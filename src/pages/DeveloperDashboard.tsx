import { useMemo } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
    users, teams, formatNumber, weeklyTrend, repositories, aiTools
} from "@/data/dashboard-data";
import { MetricCard } from "@/components/ui/MetricCard";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { DataTable } from "@/components/ui/DataTable";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import {
    User, Zap, Code2, GitCommit, GitMerge, Coins, CheckCircle,
    TrendingUp, Cpu, MousePointer2, ShieldCheck, Sparkles,
    Hammer, Clock, Target, Activity
} from "lucide-react";

export default function DeveloperDashboard() {
    const { developerUserId } = useAppStore();
    const user = users.find(u => u.id === developerUserId);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Developer profile not found</p>
            </div>
        );
    }

    const team = teams.find(t => t.id === user.teamId);
    const manualPercent = parseFloat((100 - user.aiPercent).toFixed(1));

    // User's repos (from their team)
    const myRepos = repositories.filter(r => r.team === user.team);

    // User's AI tool breakdown (simulated from team data)
    const toolBreakdown = useMemo(() => {
        const primaryToolObj = aiTools.find(t =>
            t.shortName.toLowerCase().includes(user.primaryTool.toLowerCase())
        );
        return [
            { name: primaryToolObj?.shortName || user.primaryTool, percent: 62, color: primaryToolObj?.color || "#6366f1", loC: Math.floor(user.aiLoC * 0.62) },
            { name: "Claude", percent: 22, color: "#D97706", loC: Math.floor(user.aiLoC * 0.22) },
            { name: "ChatGPT", percent: 10, color: "#10B981", loC: Math.floor(user.aiLoC * 0.10) },
            { name: "Gemini", percent: 6, color: "#2563EB", loC: Math.floor(user.aiLoC * 0.06) },
        ];
    }, [user]);

    const pieData = [
        { name: "AI Code", value: user.aiLoC },
        { name: "Manual Code", value: user.manualLoC },
    ];

    const toolPieData = toolBreakdown.map(t => ({
        name: t.name,
        value: t.loC,
        color: t.color,
    }));

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
                        Personal AI metrics and coding activity for <span className="text-slate-900 font-bold">{user.name}</span>
                    </p>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard title="My Commits" value={user.commits} icon={<GitCommit className="h-4 w-4" />} decimals={0} />
                <MetricCard title="Total LoC" value={user.totalLoC} icon={<Code2 className="h-4 w-4" />} decimals={0} />
                <MetricCard title="AI Code %" value={user.aiPercent} icon={<Zap className="h-4 w-4" />} suffix="%" gradient="ai" />
                <MetricCard title="Manual Code %" value={manualPercent} icon={<Hammer className="h-4 w-4" />} suffix="%" gradient="manual" />
                <MetricCard title="Merge Rate" value={user.aiMergeRate} icon={<GitMerge className="h-4 w-4" />} suffix="%" gradient="success" />
                <MetricCard title="PR Success" value={user.prMergeRate} icon={<CheckCircle className="h-4 w-4" />} suffix="%" gradient="warning" />
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
                                <p className="text-lg font-black text-indigo-700 font-metric">{formatNumber(user.aiLoC)} LoC</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hand-crafted</p>
                                <p className="text-lg font-black text-slate-700 font-metric">{formatNumber(user.manualLoC)} LoC</p>
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
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No repositories found for your team</p>
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
                                <p className="text-3xl font-black text-white font-metric">{formatNumber(user.tokensUsed)}</p>
                            </div>
                            {user.primaryTool === "Cursor" && (
                                <>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-slate-400">Fast Requests</span>
                                        <span className="text-sm font-black text-white font-metric">{formatNumber(user.cursorFastTokens)}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-slate-400">Slow Requests</span>
                                        <span className="text-sm font-black text-white font-metric">{formatNumber(user.cursorSlowTokens)}</span>
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
                                        <span className="text-sm font-black text-white font-metric">{formatNumber(user.copilotSuggestions)}</span>
                                    </div>
                                    <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-xs font-bold text-indigo-400">Accept Rate</span>
                                        <span className="text-sm font-black text-indigo-300 font-metric">{user.copilotAcceptRate.toFixed(1)}%</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-xs font-bold text-slate-400">Completions</span>
                                <span className="text-sm font-black text-white font-metric">{formatNumber(user.cursorCompletions)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Recent PRs */}
                <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            <GitMerge className="h-5 w-5 text-emerald-500" /> My Recent Pull Requests
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.recentPRs.length} SUBMISSIONS</span>
                    </div>
                    <DataTable data={user.recentPRs} columns={prColumns as any} className="shadow-premium" />
                </div>
            </div>
        </motion.div>
    );
}
