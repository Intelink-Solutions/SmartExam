import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit, Trash2, Search, X, Eye, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiTeacher, createTeacher, deleteTeacher, fetchTeachers, fetchSubjects, updateTeacher } from "@/lib/api";

interface Teacher {
  id: number;
  code: string;
  name: string;
  subjects: string;
  classes: string;
  email: string;
}

const emptyForm = { name: "", email: "", password: "" };

const mapTeacher = (teacher: ApiTeacher, subjects: Awaited<ReturnType<typeof fetchSubjects>>["data"]): Teacher => {
  const assignedSubjects = subjects.filter((subject) => subject.teacher_id === teacher.id);
  const subjectNames = assignedSubjects.map((subject) => subject.name);
  const classNames = Array.from(new Set(assignedSubjects.map((subject) => subject.school_class?.name).filter(Boolean) as string[]));

  return {
    id: teacher.id,
    code: `TCH${String(teacher.id).padStart(3, "0")}`,
    name: teacher.user?.name || "Unknown Teacher",
    subjects: subjectNames.length ? subjectNames.join(", ") : "No Subject Assigned",
    classes: classNames.length ? classNames.join(", ") : "No Class Assigned",
    email: teacher.user?.email || "",
  };
};

export default function TeacherManagement() {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const [teacherRes, subjectRes] = await Promise.all([fetchTeachers(token), fetchSubjects(token)]);
      setTeachers(teacherRes.data.map((item) => mapTeacher(item, subjectRes.data)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load teachers";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const filtered = useMemo(
    () => teachers.filter((teacher) => teacher.name.toLowerCase().includes(search.toLowerCase()) || teacher.code.toLowerCase().includes(search.toLowerCase())),
    [teachers, search]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setForm({ name: teacher.name, email: teacher.email || "", password: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.name || !form.email) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editing) {
        await updateTeacher(token, editing.id, {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
        });
        toast.success(`Teacher "${form.name}" updated`);
      } else {
        if (!form.password) {
          toast.error("Password is required for new teachers");
          return;
        }
        await createTeacher(token, {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        toast.success(`Teacher "${form.name}" added`);
      }

      setShowModal(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save teacher";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!deleteId) return;

    const teacher = teachers.find((item) => item.id === deleteId);
    try {
      await deleteTeacher(token, deleteId);
      toast.success(`Teacher "${teacher?.name}" deleted`);
      setDeleteId(null);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete teacher";
      toast.error(message);
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Teacher Management" }]}>
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Teacher Management</h1><p className="page-subtitle">Manage teachers, assign subjects and classes</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"><Plus className="w-4 h-4" /> Add Teacher</button>
      </div>

      <div className="bg-card rounded-lg p-4 mb-4 flex items-center gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="text" placeholder="Search teachers..." className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full" />
        </div>
      </div>

      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subjects</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classes</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((teacher, index) => (
              <motion.tr key={teacher.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-sm font-mono text-muted-foreground">{teacher.code}</td>
                <td className="px-5 py-3 text-sm font-medium text-foreground">{teacher.name}</td>
                <td className="px-5 py-3 text-sm text-foreground">{teacher.subjects}</td>
                <td className="px-5 py-3 text-sm text-foreground">{teacher.classes}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{teacher.email}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewTeacher(teacher)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(teacher)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-secondary transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(teacher.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No teachers found</td></tr>}
            {isLoading && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Loading teachers...</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {viewTeacher && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewTeacher(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(event) => event.stopPropagation()} className="bg-card rounded-xl p-6 max-w-md w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-foreground">Teacher Details</h2><button onClick={() => setViewTeacher(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button></div>
              <div className="space-y-2 text-sm">
                {[["ID", viewTeacher.code], ["Name", viewTeacher.name], ["Email", viewTeacher.email], ["Subjects", viewTeacher.subjects], ["Classes", viewTeacher.classes]].map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">{key}</span><span className="font-medium text-foreground text-right max-w-[70%]">{value}</span></div>
                ))}
              </div>
              <button onClick={() => setViewTeacher(null)} className="w-full mt-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(event) => event.stopPropagation()} className="bg-card rounded-xl w-full max-w-lg" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border"><h2 className="text-lg font-bold text-foreground">{editing ? "Edit Teacher" : "Add New Teacher"}</h2><button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button></div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Email *</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Password {editing ? "(leave blank to keep)" : "*"}</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <p className="text-xs text-muted-foreground">Subject and class assignments are managed from Classes & Subjects.</p>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">{editing ? "Update" : "Save"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl p-6 max-w-sm w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div><div><h3 className="text-base font-bold text-foreground">Delete Teacher?</h3><p className="text-xs text-muted-foreground">This action cannot be undone.</p></div></div>
              <div className="flex gap-3"><button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button><button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all">Delete</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
