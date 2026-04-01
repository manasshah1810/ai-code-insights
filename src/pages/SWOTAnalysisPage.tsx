import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateAdminSWOT,
  generateManagerSWOT,
  generateDeveloperSWOT,
  type SWOTItem
} from "@/lib/ai-completion-service";
import { orgData, users, teams } from "@/data/dashboard-data";
import { useAppStore } from "@/store/app-store";
import {
  Sparkles,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TrendingUp,
  Target,
  AlertTriangle,
  Users,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Category configuration
const categoryConfig = {
  strength: {
    label: "INTERNAL FACTORS",
    title: "Strengths",
    color: "from-emerald-500 to-teal-500",
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/50",
    textColor: "text-emerald-700",
    icon: CheckCircle2,
  },
  weakness: {
    label: "INTERNAL FACTORS",
    title: "Weaknesses",
    color: "from-amber-500 to-orange-500",
    border: "border-l-amber-500",
    bg: "bg-amber-50/50",
    textColor: "text-amber-700",
    icon: AlertTriangle,
  },
  opportunity: {
    label: "EXTERNAL FACTORS",
    title: "Opportunities",
    color: "from-blue-500 to-indigo-500",
    border: "border-l-indigo-500",
    bg: "bg-indigo-50/50",
    textColor: "text-indigo-700",
    icon: Target,
  },
  threat: {
    label: "EXTERNAL FACTORS",
    title: "Threats",
    color: "from-rose-500 to-red-500",
    border: "border-l-rose-500",
    bg: "bg-rose-50/50",
    textColor: "text-rose-700",
    icon: AlertTriangle,
  },
};

interface SWOTCategory {
  type: "strength" | "weakness" | "opportunity" | "threat";
  items: SWOTItem[];
}

export default function SWOTAnalysisPage() {
  const { currentRole, managerTeamId, developerUserId } = useAppStore();
  const [swotItems, setSWOTItems] = useState<SWOTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchSWOT = async (regenerating = false) => {
    console.log("Fetching SWOT for role:", currentRole);
    if (regenerating) setIsRegenerating(true);
    else setLoading(true);
    setError(null);

    try {
      let items: SWOTItem[] = [];

      if (currentRole === "Admin") {
        items = await generateAdminSWOT({
          totalTeams: teams.length,
          avgAdoption: orgData.aiAdoptionRate,
          totalTokens: orgData.totalTokens,
          totalLoC: orgData.totalLoC,
          aiLoC: orgData.aiLoC,
        });
      } else if (currentRole === "Manager") {
        const team = teams.find(t => t.id === managerTeamId);
        if (team) {
          items = await generateManagerSWOT({
            teamName: team.name,
            headCount: team.headCount,
            activeUsers: team.aiUsers,
            aiCodePercent: team.aiCodePercent,
            mergeRate: team.aiMergeRate,
            lowEngagementCount: users.filter(u => u.teamId === managerTeamId && u.aiPercent < 20).length,
          });
        }
      } else {
        const developer = users.find(u => u.id === developerUserId);
        if (developer) {
          items = await generateDeveloperSWOT({
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

      console.log("SWOT items received:", items.length);
      setSWOTItems(items);
    } catch (err) {
      console.error("Failed to fetch SWOT:", err);
      setError("Failed to generate SWOT analysis. Please try again.");
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    fetchSWOT();
  }, [currentRole, managerTeamId, developerUserId]);

  // Group items by category
  const categorizedItems: Record<string, SWOTItem[]> = {
    strength: swotItems.filter(item => item.category === "strength"),
    weakness: swotItems.filter(item => item.category === "weakness"),
    opportunity: swotItems.filter(item => item.category === "opportunity"),
    threat: swotItems.filter(item => item.category === "threat"),
  };

  const roleTitle = {
    Admin: "Executive SWOT Analysis",
    Manager: "Team SWOT Analysis",
    Developer: "Personal SWOT Analysis",
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
      transition={{ duration: 0.6 }}
      className="space-y-8 max-w-[1400px] mx-auto pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              {roleIcon}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl">
              {roleTitle}
            </h1>
          </div>
          <p className="text-base text-slate-600 mt-2 font-medium max-w-2xl">
            Comprehensive SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis powered by Anthropic Claude Sonnet 4.6. All insights are tactical, actionable, and operational.
          </p>
        </div>
        <button
          onClick={() => fetchSWOT(true)}
          disabled={loading || isRegenerating}
          className={cn(
            "rounded-lg font-bold px-6 h-11 flex items-center gap-2 transition-all whitespace-nowrap",
            isRegenerating || loading
              ? "bg-slate-100 text-slate-600 cursor-not-allowed"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
          {isRegenerating ? "Analyzing..." : "Regenerate"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-slate-200 bg-white p-16 shadow-sm text-center"
        >
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Generating SWOT Analysis...</h3>
          <p className="text-slate-600">Analyzing your operational metrics with AI to generate tactical insights.</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-rose-200 bg-rose-50 p-12 shadow-sm text-center"
        >
          <div className="h-20 w-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold text-rose-900 mb-2">Analysis Failed</h3>
          <p className="text-rose-600 mb-6">{error}</p>
          <Button
            onClick={() => fetchSWOT(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* SWOT Grid */}
      {!loading && !error && swotItems.length > 0 && (
        <>
          {/* Top Row: Strengths & Opportunities */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* STRENGTHS (Left) */}
            <SWOTSection
              type="strength"
              items={categorizedItems.strength}
              label="INTERNAL FACTORS"
              title="Strengths"
            />

            {/* OPPORTUNITIES (Right) */}
            <SWOTSection
              type="opportunity"
              items={categorizedItems.opportunity}
              label="EXTERNAL FACTORS"
              title="Opportunities"
            />
          </div>

          {/* Bottom Row: Weaknesses & Threats */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* WEAKNESSES (Left) */}
            <SWOTSection
              type="weakness"
              items={categorizedItems.weakness}
              label="INTERNAL FACTORS"
              title="Weaknesses"
            />

            {/* THREATS (Right) */}
            <SWOTSection
              type="threat"
              items={categorizedItems.threat}
              label="EXTERNAL FACTORS"
              title="Threats"
            />
          </div>

          {/* Summary Footer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 text-center"
          >
            <p className="text-sm text-slate-600">
              <Sparkles className="h-4 w-4 inline mr-2" />
              SWOT analysis generated by Anthropic Claude Sonnet 4.6 •
              <span className="font-bold ml-2">{swotItems.length} insights</span> •
              All insights are tactical, actionable, and operational in nature
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

function SWOTSection({
  type,
  items,
  label,
  title,
}: {
  type: "strength" | "weakness" | "opportunity" | "threat";
  items: SWOTItem[];
  label: string;
  title: string;
}) {
  const config = categoryConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
        <h2 className={cn("text-3xl font-extrabold tracking-tight", config.textColor)}>
          {title}
        </h2>
      </div>

      {/* Items Container */}
      <div className={cn("rounded-2xl border border-slate-200 p-6 space-y-4", config.bg)}>
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => (
            <SWOTItemCard key={item.id} item={item} config={config} index={idx} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const SWOTItemCard = forwardRef<HTMLDivElement, {
  item: SWOTItem;
  config: typeof categoryConfig.strength;
  index: number;
}>(({
  item,
  config,
  index,
}, ref) => {
  const Icon = config.icon;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "flex gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all",
        config.border,
        "border-l-4"
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", `bg-gradient-to-br ${config.color}`)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h4 className="font-bold text-slate-900 text-sm leading-tight">
            {item.title}
          </h4>
          {item.metric && (
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
              item.category === "strength" ? "bg-emerald-100 text-emerald-700" :
                item.category === "weakness" ? "bg-amber-100 text-amber-700" :
                  item.category === "opportunity" ? "bg-indigo-100 text-indigo-700" :
                    "bg-rose-100 text-rose-700"
            )}>
              {item.metric}
            </span>
          )}
        </div>
        {item.subtitle && (
          <p className="text-xs text-slate-500 font-medium mb-2">
            {item.subtitle}
          </p>
        )}
        <p className="text-sm text-slate-700 leading-relaxed">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
});
