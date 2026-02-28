import { useEffect, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit, Trash2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSubject,
  createClass,
  deleteClass,
  fetchClasses,
  fetchSubjects,
  fetchTeachers,
  updateClass,
} from "@/lib/api";

interface ClassItem {
  id: number; name: string; students: number; subjects: string[];
}

const emptyForm = { name: "", subjects: "" };

export default function ClassManagement() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const [classesResponse, subjectsResponse] = await Promise.all([
        fetchClasses(token),
        fetchSubjects(token),
      ]);

      const byClass = new Map<number, string[]>();
      subjectsResponse.data.forEach((subject) => {
        const current = byClass.get(subject.class_id) || [];
        current.push(subject.name);
        byClass.set(subject.class_id, current);
      });

      const mapped: ClassItem[] = classesResponse.data.map((item) => ({
        id: item.id,
        name: item.name,
        students: item.students_count || 0,
        subjects: byClass.get(item.id) || [],
      }));

      setClasses(mapped);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load classes";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: ClassItem) => { setEditing(c); setForm({ name: c.name, subjects: c.subjects.join(", ") }); setShowModal(true); };

  const handleSave = async () => {
    if (!token) return;
    if (!form.name) { toast.error("Please enter class name"); return; }

    try {
      if (editing) {
        await updateClass(token, editing.id, { name: form.name });
        toast.success(`Class "${form.name}" updated`);
      } else {
        const createdClass = await createClass(token, { name: form.name });

        if (form.subjects.trim()) {
          const teacherResponse = await fetchTeachers(token);
          const defaultTeacher = teacherResponse.data[0];

          if (!defaultTeacher) {
            toast.error("Create at least one teacher before adding subjects");
          } else {
            const subjectNames = form.subjects
              .split(",")
              .map((subject) => subject.trim())
              .filter(Boolean);

            await Promise.all(
              subjectNames.map((subjectName) =>
                createSubject(token, {
                  name: subjectName,
                  class_id: createdClass.id,
                  teacher_id: defaultTeacher.id,
                })
              )
            );
          }
        }

        toast.success(`Class "${form.name}" created`);
      }
      await loadData();
      setShowModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save class";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (deleteId === null) return;
    const c = classes.find(x => x.id === deleteId);
    try {
      await deleteClass(token, deleteId);
      await loadData();
      setDeleteId(null);
      toast.success(`Class "${c?.name}" deleted`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete class";
      toast.error(message);
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Classes & Subjects" }]}>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Classes & Subjects</h1><p className="page-subtitle">Manage classes, assign subjects and teachers</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"><Plus className="w-4 h-4" /> Create Class</button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classes.map((cls, i) => (
          <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">{cls.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cls)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-secondary transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(cls.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{cls.students} Students</p>
            <div className="flex flex-wrap gap-1.5">
              {cls.subjects.map(sub => (<span key={sub} className="px-2 py-0.5 text-xs rounded-md bg-secondary/10 text-secondary font-medium">{sub}</span>))}
            </div>
          </motion.div>
        ))}
        {!isLoading && classes.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-8">No classes found.</div>
        )}
        {isLoading && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-8">Loading classes...</div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-card rounded-xl w-full max-w-md" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border"><h2 className="text-lg font-bold text-foreground">{editing ? "Edit Class" : "Create Class"}</h2><button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button></div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Class Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. JHS 1A" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Subjects (comma-separated)</label><textarea value={form.subjects} onChange={e => setForm({...form, subjects: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} placeholder="English, Mathematics, Science" /></div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">{editing ? "Update" : "Create"}</button>
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
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div><div><h3 className="text-base font-bold text-foreground">Delete Class?</h3><p className="text-xs text-muted-foreground">This will remove the class and all assignments.</p></div></div>
              <div className="flex gap-3"><button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button><button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all">Delete</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
