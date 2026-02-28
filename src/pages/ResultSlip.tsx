import { MainLayout } from "@/components/MainLayout";
import { Printer, GraduationCap } from "lucide-react";
import { useLocation } from "react-router-dom";

type ResultSlipState = {
  studentName?: string;
  studentId?: number;
  total?: number;
  average?: number;
  grade?: string;
  position?: number;
  className?: string;
  termName?: string;
  academicYear?: string;
};

export default function ResultSlip() {
  const { state } = useLocation();
  const data = (state as ResultSlipState) || {};

  const studentName = data.studentName || "Student";
  const average = data.average || 0;
  const total = data.total || 0;
  const grade = data.grade || "N/A";
  const position = data.position || 0;

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Result Slip" }]}> 
      <div className="flex justify-end mb-4 no-print">
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          <Printer className="w-4 h-4" /> Print Result
        </button>
      </div>

      <div className="bg-card rounded-lg max-w-3xl mx-auto" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="text-center p-6 border-b border-border">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SMART EXAM PRO SCHOOL</h1>
              <p className="text-xs text-muted-foreground">{data.className || "Class"}</p>
              <p className="text-xs font-semibold text-secondary mt-1">TERMINAL REPORT CARD — {data.academicYear || "Academic Year"} • {data.termName || "Term"}</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-secondary/20 flex items-center justify-center text-lg font-bold text-secondary">{studentName.charAt(0)}</div>
              <div>
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="text-sm font-bold text-foreground">{studentName}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div><span className="text-xs text-muted-foreground">Student ID: </span><span className="text-xs font-medium text-foreground">{data.studentId || "N/A"}</span></div>
              <div><span className="text-xs text-muted-foreground">Class: </span><span className="text-xs font-medium text-foreground">{data.className || "N/A"}</span></div>
            </div>
            <div className="space-y-1">
              <div><span className="text-xs text-muted-foreground">Term: </span><span className="text-xs font-medium text-foreground">{data.termName || "N/A"}</span></div>
              <div><span className="text-xs text-muted-foreground">Year: </span><span className="text-xs font-medium text-foreground">{data.academicYear || "N/A"}</span></div>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-border grid grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Marks</p>
            <p className="text-lg font-bold text-foreground">{total}</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-bold text-foreground">{average}%</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Position</p>
            <p className="text-lg font-bold text-foreground">{position || "-"}</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Grade</p>
            <p className="text-lg font-bold text-success">{grade}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
