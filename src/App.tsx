import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { ApiUserRole } from "@/lib/api";
import LoginPage from "./pages/LoginPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminDashboard from "./pages/AdminDashboard";
import StudentManagement from "./pages/StudentManagement";
import TeacherManagement from "./pages/TeacherManagement";
import ClassManagement from "./pages/ClassManagement";
import QuestionBank from "./pages/QuestionBank";
import ExamManagement from "./pages/ExamManagement";
import StudentPortal from "./pages/StudentPortal";
import CBTExamInterface from "./pages/CBTExamInterface";
import EssayMarking from "./pages/EssayMarking";
import ResultGeneration from "./pages/ResultGeneration";
import ResultSlip from "./pages/ResultSlip";
import ReportsModule from "./pages/ReportsModule";
import SettingsModule from "./pages/SettingsModule";
import BackupRestore from "./pages/BackupRestore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ApiUserRole[] }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  const getPostLoginRoute = () => {
    if (role === "student") return "/student-portal";
    return "/dashboard";
  };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={getPostLoginRoute()} replace /> : <LoginPage />} />
      <Route path="/staff-login" element={isAuthenticated ? <Navigate to={getPostLoginRoute()} replace /> : <StaffLoginPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={getPostLoginRoute()} replace /> : <ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["super_admin", "admin", "teacher"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute allowedRoles={["super_admin", "admin"]}><StudentManagement /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute allowedRoles={["super_admin", "admin"]}><TeacherManagement /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute allowedRoles={["super_admin", "admin"]}><ClassManagement /></ProtectedRoute>} />
      <Route path="/questions" element={<ProtectedRoute allowedRoles={["super_admin", "admin", "teacher"]}><QuestionBank /></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute allowedRoles={["super_admin", "admin", "teacher"]}><ExamManagement /></ProtectedRoute>} />
      <Route path="/student-portal" element={<ProtectedRoute allowedRoles={["student"]}><StudentPortal /></ProtectedRoute>} />
      <Route path="/cbt-exam" element={<ProtectedRoute allowedRoles={["student"]}><CBTExamInterface /></ProtectedRoute>} />
      <Route path="/essay-marking" element={<ProtectedRoute allowedRoles={["super_admin", "admin", "teacher"]}><EssayMarking /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute allowedRoles={["super_admin", "admin", "teacher"]}><ResultGeneration /></ProtectedRoute>} />
      <Route path="/result-slip" element={<ProtectedRoute allowedRoles={["super_admin", "admin", "teacher", "student"]}><ResultSlip /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={["super_admin", "admin", "teacher"]}><ReportsModule /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={["super_admin", "admin"]}><SettingsModule /></ProtectedRoute>} />
      <Route path="/backup" element={<ProtectedRoute allowedRoles={["super_admin"]}><BackupRestore /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
