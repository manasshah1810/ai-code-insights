import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, RefreshCcw, Search, FileDown, Loader2, Moon, Sun } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { exportReport } from "@/lib/export-pdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function TopBar() {
  const { currentRole, setRole, lastUpdated, refreshTimestamp, theme, toggleTheme, developerUserId, managerUserId, managerTeamId } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const interval = setInterval(refreshTimestamp, 300000);
    return () => clearInterval(interval);
  }, [refreshTimestamp]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshTimestamp();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const userId = currentRole === "Developer" ? developerUserId : currentRole === "Manager" ? managerUserId : undefined;
      const teamId = currentRole === "Manager" ? managerTeamId : undefined;
      await exportReport(currentRole, userId, teamId);
      toast.success("PDF Report Exported", {
        description: `${currentRole} report has been downloaded successfully.`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Export Failed", {
        description: "Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-8 sticky top-0 z-50">
      <div className="flex items-center gap-6">


      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Telemetry Status</span>
            <Badge className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 px-1.5 py-0 text-[9px] font-black">ACTIVE</Badge>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Auto-sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Export PDF Button */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-2 rounded-xl border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-400 font-bold text-xs h-10 px-4 transition-all"
          onClick={handleExportPdf}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileDown className="h-3.5 w-3.5" />
          )}
          {isExporting ? "Exporting..." : "Export PDF"}
        </Button>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-none hover:shadow-sm"
            onClick={handleManualRefresh}
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1, ease: "linear" }}
            >
              <RefreshCcw className="h-4 w-4" />
            </motion.div>
          </Button>

          {/* Animated Light/Dark Pill Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
            className={`
              relative flex items-center gap-0.5 p-1 rounded-2xl transition-all duration-500 ease-in-out
              border shadow-inner cursor-pointer
              ${theme === 'dark'
                ? 'bg-slate-800 border-slate-700 shadow-slate-900'
                : 'bg-gradient-to-r from-amber-50 to-sky-50 border-amber-200/60 shadow-amber-100'
              }
            `}
          >
            {/* Sliding pill indicator */}
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className={`
                absolute top-1 h-8 w-8 rounded-xl z-0
                ${theme === 'light'
                  ? 'left-1 bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-400/40'
                  : 'left-[calc(100%-2.25rem)] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40'
                }
              `}
            />

            {/* Sun Icon */}
            <div className={`
              relative z-10 h-8 w-8 flex items-center justify-center rounded-xl transition-all duration-300 ${theme === 'light' ? 'text-indigo-500' : 'text-slate-400'}
            `}>
              <Sun className="h-4 w-4" />
            </div>

            {/* Moon Icon */}
            <div className={`
              relative z-10 h-8 w-8 flex items-center justify-center rounded-xl transition-all duration-300 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}
            `}>
              <Moon className="h-4 w-4" />
            </div>
          </button>

          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-none hover:shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 border-2 border-slate-50 dark:border-slate-900" />
          </Button>

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          <Select value={currentRole} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger className="w-[120px] h-10 rounded-xl border-none shadow-none bg-transparent hover:bg-white dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900">
              <SelectItem value="Admin" className="font-bold">Admin</SelectItem>
              <SelectItem value="Manager" className="font-bold">Manager</SelectItem>
              <SelectItem value="Developer" className="font-bold">Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}

