import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, Maximize, BookOpen, Shield } from "lucide-react";

const examQuestions = [
  { id: 1, question: "What is the value of x in the equation 2x + 5 = 15?", options: ["x = 3", "x = 5", "x = 7", "x = 10"], correct: 1 },
  { id: 2, question: "Which of these is a prime number?", options: ["4", "9", "11", "15"], correct: 2 },
  { id: 3, question: "Simplify: 3(2x + 4) - 2(x - 1)", options: ["4x + 14", "4x + 10", "8x + 14", "4x + 12"], correct: 0 },
  { id: 4, question: "The square root of 144 is:", options: ["10", "11", "12", "13"], correct: 2 },
  { id: 5, question: "If a triangle has angles 60° and 80°, what is the third angle?", options: ["30°", "40°", "50°", "60°"], correct: 1 },
  { id: 6, question: "What is 15% of 200?", options: ["20", "25", "30", "35"], correct: 2 },
  { id: 7, question: "Solve: 5² + 3² = ?", options: ["25", "34", "16", "64"], correct: 1 },
  { id: 8, question: "The LCM of 4 and 6 is:", options: ["8", "10", "12", "24"], correct: 2 },
  { id: 9, question: "What is the perimeter of a rectangle with length 8cm and width 5cm?", options: ["13cm", "26cm", "40cm", "80cm"], correct: 1 },
  { id: 10, question: "Convert 0.75 to a fraction:", options: ["1/2", "3/4", "2/3", "7/10"], correct: 1 },
];

export default function CBTExamInterface() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); setSubmitted(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (optionIdx: number) => { setAnswers({ ...answers, [currentQ]: optionIdx }); };
  const handleSubmit = () => { setSubmitted(true); setShowSubmitModal(false); };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const answeredCount = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((acc, [qIdx, aIdx]) => acc + (examQuestions[Number(qIdx)].correct === aIdx ? 1 : 0), 0);
  const timePercent = (timeLeft / 3600) * 100;
  const isLowTime = timeLeft < 300;

  if (submitted) {
    const percentage = Math.round((score / examQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", duration: 0.6 }} className="bg-card rounded-2xl p-8 max-w-lg w-full text-center relative overflow-hidden" style={{ boxShadow: "0 25px 60px -15px hsl(var(--primary) / 0.2)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="relative z-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
              <Flag className="w-10 h-10 text-success" />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold text-foreground mb-2">Exam Submitted! 🎉</motion.h2>
            <p className="text-sm text-muted-foreground mb-6">Your answers have been recorded successfully.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Total Questions", value: examQuestions.length, bg: "bg-muted" },
                { label: "Attempted", value: answeredCount, bg: "bg-muted" },
                { label: "Score", value: `${score}/${examQuestions.length}`, bg: "bg-success/10" },
                { label: "Percentage", value: `${percentage}%`, bg: percentage >= 50 ? "bg-success/10" : "bg-destructive/10" },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className={`${item.bg} rounded-xl p-4`}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-warning/10 rounded-xl p-3 mb-5 text-xs text-warning flex items-center gap-2">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>Essay questions are pending teacher review.</span>
            </div>

            <button onClick={() => navigate("/student-portal")} className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = examQuestions[currentQ];

  return (
    <div className="min-h-screen bg-background flex flex-col select-none" onCopy={e => e.preventDefault()} onPaste={e => e.preventDefault()} onContextMenu={e => e.preventDefault()}>
      {/* Exam Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-16 bg-primary flex items-center justify-between px-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary/30" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold">Mathematics — End of Term Exam</h1>
            <p className="text-xs text-primary-foreground/70">2025/2026 Academic Year • Term 1</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-sm font-medium bg-primary-foreground/10 px-3 py-1 rounded-lg">Q {currentQ + 1}/{examQuestions.length}</span>
          <motion.div animate={isLowTime ? { scale: [1, 1.05, 1] } : {}} transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-bold ${isLowTime ? "bg-destructive text-destructive-foreground" : "bg-primary-foreground/10"}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </motion.div>
          <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors" title="Toggle Fullscreen">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Time Progress Bar */}
      <div className="h-1 bg-muted">
        <motion.div className={`h-full transition-all duration-1000 ${isLowTime ? "bg-destructive" : "bg-secondary"}`} style={{ width: `${timePercent}%` }} />
      </div>

      <div className="flex flex-1">
        {/* Main Question Area */}
        <div className="flex-1 p-8 flex flex-col max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="flex-1">
              <div className="bg-card rounded-2xl p-8 mb-6 relative overflow-hidden" style={{ boxShadow: "0 4px 20px -5px hsl(var(--primary) / 0.1)" }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary">Question {currentQ + 1}</span>
                  <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">5 marks</span>
                </div>
                <p className="text-xl font-medium text-foreground leading-relaxed">{q.question}</p>
              </div>

              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectAnswer(i)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      answers[currentQ] === i
                        ? "border-secondary bg-secondary/5 shadow-md"
                        : "border-border hover:border-secondary/40 bg-card hover:shadow-sm"
                    }`}
                  >
                    <motion.span animate={answers[currentQ] === i ? { scale: [1, 1.15, 1] } : {}} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      answers[currentQ] === i ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </motion.span>
                    <span className="text-base font-medium text-foreground">{opt}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 transition-all">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {currentQ === examQuestions.length - 1 ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSubmitModal(true)} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-success text-success-foreground text-sm font-bold hover:opacity-90 transition-all shadow-lg">
                <Flag className="w-4 h-4" /> Submit Exam
              </motion.button>
            ) : (
              <button onClick={() => setCurrentQ(Math.min(examQuestions.length - 1, currentQ + 1))} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side Panel */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-72 bg-card border-l border-border p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-secondary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Question Navigator</h3>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {examQuestions.map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentQ(i)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                  i === currentQ
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-md"
                    : answers[i] !== undefined
                    ? "bg-success text-success-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground"><span className="w-4 h-4 rounded-md bg-success" /> <span>Answered ({answeredCount})</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><span className="w-4 h-4 rounded-md bg-muted" /> <span>Unanswered ({examQuestions.length - answeredCount})</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><span className="w-4 h-4 rounded-md bg-primary" /> <span>Current</span></div>
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-foreground">{answeredCount}/{examQuestions.length}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-secondary rounded-full" initial={{ width: 0 }} animate={{ width: `${(answeredCount / examQuestions.length) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Submit Confirmation */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 backdrop-blur-md z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring" }} className="bg-card rounded-2xl p-8 max-w-sm w-full mx-4" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <div className="flex items-center gap-3 mb-5">
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: 2, duration: 0.4 }} className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Submit Exam?</h3>
                  <p className="text-xs text-muted-foreground">{answeredCount} of {examQuestions.length} answered</p>
                </div>
              </div>
              {answeredCount < examQuestions.length && (
                <div className="bg-destructive/10 rounded-xl p-3 mb-4 text-xs text-destructive">
                  ⚠️ You have {examQuestions.length - answeredCount} unanswered question(s). They will be marked as incorrect.
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-6">Once submitted, you cannot modify your answers.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Continue Exam</button>
                <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-success text-success-foreground text-sm font-bold hover:opacity-90 transition-all">Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
