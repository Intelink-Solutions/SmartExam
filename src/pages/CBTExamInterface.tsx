import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, Maximize, BookOpen, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiExamQuestion,
  saveExamAnswer,
  startExam,
  submitExam,
} from "@/lib/api";

type LocationState = {
  examId?: number;
};

export default function CBTExamInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const state = (location.state as LocationState | null) || null;
  const examId = state?.examId;

  const [questions, setQuestions] = useState<ApiExamQuestion[]>([]);
  const [examTitle, setExamTitle] = useState("Exam");
  const [sessionEndIso, setSessionEndIso] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSummary, setSubmitSummary] = useState<{ objective_total: number; essay_pending: boolean } | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      if (!token || !examId) {
        toast.error("No exam selected. Please start from the student portal.");
        navigate("/student-portal");
        return;
      }

      try {
        setIsLoading(true);
        const response = await startExam(token, { exam_id: examId });

        setSessionEndIso(response.session.end_time);
        setTotalTime(
          Math.max(
            0,
            Math.floor(
              (new Date(response.session.end_time).getTime() - new Date(response.session.start_time).getTime()) / 1000
            )
          )
        );
        setExamTitle(response.exam.subject?.name || "Exam");
        setQuestions(response.exam.questions || []);

        const restored: Record<number, string> = {};
        response.answers.forEach((item) => {
          restored[item.question_id] = item.answer;
        });
        setAnswers(restored);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to start exam session";
        toast.error(message);
        navigate("/student-portal");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [token, examId, navigate]);

  useEffect(() => {
    if (!sessionEndIso || submitted) return;

    const endAt = new Date(sessionEndIso).getTime();
    const syncTimer = () => {
      const seconds = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
      setTimeLeft(seconds);
    };

    syncTimer();
    const timer = setInterval(syncTimer, 1000);
    return () => clearInterval(timer);
  }, [sessionEndIso, submitted]);

  const q = questions[currentQ];
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim().length > 0).length,
    [answers]
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const persistAnswer = async (question: ApiExamQuestion | undefined) => {
    if (!token || !examId || !question) return;

    const answerText = (answers[question.id] || "").trim();
    if (!answerText) return;

    try {
      setIsSavingAnswer(true);
      await saveExamAnswer(token, examId, {
        question_id: question.id,
        answer: answerText,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save answer";
      toast.error(message);
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const gotoQuestion = async (index: number) => {
    await persistAnswer(q);
    setCurrentQ(index);
  };

  const handleSubmit = async () => {
    if (!token || !examId) return;

    await persistAnswer(q);

    try {
      setIsSubmitting(true);
      const response = await submitExam(token, { exam_id: examId });
      setSubmitSummary({
        objective_total: response.objective_total,
        essay_pending: response.essay_pending,
      });
      setSubmitted(true);
      setShowSubmitModal(false);
      toast.success("Exam submitted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit exam";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 || submitted || isSubmitting) return;
    if (!questions.length) return;

    handleSubmit();
  }, [timeLeft, submitted, isSubmitting, questions.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-muted-foreground">
        Loading exam session...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl p-8 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No questions attached</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This exam has no questions yet. Contact your teacher or admin.
          </p>
          <button
            onClick={() => navigate("/student-portal")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="bg-card rounded-2xl p-8 max-w-lg w-full text-center relative overflow-hidden"
          style={{ boxShadow: "0 25px 60px -15px hsl(var(--primary) / 0.2)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5"
            >
              <Flag className="w-10 h-10 text-success" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              Exam Submitted
            </motion.h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your answers have been recorded successfully.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold text-foreground mt-1">{questions.length}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Attempted</p>
                <p className="text-2xl font-bold text-foreground mt-1">{answeredCount}</p>
              </div>
              <div className="bg-success/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Objective Score</p>
                <p className="text-2xl font-bold text-foreground mt-1">{submitSummary?.objective_total ?? 0}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Essay Status</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {submitSummary?.essay_pending ? "Pending" : "Completed"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/student-portal")}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isLowTime = timeLeft < 300;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div
      className="min-h-screen bg-background flex flex-col select-none"
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 bg-primary flex items-center justify-between px-6 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary/30" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold">{examTitle}</h1>
            <p className="text-xs text-primary-foreground/70">Live exam session</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-sm font-medium bg-primary-foreground/10 px-3 py-1 rounded-lg">
            Q {currentQ + 1}/{questions.length}
          </span>
          <motion.div
            animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
            transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-bold ${isLowTime ? "bg-destructive text-destructive-foreground" : "bg-primary-foreground/10"}`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </motion.div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      <div className="h-1 bg-muted">
        <motion.div
          className={`h-full transition-all duration-1000 ${isLowTime ? "bg-destructive" : "bg-secondary"}`}
          style={{ width: `${Math.max(0, Math.min(100, (timeLeft / Math.max(totalTime, 1)) * 100))}%` }}
        />
      </div>

      <div className="flex flex-1">
        <div className="flex-1 p-8 flex flex-col max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <div
                className="bg-card rounded-2xl p-8 mb-6 relative overflow-hidden"
                style={{ boxShadow: "0 4px 20px -5px hsl(var(--primary) / 0.1)" }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary">
                    Question {currentQ + 1}
                  </span>
                  <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">
                    {q.marks} marks
                  </span>
                </div>
                <p className="text-xl font-medium text-foreground leading-relaxed">{q.question_text}</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                {q.type === "true_false" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "true", label: "True" },
                      { value: "false", label: "False" },
                    ].map((choice) => (
                      <button
                        key={choice.value}
                        onClick={() => setAnswers({ ...answers, [q.id]: choice.value })}
                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${answers[q.id] === choice.value ? "border-secondary bg-secondary/10 text-secondary" : "border-input text-foreground hover:bg-muted"}`}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(event) => setAnswers({ ...answers, [q.id]: event.target.value })}
                    placeholder="Type your answer here"
                    className="w-full min-h-36 rounded-xl border border-input bg-background text-foreground text-sm p-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <button
              onClick={() => gotoQuestion(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0 || isSavingAnswer}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {currentQ === questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting || isSavingAnswer}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-success text-success-foreground text-sm font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-70"
              >
                <Flag className="w-4 h-4" /> Submit Exam
              </motion.button>
            ) : (
              <button
                onClick={() => gotoQuestion(Math.min(questions.length - 1, currentQ + 1))}
                disabled={isSavingAnswer}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-70"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-72 bg-card border-l border-border p-5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-secondary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Question Navigator</h3>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {questions.map((question, i) => (
              <motion.button
                key={question.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => gotoQuestion(i)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${i === currentQ ? "bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-md" : answers[question.id] ? "bg-success text-success-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-success" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-muted" />
              <span>Unanswered ({questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-primary" />
              <span>Current</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-foreground">{answeredCount}/{questions.length}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring" }}
              className="bg-card rounded-2xl p-8 max-w-sm w-full mx-4"
              style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: 2, duration: 0.4 }}
                  className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center"
                >
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Submit Exam?</h3>
                  <p className="text-xs text-muted-foreground">{answeredCount} of {questions.length} answered</p>
                </div>
              </div>
              {answeredCount < questions.length && (
                <div className="bg-destructive/10 rounded-xl p-3 mb-4 text-xs text-destructive">
                  You have {questions.length - answeredCount} unanswered question(s).
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-6">Once submitted, you cannot modify your answers.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Continue Exam
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-success text-success-foreground text-sm font-bold hover:opacity-90 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
