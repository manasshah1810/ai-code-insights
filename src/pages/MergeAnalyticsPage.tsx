import { mergeAnalytics, orgData, formatNumber } from "@/data/dashboard-data";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { DataTable } from "@/components/ui/DataTable";
import { motion } from "framer-motion";
import { GitMerge, Filter, ArrowRight, ShieldAlert, CheckCircle, Database, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function MergeAnalyticsPage() {
  const funnel = [
    { stage: "AI LoC Written", value: mergeAnalytics.aiLoCWritten, icon: <Zap className="h-4 w-4" />, color: "bg-indigo-600" },
    { stage: "AI LoC in PRs", value: mergeAnalytics.aiLoCInPRs, icon: <Filter className="h-4 w-4" />, color: "bg-purple-600" },
    { stage: "AI LoC Merged", value: mergeAnalytics.aiLoCMerged, icon: <CheckCircle className="h-4 w-4" />, color: "bg-emerald-600" },
  ];

  const rate1 = ((mergeAnalytics.aiLoCInPRs / mergeAnalytics.aiLoCWritten) * 100).toFixed(1);
  const rate2 = ((mergeAnalytics.aiLoCMerged / mergeAnalytics.aiLoCInPRs) * 100).toFixed(1);

  const comparisonData = [
    { name: "AI Engine", rate: orgData.aiMergeRate },
    { name: "Human Manual", rate: mergeAnalytics.manualMergeRate },
  ];

  const rejectedColumns = [
    {
      header: "Pull Request",
      accessorKey: "title",
      cell: (val: string) => <span className="font-bold text-slate-900">{val}</span>
    },
    {
      header: "Author",
      accessorKey: "author",
      cell: (val: string) => <span className="text-xs font-bold text-slate-500">{val}</span>
    },
    {
      header: "AI %",
      accessorKey: "aiPercent",
      cell: (val: number) => <span className="font-black font-metric text-rose-500">{val}%</span>,
      align: 'right' as const
    },
    {
      header: "Rejection Reason",
      accessorKey: "reason",
      cell: (val: string) => (
        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-md border border-rose-100">
          <ShieldAlert className="h-3 w-3" /> {val}
        </span>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GitMerge className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pipeline Performance</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Merge <span className="text-indigo-600">Analytics</span></h1>
          <p className="text-base text-slate-500 mt-1 font-medium italic">Tracing the lifecycle of AI code from draft to production deployment</p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase mb-8">Deployment Funnel</h3>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-4">
          {funnel.map((f, i) => (
            <div key={f.stage} className="flex flex-col lg:flex-row items-center gap-8 w-full group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex-1 w-full bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 text-center relative overflow-hidden active:scale-95 transition-transform"
              >
                <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 rounded-b-full shadow-lg transition-transform group-hover:scale-x-150 duration-500", f.color)} />
                <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white mb-4 shadow-xl", f.color)}>
                  {f.icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.stage}</p>
                <p className="text-4xl font-black font-metric text-slate-900 tracking-tighter">{formatNumber(f.value)}</p>
              </motion.div>

              {i < funnel.length - 1 && (
                <div className="flex flex-row lg:flex-col items-center gap-2 text-slate-400">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 border border-slate-200">
                    <ArrowRight className="h-5 w-5 lg:rotate-0 rotate-90" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded shadow-sm border border-indigo-100">
                    {i === 0 ? rate1 : rate2}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quality Benchmarking */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp className="h-32 w-32 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-white uppercase mb-8 relative z-10 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400" /> Quality Benchmark
          </h3>
          <div className="relative z-10">
            <EnhancedChart
              type="bar"
              data={comparisonData}
              index="name"
              categories={['rate']}
              colors={['#6366f1', '#475569']}
              valueFormatter={(v) => `${v}%`}
              height={250}
            />
          </div>
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative z-10">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-[0.2em] mb-2 text-center">Engine Performance Impact</p>
            <p className="text-sm text-slate-400 text-center leading-relaxed">
              AI-generated code exhibits a <span className="text-white font-bold">{Math.abs(orgData.aiMergeRate - mergeAnalytics.manualMergeRate).toFixed(1)}%</span> performance variance compared to manual crafts.
            </p>
          </div>
        </div>

        {/* Rejection Hotspots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" /> High-AI Rejection Hotspots
            </h3>
            <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold uppercase tracking-widest text-[10px]">Critical Review Required</Badge>
          </div>
          <DataTable data={mergeAnalytics.rejectedPRs} columns={rejectedColumns as any} className="shadow-premium" />
        </div>
      </div>
    </motion.div>
  );
}
