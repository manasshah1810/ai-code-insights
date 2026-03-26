import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
    users, teams, formatNumber, weeklyTrend, repositories, aiTools,
    teamToolUsage, orgData, getTeamUserAdoptionMetrics, getTeamActiveUsersData
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    Users as UsersIcon, Zap, Code2, GitMerge,
    TrendingUp, ShieldCheck, Sparkles, Target, Activity,
    ArrowRight, Trophy, BarChart3, Database, Bot, Cpu,
    CalendarIcon, Filter, ChevronDown, CheckCircle2
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ManagerDashboard() {
    const { managerUserId, managerTeamId, setManagerIdentity } = useAppStore();
    const navigate = useNavigate();

    // ─── Filter State ─────────────────────────────────────────────────────
    const [dateFilterStr, setDateFilterStr] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [toolFilter, setToolFilter] = useState<string>("all");
    const [teamSwitcherOpen, setTeamSwitcherOpen] = useState(false);

    // ─── Build team options for switcher ──────────────────────────────────
    const teamOptions = useMemo(() => {
        return teams.map(t => {
            // Pick first member of the team as the "lead"
            const lead = users.find(u => u.teamId === t.id);
            return {
                teamId: t.id,
                teamName: t.name,
                leadId: lead?.id || 1,
                leadName: lead?.name || "Unknown",
                leadRole: lead?.role || "Engineer",
                headCount: t.headCount,
                aiCodePercent: t.aiCodePercent,
            };
        });
    }, []);

    const manager = users.find(u => u.id === managerUserId);
    const team = teams.find(t => t.id === managerTeamId);

    if (!team || !manager) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Team not found</p>
            </div>
        );
    }

    // ─── Date scale factor ────────────────────────────────────────────────
    const daysMap: Record<string, number> = { "5": 5, "7": 7, "15": 15, "30": 30, "90": 90, "all": 120 };
    const daysSelected = daysMap[dateFilterStr] || 120;
    const scaleFactor = Math.min(1, daysSelected / 120);

    // ─── Team members (filtered) ──────────────────────────────────────────
    const allTeamMembers = users.filter(u => u.teamId === managerTeamId);

    const teamMembers = useMemo(() => {
        let members = [...allTeamMembers];
        if (statusFilter !== "all") {
            members = members.filter(u => u.status === statusFilter);
        }
        if (toolFilter !== "all") {
            members = members.filter(u => u.primaryTool === toolFilter);
        }
        return members;
    }, [statusFilter, toolFilter, allTeamMembers]);

    const teamRepos = repositories.filter(r => r.team === team.name);

    // Team aggregate stats (scaled by date)
    const teamTotalLoC = Math.round(teamMembers.reduce((a, u) => a + u.totalLoC, 0) * scaleFactor);
    const teamAiLoC = Math.round(teamMembers.reduce((a, u) => a + u.aiLoC, 0) * scaleFactor);
    const teamManualLoC = Math.round(teamMembers.reduce((a, u) => a + u.manualLoC, 0) * scaleFactor);
    const teamAiPercent = teamTotalLoC > 0 ? parseFloat(((teamAiLoC / teamTotalLoC) * 100).toFixed(1)) : 0;
    const teamManualPercent = parseFloat((100 - teamAiPercent).toFixed(1));
    const teamTotalCommits = Math.round(teamMembers.reduce((a, u) => a + u.commits, 0) * scaleFactor);
    const teamTokens = Math.round(teamMembers.reduce((a, u) => a + u.tokensUsed, 0) * scaleFactor);
    const avgMergeRate = teamMembers.length > 0
        ? parseFloat((teamMembers.reduce((a, u) => a + u.aiMergeRate, 0) / teamMembers.length).toFixed(1))
        : 0;
    const powerUsers = teamMembers.filter(u => u.status === "Power User").length;
    const activeUsers = teamMembers.filter(u => u.aiPercent > 0).length;

    // Team-specific user adoption metrics
    const teamAdoptionMetrics = useMemo(() => getTeamUserAdoptionMetrics(managerTeamId), [managerTeamId]);

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
            loC: Math.round(t.loC * scaleFactor),
        };
    }) || [];

    // Member trend data (aggregate weekly from members)
    const memberTrendData = [
        { week: "Week 1", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[0]?.aiPercent || 0), 0) / Math.max(teamMembers.length, 1)).toFixed(1)) },
        { week: "Week 2", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[1]?.aiPercent || 0), 0) / Math.max(teamMembers.length, 1)).toFixed(1)) },
        { week: "Week 3", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[2]?.aiPercent || 0), 0) / Math.max(teamMembers.length, 1)).toFixed(1)) },
        { week: "Week 4", aiPercent: parseFloat((teamMembers.reduce((a, u) => a + (u.weeklyTrend[3]?.aiPercent || 0), 0) / Math.max(teamMembers.length, 1)).toFixed(1)) },
    ];

    const dateLabel = dateFilterStr === "all" ? "All Time" : `Last ${dateFilterStr} days`;

    // ─── Unique tools available in team ────────────────────────────────────
    const uniqueTeamTools = [...new Set(allTeamMembers.map(u => u.primaryTool))];

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
            cell: (val: number) => <span className="font-bold font-metric text-slate-700">{formatNumber(Math.round(val * scaleFactor))}</span>,
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
                        Performance metrics for <span className="text-slate-900 font-bold">{team.name}</span> — <span className="text-slate-900">{dateLabel}</span>
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

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 w-[150px] rounded-xl border-slate-200 bg-white font-bold text-sm shadow-sm">
                            <div className="flex items-center">
                                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            <SelectItem value="all" className="font-bold">All Statuses</SelectItem>
                            <SelectItem value="Power User" className="font-bold">Power User</SelectItem>
                            <SelectItem value="Active" className="font-bold">Active</SelectItem>
                            <SelectItem value="License Idle" className="font-bold">License Idle</SelectItem>
                        </SelectContent>
                    </Select>

                    {uniqueTeamTools.length > 1 && (
                        <Select value={toolFilter} onValueChange={setToolFilter}>
                            <SelectTrigger className="h-11 w-[150px] rounded-xl border-slate-200 bg-white font-bold text-sm shadow-sm">
                                <SelectValue placeholder="AI Tool" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                <SelectItem value="all" className="font-bold">All Tools</SelectItem>
                                {uniqueTeamTools.map(tool => (
                                    <SelectItem key={tool} value={tool} className="font-bold">{tool}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Manager Identity — Clickable Team Switcher */}
                    <Popover open={teamSwitcherOpen} onOpenChange={setTeamSwitcherOpen}>
                        <PopoverTrigger asChild>
                            <button className="flex items-center gap-3 p-3 pr-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer group">
                                <UserAvatar name={manager.name} size="sm" />
                                <div className="text-left">
                                    <p className="text-sm font-black text-slate-900">{manager.name}</p>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{manager.role} • {team.name}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors ml-1" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-2 rounded-2xl shadow-2xl border-slate-100" align="end">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 pt-2 pb-2">Switch Department</p>
                            <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
                                {teamOptions.map(opt => (
                                    <button
                                        key={opt.teamId}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                            opt.teamId === managerTeamId
                                                ? "bg-indigo-50 border border-indigo-200"
                                                : "hover:bg-slate-50 border border-transparent"
                                        )}
                                        onClick={() => {
                                            setManagerIdentity(opt.leadId, opt.teamId);
                                            setTeamSwitcherOpen(false);
                                        }}
                                    >
                                        <UserAvatar name={opt.leadName} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{opt.teamName}</p>
                                            <p className="text-[10px] text-slate-500 font-bold truncate">{opt.leadName} • {opt.leadRole}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-black font-metric text-indigo-600">{opt.aiCodePercent}%</p>
                                            <p className="text-[9px] text-slate-400 font-bold">{opt.headCount} devs</p>
                                        </div>
                                        {opt.teamId === managerTeamId && (
                                            <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* SWOS Analysis Card */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Activity className="h-32 w-32 text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-tighter cursor-default">Squad SWOS Intel</h2>
                    </div>
                    <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-4xl">
                        Your squad is outputting <span className="text-white font-black">{teamAiPercent}% AI code</span> with a
                        successful <span className="text-white font-black">{avgMergeRate}% merge rate</span>.
                        The team has consumed <span className="text-white font-black">{formatNumber(teamTokens)} tokens</span> to produce <span className="text-white font-black">{formatNumber(teamAiLoC)} lines of code</span>,
                        achieving an efficiency of <span className="text-white font-black">{teamAiLoC > 0 ? (teamTokens / teamAiLoC).toFixed(2) : 0} tokens per line</span>.
                        Active AI adoption within the squad is sitting at <span className="text-white font-black">{teamMembers.length > 0 ? Math.floor((activeUsers / teamMembers.length) * 100) : 0}%</span>.
                    </p>
                </div>
            </div>

            {/* Team User Adoption Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Last 30 Day Active Users"
                    value={teamAdoptionMetrics.last30DayActiveUsers}
                    gradient="ai"
                    icon={<UsersIcon className="h-6 w-6" />}
                    trend={{
                        value: ((teamAdoptionMetrics.last30DayActiveUsers - teamAdoptionMetrics.last30DayPrevious) / teamAdoptionMetrics.last30DayPrevious * 100),
                        isPositive: teamAdoptionMetrics.last30DayActiveUsers > teamAdoptionMetrics.last30DayPrevious
                    }}
                    subtitle="Unique users in last 30 days"
                    decimals={0}
                />
                <MetricCard
                    title="Last 7 Days Active Users"
                    value={teamAdoptionMetrics.last7DayActiveUsers}
                    gradient="ai"
                    icon={<UsersIcon className="h-6 w-6" />}
                    trend={{
                        value: ((teamAdoptionMetrics.last7DayActiveUsers - teamAdoptionMetrics.last7DayPrevious) / teamAdoptionMetrics.last7DayPrevious * 100),
                        isPositive: teamAdoptionMetrics.last7DayActiveUsers > teamAdoptionMetrics.last7DayPrevious
                    }}
                    subtitle="Unique users in last 7 days"
                    decimals={0}
                />
                <MetricCard
                    title="Daily Active Users"
                    value={teamAdoptionMetrics.dailyActiveUsers}
                    gradient="ai"
                    icon={<UsersIcon className="h-6 w-6" />}
                    trend={{
                        value: ((teamAdoptionMetrics.dailyActiveUsers - teamAdoptionMetrics.dailyPrevious) / teamAdoptionMetrics.dailyPrevious * 100),
                        isPositive: teamAdoptionMetrics.dailyActiveUsers > teamAdoptionMetrics.dailyPrevious
                    }}
                    subtitle="Unique users today"
                    decimals={0}
                />
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
                    title="Avg. Tokens / Line"
                    value={teamAiLoC > 0 ? parseFloat((teamTokens / teamAiLoC).toFixed(2)) : 0}
                    icon={<Cpu className="h-5 w-5" />}
                    decimals={2}
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
                    subtitle={`${teamMembers.length > 0 ? ((powerUsers / teamMembers.length) * 100).toFixed(0) : 0}% of squad`}
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
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Squad velocity tracking — {dateLabel}</p>
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
                        {teamMembers.length} DEVELOPERS {statusFilter !== "all" ? `• ${statusFilter}` : ""}
                    </Badge>
                </div>
                {teamMembers.length > 0 ? (
                    <DataTable
                        data={teamMembers}
                        columns={memberColumns}
                        className="shadow-premium"
                    />
                ) : (
                    <div className="py-12 text-center rounded-3xl border border-slate-200 bg-white">
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No members match the selected filters</p>
                    </div>
                )}
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
