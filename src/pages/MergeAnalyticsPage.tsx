import { mergeAnalytics, orgData, formatNumber } from "@/data/dashboard-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowDown } from "lucide-react";

export default function MergeAnalyticsPage() {
  const funnel = [
    { stage: "AI LoC Written", value: mergeAnalytics.aiLoCWritten },
    { stage: "AI LoC in PRs", value: mergeAnalytics.aiLoCInPRs },
    { stage: "AI LoC Merged", value: mergeAnalytics.aiLoCMerged },
  ];

  const rate1 = ((mergeAnalytics.aiLoCInPRs / mergeAnalytics.aiLoCWritten) * 100).toFixed(1);
  const rate2 = ((mergeAnalytics.aiLoCMerged / mergeAnalytics.aiLoCInPRs) * 100).toFixed(1);

  const comparisonData = [
    { name: "AI Merge Rate", rate: orgData.aiMergeRate },
    { name: "Manual Merge Rate", rate: mergeAnalytics.manualMergeRate },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Merge Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track how AI-generated code flows from writing to production</p>
      </div>

      {/* Funnel */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-6">AI Code Funnel</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
          {funnel.map((f, i) => (
            <div key={f.stage} className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center rounded-xl border-2 border-ai/20 bg-accent/50 p-5 min-w-[160px] animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <p className="text-xs text-muted-foreground mb-1">{f.stage}</p>
                <p className="text-2xl font-bold gradient-ai-text">{formatNumber(f.value)}</p>
              </div>
              {i < funnel.length - 1 && (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ArrowDown className="h-5 w-5 md:rotate-[-90deg]" />
                  <span className="text-[10px] font-medium">{i === 0 ? rate1 : rate2}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Overall: {formatNumber(mergeAnalytics.aiLoCWritten)} written → {formatNumber(mergeAnalytics.aiLoCMerged)} merged ({orgData.aiMergeRate}%)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Comparison */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">AI vs Manual Merge Rate</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={50}>
                <Cell fill="hsl(245, 58%, 51%)" />
                <Cell fill="hsl(215, 16%, 47%)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rejected PRs */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="text-sm font-semibold">Rejected High-AI PRs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">PR Title</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Author</th>
                  <th className="text-right p-3 font-medium text-muted-foreground text-xs">AI %</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Reason</th>
                </tr>
              </thead>
              <tbody>
                {mergeAnalytics.rejectedPRs.map((pr, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-xs font-medium">{pr.title}</td>
                    <td className="p-3 text-xs text-muted-foreground">{pr.author}</td>
                    <td className="p-3 text-right"><span className="text-xs font-medium text-destructive">{pr.aiPercent}%</span></td>
                    <td className="p-3 text-xs text-muted-foreground">{pr.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
