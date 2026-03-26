import { useState, useEffect } from "react";
import {
  generateAdminRecommendations,
  generateManagerRecommendations,
  generateDeveloperRecommendations,
  type Recommendation
} from "@/lib/ai-completion-service";
import { getCachedRecommendations, cacheRecommendations } from "@/lib/recommendation-cache-service";
import { orgData, users, teams, aiTools } from "@/data/dashboard-data";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Users,
  Code2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const config = {
    high: { color: "bg-rose-100 text-rose-700 border-rose-200", label: "High Impact" },
    medium: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium Impact" },
    low: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Low Impact" },
  };
  return (
    <Badge className={`${config[impact].color} font-bold rounded-lg px-3 py-1 ring-1 border`}>
      {config[impact].label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: 1 | 2 }) {
  return (
    <Badge className={cn(
      "font-bold rounded-lg px-3 py-1 ring-1 border",
      priority === 1
        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
        : "bg-slate-100 text-slate-700 border-slate-200"
    )}>
      {priority === 1 ? "🔥 Priority 1" : "Priority 2"}
    </Badge>
  );
}

function SWOSBadge({ id }: { id: string }) {
  const isStrength = id.toLowerCase().includes("strength");
  const isWeakness = id.toLowerCase().includes("weakness");
  const isOpportunity = id.toLowerCase().includes("opportunity");
  const isThreat = id.toLowerCase().includes("threat");

  const label = isStrength ? "STRENGTH" : isWeakness ? "WEAKNESS" : isOpportunity ? "OPPORTUNITY" : isThreat ? "THREAT" : "INSIGHT";
  const colors = isStrength ? "bg-emerald-500 text-white" : isWeakness ? "bg-slate-500 text-white" : isOpportunity ? "bg-indigo-500 text-white" : isThreat ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-700";

  return (
    <Badge className={cn("font-black px-4 py-1.5 rounded-full text-[12px] shadow-sm tracking-widest border-0", colors)}>
      {label}
    </Badge>
  );
}

