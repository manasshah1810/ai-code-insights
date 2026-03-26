import { useParams, useNavigate } from "react-router-dom";
import { users, formatNumber } from "@/data/dashboard-data";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { DataTable } from "@/components/ui/DataTable";
import {
  GitCommit,
  Code2,
  GitMerge,
  Coins,
  FileCode,
  CheckCircle,
  ChevronLeft,
  Lock,
  Zap,
  ShieldCheck,
  TrendingUp,
  Cpu,
  MousePointer2,
  Target, Activity, ArrowRight, Trophy, BarChart3,
  Database, Bot, Sparkles
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Label, CartesianGrid, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { strictPrivacyMode, currentRole, developerUserId, managerUserId, managerTeamId } = useAppStore();
  const user = users.find(u => u.id === Number(userId));

  // ─── Role-based access control ───────────────────────────
  // Admin: can view any user profile
  // Manager: can view only their own team members
  // Developer: can view only their own profile
  const isAdmin = currentRole === "Admin";
  const isManager = currentRole === "Manager";
  const isDeveloper = currentRole === "Developer";

  const canAccess = (() => {
    if (strictPrivacyMode && !isAdmin) return false;
    if (isAdmin) return true;
    if (isManager) {
      // Manager can view members of their own team
      const teamMembers = users.filter(u => u.teamId === managerTeamId);
      return teamMembers.some(m => m.id === Number(userId));
    }
    if (isDeveloper) {
      // Developer can only view their own profile
      return Number(userId) === developerUserId;
    }
    return false;
  })();

  if (!canAccess) {
    const reason = strictPrivacyMode
      ? "Individual engineering performance dashboards are disabled under the current Strict Privacy Mode configuration."
      : isDeveloper
        ? "As a Developer, you can only view your own profile. Team-wide and organization-wide profiles are restricted."
        : isManager
          ? "As a Manager, you can only view profiles of engineers on your team."
          : "You do not have permission to view this profile.";

    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="h-24 w-24 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-2 border border-rose-100 shadow-xl shadow-rose-100/50"
        >
          <Lock className="h-10 w-10" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Access Restricted</h2>
          <p className="max-w-md text-slate-500 font-medium leading-relaxed">
            {reason}
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="rounded-xl font-bold border-slate-200 px-8"
          onClick={() => navigate("/dashboard")}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (!user) return <div className="p-12 text-center font-black uppercase text-slate-300 tracking-widest">Engineer profile not found</div>;

  const pieData = [
    { name: "AI Code", value: user.aiLoC },
    { name: "Manual Code", value: user.manualLoC },
  ];

  const prColumns = [
    {
      header: "Pull Request Title",
      accessorKey: "title",
      cell: (val: string) => <span className="font-bold text-slate-900">{val}</span>
    },
    {
      header: "AI Contribution",
      accessorKey: "aiPercent",
      cell: (val: number) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${val}%` }} />
          </div>
          <span className="font-bold font-metric text-indigo-600">{val}%</span>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (val: string) => (
        <Badge className={cn(
          "font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider",
          val === "Merged" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" :
            val === "Open" ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" :
              "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200"
        )}>
          {val}
        </Badge>
      )
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (val: string) => <span className="font-bold text-slate-400 text-xs">{val}</span>
    }
  ];

  const sessionChartData = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const tokens = (Math.random() * 4000) + 1000;
      const lines = tokens * (0.03 + Math.random() * 0.05);
      return {
        session: `S${i + 1}`,
        tokensUsed: parseFloat(tokens.toFixed(2)),
        linesAccepted: parseFloat(lines.toFixed(2)),
      };
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-6xl mx-auto pb-12"
    >
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
        Back to Fleet
      </button>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-premium">
        <div className="flex items-center gap-6">
          <div className="relative">
            <UserAvatar name={user.name} size="xl" />
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white border-4 border-white shadow-lg">
              <Zap className="h-4 w-4" fill="currentColor" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">{user.name}</h1>
              <StatusBadge status={user.status} size="md" />
            </div>
            <p className="text-base text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
              {user.role} <span className="h-1 w-1 rounded-full bg-slate-300" /> {user.team}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Engine</p>
            <p className="text-sm font-black text-slate-900">{user.primaryTool}</p>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
            <Cpu className="h-5 w-5 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Commits" value={user.commits} icon={<GitCommit className="h-4 w-4" />} decimals={0} />
        <MetricCard title="AI Contribution" value={user.aiPercent} icon={<Zap className="h-4 w-4" />} suffix="%" gradient="ai" />
        <MetricCard title="Avg. Tokens / Line" value={user.aiLoC > 0 ? parseFloat((user.tokensUsed / user.aiLoC).toFixed(2)) : 0} icon={<Cpu className="h-4 w-4" />} decimals={2} gradient="success" />
        <MetricCard title="AI Merge Rate" value={user.aiMergeRate} icon={<GitMerge className="h-4 w-4" />} suffix="%" gradient="success" />
        <MetricCard title="Total Tokens" value={user.tokensUsed} icon={<Coins className="h-4 w-4" />} decimals={0} />
        <MetricCard title="PR Success" value={user.prMergeRate} icon={<CheckCircle className="h-4 w-4" />} suffix="%" gradient="warning" />
      </div>

      {/* SWOS Analysis Card */}
      <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Activity className="h-32 w-32 text-white" />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-tighter cursor-default">Engineering SWOS Intel</h2>
        </div>
        <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-4xl">
          <span className="text-white font-black">{user.name}'s</span> tactical SWOS profile indicates a <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{user.aiPercent}% AI-powered output</span>.
          Current operational efficiency is <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{user.aiLoC > 0 ? (user.tokensUsed / user.aiLoC).toFixed(2) : 0} tokens per line</span>.
          With a sustained <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{user.prMergeRate}% PR success rate</span>, this engineer's strengths lie in high-velocity delivery within the <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{user.team}</span> squadron.
          Threat mitigation is active, last verified on <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{user.lastActiveDate}</span>.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Composition Chart */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-indigo-500" /> Craftsmanship vs. AI
          </h3>
          <div className="flex flex-col items-center">
            <div className="relative h-[220px] w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    <Cell fill="#6366f1" stroke="transparent" />
                    <Cell fill="#e2e8f0" stroke="transparent" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-black font-metric text-indigo-600">{user.aiPercent}%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Power</p>
              </div>
            </div>

            <div className="w-full mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Generated</p>
                <p className="text-xl font-black text-indigo-700 font-metric">{formatNumber(user.aiLoC)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Human Written</p>
                <p className="text-xl font-black text-slate-700 font-metric">{formatNumber(user.manualLoC)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Momentum Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="h-40 w-40 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-white mb-8 relative z-10 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" /> Adoption Momentum (30D)
          </h3>
          <div className="relative z-10">
            <EnhancedChart
              type="area"
              data={user.weeklyTrend}
              index="week"
              categories={['aiPercent']}
              colors={['#818cf8']}
              valueFormatter={(v) => `${v}%`}
              height={250}
              xAxisLabel="Timeline (Weeks)"
              yAxisLabel="AI Adoption %"
            />
          </div>
          <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative z-10">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest">Consistency Rating</p>
              <p className="text-sm text-slate-400 font-medium">Engineer exhibits steady growth in AI proficiency with zero recorded regressions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Efficiency Chart */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500" /> Session Efficiency (Tokens vs Lines Accepted)
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sessionChartData} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="session" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10}>
                <Label value="Session ID" offset={-10} position="insideBottom" style={{ fill: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }} />
              </XAxis>
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }}>
                <Label value="Tokens Used" angle={-90} position="insideLeft" offset={10} style={{ fill: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, textAnchor: 'middle' }} />
              </YAxis>
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }}>
                <Label value="Lines Accepted" angle={90} position="insideRight" offset={10} style={{ fill: '#10b981', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px" }}
                itemStyle={{ color: "white", fontSize: "12px", fontWeight: "bold" }}
                labelStyle={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar yAxisId="left" dataKey="tokensUsed" name="Tokens Used" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="linesAccepted" name="Lines Accepted" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PR Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Code2 className="h-6 w-6 text-indigo-500" /> Recent Pull Requests
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.recentPRs.length} SUBMISSIONS</span>
        </div>
        <DataTable data={user.recentPRs} columns={prColumns as any} className="shadow-premium" />
      </div>
    </motion.div>
  );
}
