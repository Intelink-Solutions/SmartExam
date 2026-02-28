import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, School,
  FileQuestion, ClipboardList, Monitor, CheckSquare, FileText,
  BarChart3, Settings, Database, ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Students", icon: Users, path: "/students" },
  { label: "Teachers", icon: GraduationCap, path: "/teachers" },
  { label: "Classes & Subjects", icon: School, path: "/classes" },
  { label: "Question Bank", icon: FileQuestion, path: "/questions" },
  { label: "Exams", icon: ClipboardList, path: "/exams" },
  { label: "Results", icon: FileText, path: "/results" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Backup & Restore", icon: Database, path: "/backup" },
];

const teacherNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Question Bank", icon: FileQuestion, path: "/questions" },
  { label: "Exams", icon: ClipboardList, path: "/exams" },
  { label: "Essay Marking", icon: CheckSquare, path: "/essay-marking" },
  { label: "Results", icon: FileText, path: "/results" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
];

const studentNav = [
  { label: "My Dashboard", icon: LayoutDashboard, path: "/student-portal" },
  { label: "My Exams", icon: Monitor, path: "/student-portal" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userName, logout } = useAuth();

  const navItems = role === "admin" || role === "super_admin" ? adminNav : role === "teacher" ? teacherNav : studentNav;

  return (
    <aside
      className={`${collapsed ? "w-[68px]" : "w-[260px]"} bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 min-h-screen no-print`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-primary-foreground leading-tight truncate">Smart Exam Pro</h1>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">Digital Examination System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path + item.label}
              onClick={() => navigate(item.path)}
              className={`nav-item w-full ${isActive ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User / Bottom */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate text-sidebar-primary-foreground">{userName}</p>
              <p className="text-[10px] text-sidebar-foreground/60 capitalize">{role}</p>
            </div>
          </div>
        )}
        <div className="flex gap-1">
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="nav-item flex-1 text-sidebar-foreground/70 hover:text-destructive"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-xs">Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item text-sidebar-foreground/70"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
