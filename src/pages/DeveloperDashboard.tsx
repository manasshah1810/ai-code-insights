import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, ComposedChart, Bar, Line, XAxis, YAxis, Label, CartesianGrid, Legend } from "recharts";
import {
    users, teams, formatNumber, weeklyTrend, repositories, aiTools
} from "@/data/dashboard-data";
import { MetricCard } from "@/components/ui/MetricCard";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { DataTable } from "@/components/ui/DataTable";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import {
    User, Zap, Code2, GitCommit, GitMerge, Coins, CheckCircle,
    TrendingUp, Cpu, MousePointer2, ShieldCheck, Sparkles,
    Hammer, Clock, Target, Activity, BarChart3,
    CalendarIcon, Filter
} from "lucide-react";

export default function DeveloperDashboard() {
    const { developerUserId } = useAppStore();
    const user = users.find(u => u.id === developerUserId);

    // ─── Filter State ─────────────────────────────────────────────────────
    const [dateFilterStr, setDateFilterStr] = useState<string>("all");
    const [prStatusFilter, setPrStatusFilter] = useState<string>("all");
    const [repoFilter, setRepoFilter] = useState<string>("all");

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Developer profile not found</p>
            </div>
        );
    }

    const team = teams.find(t => t.id === user.teamId);
    const manualPercent = parseFloat((100 - user.aiPercent).toFixed(1));

    // ─── Date scale factor ────────────────────────────────────────────────
    const daysMap: Record<string, number> = { "5": 5, "7": 7, "15": 15, "30": 30, "90": 90, "all": 120 };
    const daysSelected = daysMap[dateFilterStr] || 120;
    const scaleFactor = Math.min(1, daysSelected / 120);

    const dateLabel = dateFilterStr === "all" ? "All Time" : `Last ${dateFilterStr} days`;

    // User's repos (from their team) — filtered
    const allMyRepos = repositories.filter(r => r.team === user.team);
    const myRepos = repoFilter === "all" ? allMyRepos : allMyRepos.filter(r => r.name === repoFilter);

    // Scaled metrics
    const scaledAiLoC = Math.round(user.aiLoC * scaleFactor);
    const scaledManualLoC = Math.round(user.manualLoC * scaleFactor);
    const scaledTotalLoC = Math.round(user.totalLoC * scaleFactor);
    const scaledTokens = Math.round(user.tokensUsed * scaleFactor);
    const scaledCommits = Math.round(user.commits * scaleFactor);

    // User's AI tool breakdown (simulated from team data)
    const toolBreakdown = useMemo(() => {
        const primaryToolObj = aiTools.find(t =>
            t.shortName.toLowerCase().includes(user.primaryTool.toLowerCase())
        );
        return [
            { name: primaryToolObj?.shortName || user.primaryTool, percent: 62, color: primaryToolObj?.color || "#6366f1", loC: Math.floor(scaledAiLoC * 0.62) },
            { name: "Claude", percent: 22, color: "#D97706", loC: Math.floor(scaledAiLoC * 0.22) },
            { name: "ChatGPT", percent: 10, color: "#10B981", loC: Math.floor(scaledAiLoC * 0.10) },
            { name: "Gemini", percent: 6, color: "#2563EB", loC: Math.floor(scaledAiLoC * 0.06) },
        ];
    }, [user, scaledAiLoC]);

    const pieData = [
        { name: "AI Code", value: scaledAiLoC },
        { name: "Manual Code", value: scaledManualLoC },
    ];

    const toolPieData = toolBreakdown.map(t => ({
        name: t.name,
        value: t.loC,
        color: t.color,
    }));

    // PR filtering
    const filteredPRs = useMemo(() => {
        let prs = [...user.recentPRs];
        if (prStatusFilter !== "all") {
            prs = prs.filter(pr => pr.status === prStatusFilter);
        }
        return prs;
    }, [user.recentPRs, prStatusFilter]);

    const prColumns = [
        {
            header: "Pull Request",
            accessorKey: "title",
            cell: (val: string) => <span className="font-bold text-slate-900 text-sm">{val}</span>,
        },
        {
            header: "AI %",
            accessorKey: "aiPercent",
            cell: (val: number) => (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${val}%` }} />
                    </div>
                    <span className="font-bold font-metric text-indigo-600">{val}%</span>
                </div>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (val: string) => (
                <Badge className={cn(
                    "font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider",
                    val === "Merged" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        val === "Open" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                            "bg-rose-100 text-rose-700 border-rose-200"
                )}>
                    {val}
                </Badge>
            ),
        },
        {
            header: "Date",
            accessorKey: "date",
            cell: (val: string) => <span className="font-bold text-slate-400 text-xs">{val}</span>,
        },
    ];

    const sessionChartData = useMemo(() => {
        const numSessions = Math.max(2, Math.round(10 * scaleFactor));
        return Array.from({ length: numSessions }).map((_, i) => {
            const tokens = (Math.random() * 4000) + 1000;
            const lines = tokens * (0.03 + Math.random() * 0.05);
            return {
                session: `S${i + 1}`,
                tokensUsed: parseFloat(tokens.toFixed(2)),
                linesAccepted: parseFloat(lines.toFixed(2)),
            };
        });
    }, [scaleFactor]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Personal Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl">
                        My <span className="text-emerald-600">Performance</span>
                    </h1>
                    <p className="text-base text-slate-500 mt-2 font-medium">
                        Personal AI metrics for <span className="text-slate-900 font-bold">{user.name}</span> — <span className="text-slate-900">{dateLabel}</span>
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Select value={dateFilterStr} onValueChange={setDateFilterStr}>
                        <SelectTrigger className="h-11 w-[150px] rounded-xl border-slate-200 bg-white font-bold text-sm shadow-sm">
                            <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Date Range" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            <SelectItem value="all" className="font-bold">All Time</SelectItem>
                            <SelectItem value="5" className="font-bold">Last 5 days</SelectItem>
                            <SelectItem value="7" className="font-bold">Last 7 days</SelectItem>
                            <SelectItem value="15" className="font-bold">Last 15 days</SelectItem>
                            <SelectItem value="30" className="font-bold">Last 30 days</SelectItem>
                            <SelectItem value="90" className="font-bold">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={prStatusFilter} onValueChange={setPrStatusFilter}>
                        <SelectTrigger className="h-11 w-[150px] rounded-xl border-slate-200 bg-white font-bold text-sm shadow-sm">
                            <div className="flex items-center">
                                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="PR Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            <SelectItem value="all" className="font-bold">All PRs</SelectItem>
                            <SelectItem value="Merged" className="font-bold">Merged</SelectItem>
                            <SelectItem value="Open" className="font-bold">Open</SelectItem>
                            <SelectItem value="Rejected" className="font-bold">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    {allMyRepos.length > 1 && (
                        <Select value={repoFilter} onValueChange={setRepoFilter}>
                            <SelectTrigger className="h-11 w-[170px] rounded-xl border-slate-200 bg-white font-bold text-sm shadow-sm">
                                <div className="flex items-center">
                                    <Code2 className="h-4 w-4 mr-2 text-slate-400" />
                                    <SelectValue placeholder="Repository" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                <SelectItem value="all" className="font-bold">All Repos</SelectItem>
                                {allMyRepos.map(repo => (
                                    <SelectItem key={repo.name} value={repo.name} className="font-bold text-xs">{repo.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Profile Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <UserAvatar name={user.name} size="xl" />
                        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white border-4 border-white shadow-lg">
                            <Zap className="h-4 w-4" fill="currentColor" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black tracking-tighter text-slate-900">{user.name}</h2>
                            <StatusBadge status={user.status} size="md" />
                        </div>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                            {user.role} <span className="h-1 w-1 rounded-full bg-slate-300" /> {user.team}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Engine</p>
                        <p className="text-sm font-black text-slate-900 flex items-center gap-2 justify-end">
                            <Cpu className="h-4 w-4 text-indigo-500" /> {user.primaryTool}
                        </p>
                    </div>
                    <div className="text-right p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Rank</p>
                        <p className="text-sm font-black text-emerald-700">#{user.rank} of {users.length}</p>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="AI Contribution" value={user.aiPercent} icon={<Zap className="h-6 w-6" />} suffix="%" gradient="ai" trend={{ value: 12.4, isPositive: true }} />
                <MetricCard title="Avg. Tokens / Line" value={scaledAiLoC > 0 ? parseFloat((scaledTokens / scaledAiLoC).toFixed(2)) : 0} icon={<Cpu className="h-6 w-6" />} decimals={2} gradient="success" subtitle={`${dateLabel}`} />
                <MetricCard title="Merge Success" value={user.prMergeRate} icon={<GitMerge className="h-6 w-6" />} suffix="%" gradient="warning" trend={{ value: 4.2, isPositive: true }} />
                <MetricCard title="Commits" value={scaledCommits} icon={<GitCommit className="h-6 w-6" />} decimals={0} subtitle={`${dateLabel}`} />
            </div>

            {/* Code Split + Trend */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Code Split Donut */}
                <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-2">
                        <MousePointer2 className="h-5 w-5 text-emerald-500" /> My Code Origin
                    </h3>
                    <div className="flex flex-col items-center">
                        <div className="relative h-[200px] w-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value" animationDuration={1500}>
                                        <Cell fill="#6366f1" stroke="transparent" />
                                        <Cell fill="#e2e8f0" stroke="transparent" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-2xl font-black font-metric text-indigo-600">{user.aiPercent}%</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AI Powered</p>
                            </div>
                        </div>
                        <div className="w-full mt-6 grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Generated</p>
                                <p className="text-lg font-black text-indigo-700 font-metric">{formatNumber(scaledAiLoC)} LoC</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hand-crafted</p>
                                <p className="text-lg font-black text-slate-700 font-metric">{formatNumber(scaledManualLoC)} LoC</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Momentum Trend */}
                <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="h-40 w-40 text-white" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-white mb-8 relative z-10 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-400" /> My Adoption Trend (30D)
                    </h3>
                    <div className="relative z-10">
                        <EnhancedChart
                            type="area"
                            data={user.weeklyTrend}
                            index="week"
                            categories={["aiPercent"]}
                            colors={["#34d399"]}
                            valueFormatter={(v) => `${v}%`}
                            height={280}
                            xAxisLabel="Timeline (Weeks)"
                            yAxisLabel="Personal AI %"
                        />
                    </div>
                    <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative z-10">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">My Consistency</p>
                            <p className="text-sm text-slate-400 font-medium">You've maintained steady AI adoption growth over the past month.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-emerald-600 rounded-3xl p-8 shadow-xl shadow-emerald-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Activity className="h-32 w-32 text-white" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">Personal Performance Intel</h2>
                </div>
                <p className="text-emerald-50 text-lg font-medium leading-relaxed max-w-4xl">
                    You have successfully integrated <span className="text-white font-black underline decoration-emerald-300 underline-offset-4">{user.aiPercent}% AI code</span> into your workflow.
                    Your efficiency is recorded at <span className="text-white font-black underline decoration-emerald-300 underline-offset-4">{scaledAiLoC > 0 ? (scaledTokens / scaledAiLoC).toFixed(2) : 0} tokens per line</span>,
                    utilizing <span className="text-white font-black underline decoration-emerald-300 underline-offset-4">{formatNumber(scaledTokens)} total tokens</span>.
                    With a <span className="text-white font-black underline decoration-emerald-300 underline-offset-4">{user.prMergeRate}% PR success rate</span>,
                    you are ranked <span className="text-white font-black underline decoration-emerald-300 underline-offset-4">#{user.rank}</span> in the engineering fleet.
                </p>
            </div>

            {/* AI Tools I Use + My Repos */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* AI Tools I Use */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-500" /> AI Tools I Use
                    </h3>

                    <div className="relative h-[180px] w-[180px] mx-auto mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={toolPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" animationDuration={1500}>
                                    {toolPieData.map((entry, idx) => (
                                        <Cell key={`tool-cell-${idx}`} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", fontSize: "11px", color: "white" }}
                                    itemStyle={{ color: "white" }}
                                    formatter={(value: number) => formatNumber(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                        {toolBreakdown.map((tool) => (
                            <div key={tool.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tool.color }} />
                                    <span className="text-sm font-bold text-slate-900">{tool.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black font-metric text-slate-600">{formatNumber(tool.loC)}</span>
                                    <Badge className="text-[9px] px-1.5 font-black" style={{ backgroundColor: `${tool.color}15`, color: tool.color, border: `1px solid ${tool.color}30` }}>
                                        {tool.percent}%
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Repositories */}
                <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-emerald-500" /> My Repositories
                    </h3>
                    <div className="space-y-4">
                        {myRepos.map((repo) => (
                            <div key={repo.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Code2 className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-mono font-bold text-slate-900">{repo.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatNumber(repo.totalLoC)} LoC</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${repo.aiPercent}%` }} />
                                        </div>
                                        <span className="font-black font-metric text-emerald-600 text-sm">{repo.aiPercent}%</span>
                                    </div>
                                    <Badge className={cn(
                                        "text-[9px] font-black px-2 rounded-md",
                                        repo.primaryTool === "Cursor" ? "bg-violet-50 text-violet-600 border-violet-200" : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                        {repo.primaryTool}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {myRepos.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No repositories match the selected filter</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Token Usage + My PRs */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Token Metrics */}
                <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-emerald-500/10 blur-[80px] rounded-full" />
                    <div className="relative z-10">
                        <h3 className="text-xl font-black tracking-tight text-white mb-8 flex items-center gap-2">
                            <Coins className="h-6 w-6 text-amber-400" /> My Token Usage
                        </h3>
                        <div className="space-y-6">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tokens</p>
                                <p className="text-3xl font-black text-white font-metric">{formatNumber(scaledTokens)}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-1">{dateLabel}</p>
                            </div>
                            {user.primaryTool === "Cursor" && (
                                <>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-slate-400">Fast Requests</span>
                                        <span className="text-sm font-black text-white font-metric">{formatNumber(Math.round(user.cursorFastTokens * scaleFactor))}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-slate-400">Slow Requests</span>
                                        <span className="text-sm font-black text-white font-metric">{formatNumber(Math.round(user.cursorSlowTokens * scaleFactor))}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-indigo-400">Accept Rate</span>
                                        <span className="text-sm font-black text-indigo-300 font-metric">{user.cursorAcceptRate.toFixed(1)}%</span>
                                    </div>
                                </>
                            )}
                            {user.primaryTool === "Copilot" && (
                                <>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-slate-400">Suggestions</span>
                                        <span className="text-sm font-black text-white font-metric">{formatNumber(Math.round(user.copilotSuggestions * scaleFactor))}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-indigo-400">Accept Rate</span>
                                        <span className="text-sm font-black text-indigo-300 font-metric">{user.copilotAcceptRate.toFixed(1)}%</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-xs font-bold text-slate-400">Completions</span>
                                <span className="text-sm font-black text-white font-metric">{formatNumber(Math.round(user.cursorCompletions * scaleFactor))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Recent PRs */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <GitMerge className="h-5 w-5 text-emerald-500" /> My Recent Pull Requests
                            </h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {filteredPRs.length} {prStatusFilter !== "all" ? prStatusFilter.toUpperCase() : "SUBMISSIONS"}
                            </span>
                        </div>
                        {filteredPRs.length > 0 ? (
                            <DataTable data={filteredPRs} columns={prColumns as any} className="shadow-premium" />
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No PRs match the selected status filter</p>
                            </div>
                        )}
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
                                    <RechartsTooltip
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
                </div>
            </div>
        </motion.div>
    );
}
