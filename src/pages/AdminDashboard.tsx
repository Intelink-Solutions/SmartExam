import { MainLayout } from "@/components/MainLayout";
import { motion } from "framer-motion";
import {
  Users, GraduationCap, School, BookOpen, ClipboardList, FileText,
  Plus, UserPlus, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const stats = [
  { label: "Total Students", value: "1,248", icon: Users, change: "+12%", up: true, color: "bg-primary" },
  { label: "Total Teachers", value: "86", icon: GraduationCap, change: "+3%", up: true, color: "bg-secondary" },
  { label: "Total Classes", value: "42", icon: School, change: "0%", up: true, color: "bg-success" },
  { label: "Total Subjects", value: "18", icon: BookOpen, change: "+2", up: true, color: "bg-info" },
  { label: "Active Exams", value: "7", icon: ClipboardList, change: "-2", up: false, color: "bg-warning" },
  { label: "Results Generated", value: "3,891", icon: FileText, change: "+145", up: true, color: "bg-chart-5" },
];

const recentActivities = [
  { action: "Exam Created", detail: "Mathematics - JHS 2", time: "2 mins ago", user: "Mr. Johnson" },
  { action: "Student Added", detail: "Kwame Asante - SHS 1A", time: "15 mins ago", user: "Admin" },
  { action: "Results Published", detail: "English - Primary 6", time: "1 hour ago", user: "System" },
  { action: "Question Added", detail: "Science - 25 questions", time: "2 hours ago", user: "Mrs. Mensah" },
  { action: "Exam Completed", detail: "Social Studies - JHS 3", time: "3 hours ago", user: "System" },
];

export default function AdminDashboard() {
  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Dashboard" }]}>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Activities</h2>
            <button className="text-xs text-secondary hover:underline">View All</button>
          </div>
          <div className="divide-y divide-border">
            {recentActivities.map((activity, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Add New Student", icon: UserPlus, href: "/students" },
              { label: "Create Exam", icon: ClipboardList, href: "/exams" },
              { label: "Generate Results", icon: FileText, href: "/results" },
              { label: "Add Questions", icon: Plus, href: "/questions" },
            ].map((action) => (
                <a
                key={action.label}
                href={action.href}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted text-foreground text-sm font-medium transition-colors"
              >
                <action.icon className="w-4 h-4 text-secondary" />
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
