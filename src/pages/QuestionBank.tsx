import { useEffect, useMemo, useRef, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit, Trash2, Search, Upload, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiClass,
  ApiSubject,
  createQuestion,
  deleteQuestion,
  fetchClasses,
  fetchQuestions,
  fetchSubjects,
  importQuestions,
  updateQuestion,
} from "@/lib/api";

interface Question {
  id: number; subject: string; class: string; subjectId: number; classId: number; type: string; question: string; marks: number; options?: string[];
}

const emptyForm = { subject: "", class: "", type: "Multiple Choice", question: "", marks: 2, optA: "", optB: "", optC: "", optD: "" };

const mapTypeToUi = (type: string): string => {
  if (type === "mcq") return "Multiple Choice";
  if (type === "true_false") return "True/False";
  return "Essay";
};

const mapUiToType = (type: string): "mcq" | "true_false" | "essay" => {
  if (type === "Multiple Choice") return "mcq";
  if (type === "True/False") return "true_false";
  return "essay";
};

export default function QuestionBank() {
  const { token } = useAuth();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All Subjects");
  const [filterType, setFilterType] = useState("All Types");
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const [questionRes, subjectRes, classRes] = await Promise.all([
        fetchQuestions(token),
        fetchSubjects(token),
        fetchClasses(token),
      ]);

      setSubjects(subjectRes.data);
      setClasses(classRes.data);

      setQuestions(
        questionRes.data.map((q) => ({
          id: q.id,
          subject: q.subject?.name || "Unknown Subject",
          class: q.school_class?.name || "Unknown Class",
          subjectId: q.subject_id,
          classId: q.class_id,
          type: mapTypeToUi(q.type),
          question: q.question_text,
          marks: q.marks,
          options: q.correct_answer ? [q.correct_answer] : undefined,
        }))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load questions";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const subjectOptions = useMemo(() => subjects.map((item) => item.name), [subjects]);
  const classOptions = useMemo(() => classes.map((item) => item.name), [classes]);

  const filtered = questions.filter(q => {
    const ms = q.question.toLowerCase().includes(search.toLowerCase());
    const mSub = filterSubject === "All Subjects" || q.subject === filterSubject;
    const mType = filterType === "All Types" || q.type === filterType;
    return ms && mSub && mType;
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({ subject: q.subject, class: q.class, type: q.type, question: q.question, marks: q.marks, optA: q.options?.[0] || "", optB: q.options?.[1] || "", optC: q.options?.[2] || "", optD: q.options?.[3] || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.question || !form.subject || !form.class) { toast.error("Please fill required fields"); return; }
    const options = form.type === "Multiple Choice" ? [form.optA, form.optB, form.optC, form.optD].filter(Boolean) : undefined;

    const subject = subjects.find((item) => item.name === form.subject);
    const schoolClass = classes.find((item) => item.name === form.class);
    if (!subject || !schoolClass) {
      toast.error("Please select valid class and subject");
      return;
    }

    try {
      const payload = {
        subject_id: subject.id,
        class_id: schoolClass.id,
        type: mapUiToType(form.type),
        question_text: form.question,
        marks: form.marks,
        correct_answer: options?.[0] || null,
      };

      if (editing) {
        await updateQuestion(token, editing.id, payload);
        toast.success("Question updated");
      } else {
        await createQuestion(token, payload);
        toast.success("Question added");
      }

      await loadData();
      setShowModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save question";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (deleteId === null) return;
    try {
      await deleteQuestion(token, deleteId);
      await loadData();
      setDeleteId(null);
      toast.success("Question deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete question";
      toast.error(message);
    }
  };

  const handleBulkImport = () => {
    importInputRef.current?.click();
  };

  const handleImportFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await importQuestions(token, file);
      await loadData();
      if (response.errors.length) {
        toast.warning(`Imported ${response.imported} questions with ${response.errors.length} row errors`);
      } else {
        toast.success(`Imported ${response.imported} questions successfully`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bulk import failed";
      toast.error(message);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Question Bank" }]}>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Question Bank</h1><p className="page-subtitle">Create and manage examination questions</p></div>
        <div className="flex gap-2">
          <button onClick={handleBulkImport} className="flex items-center gap-2 px-4 py-2.5 border border-input text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all"><Upload className="w-4 h-4" /> Bulk Import</button>
          <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFileSelected} />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"><Plus className="w-4 h-4" /> Add Question</button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 mb-4 flex items-center gap-4 flex-wrap" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search questions..." className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full" />
        </div>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground">
          <option>All Subjects</option>{subjectOptions.map((subjectName) => <option key={subjectName}>{subjectName}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground">
          <option>All Types</option><option>Multiple Choice</option><option>True/False</option><option>Essay</option>
        </select>
      </div>

      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marks</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((q, i) => (
              <motion.tr key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-sm text-foreground max-w-xs truncate">{q.question}</td>
                <td className="px-5 py-3 text-sm text-foreground">{q.subject}</td>
                <td className="px-5 py-3 text-sm text-foreground">{q.class}</td>
                <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${q.type === "Multiple Choice" ? "bg-secondary/10 text-secondary" : q.type === "Essay" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"}`}>{q.type}</span></td>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{q.marks}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(q)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-secondary transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(q.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No questions found</td></tr>}
            {isLoading && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Loading questions...</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-card rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10"><h2 className="text-lg font-bold text-foreground">{editing ? "Edit Question" : "Add Question"}</h2><button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button></div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-muted-foreground mb-1">Subject *</label><select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground"><option value="">Select</option>{subjectOptions.map((subjectName) => <option key={subjectName}>{subjectName}</option>)}</select></div>
                  <div><label className="block text-xs font-medium text-muted-foreground mb-1">Class *</label><select value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground"><option value="">Select</option>{classOptions.map((className) => <option key={className}>{className}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-muted-foreground mb-1">Question Type *</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground"><option>Multiple Choice</option><option>True/False</option><option>Essay</option></select></div>
                  <div><label className="block text-xs font-medium text-muted-foreground mb-1">Marks *</label><input type="number" value={form.marks} onChange={e => setForm({...form, marks: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                </div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Question *</label><textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} /></div>
                {form.type === "Multiple Choice" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-muted-foreground">Options</label>
                    {["A", "B", "C", "D"].map((letter, i) => (
                      <div key={letter} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{letter}</span>
                        <input value={[form.optA, form.optB, form.optC, form.optD][i]} onChange={e => { const key = ["optA", "optB", "optC", "optD"][i]; setForm({...form, [key]: e.target.value}); }} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-card">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">{editing ? "Update" : "Save"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl p-6 max-w-sm w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div><div><h3 className="text-base font-bold text-foreground">Delete Question?</h3><p className="text-xs text-muted-foreground">This action cannot be undone.</p></div></div>
              <div className="flex gap-3"><button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button><button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all">Delete</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
