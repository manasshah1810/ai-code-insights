import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
    orgData, aiTools, aiToolMonthlyTrend, teamToolUsage,
    repoToolAttribution, aiToolQualityMetrics, formatNumber, teams
} from "@/data/dashboard-data";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    Bot, Sparkles, TrendingUp, Shield, Zap, Clock,
    CheckCircle2, Users, Code2, ArrowRight, Filter,
    BarChart3, Layers, Trophy, Target, GitMerge,
    Activity, Database, ChevronRight
} from "lucide-react";

const toolColorMap: Record<string, string> = {
    claude: "#D97706",
    copilot: "#6366F1",
    cursor: "#8B5CF6",
    gemini: "#2563EB",
    chatgpt: "#10B981",
};

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
    }),
};

export default function AIToolsPage() {
    const [selectedTool, setSelectedTool] = useState<string>("all");
    const [teamFilter, setTeamFilter] = useState<string>("all");

    const topTool = aiTools.reduce((a, b) => a.totalLoC > b.totalLoC ? a : b);
    const bestMerge = aiTools.reduce((a, b) => a.mergeRate > b.mergeRate ? a : b);
    const totalAIUsers = aiTools.reduce((a, b) => a + b.activeUsers, 0);

    // Pie data for global tool distribution
    const pieData = aiTools.map(t => ({
        name: t.shortName,
        value: t.totalLoC,
        color: t.color,
    }));

    // Radar chart data for quality comparison
    const radarData = [
        { metric: "Merge Rate", ...Object.fromEntries(aiTools.map(t => [t.shortName, t.mergeRate])) },
        { metric: "Accept Rate", ...Object.fromEntries(aiTools.map(t => [t.shortName, t.avgAcceptRate])) },
        { metric: "Confidence", ...Object.fromEntries(aiTools.map(t => [t.shortName, t.avgConfidence])) },
        {
            metric: "Code Quality",
            ...Object.fromEntries(aiToolQualityMetrics.map(q => {
                const tool = aiTools.find(t => t.id === q.toolId);
                return [tool?.shortName || "", 100 - q.bugRate * 10];
            })),
        },
        {
            metric: "Test Coverage",
            ...Object.fromEntries(aiToolQualityMetrics.map(q => {
                const tool = aiTools.find(t => t.id === q.toolId);
                return [tool?.shortName || "", q.testCoverage];
            })),
        },
    ];

    // Filtered repo data
    const filteredRepos = useMemo(() => {
        let repos = repoToolAttribution;
        if (teamFilter !== "all") {
            repos = repos.filter(r => r.team === teamFilter);
        }
        return repos;
    }, [teamFilter]);

    // Stacked bar data for team-level tool usage
    const teamToolData = teamToolUsage.map(t => ({
        name: t.teamName.replace(" Engineering", " Eng.").replace(" Automation", " Auto."),
        ...Object.fromEntries(t.tools.map(tool => {
            const at = aiTools.find(a => a.id === tool.toolId);
            return [at?.shortName || tool.toolId, tool.loC];
        })),
    }));

    const repoColumns = [
        {
            header: "Repository",
            accessorKey: "repoName",
            cell: (val: string) => (
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-400" />
                    <span className="font-mono text-xs font-bold text-slate-900 px-2 py-1 bg-slate-50 rounded border border-slate-100">{val}</span>
                </div>
            ),
        },
        {
            header: "Team",
            accessorKey: "team",
            cell: (val: string) => <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{val}</span>,
        },
        {
            header: "AI LoC",
            accessorKey: "totalAiLoC",
            cell: (val: number) => <span className="font-bold font-metric text-slate-700">{formatNumber(val)}</span>,
            align: "right" as const,
        },
        {
            header: "Tool Mix",
            accessorKey: "tools",
            cell: (val: { toolId: string; percent: number }[]) => (
                <div className="flex items-center gap-1">
                    <div className="flex h-2 w-24 rounded-full overflow-hidden">
                        {val.map((t, i) => (
                            <div
                                key={t.toolId}
                                className="h-full transition-all"
                                style={{
                                    width: `${t.percent}%`,
                                    backgroundColor: toolColorMap[t.toolId] || "#cbd5e1",
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 ml-1">
                        {val[0]?.percent}% {aiTools.find(a => a.id === val[0]?.toolId)?.shortName}
                    </span>
                </div>
            ),
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
                        <Bot className="h-5 w-5 text-violet-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">AI Attribution Engine</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl">
                        AI Tools <span className="text-violet-600">Intelligence</span>
                    </h1>
                    <p className="text-base text-slate-500 mt-2 font-medium">
                        Decomposing which AI models and tools generated every line of code across your organization
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Select value={teamFilter} onValueChange={setTeamFilter}>
                            <SelectTrigger className="w-[200px] h-11 rounded-xl pl-9 font-bold bg-white border-slate-200 text-slate-700">
                                <SelectValue placeholder="All Teams" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all" className="font-bold">All Engineering Squads</SelectItem>
                                {teams.map(t => <SelectItem key={t.id} value={t.name} className="font-medium">{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Hero KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Top AI Engine"
                    value={topTool.percentOfAI}
                    suffix="%"
                    gradient="ai"
                    icon={<Trophy className="h-6 w-6" />}
                    subtitle={`${topTool.shortName} — ${formatNumber(topTool.totalLoC)} LoC`}
                />
                <MetricCard
                    title="Highest Merge Rate"
                    value={bestMerge.mergeRate}
                    suffix="%"
                    gradient="success"
                    icon={<GitMerge className="h-6 w-6" />}
                    subtitle={`${bestMerge.shortName} leads merge quality`}
                />
                <MetricCard
                    title="AI Engines Tracked"
                    value={aiTools.length}
                    decimals={0}
                    icon={<Bot className="h-6 w-6" />}
                    subtitle="Distinct code generation sources"
                />
                <MetricCard
                    title="Active AI Users"
                    value={totalAIUsers}
                    decimals={0}
                    gradient="warning"
                    icon={<Users className="h-6 w-6" />}
                    subtitle="Unique users across all tools"
                />
            </div>

            {/* Tool Cards (Horizontal) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {aiTools.map((tool, idx) => (
                    <motion.div
                        key={tool.id}
                        custom={idx}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                        className={cn(
                            "relative rounded-2xl border p-6 bg-white overflow-hidden group cursor-pointer transition-all",
                            selectedTool === tool.id
                                ? `ring-2 shadow-lg ${tool.borderColor}`
                                : "border-slate-200 hover:border-slate-300"
                        )}
                        onClick={() => setSelectedTool(selectedTool === tool.id ? "all" : tool.id)}
                    >
                        {/* Glow */}
                        <div
                            className="absolute -top-6 -right-6 h-20 w-20 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
                            style={{ backgroundColor: tool.color }}
                        />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                                    style={{ backgroundColor: `${tool.color}15`, border: `1px solid ${tool.color}30` }}
                                >
                                    {tool.icon}
                                </div>
                                <Badge
                                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
                                    style={{ backgroundColor: `${tool.color}15`, color: tool.color, border: `1px solid ${tool.color}30` }}
                                >
                                    {tool.activeUsers} users
                                </Badge>
                            </div>

                            <h4 className="text-sm font-black text-slate-900 mb-1 truncate">{tool.name}</h4>

                            <div className="flex items-baseline gap-1.5 mb-3">
                                <span className="text-3xl font-black font-metric" style={{ color: tool.color }}>
                                    <CountUp end={tool.percentOfAI} decimals={1} duration={1.5} />%
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">of AI code</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="font-bold text-slate-400 uppercase tracking-wider">Merge</p>
                                    <p className="font-black text-slate-900 font-metric text-sm">{tool.mergeRate}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="font-bold text-slate-400 uppercase tracking-wider">LoC</p>
                                    <p className="font-black text-slate-900 font-metric text-sm">{formatNumber(tool.totalLoC)}</p>
                                </div>
                            </div>

                            {/* Progress ring */}
                            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${tool.percentOfAI}%` }}
                                    transition={{ duration: 1.2, ease: "circOut", delay: idx * 0.1 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: tool.color }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Analysis Grid */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Tool Distribution Donut */}
                <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Layers className="h-32 w-32 text-violet-400" />
                    </div>

                    <h3 className="text-lg font-black tracking-widest text-violet-400 uppercase mb-6 relative z-10">
                        AI Tool Distribution
                    </h3>

                    <div className="relative h-56 w-56 mb-6 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {pieData.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", fontSize: "11px", color: "white" }}
                                    itemStyle={{ color: "white" }}
                                    formatter={(value: number) => formatNumber(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-lg font-black text-white font-metric">{aiTools.length}</p>
                            <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest">AI Engines</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3 w-full relative z-10">
                        {aiTools.map((tool) => (
                            <div key={tool.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tool.color }} />
                                    <span className="text-xs font-bold text-slate-300">{tool.shortName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-white font-metric">{formatNumber(tool.totalLoC)}</span>
                                    <span className="text-[10px] font-bold text-slate-500">{tool.percentOfAI}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Trend Chart */}
                <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp className="h-32 w-32 text-violet-600" />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900">LoC Generation by AI Engine</h3>
                            <p className="text-sm text-slate-500 mt-1">8-month output trend per tool</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {aiTools.map(t => (
                                <div key={t.id} className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase">{t.shortName}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <EnhancedChart
                        type="area"
                        data={aiToolMonthlyTrend}
                        index="month"
                        categories={["claude", "copilot", "cursor", "gemini", "chatgpt"]}
                        colors={aiTools.map(t => t.color)}
                        valueFormatter={(v) => formatNumber(v as number)}
                        height={380}
                    />
                </div>
            </div>

            {/* Quality Radar + Team Heatmap */}
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Quality Radar */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-violet-500" /> Quality Radar
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Multi-dimensional code quality comparison</p>
                        </div>
                    </div>

                    <div className="h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis
                                    dataKey="metric"
                                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                                />
                                {aiTools.map((tool) => (
                                    <Radar
                                        key={tool.id}
                                        name={tool.shortName}
                                        dataKey={tool.shortName}
                                        stroke={tool.color}
                                        fill={tool.color}
                                        fillOpacity={0.08}
                                        strokeWidth={2}
                                    />
                                ))}
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {aiTools.map(t => (
                            <div key={t.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                                <span className="text-[10px] font-bold text-slate-600">{t.shortName}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quality Metrics Table */}
                <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <Target className="h-5 w-5 text-violet-500" /> Detailed Quality Metrics
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Per-tool code quality and security analysis</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tool</th>
                                    <th className="text-right py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Merge Rate</th>
                                    <th className="text-right py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bug Rate</th>
                                    <th className="text-right py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sec Flaws</th>
                                    <th className="text-right py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Cov.</th>
                                    <th className="text-right py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doc Score</th>
                                    <th className="text-right py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aiTools.map((tool) => {
                                    const quality = aiToolQualityMetrics.find(q => q.toolId === tool.id);
                                    return (
                                        <motion.tr
                                            key={tool.id}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="py-4 px-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-9 w-9 rounded-lg flex items-center justify-center text-base shadow-sm group-hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: `${tool.color}15`, border: `1px solid ${tool.color}25` }}
                                                    >
                                                        {tool.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{tool.shortName}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{tool.activeUsers} users</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <span className="font-black font-metric text-emerald-600">{tool.mergeRate}%</span>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <span className={cn(
                                                    "font-black font-metric",
                                                    (quality?.bugRate || 0) < 3 ? "text-emerald-600" : (quality?.bugRate || 0) < 4 ? "text-amber-600" : "text-rose-600"
                                                )}>
                                                    {quality?.bugRate}/100
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <span className={cn(
                                                    "font-bold font-metric",
                                                    (quality?.securityFlaws || 0) < 20 ? "text-emerald-600" : (quality?.securityFlaws || 0) < 30 ? "text-amber-600" : "text-rose-600"
                                                )}>
                                                    {quality?.securityFlaws}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{ width: `${quality?.testCoverage}%`, backgroundColor: tool.color }}
                                                        />
                                                    </div>
                                                    <span className="font-bold font-metric text-slate-700 text-xs">{quality?.testCoverage}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <Badge className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded-md",
                                                    (quality?.docQuality || 0) >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : (quality?.docQuality || 0) >= 65 ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                            : "bg-rose-50 text-rose-700 border border-rose-200"
                                                )}>
                                                    {quality?.docQuality}/100
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <span className="font-bold font-metric text-slate-600">{tool.avgCycleTime}m</span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Team Tool Usage Heatmap */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-violet-500" /> Team × Tool Matrix
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">How each squad leverages AI engines</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {aiTools.map(t => (
                            <div key={t.id} className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                                <span className="text-[10px] font-black text-slate-500 uppercase">{t.shortName}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Squad</th>
                                {aiTools.map(t => (
                                    <th key={t.id} className="text-center py-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.shortName}</th>
                                ))}
                                <th className="text-right py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamToolUsage.map((team, tIdx) => (
                                <motion.tr
                                    key={team.teamId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: tIdx * 0.04 }}
                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <p className="text-sm font-bold text-slate-900">{team.teamName}</p>
                                    </td>
                                    {team.tools.map((toolUsage) => {
                                        const at = aiTools.find(a => a.id === toolUsage.toolId);
                                        const intensity = toolUsage.percent / 45; // normalize to 0-1 range
                                        return (
                                            <td key={toolUsage.toolId} className="text-center py-4 px-3">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div
                                                        className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-black transition-transform hover:scale-110"
                                                        style={{
                                                            backgroundColor: `${at?.color || "#94a3b8"}${Math.round(intensity * 40 + 10).toString(16).padStart(2, "0")}`,
                                                            color: intensity > 0.5 ? at?.color : "#94a3b8",
                                                            border: `1px solid ${at?.color || "#94a3b8"}${Math.round(intensity * 30 + 10).toString(16).padStart(2, "0")}`,
                                                        }}
                                                    >
                                                        {toolUsage.percent}%
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 font-bold">{formatNumber(toolUsage.loC)}</span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="py-4 px-4">
                                        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
                                            {team.tools.map((toolUsage) => {
                                                const at = aiTools.find(a => a.id === toolUsage.toolId);
                                                return (
                                                    <motion.div
                                                        key={toolUsage.toolId}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${toolUsage.percent}%` }}
                                                        transition={{ duration: 1, ease: "circOut", delay: tIdx * 0.05 }}
                                                        className="h-full"
                                                        style={{ backgroundColor: at?.color || "#94a3b8" }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Repository Attribution Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
                            <Code2 className="h-5 w-5 text-violet-500" /> Repository Tool Attribution
                        </h3>
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-bold">{filteredRepos.length} REPOS</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                        <Activity className="h-3 w-3" /> AI-origin analysis
                    </div>
                </div>
                <DataTable data={filteredRepos} columns={repoColumns as any} className="shadow-premium" />
            </div>

            {/* Efficiency Comparison */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-violet-500/10 blur-[100px] rounded-full" />
                <div className="absolute -top-8 -left-8 h-32 w-32 bg-blue-500/10 blur-[80px] rounded-full" />

                <div className="relative z-10">
                    <h3 className="text-xl font-black tracking-tight text-white mb-8 flex items-center gap-2">
                        <Clock className="h-6 w-6 text-violet-400" /> Efficiency by AI Engine
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {aiTools.map((tool, idx) => (
                            <motion.div
                                key={tool.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="h-10 w-10 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: `${tool.color}20` }}
                                    >
                                        {tool.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white">{tool.shortName}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">{tool.activeUsers} devs</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cycle Time</span>
                                            <span className="text-sm font-black text-white font-metric">{tool.avgCycleTime}m</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(tool.avgCycleTime / 55) * 100}%` }}
                                                transition={{ duration: 1.2, ease: "circOut" }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: tool.color }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accept Rate</span>
                                            <span className="text-sm font-black font-metric" style={{ color: tool.color }}>{tool.avgAcceptRate}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${tool.avgAcceptRate}%` }}
                                                transition={{ duration: 1.2, ease: "circOut" }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: tool.color, opacity: 0.7 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-white/10">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence</span>
                                            <span className="text-sm font-black text-white font-metric">{tool.avgConfidence}%</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
