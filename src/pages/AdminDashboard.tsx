import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  ClipboardList,
  FileText,
  Plus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiExam,
  ApiStudent,
  fetchClasses,
  fetchClassResults,
  fetchExams,
  fetchStudents,
  fetchSubjects,
  fetchTeachers,
} from "@/lib/api";

type DashboardStat = {
  label: string;
  value: string;
  icon: typeof Users;
  color: string;
};

type Activity = {
  action: string;
  detail: string;
  time: string;
  user: string;
};

const formatRelativeDate = (iso?: string) => {
  if (!iso) return "recently";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const [studentsRes, teachersRes, classesRes, subjectsRes, examsRes] = await Promise.all([
          fetchStudents(token),
          fetchTeachers(token),
          fetchClasses(token),
          fetchSubjects(token),
          fetchExams(token),
        ]);

        const activeExams = examsRes.data.filter((exam) => exam.status === "active").length;

        const resultCounts = await Promise.all(
          classesRes.data.map(async (schoolClass) => {
            try {
              const classResults = await fetchClassResults(token, schoolClass.id);
              return classResults.length;
            } catch {
              return 0;
            }
          })
        );

        const totalResults = resultCounts.reduce((sum, count) => sum + count, 0);

        setStats([
          { label: "Total Students", value: String(studentsRes.total), icon: Users, color: "bg-primary" },
          { label: "Total Teachers", value: String(teachersRes.total), icon: GraduationCap, color: "bg-secondary" },
          { label: "Total Classes", value: String(classesRes.total), icon: School, color: "bg-success" },
          { label: "Total Subjects", value: String(subjectsRes.total), icon: BookOpen, color: "bg-info" },
          { label: "Active Exams", value: String(activeExams), icon: ClipboardList, color: "bg-warning" },
          { label: "Results Generated", value: String(totalResults), icon: FileText, color: "bg-chart-5" },
        ]);

        const recentExams = [...examsRes.data]
          .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
          .slice(0, 3)
          .map((exam: ApiExam) => ({
            action: "Exam Updated",
            detail: `${exam.subject?.name || "Subject"} - ${exam.school_class?.name || "Class"}`,
            time: formatRelativeDate(exam.exam_date),
            user: "System",
          }));

        const recentStudents = [...studentsRes.data]
          .slice(0, 2)
          .map((student: ApiStudent) => ({
            action: "Student Record",
            detail: `${student.user.name} - ${student.school_class?.name || "Class"}`,
            time: "recently",
            user: "Admin",
          }));

        setActivities([...recentExams, ...recentStudents]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load dashboard";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  const quickActions = useMemo(
    () => [
      { label: "Add New Student", icon: UserPlus, href: "/students" },
      { label: "Create Exam", icon: ClipboardList, href: "/exams" },
      { label: "Generate Results", icon: FileText, href: "/results" },
      { label: "Add Questions", icon: Plus, href: "/questions" },
    ],
    []
  );

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Dashboard" }]}>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here is what is happening today.</p>
      </div>

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
            </div>
            <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Activities</h2>
          </div>
          <div className="divide-y divide-border">
            {activities.map((activity, i) => (
              <div key={`${activity.action}-${i}`} className="px-5 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
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
            {!isLoading && activities.length === 0 && (
              <div className="px-5 py-6 text-sm text-muted-foreground">No recent activity available.</div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
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
