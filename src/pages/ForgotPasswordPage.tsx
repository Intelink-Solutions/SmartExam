import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { forgotPasswordRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPasswordRequest(email.trim());
      setMessage(response.message || "If that email exists, a password reset link has been sent.");
    } catch (error) {
      const fallbackMessage = "Unable to process request right now.";
      const apiMessage = (error as { message?: string })?.message;
      setErrorMessage(apiMessage || fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-background/88" />

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-xl p-8 w-full max-w-md relative z-10"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)" }}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          aria-label="Back to login"
          title="Back to login"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@smartexampro.local"
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all text-sm disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          {message && <p className="text-sm text-success text-center">{message}</p>}
          {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}

          <p className="text-center text-sm text-muted-foreground">
            <button type="button" onClick={() => navigate("/")} className="text-secondary hover:underline">
              Back to login
            </button>
          </p>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground">© 2026 Intelink SOLUTIONS. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}
