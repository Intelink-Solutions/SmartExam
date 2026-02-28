import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Bell, Search } from "lucide-react";

interface TopNavbarProps {
  breadcrumbs?: { label: string; path?: string }[];
}

export function TopNavbar({ breadcrumbs }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { role } = useAuth();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 no-print" style={{ boxShadow: "var(--shadow-sm)" }}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs?.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            {i === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-active">{b.label}</span>
            ) : (
              <span className="breadcrumb-item">{b.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 mr-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-40"
          />
        </div>

        <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
          2024/2025 • Term 1
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <button className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
