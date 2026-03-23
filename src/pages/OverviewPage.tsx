import { useState, useMemo, useEffect } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { orgData, teams, users, weeklyTrend, formatNumber, productivityData, securityData, aiTools } from "@/data/dashboard-data";
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
  Cpu
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { socketService } from "@/lib/socket-service";
import { exportReport } from "@/lib/export-pdf";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { RoiCalculator } from "@/lib/roi-calculator";

// Map week labels to date ranges
const weekDateRanges = weeklyTrend.map((w) => {
  const [start, end] = w.label.split(" - ").map((d) => parse(d.trim(), "MMM d, yyyy", new Date()));
  return { ...w, start, end };
});

export default function OverviewPage() {
  const navigate = useNavigate();
  const { monthlySeatCost, manualHourlyRate } = useAppStore();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [dateFilterStr, setDateFilterStr] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

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
    const cost = aiTools.filter(t => platformFilter === "all" || t.shortName === platformFilter)
      .reduce((acc, t) => acc + (t.totalTokens * t.costPer1kTokens / 1000), 0) * scaleFactor;

    return {
      aiLoC,
      totalLoC,
      aiCodePercent: totalLoC > 0 ? parseFloat(((aiLoC / totalLoC) * 100).toFixed(1)) : 0,
      activeAIUsers: currentUsers.filter(u => u.aiPercent > 0).length,
      aiAdoptionRate: currentUsers.length > 0 ? parseFloat(((currentUsers.filter(u => u.aiPercent > 0).length / currentUsers.length) * 100).toFixed(1)) : 0,
      totalTokens: tokens,
      totalAiCost: cost,
      linesPerMillionTokens: tokens > 0 ? Math.floor((aiLoC / tokens) * 1000000) : 0
    };
  }, [platformFilter, dateRange, users, aiTools]);

  const filteredTeams = useMemo(() => {
    if (platformFilter === "all") return teams;
    return teams.filter(t => t.primaryTool === platformFilter);
  }, [platformFilter]);

  useEffect(() => {
    socketService.connect();
    const handleMetricUpdate = (data: any) => {
      setLiveEvents(prev => [data, ...prev].slice(0, 5));
      toast.info(`Real-time: ${data.source} commit detected`, {
        description: `Commit ${data.commitId} processed`,
        position: "bottom-right",
        duration: 3000
      });
    };
    socketService.on('METRIC_UPDATE', handleMetricUpdate);
    socketService.simulateLiveStream();
    return () => {
      socketService.off('METRIC_UPDATE', handleMetricUpdate);
    };
  }, []);

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
            <h2 className="text-xl font-black text-white tracking-tight">AI Ecosystem Intelligence Summary</h2>
          </div>
          <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-4xl">
            Currently tracking <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredMetrics.activeAIUsers} engineers</span> across <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredTeams.length} teams</span>.
            The organization has generated <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{formatNumber(filteredMetrics.aiLoC)} lines of AI code</span> with a
            sustained <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredMetrics.aiCodePercent}% output share</span>.
            Efficiency stands at <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">{filteredMetrics.linesPerMillionTokens} lines per 1M tokens</span>,
            driving a <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">${formatNumber(filteredMetrics.totalAiCost)} monthly investment</span> in AI {platformFilter !== 'all' ? platformFilter : 'tooling'}.
            Velocity has seen a <span className="text-white font-black underline decoration-indigo-300 underline-offset-4">72.1% net improvement</span> over manual baseline.
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
          title="Lines / 1M Tokens"
          value={filteredMetrics.linesPerMillionTokens}
          gradient="manual"
          icon={<Cpu className="h-6 w-6" />}
          subtitle="AI Output Efficiency"
        />
        <MetricCard
          title="Velocity Boost"
          value={productivityData.velocityBoostPercent}
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

      {/* Main Analysis Section */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Trend Analysis */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden group">
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
            height={350}
          />
        </div>

        {/* Team Leadership */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-black tracking-tight text-slate-900 mb-6">Team Proficiency</h3>
          <div className="space-y-6">
            {teams.map((team) => (
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
            className="w-full mt-8 h-12 rounded-xl text-slate-600 font-bold hover:bg-slate-50 group transition-all"
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
                  <span className="text-xl font-black text-white font-metric">{productivityData.aiCycleTimeAvg}m</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(productivityData.aiCycleTimeAvg / productivityData.manualCycleTimeAvg) * 100}%` }}
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
                    {productivityData.velocityBoostPercent}% <span className="text-lg font-bold text-indigo-400 uppercase tracking-normal">Faster Delivery</span>
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
                <h3 className="text-xl font-black tracking-tight text-slate-900">Real-time Telemetry</h3>
                <p className="text-sm text-slate-500 font-medium">Streaming global AI events from VCS webhooks</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live: Connected</span>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {liveEvents.map((event, i) => (
                <motion.div
                  key={event.commitId || i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 transition-transform",
                      event.source === 'AI'
                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                        : 'bg-white text-slate-900 border border-slate-200 shadow-slate-100'
                    )}>
                      {event.source === 'AI' ? <Zap className="h-5 w-5" /> : <Code2 className="h-5 w-5 text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Commit {event.commitId?.substring(0, 8) || "Processing"}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>{event.repository || "System"}</span>
                        <span>•</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Confidence</p>
                      <p className="text-sm font-black font-metric text-indigo-600">{Math.round((event.confidence || 0) * 100)}%</p>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {liveEvents.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Activity className="h-10 w-10 text-slate-200 animate-pulse" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Listening for live deployment telemetry...</p>
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
    </motion.div >
  );
}
