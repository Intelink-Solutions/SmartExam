import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, X, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiClass,
  createStudentWithPhoto,
  deleteStudent,
  fetchClasses,
  fetchStudents,
  updateStudentWithPhoto,
} from "@/lib/api";

interface Student {
  dbId: number;
  id: string;
  name: string;
  classId: number;
  class: string;
  gender: string;
  status: string;
  dob?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
}

const emptyForm = { firstName: "", lastName: "", gender: "Male", dob: "", class: "", studentId: "", admissionDate: "", parentName: "", phone: "", address: "", photoFile: null as File | null };

const mapApiStudent = (student: Awaited<ReturnType<typeof fetchStudents>>["data"][number]): Student => ({
  dbId: student.id,
  id: student.student_id,
  name: student.user?.name || "Unknown Student",
  classId: student.class_id,
  class: student.school_class?.name || "Unknown Class",
  gender: "N/A",
  status: student.status?.toLowerCase() === "active" ? "Active" : "Inactive",
});

export default function StudentManagement() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All Classes");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const [studentsResponse, classesResponse] = await Promise.all([
        fetchStudents(token),
        fetchClasses(token),
      ]);
      setStudents(studentsResponse.data.map(mapApiStudent));
      setClasses(classesResponse.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load students";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const classOptions = useMemo(() => classes.map((item) => item.name), [classes]);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "All Classes" || s.class.includes(filterClass);
    const matchStatus = filterStatus === "All Status" || s.status === filterStatus;
    return matchSearch && matchClass && matchStatus;
  });

  const openCreate = () => { setEditingStudent(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: Student) => {
    setEditingStudent(s);
    const [first, ...rest] = s.name.split(" ");
    setForm({ ...emptyForm, firstName: first, lastName: rest.join(" "), gender: s.gender, class: s.class, studentId: s.id, parentName: s.parentName || "", phone: s.parentPhone || "", address: s.address || "", photoFile: null });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.firstName || !form.lastName) { toast.error("Please fill in student name"); return; }
    const selectedClass = classes.find((item) => item.name === form.class);
    if (!selectedClass) { toast.error("Please select a valid class"); return; }

    try {
      if (editingStudent) {
        const generatedEmail = `${form.studentId || editingStudent.id}@smartexampro.local`;
        await updateStudentWithPhoto(token, editingStudent.dbId, {
          name: `${form.firstName} ${form.lastName}`,
          email: generatedEmail,
          class_id: selectedClass.id,
          student_id: form.studentId || editingStudent.id,
          status: "active",
        }, form.photoFile);
        toast.success(`Student "${form.firstName} ${form.lastName}" updated`);
      } else {
        const generatedStudentId = form.studentId || `STD${String(students.length + 1).padStart(3, "0")}`;
        const generatedEmail = `${generatedStudentId}@smartexampro.local`;
        await createStudentWithPhoto(token, {
          name: `${form.firstName} ${form.lastName}`,
          email: generatedEmail,
          password: "password123",
          class_id: selectedClass.id,
          student_id: generatedStudentId,
          status: "active",
        }, form.photoFile);
        toast.success(`Student "${form.firstName} ${form.lastName}" added`);
      }
      await loadData();
      setShowModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save student";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!deleteId) return;
    const student = students.find(s => s.dbId === deleteId);
    try {
      await deleteStudent(token, deleteId);
      await loadData();
      setDeleteId(null);
      toast.success(`Student "${student?.name}" deleted`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete student";
      toast.error(message);
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Student Management" }]}>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-subtitle">Manage all enrolled students</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="bg-card rounded-lg p-4 mb-4 flex items-center gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full" />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground">
          <option>All Classes</option><option>Primary</option><option>JHS</option><option>SHS</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground">
          <option>All Status</option><option>Active</option><option>Inactive</option>
        </select>
      </div>

      <div className="data-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Photo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((student, i) => (
                <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3"><div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">{student.name.charAt(0)}</div></td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{student.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{student.id}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{student.class}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{student.gender}</td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${student.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{student.status}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewStudent(student)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(student)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-secondary transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(student.dbId)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No students found</td></tr>}
              {isLoading && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Loading students...</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student Modal */}
      <AnimatePresence>
        {viewStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewStudent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-card rounded-xl p-6 max-w-md w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Student Details</h2>
                <button onClick={() => setViewStudent(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-xl font-bold text-secondary">{viewStudent.name.charAt(0)}</div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{viewStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewStudent.id}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Class</span><span className="font-medium text-foreground">{viewStudent.class}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Gender</span><span className="font-medium text-foreground">{viewStudent.gender}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Status</span><span className={`font-medium ${viewStudent.status === "Active" ? "text-success" : "text-destructive"}`}>{viewStudent.status}</span></div>
                {viewStudent.parentName && <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Parent</span><span className="font-medium text-foreground">{viewStudent.parentName}</span></div>}
              </div>
              <button onClick={() => setViewStudent(null)} className="w-full mt-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Student Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-card rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-lg font-bold text-foreground">{editingStudent ? "Edit Student" : "Add New Student"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">First Name *</label><input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Last Name *</label><input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground"><option>Male</option><option>Female</option></select></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                    <div className="col-span-2"><label className="block text-xs font-medium text-muted-foreground mb-1">Photo</label><label className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:border-secondary transition-colors block"><Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" /><p className="text-xs text-muted-foreground">{form.photoFile ? form.photoFile.name : "Click to upload photo"}</p><input type="file" accept="image/*" className="hidden" onChange={(e) => setForm({ ...form, photoFile: e.target.files?.[0] || null })} /></label></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Academic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Class</label><select value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground"><option value="">Select Class</option>{classOptions.map((className) => <option key={className} value={className}>{className}</option>)}</select></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Student ID</label><input value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="Auto-generated" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Admission Date</label><input type="date" value={form.admissionDate} onChange={e => setForm({...form, admissionDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Parent / Guardian Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Parent Name</label><input value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                    <div><label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                    <div className="col-span-2"><label className="block text-xs font-medium text-muted-foreground mb-1">Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={2} /></div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-card">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">{editingStudent ? "Update Student" : "Save Student"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl p-6 max-w-sm w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
                <div><h3 className="text-base font-bold text-foreground">Delete Student?</h3><p className="text-xs text-muted-foreground">This action cannot be undone.</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
