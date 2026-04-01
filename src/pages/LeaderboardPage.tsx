import { useState } from "react";
import { users, formatNumber } from "@/data/dashboard-data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { DataTable } from "@/components/ui/DataTable";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Star, Shield, Info, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { anonymizeIdSync } from "@/lib/privacy-utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { strictPrivacyMode, userOptInList } = useAppStore();

  const visibleUsers = users.filter(u => !strictPrivacyMode || (userOptInList[u.id] || false));
  const sorted = [...visibleUsers].sort((a, b) => a.rank - b.rank);

  if (strictPrivacyMode && sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <motion.div
          initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          className="h-28 w-28 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mb-2 border border-amber-100 dark:border-amber-900/30 shadow-2xl shadow-amber-100/50 dark:shadow-amber-900/20"
        >
          <Trophy className="h-12 w-12" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Leaderboard Locked</h2>
          <p className="max-w-md text-slate-500 font-medium leading-relaxed mx-auto">
            Strict Privacy Mode is <span className="text-slate-900 font-bold">Activated</span>.
            The competitive rankings are hidden until developers manually opt-in from their profile control center.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Shield className="h-3 w-3" /> Privacy Protocols Active
        </div>
      </div>
    );
  }

  const columns = [
    {
      header: "#",
      accessorKey: "rank",
      cell: (val: number) => {
        if (val === 1) return <span className="text-lg">🥇</span>;
        if (val === 2) return <span className="text-lg">🥈</span>;
        if (val === 3) return <span className="text-lg">🥉</span>;
        return <span className="font-black font-metric text-slate-400 pl-1">{val}</span>;
      },
      className: "w-12"
    },
    {
      header: "Engineer",
      accessorKey: "name",
      cell: (val: string, row: any) => (
        <div
          className="flex items-center gap-3 cursor-pointer group/user"
          onClick={() => navigate(`/users/${row.id}`)}
        >
          <UserAvatar name={strictPrivacyMode ? "?" : val} size="sm" />
          <div>
            <p className="font-bold text-slate-900 group-hover/user:text-indigo-600 transition-colors">
              {strictPrivacyMode ? `Engineer # ${anonymizeIdSync(row.id)}` : val}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{row.team}</p>
          </div>
        </div>
      )
    },
    {
      header: "AI Code %",
      accessorKey: "aiPercent",
      cell: (val: number) => (
        <div className="flex items-center gap-2">
          <span className="font-black font-metric text-indigo-600">{val}%</span>
          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${val}%` }} />
          </div>
        </div>
      ),
      align: 'right' as const
    },
    {
      header: "Merge Rate",
      accessorKey: "aiMergeRate",
      cell: (val: number) => <span className="font-bold font-metric text-emerald-600">{val}%</span>,
      align: 'right' as const
    },
    {
      header: "Tokens",
      accessorKey: "tokensUsed",
      cell: (val: number) => <span className="font-bold font-metric text-slate-500">{formatNumber(val)}</span>,
      align: 'right' as const
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (val: string) => <StatusBadge status={val} size="sm" />
    },
    {
      header: "Date",
      accessorKey: "lastActiveDate",
      cell: (val: string) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{val}</span>
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 max-w-6xl mx-auto pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Global Rankings</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl">
            The <span className="text-indigo-600">Leaderboard</span>
          </h1>
          <p className="text-base text-slate-500 mt-2 font-medium">Tracking AI adoption, efficiency, and engineering excellence</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Updates Active</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        {/* Silver - 2nd Place */}
        {sorted[1] && (
          <motion.div
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/users/${sorted[1].id}`)}
            className="order-2 md:order-1 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-premium text-center relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Medal className="h-24 w-24 text-slate-400" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rank #2</p>
            <div className="relative inline-block mb-4">
              <UserAvatar name={strictPrivacyMode ? "?" : sorted[1].name} size="lg" className="ring-4 ring-slate-100" />
              <div className="absolute -top-3 -right-3 h-8 w-8 rounded-xl bg-slate-300 flex items-center justify-center text-slate-700 font-black shadow-lg border-2 border-white">
                2
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
              {strictPrivacyMode ? `Dev #${anonymizeIdSync(sorted[1].id)}` : sorted[1].name}
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">{sorted[1].team}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Output</p>
                <p className="text-lg font-black font-metric text-indigo-600">{sorted[1].aiPercent}%</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Merge Rate</p>
                <p className="text-lg font-black font-metric text-emerald-600">{sorted[1].aiMergeRate}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gold - 1st Place */}
        {sorted[0] && (
          <motion.div
            whileHover={{ y: -15, scale: 1.02 }}
            onClick={() => navigate(`/users/${sorted[0].id}`)}
            className="order-1 md:order-2 rounded-[3.5rem] border-4 border-amber-400/20 bg-slate-900 dark:bg-slate-900 p-10 shadow-2xl shadow-amber-200/20 text-center relative overflow-hidden group cursor-pointer scale-105"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-all">
              <Trophy className="h-32 w-32 text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">AI Visionary • #1</p>
            <div className="relative inline-block mb-6">
              <UserAvatar name={strictPrivacyMode ? "?" : sorted[0].name} size="xl" className="ring-8 ring-amber-400/10 shadow-2xl" />
              <div className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-amber-400 flex items-center justify-center text-amber-900 font-black text-lg shadow-xl border-4 border-slate-900">
                1
              </div>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter mb-1">
              {strictPrivacyMode ? `Dev #${anonymizeIdSync(sorted[0].id)}` : sorted[0].name}
            </h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{sorted[0].team}</p>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-inner">
                <p className="text-[10px] font-black text-amber-400/70 uppercase tracking-widest mb-1">AI Power</p>
                <p className="text-2xl font-black font-metric text-white">{sorted[0].aiPercent}%</p>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-inner">
                <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-widest mb-1">Merge Rate</p>
                <p className="text-2xl font-black font-metric text-white">{sorted[0].aiMergeRate}%</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-amber-400 animate-pulse">
              <Star className="h-4 w-4 fill-current" /> ULTIMATE PERFORMANCE <Star className="h-4 w-4 fill-current" />
            </div>
          </motion.div>
        )}

        {/* Bronze - 3rd Place */}
        {sorted[2] && (
          <motion.div
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/users/${sorted[2].id}`)}
            className="order-3 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-premium text-center relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Medal className="h-24 w-24 text-orange-400" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rank #3</p>
            <div className="relative inline-block mb-4">
              <UserAvatar name={strictPrivacyMode ? "?" : sorted[2].name} size="lg" className="ring-4 ring-orange-50" />
              <div className="absolute -top-3 -right-3 h-8 w-8 rounded-xl bg-orange-300 flex items-center justify-center text-orange-900 font-black shadow-lg border-2 border-white">
                3
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
              {strictPrivacyMode ? `Dev #${anonymizeIdSync(sorted[2].id)}` : sorted[2].name}
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">{sorted[2].team}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Output</p>
                <p className="text-lg font-black font-metric text-indigo-600">{sorted[2].aiPercent}%</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Merge Rate</p>
                <p className="text-lg font-black font-metric text-emerald-600">{sorted[2].aiMergeRate}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Full Rankings Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Fleet Rankings</h3>
            <Badge className="bg-slate-100 text-slate-600 font-bold border-slate-200">{sorted.length} ACTIVE DEVS</Badge>
          </div>
          {strictPrivacyMode && (
            <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Info className="h-3 w-3" /> Names Anonymized for Privacy
            </div>
          )}
        </div>

        <DataTable data={sorted} columns={columns as any} className="shadow-premium" />
      </div>

      {/* Motivational Footer */}
      <div className="p-10 rounded-[3rem] bg-indigo-600 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp className="h-32 w-32" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase">Unlock Your AI Potential</h3>
          <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
            Engineering excellence is no longer just about writing code—it's about mastering the next generation of intelligent tools.
            Keep pushing the boundaries of what's possible with AI.
          </p>
          <Button
            onClick={() => navigate('/settings')}
            className="bg-white text-indigo-600 font-black h-12 rounded-xl px-8 hover:bg-white/90 shadow-xl shadow-indigo-900/20 active:scale-95 transition-all"
          >
            Configure AI Tools <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
