import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Eye, EyeOff, ShieldPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const email = identifier.includes("@") ? identifier : `${identifier}@smartexampro.local`;
      await login(email.trim(), password, ["student"]);
      navigate("/student-portal");
    } catch (error) {
      const fallbackMessage = "Unable to sign in. Please check your credentials.";
      const message = error instanceof Error ? error.message : (error as { message?: string })?.message || fallbackMessage;
      setErrorMessage(message);
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

      {/* Background Pattern */}
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
          onClick={() => navigate("/staff-login")}
          className="absolute top-4 right-4 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          aria-label="Go to Admin and Teacher login"
          title="Admin and Teacher login"
        >
          <ShieldPlus className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Smart Exam Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">Digital Examination System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Student ID</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter Student ID or Email"
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all text-sm"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}

          <p className="text-center text-sm text-muted-foreground">
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-secondary hover:underline">Forgot password?</button>
          </p>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground">© 2026 Intelink SOLUTIONS. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}
