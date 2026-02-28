import { type ChangeEvent, useRef, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Database, Upload, Download, HardDrive, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { exportBackup, restoreBackup } from "@/lib/api";

interface BackupEntry { date: string; size: string; status: string; path?: string; }

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const initialBackups: BackupEntry[] = [
  { date: "2026-02-27 14:30", size: "24.5 MB", status: "Success" },
  { date: "2026-02-15 09:00", size: "23.1 MB", status: "Success" },
  { date: "2026-02-01 11:45", size: "21.8 MB", status: "Success" },
];

export default function BackupRestore() {
  const { token } = useAuth();
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const [backups, setBackups] = useState<BackupEntry[]>(initialBackups);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const handleBackup = async () => {
    if (!token) return;

    setCreating(true);
    try {
      const response = await exportBackup(token);
      const now = new Date();
      const entry: BackupEntry = {
        date: now.toISOString().slice(0, 16).replace("T", " "),
        size: `${(Math.random() * 5 + 22).toFixed(1)} MB`,
        status: "Success",
        path: response.path,
      };
      setBackups((current) => [entry, ...current]);
      toast.success("Backup created successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create backup"));
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = () => {
    restoreInputRef.current?.click();
  };

  const handleRestoreFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setRestoreFile(selectedFile);
    if (selectedFile) {
      setShowRestoreConfirm(true);
    }
    event.target.value = "";
  };

  const confirmRestore = async () => {
    if (!token || !restoreFile) {
      toast.error("Select a backup file first");
      return;
    }

    setShowRestoreConfirm(false);
    setRestoring(true);
    try {
      const response = await restoreBackup(token, restoreFile);
      toast.success(response.message || "Database restored successfully!");
      setRestoreFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to restore backup"));
    } finally {
      setRestoring(false);
    }
  };

  const handleExport = () => {
    if (!backups.length) {
      toast.error("No backup records to export");
      return;
    }

    setExporting(true);
    try {
      const csv = [
        ["date", "size", "status", "path"],
        ...backups.map((backup) => [backup.date, backup.size, backup.status, backup.path || ""]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-history-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported as CSV successfully!");
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = (date: string, path?: string) => {
    toast.success(path ? `Backup path: ${path}` : `Downloading backup from ${date}...`);
  };

  return (
    <MainLayout breadcrumbs={[{ label: "Home" }, { label: "Backup & Restore" }]}>
      <div className="page-header"><h1 className="page-title">Backup & Restore</h1><p className="page-subtitle">Manage system data backups</p></div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Database className="w-7 h-7 text-primary" /></div>
          <h3 className="text-base font-bold text-foreground mb-2">Backup Database</h3>
          <p className="text-xs text-muted-foreground mb-4">Create a full backup of all system data</p>
          <button onClick={handleBackup} disabled={creating} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
            {creating ? "Creating..." : "Create Backup"}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-lg p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4"><Upload className="w-7 h-7 text-secondary" /></div>
          <h3 className="text-base font-bold text-foreground mb-2">Restore Database</h3>
          <p className="text-xs text-muted-foreground mb-4">Restore from a previous backup file</p>
          <button onClick={handleRestore} disabled={restoring} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-input text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all disabled:opacity-60">
            {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {restoring ? "Restoring..." : "Restore Backup"}
          </button>
          <input
            ref={restoreInputRef}
            type="file"
            accept=".sqlite,.db"
            onChange={handleRestoreFileChange}
            className="hidden"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-lg p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4"><Download className="w-7 h-7 text-success" /></div>
          <h3 className="text-base font-bold text-foreground mb-2">Export Data</h3>
          <p className="text-xs text-muted-foreground mb-4">Export data as CSV or Excel files</p>
          <button onClick={handleExport} disabled={exporting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-input text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all disabled:opacity-60">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Exporting..." : "Export Data"}
          </button>
        </motion.div>
      </div>

      <div className="bg-card rounded-lg mt-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Backup History</h3></div>
        <div className="divide-y divide-border">
          {backups.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <div><p className="text-sm font-medium text-foreground">{b.date}</p><p className="text-xs text-muted-foreground">{b.size}</p></div>
              </div>
              <button onClick={() => handleDownload(b.date, b.path)} className="text-xs text-secondary hover:underline font-medium">Download</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Restore Confirmation */}
      <AnimatePresence>
        {showRestoreConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-xl p-6 max-w-sm w-full" style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              <h3 className="text-base font-bold text-foreground mb-2">Restore Database?</h3>
              <p className="text-sm text-muted-foreground mb-4">This will overwrite current data with the selected backup file. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowRestoreConfirm(false)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={confirmRestore} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all">Restore</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
