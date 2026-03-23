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
    Users as UsersIcon, Zap, Code2, GitMerge,
    TrendingUp, ShieldCheck, Sparkles, Target, Activity,
    ArrowRight, Trophy, BarChart3, Database, Bot, Cpu
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
                <div
                    className="flex items-center gap-3 cursor-pointer group/user"
                    onClick={() => navigate(`/users/${row.id}`)}
                >
                    <UserAvatar name={val} size="sm" />
                    <div>
                        <p className="text-sm font-bold text-slate-900 group-hover/user:text-indigo-600 transition-colors">{val}</p>
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
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8 max-w-[1600px] mx-auto pb-12"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Team Insights</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl">
                        Squad <span className="text-indigo-600">Leaderboard</span>
                    </h1>
                    <p className="text-base text-slate-500 mt-2 font-medium">
                        Performance metrics for <span className="text-slate-900 font-bold">{team.name}</span>
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

            {/* AI Summary Card */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Activity className="h-32 w-32 text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">Squad AI Performance Intel</h2>
                    </div>
                    <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-4xl">
                        Your squad is outputting <span className="text-white font-black">{teamAiPercent}% AI code</span> with a
                        successful <span className="text-white font-black">{avgMergeRate}% merge rate</span>.
                        The team has consumed <span className="text-white font-black">{formatNumber(teamTokens)} tokens</span> to produce <span className="text-white font-black">{formatNumber(teamAiLoC)} lines of code</span>,
                        achieving an efficiency of <span className="text-white font-black">{Math.floor((teamAiLoC / teamTokens) * 1000000)} lines per 1M tokens</span>.
                        Active AI adoption within the squad is sitting at <span className="text-white font-black">{Math.floor((activeUsers / teamMembers.length) * 100)}%</span>.
                    </p>
                </div>
            </div>

            {/* Team KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <MetricCard
                    title="Team AI Code %"
                    value={teamAiPercent}
                    suffix="%"
                    gradient="ai"
                    icon={<Zap className="h-5 w-5" />}
                    subtitle={`${formatNumber(teamAiLoC)} AI LoC`}
                />
                <MetricCard
                    title="Token Efficiency"
                    value={Math.floor((teamAiLoC / teamTokens) * 1000000)}
                    icon={<Cpu className="h-5 w-5" />}
                    decimals={0}
                    suffix=" L/1M-T"
                    gradient="success"
                    subtitle="Output vs Consumption"
                />
                <MetricCard
                    title="Avg Merge Rate"
                    value={avgMergeRate}
                    suffix="%"
                    gradient="warning"
                    icon={<GitMerge className="h-5 w-5" />}
                    subtitle="AI code quality"
                />
                <MetricCard
                    title="Power Users"
                    value={powerUsers}
                    decimals={0}
                    icon={<Trophy className="h-5 w-5" />}
                    subtitle={`${((powerUsers / teamMembers.length) * 100).toFixed(0)}% of squad`}
                />
                <MetricCard
                    title="Team Size"
                    value={teamMembers.length}
                    decimals={0}
                    icon={<UsersIcon className="h-5 w-5" />}
                    subtitle={`${activeUsers} active AI users`}
                />
            </div>

            {/* Team Trend + AI Split */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Team AI Adoption Trend */}
                <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900">Team AI Adoption Trend</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Squad velocity tracking</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <EnhancedChart
                            type="area"
                            data={memberTrendData}
                            index="week"
                            categories={['aiPercent']}
                            colors={['#3b82f6']}
                            valueFormatter={(v) => `${v}%`}
                            xAxisLabel="Timeline (Weeks)"
                            yAxisLabel="Cumulative AI %"
                        />
                    </div>
                </div>

                {/* Team Code Mix Pie */}
                <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-indigo-500" /> Codebase Mix
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={teamPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#6366f1" />
                                    <Cell fill="#e2e8f0" />
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                            <span className="text-xs font-black text-indigo-700 uppercase">AI Produced</span>
                            <span className="text-sm font-black font-metric text-indigo-700">{teamAiPercent}%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-black text-slate-600 uppercase">Hand Crafted</span>
                            <span className="text-sm font-black font-metric text-slate-600">{teamManualPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Proficiency Breakdown */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Member Proficiency Breakdown</h3>
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase border-slate-200 text-slate-400">
                        {teamMembers.length} ACTIVE DEVELOPERS
                    </Badge>
                </div>
                <DataTable
                    data={teamMembers}
                    columns={memberColumns}
                    className="shadow-premium"
                />
            </div>

            {/* Team Repositories */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                        <Database className="h-5 w-5 text-indigo-500" /> Managed Repositories
                    </h3>
                    <div className="space-y-4">
                        {teamRepos.map(repo => (
                            <div key={repo.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                                <div>
                                    <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{repo.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Primary: {repo.primaryTool}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black font-metric text-slate-900">{repo.aiPercent}% AI</p>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{repo.mergeRate}% Success</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team Quality Guardrails */}
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl">
                    <h3 className="text-xl font-black tracking-tight text-white mb-6 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-400" /> Squad Guardrails
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <span>Security Compliance</span>
                                <span className="text-emerald-400">98.2%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "98.2%" }}
                                    transition={{ duration: 1.5 }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <span>AI Risk Mitigation</span>
                                <span className="text-emerald-400">Active</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-xs text-slate-400 font-medium italic">
                                    "Autonomous scan complete. No high-risk AI patterns detected in the last synchronized commits for this squad."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
