import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Monitor, Clock, Play, CheckCircle, Lock, BookOpen, Trophy, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiExam, fetchExams, startExam } from "@/lib/api";

interface StudentExam {
  id: number;
  subject: string;
  type: string;
  duration: string;
  status: "Available" | "Completed" | "Upcoming" | "Missed";
  questions: number;
  totalMarks: number;
  date: string;
}

const mapExamStatus = (exam: ApiExam): StudentExam["status"] => {
  if (exam.student_state === "completed") return "Completed";
  if (exam.student_state === "upcoming") return "Upcoming";
  if (exam.student_state === "missed") return "Missed";
  return "Available";
};

const mapApiExam = (exam: ApiExam): StudentExam => ({
  id: exam.id,
  subject: exam.subject?.name || "Subject",
  type: exam.term?.name || "Exam",
  duration: `${exam.duration_minutes} mins`,
  status: mapExamStatus(exam),
  questions: exam.questions_count || exam.questions?.length || 0,
  totalMarks: exam.total_marks,
  date: exam.exam_date?.slice(0, 10) || "",
});

export default function StudentPortal() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState<StudentExam[]>([]);
  const [showStartModal, setShowStartModal] = useState<StudentExam | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const loadExams = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await fetchExams(token);
        setAvailableExams(response.data.map(mapApiExam));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load exams";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadExams();
  }, [token]);

  const completedExams = useMemo(() => availableExams.filter((e) => e.status === "Completed"), [availableExams]);
  const avgScore = 0;

  const handleStartExam = (exam: StudentExam) => {
    setShowStartModal(exam);
  };

  const confirmStart = async () => {
    if (!token || !showStartModal) return;
    try {
      setIsStarting(true);
      await startExam(token, { exam_id: showStartModal.id });
      toast.success(`Starting ${showStartModal.subject} exam...`);
      const examId = showStartModal.id;
      setShowStartModal(null);
      navigate("/cbt-exam", { state: { examId } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start exam";
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  };

  const filtered = filter === "All" ? availableExams : availableExams.filter(e => e.status === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case "Available": return <Play className="w-3.5 h-3.5" />;
      case "Completed": return <CheckCircle className="w-3.5 h-3.5" />;
      case "Upcoming": return <Lock className="w-3.5 h-3.5" />;
      case "Missed": return <Clock className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Student Portal" }, { label: "Dashboard" }]}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary rounded-xl p-6 mb-6 text-primary-foreground relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-primary-foreground/80 text-sm">Review and take your available exams.</p>
          <div className="flex gap-4 mt-4">
            <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-primary-foreground/70" />
                <p className="text-xs text-primary-foreground/70">Exams Taken</p>
              </div>
              <p className="text-2xl font-bold">{completedExams.length}</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-primary-foreground/70" />
                <p className="text-xs text-primary-foreground/70">Average Score</p>
              </div>
              <p className="text-2xl font-bold">{avgScore}%</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 text-primary-foreground/70" />
                <p className="text-xs text-primary-foreground/70">Pending</p>
              </div>
              <p className="text-2xl font-bold">{availableExams.filter((e) => e.status === "Available").length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Exam List Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Monitor className="w-5 h-5 text-secondary" /> My Examinations
        </h2>
        <div className="flex items-center gap-1">
          {["All", "Available", "Completed", "Upcoming", "Missed"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filtered.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 hover:border-secondary/30 transition-all group"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-foreground">{exam.subject}</h3>
                <p className="text-xs text-muted-foreground">{exam.type} • {exam.date}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                exam.status === "Available" ? "bg-success/10 text-success" :
                exam.status === "Completed" ? "bg-secondary/10 text-secondary" :
                exam.status === "Missed" ? "bg-destructive/10 text-destructive" :
                "bg-warning/10 text-warning"
              }`}>
                {statusIcon(exam.status)} {exam.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted-foreground">Questions</p>
                <p className="text-sm font-bold text-foreground">{exam.questions}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted-foreground">Duration</p>
                <p className="text-sm font-bold text-foreground">{exam.duration}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-muted-foreground">Marks</p>
                <p className="text-sm font-bold text-foreground">{exam.totalMarks}</p>
              </div>
            </div>

            {exam.status === "Available" ? (
              <button
                onClick={() => handleStartExam(exam)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all group-hover:shadow-md"
              >
                <Play className="w-4 h-4" /> Start Exam
              </button>
            ) : exam.status === "Upcoming" ? (
              <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed">
                <Lock className="w-4 h-4" /> Not Yet Available
              </button>
            ) : exam.status === "Missed" ? (
              <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 bg-destructive/10 text-destructive rounded-lg text-sm font-medium cursor-not-allowed">
                <Clock className="w-4 h-4" /> Exam Missed
              </button>
            ) : (
              <button
                onClick={() => toast.info("Result details are available in the results module.")}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-secondary/10 text-secondary rounded-lg text-sm font-semibold hover:bg-secondary/20 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> View Result
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No exams found for this filter.</div>
      )}

      {isLoading && <div className="text-center py-12 text-muted-foreground text-sm">Loading exams...</div>}

      {/* Start Exam Confirmation Modal */}
      <AnimatePresence>
        {showStartModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl p-6 max-w-md w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Start {showStartModal.subject}?</h3>
                  <p className="text-xs text-muted-foreground">{showStartModal.type} Examination</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold text-foreground">{showStartModal.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-semibold text-foreground">{showStartModal.questions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Marks</span>
                  <span className="font-semibold text-foreground">{showStartModal.totalMarks}</span>
                </div>
              </div>

              <div className="bg-warning/10 rounded-lg p-3 mb-5 text-xs text-warning flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>The timer will start immediately. You cannot pause or restart the exam once started. Copy & paste is disabled.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowStartModal(null)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button disabled={isStarting} onClick={confirmStart} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-70">
                  {isStarting ? "Starting..." : "Start Exam"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
