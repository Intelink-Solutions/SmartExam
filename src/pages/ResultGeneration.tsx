import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { FileText, Printer, Download, Trophy, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClass, ApiResult, ApiTerm, fetchClasses, fetchTerms, generateResults } from "@/lib/api";

interface UiResult {
  studentId: number;
  name: string;
  total: number;
  average: number;
  grade: string;
  position: number;
}

export default function ResultGeneration() {
  const { token } = useAuth();
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [terms, setTerms] = useState<ApiTerm[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [results, setResults] = useState<UiResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        const [classRes, termRes] = await Promise.all([fetchClasses(token), fetchTerms(token)]);
        setClasses(classRes.data);
        setTerms(termRes.data);

        if (classRes.data[0]) setSelectedClassId(String(classRes.data[0].id));
        if (termRes.data[0]) setSelectedTermId(String(termRes.data[0].id));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load result setup data";
        toast.error(message);
      }
    };

    loadData();
  }, [token]);

  const selectedClass = useMemo(
    () => classes.find((item) => String(item.id) === selectedClassId),
    [classes, selectedClassId]
  );
  const selectedTerm = useMemo(
    () => terms.find((item) => String(item.id) === selectedTermId),
    [terms, selectedTermId]
  );

  const mapApiResult = (item: ApiResult): UiResult => ({
    studentId: item.student_id,
    name: item.student?.user?.name || "Unknown Student",
    total: item.total_marks,
    average: Number(item.average || 0),
    grade: item.grade,
    position: item.position || 0,
  });

  const handleGenerate = async () => {
    if (!token || !selectedClassId || !selectedTermId) {
      toast.error("Please select class and term");
      return;
    }

    try {
      setLoading(true);
      const generatedResults = await generateResults(token, {
        class_id: Number(selectedClassId),
        term_id: Number(selectedTermId),
      });

      const mapped = generatedResults.map(mapApiResult).sort((a, b) => a.position - b.position);
      setResults(mapped);
      setGenerated(true);
      toast.success(`Results generated for ${selectedClass?.name || "Class"}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate results";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    toast.success("Preparing print view for all students...");
    window.print();
  };

  const handleExport = () => {
    if (!results.length) {
      toast.error("No results to export");
      return;
    }

    const headers = ["Position", "Student Name", "Total Marks", "Average", "Grade"];
    const rows = results.map((item) => [item.position, item.name, item.total, item.average, item.grade]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `results-${selectedClass?.name || "class"}-${selectedTerm?.name || "term"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported successfully");
  };

  const handleViewSlip = (result: UiResult) => {
    navigate("/result-slip", {
      state: {
        studentName: result.name,
        studentId: result.studentId,
        total: result.total,
        average: result.average,
        grade: result.grade,
        position: result.position,
        className: selectedClass?.name || "Class",
        termName: selectedTerm?.name || "Term",
        academicYear: selectedTerm?.academic_year?.name || "Academic Year",
      },
    });
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Results" }]}> 
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Result Generation</h1><p className="page-subtitle">Generate and view student results</p></div>
        {generated && (
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 border border-input text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all"><Printer className="w-4 h-4" /> Print All</button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"><Download className="w-4 h-4" /> Export</button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg p-5 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Academic Year</label>
            <input
              readOnly
              value={selectedTerm?.academic_year?.name || "Academic Year"}
              className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-sm text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Term</label>
            <select value={selectedTermId} onChange={(event) => setSelectedTermId(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground">
              {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Class</label>
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground">
              {classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
              {loading ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
              {loading ? "Generating..." : "Generate Results"}
            </button>
          </div>
        </div>
      </div>

      {generated && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="data-table">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Marks</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((item, index) => (
                <motion.tr key={`${item.name}-${item.position}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">{item.position <= 3 ? <Trophy className={`w-4 h-4 ${item.position === 1 ? "text-warning" : item.position === 2 ? "text-muted-foreground" : "text-chart-4"}`} /> : <span className="text-sm text-muted-foreground">{item.position}</span>}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{item.name}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">{item.total}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{item.average}%</td>
                  <td className="px-5 py-3"><span className="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-secondary/10 text-secondary">{item.grade}</span></td>
                  <td className="px-5 py-3 text-sm font-bold text-foreground">{item.position}<sup>{item.position === 1 ? "st" : item.position === 2 ? "nd" : item.position === 3 ? "rd" : "th"}</sup></td>
                  <td className="px-5 py-3"><button onClick={() => handleViewSlip(item)} className="flex items-center gap-1 text-xs text-secondary hover:underline font-medium"><Eye className="w-3 h-3" /> View Slip</button></td>
                </motion.tr>
              ))}
              {results.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No results generated</td></tr>}
            </tbody>
          </table>
        </motion.div>
      )}
    </MainLayout>
  );
}
