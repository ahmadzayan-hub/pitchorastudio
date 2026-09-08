"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { ToastProvider } from "@/components/ui/Toast";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <ToastProvider>
      {/* Animated background mesh */}
      <div className="bg-mesh" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      <div className="app-layout relative z-10">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="app-main">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} />
          <main
            id="main"
            className={`flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <div className="animate-fade-up">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
