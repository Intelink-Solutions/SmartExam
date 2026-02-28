import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
}

export function MainLayout({ children, breadcrumbs }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar breadcrumbs={breadcrumbs} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
