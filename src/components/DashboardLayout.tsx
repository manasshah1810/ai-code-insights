import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { ChatBot } from "@/components/ChatBot";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <SidebarProvider>
      <div className={cn(
        "relative min-h-screen flex w-full overflow-hidden font-sans antialiased transition-colors duration-500",
        isDark ? "bg-slate-950 text-slate-100" : "bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 text-slate-900"
      )}>
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {isDark ? (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/30 rounded-full blur-[120px] animate-blob" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
              <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-blue-900/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
            </>
          ) : (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] animate-blob" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
              <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-emerald-200/25 rounded-full blur-[100px] animate-blob animation-delay-4000" />
            </>
          )}
        </div>

        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <TopBar />
          <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-12 xl:p-16 scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Floating ChatBot */}
        <ChatBot />
      </div>
    </SidebarProvider>
  );
}
