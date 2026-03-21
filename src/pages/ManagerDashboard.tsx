import { useMemo } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
    users, teams, formatNumber, weeklyTrend, repositories, aiTools,
    teamToolUsage, orgData
} from "@/data/dashboard-data";
import { MetricCard } from "@/components/ui/MetricCard";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { DataTable } from "@/components/ui/DataTable";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    Users as UsersIcon, Zap, Code2, GitMerge, Coins,
    TrendingUp, ShieldCheck, Sparkles, Hammer, Clock,
    Target, Activity, ArrowRight, Trophy, BarChart3,
    Database, Bot
} from "lucide-react";

export default function ManagerDashboard() {
    const { managerUserId, managerTeamId } = useAppStore();
    const navigate = useNavigate();

    const manager = users.find(u => u.id === managerUserId);
    const team = teams.find(t => t.id === managerTeamId);

    if (!team || !manager) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Team not found</p>
            </div>
        );
    }

    // Team members only
    const teamMembers = users.filter(u => u.teamId === managerTeamId);
    const teamRepos = repositories.filter(r => r.team === team.name);

    // Team aggregate stats
    const teamTotalLoC = teamMembers.reduce((a, u) => a + u.totalLoC, 0);
    const teamAiLoC = teamMembers.reduce((a, u) => a + u.aiLoC, 0);
    const teamManualLoC = teamMembers.reduce((a, u) => a + u.manualLoC, 0);
    const teamAiPercent = parseFloat(((teamAiLoC / teamTotalLoC) * 100).toFixed(1));
    const teamManualPercent = parseFloat((100 - teamAiPercent).toFixed(1));
    const teamTotalCommits = teamMembers.reduce((a, u) => a + u.commits, 0);
    const teamTokens = teamMembers.reduce((a, u) => a + u.tokensUsed, 0);
    const avgMergeRate = parseFloat((teamMembers.reduce((a, u) => a + u.aiMergeRate, 0) / teamMembers.length).toFixed(1));
    const powerUsers = teamMembers.filter(u => u.status === "Power User").length;
    const activeUsers = teamMembers.filter(u => u.aiPercent > 0).length;

    const teamPie = [
        { name: "AI Code", value: teamAiLoC },
        { name: "Manual Code", value: teamManualLoC },
    ];

    // Team tool usage
    const teamToolData = teamToolUsage.find(t => t.teamId === managerTeamId);
    const toolDistribution = teamToolData?.tools.map(t => {
        const at = aiTools.find(a => a.id === t.toolId);
        return {
            name: at?.shortName || t.toolId,
            color: at?.color || "#94a3b8",
            percent: t.percent,
            loC: t.loC,
        };
    }) || [];

    // Member trend data (aggregate weekly from members)
    const memberTrendData = [
        { week: "Week 1", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[0]?.aiPercent || 0), 0) / teamMembers.length).toFixed(1)) },
        { week: "Week 2", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[1]?.aiPercent || 0), 0) / teamMembers.length).toFixed(1)) },
        { week: "Week 3", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[2]?.aiPercent || 0), 0) / teamMembers.length).toFixed(1)) },
        { week: "Week 4", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[3]?.aiPercent || 0), 0) / teamMembers.length).toFixed(1)) },
    ];

    const memberColumns = [
        {
            header: "Engineer",
            accessorKey: "name",
            cell: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <UserAvatar name={val} size="sm" />
                    <div>
                        <p className="text-sm font-bold text-slate-900">{val}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{row.role}</p>
                    </div>
                </div>
            ),
        },
        {
            header: "LoC Output",
            accessorKey: "totalLoC",
            cell: (val: number) => <span className="font-bold font-metric text-slate-700">{formatNumber(val)}</span>,
            align: "right" as const,
        },
        {
            header: "AI %",
            accessorKey: "aiPercent",
            cell: (val: number) => (
                <div className="flex items-center gap-2 justify-end">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${val}%` }} />
                    </div>
                    <span className="font-black font-metric text-indigo-600 w-12 text-right">{val}%</span>
                </div>
            ),
            align: "right" as const,
        },
        {
            header: "Manual %",
            accessorKey: "manualLoC",
            cell: (_val: number, row: any) => {
                const mp = parseFloat((100 - row.aiPercent).toFixed(1));
                return (
                    <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold font-metric text-slate-500 w-12 text-right">{mp}%</span>
                    </div>
                );
            },
            align: "right" as const,
        },
        {
            header: "Merge Rate",
            accessorKey: "aiMergeRate",
            cell: (val: number) => <span className="font-bold font-metric text-emerald-600">{val}%</span>,
            align: "right" as const,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (val: string) => <StatusBadge status={val as any} size="sm" />,
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
                        <UsersIcon className="h-5 w-5 text-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Team Manager View</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl">
                        {team.name} <span className="text-blue-600">Dashboard</span>
                    </h1>
                    <p className="text-base text-slate-500 mt-2 font-medium">
                        Team performance managed by <span className="text-slate-900 font-bold">{manager.name}</span> — {team.headCount} engineers
                    </p>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <UserAvatar name={manager.name} size="sm" />
                    <div>
                        <p className="text-sm font-black text-slate-900">{manager.name}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{manager.role} • Manager</p>
                    </div>
                </div>
            </div>

            {/* Team KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                <MetricCard
                    title="Team AI Code %"
                    value={teamAiPercent}
                    suffix="%"
                    gradient="ai"
                    icon={<Zap className="h-5 w-5" />}
                    subtitle={`${formatNumber(teamAiLoC)} AI LoC`}
                />
                <MetricCard
                    title="Manual Code %"
                    value={teamManualPercent}
                    suffix="%"
                    gradient="manual"
                    icon={<Hammer className="h-5 w-5" />}
                    subtitle={`${formatNumber(teamManualLoC)} hand-crafted`}
                />
                <MetricCard
                    title="Team Size"
                    value={teamMembers.length}
                    decimals={0}
                    icon={<UsersIcon className="h-5 w-5" />}
                    subtitle={`${activeUsers} active AI users`}
                />
                <MetricCard
                    title="Avg Merge Rate"
                    value={avgMergeRate}
                    suffix="%"
                    gradient="success"
                    icon={<GitMerge className="h-5 w-5" />}
                    subtitle="AI code quality"
                />
                <MetricCard
                    title="Total Commits"
                    value={teamTotalCommits}
                    decimals={0}
                    icon={<Activity className="h-5 w-5" />}
                    subtitle="This cycle"
                />
                <MetricCard
                    title="Power Users"
                    value={powerUsers}
                    decimals={0}
                    gradient="warning"
                    icon={<Trophy className="h-5 w-5" />}
                    subtitle={`${((powerUsers / teamMembers.length) * 100).toFixed(0)}% of squad`}
                />
            </div>

            {/* Team Trend + AI Split */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Team AI Adoption Trend */}
                <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900">Team AI Adoption Trend</h3>
                            <p className="text-sm text-slate-500 mt-1">Average AI % across your {teamMembers.length} engineers</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase">Avg AI %</span>
                            </div>
                        </div>
                    </div>
                    <EnhancedChart
                        type="area"
                        data={memberTrendData}
                        index="week"
                        categories={["aiPercent"]}
                        colors={["#3b82f6"]}
                        valueFormatter={(v) => `${v}%`}
                        height={300}
                    />
                </div>

                {/* Team Code Split */}
                <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Code2 className="h-32 w-32 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-black tracking-widest text-blue-400 uppercase mb-6 relative z-10">Team Code Split</h3>

                    <div className="relative h-48 w-48 mb-6 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={teamPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value" animationDuration={1500}>
                                    <Cell fill="#3b82f6" stroke="transparent" />
                                    <Cell fill="#334155" stroke="transparent" />
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", fontSize: "10px", color: "white" }}
                                    itemStyle={{ color: "white" }}
                                    formatter={(value: number) => formatNumber(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-2xl font-black text-white font-metric">{teamAiPercent}%</p>
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">AI Powered</p>
                        </div>
                    </div>

                    <div className="space-y-3 w-full relative z-10">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI LoC</span>
                            </div>
                            <span className="text-sm font-black text-white font-metric">{formatNumber(teamAiLoC)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-slate-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual LoC</span>
                            </div>
                            <span className="text-sm font-black text-white font-metric">{formatNumber(teamManualLoC)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Tools Used by Team + Member Proficiency */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* AI Tools Used */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-violet-500" /> Team AI Tools
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Which AI engines your team generates code with</p>

                    <div className="space-y-4">
                        {toolDistribution.map((tool) => (
                            <div key={tool.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tool.color }} />
                                        <span className="text-sm font-bold text-slate-900">{tool.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500">{formatNumber(tool.loC)} LoC</span>
                                        <span className="text-lg font-black font-metric" style={{ color: tool.color }}>{tool.percent}%</span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${tool.percent}%` }}
                                        transition={{ duration: 1.2, ease: "circOut" }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: tool.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stacked total bar */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Combined Distribution</p>
                        <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-100">
                            {toolDistribution.map((tool) => (
                                <motion.div
                                    key={tool.name}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${tool.percent}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className="h-full"
                                    style={{ backgroundColor: tool.color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Member Proficiency List */}
                <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" /> Member Proficiency
                        </h3>
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-bold">{teamMembers.length} ENGINEERS</Badge>
                    </div>
                    <div className="space-y-3">
                        {teamMembers
                            .sort((a, b) => b.aiPercent - a.aiPercent)
                            .map((member, idx) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/users/${member.id}`)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <UserAvatar name={member.name} size="sm" />
                                            {idx < 3 && (
                                                <div className={cn(
                                                    "absolute -top-1 -left-1 h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm",
                                                    idx === 0 ? "bg-amber-400 text-amber-900" : idx === 1 ? "bg-slate-300 text-slate-700" : "bg-orange-300 text-orange-900"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{member.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.role} • {formatNumber(member.totalLoC)} LoC</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-bold text-slate-400">Manual</p>
                                            <p className="text-sm font-black font-metric text-slate-500">{(100 - member.aiPercent).toFixed(1)}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-indigo-400">AI</p>
                                            <p className="text-xl font-black font-metric text-indigo-600">{member.aiPercent}%</p>
                                        </div>
                                        <StatusBadge status={member.status} size="sm" />
                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Team Repos */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            <Database className="h-5 w-5 text-blue-500" /> Team Repositories
                        </h3>
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-bold">{teamRepos.length} REPOS</Badge>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {teamRepos.map((repo) => (
                        <motion.div
                            key={repo.name}
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Code2 className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-mono font-bold text-slate-900">{repo.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{repo.primaryTool}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-white border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total LoC</p>
                                    <p className="text-lg font-black text-slate-900 font-metric">{formatNumber(repo.totalLoC)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI %</p>
                                    <p className="text-lg font-black text-blue-600 font-metric">{repo.aiPercent}%</p>
                                </div>
                            </div>

                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${repo.aiPercent}%` }}
                                    transition={{ duration: 1.2, ease: "circOut" }}
                                    className="h-full bg-blue-500 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] font-bold text-blue-500">AI: {repo.aiPercent}%</span>
                                <span className="text-[10px] font-bold text-slate-400">Manual: {100 - repo.aiPercent}%</span>
                            </div>
                        </motion.div>
                    ))}
                    {teamRepos.length === 0 && (
                        <div className="col-span-3 py-12 text-center">
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No repositories found for your team</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Team Health Summary */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="absolute -top-8 -left-8 h-32 w-32 bg-emerald-500/10 blur-[80px] rounded-full" />
                <div className="relative z-10">
                    <h3 className="text-xl font-black tracking-tight text-white mb-8 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" /> Team Health Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Adoption</p>
                            <p className="text-3xl font-black text-white font-metric">{teamAiPercent}%</p>
                            <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${teamAiPercent}%` }}
                                    className="h-full bg-blue-500 rounded-full"
                                />
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Manual Craft</p>
                            <p className="text-3xl font-black text-white font-metric">{teamManualPercent}%</p>
                            <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${teamManualPercent}%` }}
                                    className="h-full bg-slate-500 rounded-full"
                                />
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Merge Quality</p>
                            <p className="text-3xl font-black text-emerald-400 font-metric">{avgMergeRate}%</p>
                            <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${avgMergeRate}%` }}
                                    className="h-full bg-emerald-500 rounded-full"
                                />
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Token Budget</p>
                            <p className="text-3xl font-black text-amber-400 font-metric">{formatNumber(teamTokens)}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-2">
                                {formatNumber(Math.floor(teamTokens / teamMembers.length))} per engineer
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
