import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClass, ApiTerm, fetchClasses, fetchFailedStudents, fetchPerformanceReport, fetchTerms, fetchTopStudents } from "@/lib/api";
import { toast } from "sonner";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ReportsModule() {
  const { token } = useAuth();

  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [terms, setTerms] = useState<ApiTerm[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");

  const [subjectPerformance, setSubjectPerformance] = useState<Array<{ name: string; average: number }>>([]);
  const [gradeDistribution, setGradeDistribution] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [topStudents, setTopStudents] = useState<Array<{ name: string; average: number }>>([]);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    const loadSetup = async () => {
      if (!token) return;

      try {
        const [classRes, termRes] = await Promise.all([fetchClasses(token), fetchTerms(token)]);
        setClasses(classRes.data);
        setTerms(termRes.data);

        if (classRes.data[0]) setSelectedClassId(String(classRes.data[0].id));
        if (termRes.data[0]) setSelectedTermId(String(termRes.data[0].id));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load report setup";
        toast.error(message);
      }
    };

    loadSetup();
  }, [token]);

  useEffect(() => {
    const loadReport = async () => {
      if (!token || !selectedClassId || !selectedTermId) return;

      try {
        const [top, failed, performance] = await Promise.all([
          fetchTopStudents(token, Number(selectedClassId), 10),
          fetchFailedStudents(token, Number(selectedClassId), 50),
          fetchPerformanceReport(token, Number(selectedClassId), Number(selectedTermId)),
        ]);

        setTopStudents(
          top.map((item) => ({
            name: item.student?.user?.name || "Unknown Student",
            average: Number(item.average || 0),
          }))
        );

        setFailedCount(failed.length);

        setSubjectPerformance(
          performance.subject_performance.map((item) => ({
            name: item.name,
            average: Number(item.avg_score || 0),
          }))
        );

        setGradeDistribution(
          performance.grade_distribution.map((item, index) => ({
            name: item.grade,
            value: item.total,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load reports";
        toast.error(message);
      }
    };

    loadReport();
  }, [token, selectedClassId, selectedTermId]);

  const selectedTerm = useMemo(
    () => terms.find((item) => String(item.id) === selectedTermId),
    [terms, selectedTermId]
  );

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Reports" }]}> 
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Performance analysis and academic reports</p>
      </div>

      <div className="bg-card rounded-lg p-4 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Class</label>
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground">
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Term</label>
            <select value={selectedTermId} onChange={(event) => setSelectedTermId(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground">
              {terms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Academic Year</label>
            <input readOnly value={selectedTerm?.academic_year?.name || "Academic Year"} className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-sm text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-lg p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Subject Performance (Average Marks)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={gradeDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {gradeDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg mb-6 p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="text-sm text-muted-foreground">Failed Students: <span className="font-semibold text-foreground">{failedCount}</span></p>
      </div>

      <div className="bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Top Performing Students</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topStudents.map((student, index) => (
              <tr key={`${student.name}-${index}`} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-sm font-bold text-foreground">#{index + 1}</td>
                <td className="px-5 py-3 text-sm font-medium text-foreground">{student.name}</td>
                <td className="px-5 py-3 text-sm font-bold text-success">{student.average}%</td>
              </tr>
            ))}
            {topStudents.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-sm text-muted-foreground text-center">No data available.</td></tr>}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
