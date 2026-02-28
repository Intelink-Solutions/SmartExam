import { MainLayout } from "@/components/MainLayout";
import { Save, Upload, Plus, Trash2, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiGradingScale,
  createGradingScale,
  fetchGradingScales,
  fetchSchoolSettings,
  removeGradingScale,
  saveGradingScale,
  updateSchoolSettings,
  uploadSchoolImage,
  uploadSchoolLogo,
} from "@/lib/api";

interface Grade {
  id?: number;
  grade: string;
  minScore: number;
  maxScore: number;
  remark: string;
}

const emptyGrade = { grade: "", minScore: 0, maxScore: 0, remark: "" };

export default function SettingsModule() {
  const { token } = useAuth();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [schoolName, setSchoolName] = useState("Smart Exam Pro School");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [classScore, setClassScore] = useState(30);
  const [examScore, setExamScore] = useState(70);
  const [academicYear, setAcademicYear] = useState("");
  const [currentTerm, setCurrentTerm] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState(emptyGrade);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deleteGrade, setDeleteGrade] = useState<Grade | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const toApiAsset = (assetPath: string | null) => {
    if (!assetPath) return null;
    return `http://127.0.0.1:8000/storage/${assetPath}`;
  };

  const loadData = async () => {
    if (!token) return;

    try {
      const [settings, gradingScales] = await Promise.all([fetchSchoolSettings(token), fetchGradingScales(token)]);
      setSchoolName(settings.school_name || "Smart Exam Pro School");
      setAddress(settings.address || "");
      setContact(settings.contact || "");
      setClassScore(settings.class_score_weight || 30);
      setExamScore(settings.exam_score_weight || 70);
      setAcademicYear(settings.current_academic_year || "");
      setCurrentTerm(settings.current_term || "");
      setLogoPath(settings.logo_path);
      setImagePath(settings.image_path);

      setGrades(
        gradingScales.map((grade: ApiGradingScale) => ({
          id: grade.id,
          grade: grade.grade_letter,
          minScore: grade.min_score,
          maxScore: grade.max_score,
          remark: grade.remark,
        }))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load settings";
      toast.error(message);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleSaveSettings = async () => {
    if (!token) return;
    if (classScore + examScore !== 100) {
      toast.error("Class score and exam score must add up to 100");
      return;
    }

    try {
      setSavingSettings(true);
      await updateSchoolSettings(token, {
        school_name: schoolName,
        address,
        contact,
        class_score_weight: classScore,
        exam_score_weight: examScore,
        current_academic_year: academicYear,
        current_term: currentTerm,
      });
      toast.success("School settings saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save settings";
      toast.error(message);
    } finally {
      setSavingSettings(false);
    }
  };

  const onLogoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const response = await uploadSchoolLogo(token, file);
      setLogoPath(response.logo_path || null);
      toast.success(response.message || "Logo uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload logo";
      toast.error(message);
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  };

  const onImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const response = await uploadSchoolImage(token, file);
      setImagePath(response.image_path || null);
      toast.success(response.message || "School image uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload school image";
      toast.error(message);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const openCreateGrade = () => {
    setEditingGrade(null);
    setGradeForm(emptyGrade);
    setShowGradeModal(true);
  };

  const openEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setGradeForm({ ...grade });
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    if (!token) return;
    if (!gradeForm.grade || gradeForm.maxScore < gradeForm.minScore) {
      toast.error("Provide a valid grade range");
      return;
    }

    try {
      if (editingGrade?.id) {
        await saveGradingScale(token, editingGrade.id, {
          grade_letter: gradeForm.grade,
          min_score: gradeForm.minScore,
          max_score: gradeForm.maxScore,
          remark: gradeForm.remark,
        });
        toast.success(`Grade "${gradeForm.grade}" updated`);
      } else {
        await createGradingScale(token, {
          grade_letter: gradeForm.grade,
          min_score: gradeForm.minScore,
          max_score: gradeForm.maxScore,
          remark: gradeForm.remark,
        });
        toast.success(`Grade "${gradeForm.grade}" added`);
      }

      setShowGradeModal(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save grade";
      toast.error(message);
    }
  };

  const handleDeleteGrade = async () => {
    if (!token || !deleteGrade?.id) return;

    try {
      await removeGradingScale(token, deleteGrade.id);
      toast.success("Grade removed");
      setDeleteGrade(null);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove grade";
      toast.error(message);
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Settings" }]}> 
      <div className="page-header"><h1 className="page-title">Settings</h1><p className="page-subtitle">Configure system preferences</p></div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-foreground">School Information</h3></div>
          <div className="p-5 space-y-4">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">School Name</label><input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">School Logo</label>
                <div onClick={() => logoInputRef.current?.click()} className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:border-secondary transition-colors">
                  {uploadingLogo ? <Loader2 className="w-6 h-6 mx-auto text-muted-foreground mb-1 animate-spin" /> : <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />}
                  <p className="text-xs text-muted-foreground">Upload logo</p>
                </div>
                {logoPath && <img src={toApiAsset(logoPath) || ""} alt="School logo" className="mt-2 h-12 object-contain rounded border border-border p-1" />}
                <input ref={logoInputRef} type="file" accept="image/*" onChange={onLogoSelected} className="hidden" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">School Image</label>
                <div onClick={() => imageInputRef.current?.click()} className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:border-secondary transition-colors">
                  {uploadingImage ? <Loader2 className="w-6 h-6 mx-auto text-muted-foreground mb-1 animate-spin" /> : <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />}
                  <p className="text-xs text-muted-foreground">Upload image</p>
                </div>
                {imagePath && <img src={toApiAsset(imagePath) || ""} alt="School" className="mt-2 h-12 object-cover rounded border border-border" />}
                <input ref={imageInputRef} type="file" accept="image/*" onChange={onImageSelected} className="hidden" />
              </div>
            </div>

            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Address</label><input value={address} onChange={(event) => setAddress(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Contact</label><input value={contact} onChange={(event) => setContact(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Class Score %</label><input type="number" value={classScore} onChange={(event) => setClassScore(Number(event.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Exam Score %</label><input type="number" value={examScore} onChange={(event) => setExamScore(Number(event.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Current Academic Year</label><input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 2025/2026" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Current Term</label><input value={currentTerm} onChange={(event) => setCurrentTerm(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. First Term" /></div>
            </div>

            <button onClick={handleSaveSettings} disabled={savingSettings} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Grading System</h3>
            <button onClick={openCreateGrade} className="flex items-center gap-1 text-xs text-secondary font-medium hover:underline"><Plus className="w-3 h-3" /> Add Grade</button>
          </div>
          <div className="p-3">
            <table className="w-full">
              <thead><tr className="border-b border-border"><th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Grade</th><th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Min</th><th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Max</th><th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Remark</th><th className="px-3 py-2"></th></tr></thead>
              <tbody className="divide-y divide-border">
                {grades.map((grade) => (
                  <tr key={grade.id || grade.grade}>
                    <td className="px-3 py-2 text-sm font-bold text-foreground">{grade.grade}</td>
                    <td className="px-3 py-2 text-sm text-foreground">{grade.minScore}</td>
                    <td className="px-3 py-2 text-sm text-foreground">{grade.maxScore}</td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">{grade.remark}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEditGrade(grade)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-secondary transition-colors text-xs">Edit</button>
                        <button onClick={() => setDeleteGrade(grade)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {grades.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">No grading scales found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGradeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGradeModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(event) => event.stopPropagation()} className="bg-card rounded-xl w-full max-w-sm" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border"><h2 className="text-lg font-bold text-foreground">{editingGrade ? "Edit Grade" : "Add Grade"}</h2><button onClick={() => setShowGradeModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button></div>
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Grade *</label><input value={gradeForm.grade} onChange={(event) => setGradeForm({ ...gradeForm, grade: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. A1" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-muted-foreground mb-1">Min Score</label><input type="number" value={gradeForm.minScore} onChange={(event) => setGradeForm({ ...gradeForm, minScore: Number(event.target.value) })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                  <div><label className="block text-xs font-medium text-muted-foreground mb-1">Max Score</label><input type="number" value={gradeForm.maxScore} onChange={(event) => setGradeForm({ ...gradeForm, maxScore: Number(event.target.value) })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></div>
                </div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Remark</label><input value={gradeForm.remark} onChange={(event) => setGradeForm({ ...gradeForm, remark: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Excellent" /></div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                <button onClick={() => setShowGradeModal(false)} className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSaveGrade} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteGrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl p-6 max-w-sm w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <h3 className="text-base font-bold text-foreground mb-2">Remove Grade "{deleteGrade.grade}"?</h3>
              <p className="text-sm text-muted-foreground mb-4">This will remove the grade from the grading system.</p>
              <div className="flex gap-3"><button onClick={() => setDeleteGrade(null)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button><button onClick={handleDeleteGrade} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all">Remove</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
