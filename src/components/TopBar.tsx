import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Download, RefreshCcw, Search } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function TopBar() {
  const { currentRole, setRole, lastUpdated, refreshTimestamp } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(refreshTimestamp, 300000);
    return () => clearInterval(interval);
  }, [refreshTimestamp]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshTimestamp();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-xl px-8 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <SidebarTrigger className="text-slate-400 hover:text-indigo-600 transition-colors h-10 w-10 rounded-xl hover:bg-indigo-50" />
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search metrics, teams, or engineers..."
              className="h-11 w-80 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end mr-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telemetry Status</span>
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-1.5 py-0 text-[9px] font-black">ACTIVE</Badge>
          </div>
          <span className="text-xs font-bold text-slate-500">Auto-sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-none hover:shadow-sm"
            onClick={handleManualRefresh}
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1, ease: "linear" }}
            >
              <RefreshCcw className="h-4 w-4" />
            </motion.div>
          </Button>

          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-none hover:shadow-sm">
            <Bell className="h-4 w-4" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500 border-2 border-slate-50" />
          </Button>

          <div className="w-[1px] h-6 bg-slate-200 mx-1" />

          <Select value={currentRole} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger className="w-[120px] h-10 rounded-xl border-none shadow-none bg-transparent hover:bg-white font-bold text-xs text-slate-700 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100">
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
