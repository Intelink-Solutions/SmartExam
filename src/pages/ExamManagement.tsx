import { useEffect, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit, Power, PowerOff, Calendar, X, Search, Filter, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiClass,
  ApiExam,
  ApiExamStatus,
  ApiSubject,
  ApiTerm,
  createExam,
  deleteExam,
  fetchClasses,
  fetchExams,
  fetchSubjects,
  fetchTerms,
  updateExam,
} from "@/lib/api";

type UiExamStatus = "Active" | "Disabled" | "Draft";

interface ExamRow {
  id: number;
  classId: number;
  subjectId: number;
  termId: number;
  subject: string;
  class: string;
  term: string;
  year: string;
  duration: string;
  totalMarks: number;
  date: string;
  status: UiExamStatus;
  questionsCount: number;
}

const emptyForm = {
  subjectId: "",
  classId: "",
  termId: "",
  duration: "60",
  totalMarks: 50,
  date: "",
  questionsCount: 0,
};

const mapStatusToUi = (status: ApiExamStatus): UiExamStatus => {
  if (status === "active") return "Active";
  if (status === "closed") return "Disabled";
  return "Draft";
};

const mapUiToStatus = (status: UiExamStatus): ApiExamStatus => {
  if (status === "Active") return "active";
  if (status === "Disabled") return "closed";
  return "draft";
};

const toDateInput = (value: string): string => {
  if (!value) return "";
  return value.slice(0, 10);
};

export default function ExamManagement() {
  const { token } = useAuth();
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [terms, setTerms] = useState<ApiTerm[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const [examsRes, classesRes, subjectsRes, termsRes] = await Promise.all([
        fetchExams(token),
        fetchClasses(token),
        fetchSubjects(token),
        fetchTerms(token),
      ]);

      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setTerms(termsRes.data);

      const mapped: ExamRow[] = examsRes.data.map((exam: ApiExam) => {
        const term = exam.term || termsRes.data.find((item) => item.id === exam.term_id);
        return {
          id: exam.id,
          classId: exam.class_id,
          subjectId: exam.subject_id,
          termId: exam.term_id,
          subject: exam.subject?.name || subjectsRes.data.find((item) => item.id === exam.subject_id)?.name || "Unknown Subject",
          class: exam.school_class?.name || classesRes.data.find((item) => item.id === exam.class_id)?.name || "Unknown Class",
          term: term?.name || "Term",
          year: term?.academic_year?.name || "Academic Year",
          duration: String(exam.duration_minutes),
          totalMarks: exam.total_marks,
          date: toDateInput(exam.exam_date),
          status: mapStatusToUi(exam.status),
          questionsCount: exam.questions?.length || 0,
        };
      });

      setExams(mapped);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load exams";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const openCreate = () => {
    setEditingExam(null);
    setForm({ ...emptyForm, termId: terms[0] ? String(terms[0].id) : "" });
    setShowModal(true);
  };

  const openEdit = (exam: ExamRow) => {
    setEditingExam(exam);
    setForm({
      subjectId: String(exam.subjectId),
      classId: String(exam.classId),
      termId: String(exam.termId),
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      date: exam.date,
      questionsCount: exam.questionsCount,
    });
    setShowModal(true);
  };

  const selectedTerm = terms.find((term) => String(term.id) === form.termId);
  const selectedYear = selectedTerm?.academic_year?.name || "Academic Year";

  const handleSave = async () => {
    if (!token) return;
    if (!form.subjectId || !form.classId || !form.termId || !form.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      class_id: Number(form.classId),
      subject_id: Number(form.subjectId),
      term_id: Number(form.termId),
      duration_minutes: Number(form.duration),
      total_marks: Number(form.totalMarks),
      status: editingExam ? mapUiToStatus(editingExam.status) : ("draft" as ApiExamStatus),
      exam_date: `${form.date} 09:00:00`,
    };

    try {
      if (editingExam) {
        await updateExam(token, editingExam.id, payload);
        toast.success("Exam updated successfully");
      } else {
        await createExam(token, payload);
        toast.success("Exam created successfully");
      }
      await loadData();
      setShowModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save exam";
      toast.error(message);
    }
  };

  const toggleStatus = async (exam: ExamRow) => {
    if (!token) return;

    const newStatus: UiExamStatus = exam.status === "Active" ? "Disabled" : "Active";

    try {
      await updateExam(token, exam.id, { status: mapUiToStatus(newStatus) });
      await loadData();
      toast.success(`Exam "${exam.subject}" ${newStatus === "Active" ? "enabled" : "disabled"}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update exam status";
      toast.error(message);
    }
  };

  const removeExam = async (id: number) => {
    if (!token) return;

    const exam = exams.find((item) => item.id === id);
    try {
      await deleteExam(token, id);
      await loadData();
      setShowDeleteModal(null);
      toast.success(`Exam "${exam?.subject}" deleted`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete exam";
      toast.error(message);
    }
  };

  const filtered = exams.filter((exam) => {
    const matchSearch = exam.subject.toLowerCase().includes(search.toLowerCase()) || exam.class.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || exam.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Exams" }]}> 
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Exam Management</h1>
          <p className="page-subtitle">Create and manage examinations</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exams..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {["All", "Active", "Disabled", "Draft"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterStatus === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Term</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Marks</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((exam) => (
              <tr key={exam.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{exam.subject}</td>
                <td className="px-5 py-3 text-sm text-foreground">{exam.class}</td>
                <td className="px-5 py-3 text-sm text-foreground">{exam.term}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{exam.duration} mins</td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{exam.totalMarks}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{exam.date}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    exam.status === "Active" ? "bg-success/10 text-success" : exam.status === "Disabled" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  }`}>{exam.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(exam)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-secondary transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStatus(exam)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-success transition-colors" title={exam.status === "Active" ? "Disable" : "Enable"}>
                      {exam.status === "Active" ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setShowDeleteModal(exam.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">No exams found</td></tr>}
            {isLoading && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Loading exams...</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">{editingExam ? "Edit Exam" : "Create New Exam"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Academic Year</label>
                    <input value={selectedYear} readOnly className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-sm text-muted-foreground" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Term *</label>
                    <select value={form.termId} onChange={(event) => setForm({ ...form, termId: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select Term</option>
                      {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Subject *</label>
                    <select value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Class *</label>
                    <select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select Class</option>
                      {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Duration (mins) *</label>
                    <input type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Total Marks *</label>
                    <input type="number" value={form.totalMarks} onChange={(event) => setForm({ ...form, totalMarks: Number(event.target.value) })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">No. of Questions</label>
                    <input type="number" value={form.questionsCount} onChange={(event) => setForm({ ...form, questionsCount: Number(event.target.value) })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Exam Date *</label>
                  <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-border">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
                  {editingExam ? "Update Exam" : "Create Exam"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl p-6 max-w-sm w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Delete Exam?</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => removeExam(showDeleteModal)} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