export default function AISummaryPage() {
  const { currentRole, managerTeamId, developerUserId } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      let recs: Recommendation[] = [];

      if (currentRole === "Admin") {
        recs = await generateAdminRecommendations({
          totalTeams: teams.length,
          avgAdoption: orgData.aiAdoptionRate,
          totalTokens: orgData.totalTokens,
          totalLoC: orgData.totalLoC,
          aiLoC: orgData.aiLoC,
        });
      } else if (currentRole === "Manager") {
        const team = teams.find(t => t.id === managerTeamId);
        const lowEngagementUsers = users.filter(u => u.teamId === managerTeamId && u.aiPercent < 20);

        if (team) {
          recs = await generateManagerRecommendations({
            teamName: team.name,
            headCount: team.headCount,
            activeUsers: team.aiUsers,
            aiCodePercent: team.aiCodePercent,
            mergeRate: team.aiMergeRate,
            lowEngagementCount: lowEngagementUsers.length,
          });
        }
      } else {
        const developer = users.find(u => u.id === developerUserId);
        if (developer) {
          recs = await generateDeveloperRecommendations({
            name: developer.name,
            aiPercent: developer.aiPercent,
            tokensUsed: developer.tokensUsed,
            aiLoC: developer.aiLoC,
            commitCount: developer.commits,
            mergeRate: developer.prMergeRate,
            acceptanceRate: developer.cursorAcceptRate,
            primaryTool: developer.primaryTool,
          });
        }
      }

      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError("Failed to load SWOS analysis. The engine might be under heavy load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentRole, managerTeamId, developerUserId]);

  const roleTitle = {
    Admin: "Executive SWOS Analysis",
    Manager: "Team SWOS Analysis",
    Developer: "Personal SWOS Analysis"
  }[currentRole];

  const roleIcon = {
    Admin: <Users className="h-6 w-6" />,
    Manager: <TrendingUp className="h-6 w-6" />,
    Developer: <Code2 className="h-6 w-6" />,
  }[currentRole];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8 max-w-[1200px] mx-auto pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Tactical & Operational Insights</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl uppercase">
            {roleTitle}
          </h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Tactical analysis of Strengths, Weaknesses, Opportunities, and Threats across your engineering operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => fetchRecommendations(true)}
            disabled={loading}
            className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-6 h-11 transition-all"
          >
            <Zap className={cn("h-4 w-4", loading && "animate-pulse")} />
            {loading ? "Analyzing..." : "Regenerate SWOS"}
          </Button>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-700">Qwen 3 Engine Active</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2 font-mono uppercase tracking-tighter">Running Tactical SWOS Engine...</h3>
          <p className="text-slate-600">Our Qwen model is performing a detailed SWOS analysis (Strengths, Weakness, Opportunities, Threats) on your operational metadata.</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-12 shadow-sm text-center">
          <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold text-rose-900 mb-2">SWOS Engine Stall</h3>
          <p className="text-rose-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Reboot Engine
          </Button>
        </div>
      )}

      {/* No Recommendations Case */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">Analysis Complete: No Critical Threats</h3>
          <p className="text-slate-600">Operations are stable and metrics are within safe bands. No immediate SWOS interventions required.</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                    className="w-full p-8 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <SWOSBadge id={rec.id} />
                          <div className="flex-1">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                              {rec.title}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2 italic">
                              {rec.description}
                            </p>
                          </div>
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <ImpactBadge impact={rec.impact} />
                          <PriorityBadge priority={rec.priority} />
                          <Badge className="bg-slate-100 text-slate-700 font-bold rounded-lg px-3 py-1 ring-1 ring-slate-200 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rec.timeframe}
                          </Badge>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <motion.div
                        animate={{ rotate: expandedId === rec.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 mt-2"
                      >
                        <ChevronRight className="h-6 w-6 text-slate-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {expandedId === rec.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-100 overflow-hidden"
                      >
                        <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50/50 to-white">
                          {/* Full Description */}
                          <div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-2">
                              Detailed Context
                            </h4>
                            <p className="text-slate-700 leading-relaxed">
                              {rec.description}
                            </p>
                          </div>

                          {/* Visualizations - Metrics/Charts/KPIs */}
                          {rec.visualizations && rec.visualizations.length > 0 && (
                            <div>
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
                                📊 Key Metrics & Impact
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {rec.visualizations.map((viz, vizIdx) => (
                                  <motion.div
                                    key={vizIdx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: vizIdx * 0.05 }}
                                    className={cn(
                                      "rounded-xl border p-4 transition-all hover:shadow-sm",
                                      viz.type === "metric"
                                        ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                                        : viz.type === "gauge"
                                          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                                          : viz.type === "progress"
                                            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                                            : "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200"
                                    )}
                                  >
                                    <p className="text-xs font-bold text-slate-600 mb-2 line-clamp-1">
                                      {viz.label}
                                    </p>
                                    {viz.type === "progress" ? (
                                      <div>
                                        <div className="flex items-baseline gap-1 mb-2">
                                          <span className="text-2xl font-black text-slate-900">
                                            {typeof viz.value === "number" && typeof viz.target === "number"
                                              ? Math.round((viz.value / viz.target) * 100)
                                              : 0}
                                          </span>
                                          <span className="text-xs text-slate-600">%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                          <div
                                            className="bg-emerald-500 h-2 rounded-full transition-all"
                                            style={{
                                              width: `${typeof viz.value === "number" && typeof viz.target === "number"
                                                ? Math.min(100, (viz.value / viz.target) * 100)
                                                : 0}%`
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ) : viz.type === "gauge" ? (
                                      <div>
                                        <div className="flex items-baseline gap-1 mb-2">
                                          <span className="text-2xl font-black text-slate-900">
                                            {viz.value}
                                          </span>
                                          <span className="text-xs text-slate-600">{viz.unit}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                                          <div
                                            className="bg-amber-500 h-1.5 rounded-full transition-all"
                                            style={{
                                              width: `${typeof viz.value === "number" ? Math.min(100, viz.value) : 0}%`
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ) : viz.type === "trend" ? (
                                      <div>
                                        <div className="text-2xl font-black text-slate-900 mb-1">
                                          {viz.value}
                                        </div>
                                        {viz.change && (
                                          <div className={cn(
                                            "inline-block px-2 py-1 rounded text-xs font-bold",
                                            viz.change.includes("-")
                                              ? "bg-red-100 text-red-700"
                                              : "bg-green-100 text-green-700"
                                          )}>
                                            {viz.change}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="text-2xl font-black text-slate-900 mb-1">
                                          {typeof viz.value === "number"
                                            ? parseFloat(viz.value.toFixed(2)).toLocaleString()
                                            : viz.value}
                                        </div>
                                        {viz.target && (
                                          <div className="text-xs text-slate-600">
                                            Target: {typeof viz.target === "number"
                                              ? parseFloat(viz.target.toFixed(2)).toLocaleString()
                                              : viz.target}
                                            {viz.unit}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Items */}
                          <div>
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
                              🎯 Recommended Actions
                            </h4>
                            <ul className="space-y-3">
                              {rec.actionItems.map((item, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex gap-3 items-start"
                                >
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-indigo-600">{i + 1}</span>
                                  </div>
                                  <span className="text-slate-700 pt-0.5">{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>

                          {/* Expected Outcome */}
                          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-200/50 p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1">
                                  Expected Outcome
                                </p>
                                <p className="text-sm text-emerald-900 font-medium">
                                  {rec.expectedOutcome}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="flex gap-3 pt-4">
                            <Button
                              className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Start This Initiative
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 h-11 rounded-xl border-slate-200 font-bold hover:bg-slate-50"
                              onClick={() => setExpandedId(null)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-indigo-600" />
              <p className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                Priority Actions
              </p>
            </div>
            <p className="text-3xl font-black font-metric text-indigo-900">
              {recommendations.filter(r => r.priority === 1).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <p className="text-xs font-black text-amber-700 uppercase tracking-wider">
                High Impact Items
              </p>
            </div>
            <p className="text-3xl font-black font-metric text-amber-900">
              {recommendations.filter(r => r.impact === "high").length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                Implementation Time
              </p>
            </div>
            <p className="text-lg font-black font-metric text-emerald-900">
              1-3 weeks
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
