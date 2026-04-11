import { useState, useMemo, useEffect } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { orgData, teams, users, weeklyTrend, formatNumber, productivityData, securityData, aiTools, dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers, teamUserActivity, userAdoptionMetrics } from "@/data/dashboard-data";
import { generateAdminRecommendations, generateManagerRecommendations, generateDeveloperRecommendations, type Recommendation } from "@/lib/ai-completion-service";
import { getCachedRecommendations, cacheRecommendations } from "@/lib/recommendation-cache-service";
import {
  Users,
  Zap,
  Code2,
  GitMerge,
  Coins,
  FileDown,
  CalendarIcon,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Sparkles,
  ArrowRight,
  Trophy,
  CheckCircle,
  Hammer,
  Cpu,
  GitCommitHorizontal,
  User,
  FolderGit2,
  Hash,
  Layers,
  X,
  Lightbulb,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { socketService, type CommitEvent } from "@/lib/socket-service";
import { exportReport } from "@/lib/export-pdf";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { RoiCalculator } from "@/lib/roi-calculator";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// Map week labels to date ranges
const weekDateRanges = weeklyTrend.map((w) => {
  const [start, end] = w.label.split(" - ").map((d) => parse(d.trim(), "MMM d, yyyy", new Date()));
  return { ...w, start, end };
});

export default function OverviewPage() {
  const navigate = useNavigate();
  const { monthlySeatCost, manualHourlyRate, liveEvents, addLiveEvent, currentRole, managerTeamId, developerUserId, theme } = useAppStore();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [dateFilterStr, setDateFilterStr] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedCommit, setSelectedCommit] = useState<CommitEvent | null>(null);
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const latestDataDate = useMemo(() => {
    return weekDateRanges.length > 0 ? weekDateRanges[weekDateRanges.length - 1].end : new Date();
  }, []);

  const topUsers = useMemo(() => {
    let list = [...users];
    if (platformFilter !== "all") {
      list = list.filter(u => u.primaryTool === platformFilter);
    }
    return list.sort((a, b) => a.rank - b.rank).slice(0, 3);
  }, [platformFilter]);

  const fiscalStats = useMemo(() => RoiCalculator.calculate({
    monthlySeatCost,
    manualHourlyRate,
    teamSize: orgData.totalDevelopers,
    aiLoC: orgData.aiLoC,
    manualLoC: orgData.manualLoC,
    timeSavedHours: productivityData.timeSavedHours,
    aiFeatures: productivityData.tasksMatched,
    manualFeatures: 450
  }), [monthlySeatCost, manualHourlyRate]);

  const filteredMetrics = useMemo(() => {
    let currentUsers = [...users];
    if (platformFilter !== "all") {
      currentUsers = currentUsers.filter(u => u.primaryTool === platformFilter);
    }

    // In a real app, date filtering would happen on the backend or on a time-series of events.
    // For this demo, we'll scale the metrics based on the date range relative to 'All Time' (4 months).
    const daysSelected = dateRange.from && dateRange.to
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 120; // 4 months default
    const scaleFactor = Math.min(1, daysSelected / 120);

    const aiLoC = currentUsers.reduce((acc, u) => acc + u.aiLoC, 0) * scaleFactor;
    const totalLoC = currentUsers.reduce((acc, u) => acc + u.totalLoC, 0) * scaleFactor;
    const tokens = currentUsers.reduce((acc, u) => acc + u.tokensUsed, 0) * scaleFactor;

    // Aggregate data from tools
    const activeTools = aiTools.filter(t => platformFilter === "all" || t.shortName === platformFilter);
    const cost = activeTools.reduce((acc, t) => acc + (t.totalTokens * t.costPer1kTokens / 1000), 0) * scaleFactor;
    const avgCycleTimeByTool = activeTools.length > 0
      ? activeTools.reduce((acc, t) => acc + t.avgCycleTime, 0) / activeTools.length
      : productivityData.aiCycleTimeAvg;

    const velocityBoost = ((productivityData.manualCycleTimeAvg - avgCycleTimeByTool) / productivityData.manualCycleTimeAvg) * 100;
    const timeSaved = (productivityData.timeSavedHours * (aiLoC / Math.max(1, orgData.aiLoC)));

    return {
      aiLoC,
      totalLoC,
      aiCodePercent: totalLoC > 0 ? parseFloat(((aiLoC / totalLoC) * 100).toFixed(1)) : 0,
      activeAIUsers: currentUsers.filter(u => u.aiPercent > 0).length,
      aiAdoptionRate: currentUsers.length > 0 ? parseFloat(((currentUsers.filter(u => u.aiPercent > 0).length / currentUsers.length) * 100).toFixed(1)) : 0,
      totalTokens: tokens,
      totalAiCost: cost,
      avgTokensPerLine: aiLoC > 0 ? parseFloat((tokens / aiLoC).toFixed(2)) : 0,
      velocityBoost: parseFloat(velocityBoost.toFixed(1)),
      aiCycleTime: Math.round(avgCycleTimeByTool),
      timeSavedHours: Math.round(timeSaved)
    };
  }, [platformFilter, dateRange, users, aiTools]);

  const filteredTeams = useMemo(() => {
    if (platformFilter === "all") return teams;
    return teams.filter(t => t.primaryTool === platformFilter);
  }, [platformFilter]);

  useEffect(() => {
    socketService.connect();
    const handleMetricUpdate = (data: CommitEvent) => {
      addLiveEvent(data);
      toast.info(`Real-time: ${data.source} commit detected`, {
        description: `${data.commitHeading} by ${data.authorName}`,
        position: "bottom-right",
        duration: 4000
      });
    };
    socketService.on('METRIC_UPDATE', handleMetricUpdate);
    socketService.simulateLiveStream(); // idempotent — won't double-start
    return () => {
      socketService.off('METRIC_UPDATE', handleMetricUpdate);
    };
  }, []);

  useEffect(() => {
    if (currentRole === "Admin") {
      setLoadingRecommendations(true);
      generateAdminRecommendations({
        totalTeams: teams.length,
        avgAdoption: orgData.aiAdoptionRate,
        totalTokens: orgData.totalTokens,
        totalLoC: orgData.totalLoC,
        aiLoC: orgData.aiLoC,
      })
        .then((recs) => setRecommendations(recs))
        .catch((err) => {
          console.error("Failed to fetch recommendations:", err);
          setRecommendations([]);
        })
        .finally(() => setLoadingRecommendations(false));
    } else if (currentRole === "Manager") {
      setLoadingRecommendations(true);
      const team = teams.find(t => t.id === managerTeamId);
      const lowEngagementUsers = users.filter(u => u.teamId === managerTeamId && u.aiPercent < 20);

      if (team) {
        generateManagerRecommendations({
          teamName: team.name,
          headCount: team.headCount,
          activeUsers: team.aiUsers,
          aiCodePercent: team.aiCodePercent,
          mergeRate: team.aiMergeRate,
          lowEngagementCount: lowEngagementUsers.length,
        })
          .then((recs) => setRecommendations(recs))
          .catch((err) => {
            console.error("Failed to fetch manager recommendations:", err);
            setRecommendations([]);
          })
          .finally(() => setLoadingRecommendations(false));
      }
    } else if (currentRole === "Developer") {
      setLoadingRecommendations(true);
      const developer = users.find(u => u.id === developerUserId);
      if (developer) {
        generateDeveloperRecommendations({
          name: developer.name,
          aiPercent: developer.aiPercent,
          tokensUsed: developer.tokensUsed,
          aiLoC: developer.aiLoC,
          commitCount: developer.commits,
          mergeRate: developer.prMergeRate,
          acceptanceRate: developer.cursorAcceptRate,
          primaryTool: developer.primaryTool,
        })
          .then((recs) => setRecommendations(recs))
          .catch((err) => {
            console.error("Failed to fetch developer recommendations:", err);
            setRecommendations([]);
          })
          .finally(() => setLoadingRecommendations(false));
      }
    }
  }, [currentRole, managerTeamId, developerUserId]);

  const handleCommitClick = (event: CommitEvent) => {
    setSelectedCommit(event);
    setCommitDialogOpen(true);
  };

  const filteredTrend = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return weeklyTrend;
    return weekDateRanges
      .filter((w) => {
        if (dateRange.from && dateRange.to) {
          return w.end >= dateRange.from && w.start <= dateRange.to;
        }
        if (dateRange.from) return w.end >= dateRange.from;
        if (dateRange.to) return w.start <= dateRange.to;
        return true;
      })
      .map(({ start, end, ...rest }) => rest);
  }, [dateRange]);

  const dateLabel = dateRange.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
      : format(dateRange.from, "MMM d")
    : "All Time";

  const dateLabel2 = dateFilterStr === "all" ? "All Time" : `Last ${dateFilterStr} days`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8 max-w-[1600px] mx-auto pb-12"
      id="overview-content"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Live Insights</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl">
            Executive <span className="text-indigo-600">Overview</span>
          </h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            TechCorp Inc. Performance Tracking — <span className="text-slate-900">{dateLabel2}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateFilterStr} onValueChange={(val) => {
            setDateFilterStr(val);
            if (val === "all") {
              setDateRange({});
            } else {
              const days = parseInt(val, 10);
              const toDate = latestDataDate;
              const fromDate = new Date(toDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
              setDateRange({ from: fromDate, to: toDate });
            }
          }}>
            <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 bg-white font-bold text-sm shadow-sm">
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

          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 bg-white font-bold text-sm shadow-sm">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
              <SelectItem value="all" className="font-bold">All Tools</SelectItem>
              {aiTools.map(tool => (
                <SelectItem key={tool.id} value={tool.shortName} className="font-bold">{tool.shortName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="h-11 rounded-xl px-6 bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
            onClick={() => exportReport("Admin")}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Cpu className="h-32 w-32 text-white" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Engineering Productivity Overview</h2>
          </div>
          <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-4xl">
            Currently tracking <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredMetrics.activeAIUsers} engineers</span> across <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredTeams.length} teams</span>.
            The organization has generated <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{formatNumber(filteredMetrics.aiLoC)} lines of AI code</span> with a
            sustained <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredMetrics.aiCodePercent}% output share</span>.
            Efficiency stands at <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredMetrics.avgTokensPerLine} tokens per line</span>,
            driving a <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">${formatNumber(filteredMetrics.totalAiCost)} monthly investment</span> in AI {platformFilter !== 'all' ? platformFilter : 'tooling'}.
            Velocity has seen a <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredMetrics.velocityBoost}% net improvement</span> over manual baseline.
          </p>
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <MetricCard
          title="Monthly AI Cost"
          value={filteredMetrics.totalAiCost}
          prefix="$"
          gradient="warning"
          icon={<Coins className="h-6 w-6" />}
          trend={{ value: 12.8, isPositive: true }}
          subtitle={`${formatNumber(filteredMetrics.totalTokens)} tokens consumed`}
        />
        <MetricCard
          title="Avg. AI Code %"
          value={filteredMetrics.aiCodePercent}
          suffix="%"
          gradient="ai"
          icon={<Zap className="h-6 w-6" />}
          trend={{ value: 10.2, isPositive: true }}
          subtitle={`${formatNumber(filteredMetrics.aiLoC)} AI LoC generated`}
        />
        <MetricCard
          title="Avg. Tokens / Line"
          value={filteredMetrics.avgTokensPerLine}
          gradient="manual"
          icon={<Cpu className="h-6 w-6" />}
          subtitle="AI Output Efficiency"
        />
        <MetricCard
          title="Velocity Boost"
          value={filteredMetrics.velocityBoost}
          suffix="%"
          gradient="success"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 5.4, isPositive: true }}
          subtitle="Real-world productivity gain"
        />
        <MetricCard
          title="Active AI Users"
          value={filteredMetrics.activeAIUsers}
          subtitle={`${filteredMetrics.aiAdoptionRate}% adoption rate`}
          icon={<Users className="h-6 w-6" />}
          decimals={0}
        />
      </div>

      {/* SWOT Analysis Section */}
      {(currentRole === "Admin" || currentRole === "Manager" || currentRole === "Developer") && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-tighter cursor-default">SWOT Analysis</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {loadingRecommendations ? (
              <>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-64 flex items-center justify-center"
                >
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Running SWOT Engine...</p>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-64 flex items-center justify-center"
                >
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Identifying Operational Threats...</p>
                  </div>
                </motion.div>
              </>
            ) : recommendations.length > 0 ? (
              recommendations.slice(0, 2).map((rec) => (
                <motion.button
                  key={rec.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/ai-summary')}
                  className="text-left rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      rec.priority === 1 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    )}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                      rec.priority === 1 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {rec.id.includes('strength') ? 'STRENGTH' : rec.id.includes('weakness') ? 'WEAKNESS' : rec.id.includes('opportunity') ? 'OPPORTUNITY' : 'THREAT'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 uppercase tracking-tight">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-1 mb-4">
                    {rec.description.split('.')[0]}.
                  </p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
                    Full Tactical Breakdown
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center border-dashed">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Critical SWOT Events Detected</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Adoption & Usage Pattern Section - Admin & Manager Only */}
      {(currentRole === "Admin" || currentRole === "Manager") && (
        <div className="space-y-8">
          {/* User Adoption Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Last 30 Day Active Users"
              value={userAdoptionMetrics.last30DayActiveUsers}
              gradient="ai"
              icon={<Users className="h-6 w-6" />}
              trend={{
                value: ((userAdoptionMetrics.last30DayActiveUsers - userAdoptionMetrics.last30DayPrevious) / userAdoptionMetrics.last30DayPrevious * 100),
                isPositive: userAdoptionMetrics.last30DayActiveUsers > userAdoptionMetrics.last30DayPrevious
              }}
              subtitle="Unique users in last 30 days"
              decimals={0}
            />
            <MetricCard
              title="Last 7 Days Active Users"
              value={userAdoptionMetrics.last7DayActiveUsers}
              gradient="ai"
              icon={<Users className="h-6 w-6" />}
              trend={{
                value: ((userAdoptionMetrics.last7DayActiveUsers - userAdoptionMetrics.last7DayPrevious) / userAdoptionMetrics.last7DayPrevious * 100),
                isPositive: userAdoptionMetrics.last7DayActiveUsers > userAdoptionMetrics.last7DayPrevious
              }}
              subtitle="Unique users in last 7 days"
              decimals={0}
            />
            <MetricCard
              title="Daily Active Users"
              value={userAdoptionMetrics.dailyActiveUsers}
              gradient="ai"
              icon={<Users className="h-6 w-6" />}
              trend={{
                value: ((userAdoptionMetrics.dailyActiveUsers - userAdoptionMetrics.dailyPrevious) / userAdoptionMetrics.dailyPrevious * 100),
                isPositive: userAdoptionMetrics.dailyActiveUsers > userAdoptionMetrics.dailyPrevious
              }}
              subtitle="Unique users today"
              decimals={0}
            />
          </div>

          {/* User Activity Charts */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Monthly Active Users */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <h3 className="text-xl font-black tracking-tight text-slate-900">Monthly Active Users</h3>
                <p className="text-sm text-slate-500 mt-1">Unique users per month</p>
              </div>
              <EnhancedChart
                type="line"
                data={monthlyActiveUsers.map(m => ({ month: m.shortMonth, uniqueUsers: m.uniqueUsers }))}
                index="month"
                categories={['uniqueUsers']}
                colors={['#6366f1']}
                valueFormatter={(v) => formatNumber(v as number)}
                height={260}
                xAxisLabel="Month"
                yAxisLabel="Active Users"
              />
            </div>

            {/* Weekly Active Users */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <h3 className="text-xl font-black tracking-tight text-slate-900">Weekly Active Users</h3>
                <p className="text-sm text-slate-500 mt-1">Unique users per week (16 weeks)</p>
              </div>
              <EnhancedChart
                type="line"
                data={weeklyActiveUsers}
                index="week"
                categories={['uniqueUsers']}
                colors={['#06b6d4']}
                valueFormatter={(v) => formatNumber(v as number)}
                height={260}
                xAxisLabel="Week"
                yAxisLabel="Active Users"
              />
            </div>

            {/* Daily Active Users */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <h3 className="text-xl font-black tracking-tight text-slate-900">Daily Active Users</h3>
                <p className="text-sm text-slate-500 mt-1">Unique users per day (30 days)</p>
              </div>
              <EnhancedChart
                type="line"
                data={dailyActiveUsers}
                index="day"
                categories={['uniqueUsers']}
                colors={['#f59e0b']}
                valueFormatter={(v) => formatNumber(v as number)}
                height={260}
                xAxisLabel="Day"
                yAxisLabel="Active Users"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Section */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Trend Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Adoption & Output Trend */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden group flex-1">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="h-32 w-32 text-indigo-600" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">Adoption & Output Trend</h3>
                <p className="text-sm text-slate-500 mt-1">Comparing AI assistance vs manual craftsmanship</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase">AI Output</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <span className="text-xs font-bold text-slate-600 uppercase">Manual</span>
                </div>
              </div>
            </div>

            <EnhancedChart
              type="area"
              data={filteredTrend}
              index="week"
              categories={['aiLoC', 'manualLoC']}
              colors={['#6366f1', '#94a3b8']}
              valueFormatter={(v) => formatNumber(v as number)}
              height={260}
              xAxisLabel="Timeline (Weekly)"
              yAxisLabel="Lines of Code (LoC)"
            />
          </div>

          {/* AI Code Quality Trend */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden group flex-1">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CheckCircle className="h-32 w-32 text-emerald-500" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">AI Code Quality Trend</h3>
                <p className="text-sm text-slate-500 mt-1">Average successful pull request merge rate over time</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-600 uppercase">Merge Rate %</span>
              </div>
            </div>

            <EnhancedChart
              type="line"
              data={filteredTrend}
              index="week"
              categories={['aiMergeRate']}
              colors={['#10b981']}
              valueFormatter={(v) => `${v}%`}
              height={260}
              xAxisLabel="Timeline (Weekly)"
              yAxisLabel="Merge Success Rate (%)"
            />
          </div>
        </div>

        {/* Team Leadership */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-black tracking-tight text-slate-900 mb-6">Team Proficiency</h3>
          <div className="space-y-6 flex-1">
            {filteredTeams.map((team) => (
              <div key={team.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{team.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{team.headCount} DEVS • {team.primaryTool}</p>
                  </div>
                  <span className="text-lg font-black font-metric text-indigo-600">{team.aiCodePercent}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${team.aiCodePercent}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full mt-8 h-12 rounded-xl text-slate-600 font-bold hover:bg-slate-50 group transition-all shrink-0"
            onClick={() => navigate('/teams')}
          >
            Full Team Analytics <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Productivity & Security Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cycle Time Analysis */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-indigo-500/10 blur-[80px] rounded-full" />

          <div className="relative z-10">
            <h3 className="text-xl font-black tracking-tight text-white mb-8 flex items-center gap-2">
              <Clock className="h-6 w-6 text-indigo-400" /> Efficiency Gain
            </h3>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center pr-1">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">AI Assisted</span>
                  <span className="text-xl font-black text-white font-metric">{filteredMetrics.aiCycleTime}m</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(filteredMetrics.aiCycleTime / productivityData.manualCycleTimeAvg) * 100}%` }}
                    className="h-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center pr-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manual Only</span>
                  <span className="text-xl font-black text-white font-metric">{productivityData.manualCycleTimeAvg}m</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="h-full bg-slate-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-sm">
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-tighter mb-1">Impact Summary</p>
                  <p className="text-3xl font-black text-white tracking-tighter">
                    {filteredMetrics.velocityBoost}% <span className="text-lg font-bold text-indigo-400 uppercase tracking-normal">Faster Delivery</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Health */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-500" /> Guardrail Efficiency
              </h3>
              <p className="text-sm text-slate-500 mt-1">AI Risks detected and mitigated across repositories</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-black rounded-lg px-3 py-1 ring-1 ring-emerald-200">
              HEALTHY SCORE: {(100 - orgData.aiRiskScore).toFixed(1)}/100
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <EnhancedChart
              type="bar"
              data={securityData.interventionTrend}
              index="week"
              categories={['interventions', 'flaws']}
              colors={['#10b981', '#cbd5e1']}
              height={220}
              xAxisLabel="Timeline (Weekly)"
              yAxisLabel="Sec. Event Count"
            />

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detections by category</h4>
              {securityData.topRiskTypes.map((risk) => (
                <div key={risk.type} className="group">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-700">{risk.type}</span>
                    <span className="text-sm font-black font-metric text-slate-900">{risk.count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(risk.count / 700) * 100}%` }}
                      className={cn(
                        "h-full transition-all group-hover:opacity-80",
                        risk.type === "Unsafe Patterns" ? "bg-rose-500" : risk.type === "Hardcoded Secrets" ? "bg-amber-500" : "bg-indigo-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity & Top Contributors */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Live Feed */}
        <div className="lg:col-span-12 xl:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                <Activity className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Real-time Telemetry</h3>
                <p className="text-sm text-slate-500 font-medium">Streaming global AI events from VCS webhooks • Click a commit for details</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live: Connected</span>
            </div>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {liveEvents.map((event, i) => (
                <motion.button
                  key={event.commitId || i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => handleCommitClick(event)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 transition-transform",
                      event.source === 'AI'
                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                        : event.source === 'Hybrid'
                          ? 'bg-violet-500 text-white shadow-violet-200'
                          : 'bg-white text-slate-900 border border-slate-200 shadow-slate-100'
                    )}>
                      {event.source === 'AI' ? <Zap className="h-5 w-5" /> : event.source === 'Hybrid' ? <Layers className="h-5 w-5" /> : <Code2 className="h-5 w-5 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate" title={event.commitHeading}>{event.commitHeading}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        <span className="truncate" title={event.authorName}>{event.authorName}</span>
                        <span>•</span>
                        <span className="truncate" title={event.repository}>{event.repository}</span>
                        <span>•</span>
                        <span className="flex-shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lines</p>
                        <p className="text-sm font-black font-metric text-slate-700">{event.linesAdded}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI %</p>
                        <p className="text-sm font-black font-metric text-indigo-600">{event.aiPercent}%</p>
                      </div>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
            {liveEvents.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Activity className="h-10 w-10 text-slate-200 animate-pulse" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Listening for live deployment telemetry...</p>
                <p className="text-slate-300 text-xs font-medium">First commit will appear shortly</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Contributors Card */}
        <div className="lg:col-span-12 xl:col-span-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight text-slate-900">Leaderboard</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top AI Engineers</span>
          </div>

          <div className="space-y-4">
            {topUsers.map((user, idx) => (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/users/${user.id}`)}
                className="w-full flex items-center gap-4 rounded-2xl p-4 bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all text-left group"
              >
                <div className="relative">
                  <UserAvatar name={user.name} size="md" />
                  <div className={cn(
                    "absolute -top-2 -left-2 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md",
                    idx === 0 ? "bg-amber-400 text-amber-900" : idx === 1 ? "bg-slate-300 text-slate-700" : "bg-orange-300 text-orange-900"
                  )}>
                    {idx + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.team}</p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black font-metric text-indigo-600">{user.aiPercent}%</p>
                  <StatusBadge status={user.status} size="sm" />
                </div>
              </motion.button>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full mt-6 h-12 rounded-xl text-slate-600 font-black border-slate-200 hover:bg-slate-50 group transition-all"
            onClick={() => navigate('/leaderboard')}
          >
            View Full Rankings <Trophy className="h-4 w-4 ml-2 group-hover:rotate-12 transition-transform text-amber-500" />
          </Button>
        </div>
      </div>

      {/* ─── Commit Detail Modal ─── */}
      <AnimatePresence>
        {commitDialogOpen && selectedCommit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCommitDialogOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 px-8 py-10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -bottom-16 -left-16 h-40 w-40 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <GitCommitHorizontal className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <h2 className="text-2xl font-black text-white tracking-tight leading-none">Commit Details</h2>
                        <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Real-time Telemetry Event</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCommitDialogOpen(false)}
                      className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <p className="text-white font-extrabold text-2xl leading-tight mb-2">{selectedCommit.commitHeading}</p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white/20 text-white border-none hover:bg-white/30 transition-colors">
                        <Hash className="h-3 w-3 mr-1" />
                        {selectedCommit.commitId.substring(0, 7)}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-none hover:bg-white/30 transition-colors">
                        <Activity className="h-3 w-3 mr-1" />
                        {selectedCommit.source}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body — Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Commit Description Callout */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Commit Description</h4>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedCommit.commitDescription}
                  </p>
                </div>
                {/* KPI Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Commit ID</span>
                    </div>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 truncate" title={selectedCommit.commitId}>
                      {selectedCommit.commitId.substring(0, 12)}...
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Author</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{selectedCommit.authorName}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-1.5">{selectedCommit.authorRole}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Team</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedCommit.teamName}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <FolderGit2 className="h-4 w-4 text-violet-400" />
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Repository</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{selectedCommit.repository}</p>
                  </div>
                </div>

                {/* Metrics KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50">
                    <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2.5">Lines Added</p>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-metric leading-none">{selectedCommit.linesAdded}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/40 dark:to-fuchsia-950/40 border border-violet-100 dark:border-violet-900/50">
                    <p className="text-[10px] font-black text-violet-500 dark:text-violet-400 uppercase tracking-widest mb-2.5">AI Generated</p>
                    <p className="text-3xl font-black text-violet-600 dark:text-violet-400 font-metric leading-none">{selectedCommit.linesAI}</p>
                    <p className="text-[10px] text-violet-600 dark:text-violet-300 font-bold mt-2.5 leading-snug">{selectedCommit.aiPercent}% of total</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">Manual Lines</p>
                    <p className="text-3xl font-black text-slate-700 dark:text-slate-300 font-metric leading-none">{selectedCommit.linesManual}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold mt-2.5 leading-snug">{100 - selectedCommit.aiPercent}% of total</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-100 dark:border-amber-900/50">
                    <p className="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-2.5">Tokens Used</p>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400 font-metric leading-none">{formatNumber(selectedCommit.tokensUsed)}</p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* AI Tool Split — Doughnut Chart */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      AI Tool Attribution
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-[160px] h-[160px] flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={selectedCommit.aiToolSplit}
                              dataKey="percent"
                              nameKey="tool"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={72}
                              strokeWidth={2}
                              stroke="#ffffff"
                            >
                              {selectedCommit.aiToolSplit.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value: any, name: any) => [`${value}%`, name]}
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                color: theme === 'dark' ? '#f8fafc' : '#1e293b',
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '8px 14px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2.5">
                        {selectedCommit.aiToolSplit.map((tool, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: tool.color }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{tool.icon} {tool.tool}</span>
                                <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-metric">{tool.percent}%</span>
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{tool.lines} lines</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI vs Manual — Bar Chart */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-emerald-500" />
                      Code Composition
                    </h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart
                        data={[
                          { name: 'AI Generated', value: selectedCommit.linesAI, fill: '#6366f1' },
                          { name: 'Manual', value: selectedCommit.linesManual, fill: '#94a3b8' },
                        ]}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700, fill: theme === 'dark' ? '#cbd5e1' : '#94a3b8' }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700, fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }} width={95} />
                        <RechartsTooltip
                          formatter={(value: any) => [`${value} lines`]}
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                            border: 'none',
                            borderRadius: '12px',
                            color: theme === 'dark' ? '#f8fafc' : '#1e293b',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '8px 14px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                          {[
                            { name: 'AI Generated', value: selectedCommit.linesAI, fill: '#6366f1' },
                            { name: 'Manual', value: selectedCommit.linesManual, fill: '#94a3b8' },
                          ].map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Visual Proportion Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">AI: {selectedCommit.aiPercent}%</span>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Manual: {100 - selectedCommit.aiPercent}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedCommit.aiPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-l-full"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - selectedCommit.aiPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className="h-full bg-slate-300 rounded-r-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Info Bar */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 text-white">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Source Type</p>
                      <Badge className={cn(
                        "mt-1 font-black text-[10px] rounded-lg",
                        selectedCommit.source === 'AI' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                          selectedCommit.source === 'Hybrid' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
                            'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      )}>{selectedCommit.source}</Badge>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence</p>
                      <p className="text-lg font-black font-metric text-emerald-400 mt-0.5">{Math.round(selectedCommit.confidence * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                      <p className="text-sm font-bold text-slate-300 mt-0.5">{new Date(selectedCommit.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/users/${selectedCommit.authorId}`)}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-xl px-5 h-10 text-xs transition-all active:scale-95"
                  >
                    View {selectedCommit.authorName.split(' ')[0]}'s Profile
                    <ArrowRight className="h-3.5 w-3.5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div >
  );
}
