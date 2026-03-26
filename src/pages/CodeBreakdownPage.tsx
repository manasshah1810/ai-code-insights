import { useState } from "react";
import { teams, repositories, orgData, formatNumber } from "@/data/dashboard-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedChart } from "@/components/ui/EnhancedChart";
import { DataTable } from "@/components/ui/DataTable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { motion } from "framer-motion";
import { Code2, Database, Shield, Zap, Search, Filter, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function CodeBreakdownPage() {
  const [teamFilter, setTeamFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");

  const filteredRepos = repositories.filter(r => {
    if (teamFilter !== "all" && r.team !== teamFilter) return false;
    if (toolFilter !== "all") {
      if (toolFilter === "Cursor" && r.primaryTool !== "Cursor") return false;
      if (toolFilter === "Copilot" && r.primaryTool !== "Copilot") return false;
    }
    return true;
  });

  const teamChartData = teams.map(t => ({
    name: t.name.replace(" Engineering", " Eng.").replace(" Product", " Prod."),
    aiLoC: t.aiLoC,
    manualLoC: t.manualLoC,
  }));

  const pieData = [
    { name: "AI Code", value: orgData.aiLoC },
    { name: "Manual Code", value: orgData.manualLoC },
  ];

  const repoColumns = [
    {
      header: "Repository",
      accessorKey: "name",
      cell: (val: string) => (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-slate-400" />
          <span className="font-mono text-xs font-bold text-slate-900 px-2 py-1 bg-slate-50 rounded border border-slate-100">{val}</span>
        </div>
      )
    },
    {
      header: "Squad",
      accessorKey: "team",
      cell: (val: string) => <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{val}</span>
    },
    {
      header: "Total Output",
      accessorKey: "totalLoC",
      cell: (val: number) => <span className="font-bold font-metric text-slate-600">{formatNumber(val)} LoC</span>,
      align: 'right' as const
    },
    {
      header: "AI Contribution",
      accessorKey: "aiPercent",
      cell: (val: number) => (
        <div className="flex items-center justify-end gap-3">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${val}%` }} />
          </div>
          <span className="font-black font-metric text-indigo-600 text-right w-10">{val}%</span>
        </div>
      ),
      align: 'right' as const
    },
    {
      header: "Merge Quality",
      accessorKey: "mergeRate",
      cell: (val: number) => <span className="font-bold font-metric text-emerald-600">{val}%</span>,
      align: 'right' as const
    },
    {
      header: "Engine",
      accessorKey: "primaryTool",
      cell: (val: string) => (
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
          val === 'Cursor' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
        )}>
          {val}
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
            <Layers className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Analysis</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Code <span className="text-indigo-600">Breakdown</span></h1>
          <p className="text-base text-slate-500 mt-1 font-medium italic">Decomposing the origin of every line of code in the organization</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[200px] h-11 rounded-xl pl-9 font-bold bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Filter by Team" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="all" className="font-bold">All Engineering Squads</SelectItem>
                {teams.map(t => <SelectItem key={t.id} value={t.name} className="font-medium">{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Select value={toolFilter} onValueChange={setToolFilter}>
              <SelectTrigger className="w-[180px] h-11 rounded-xl pl-9 font-bold bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Filter by Engine" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="all" className="font-bold">All AI Engines</SelectItem>
                <SelectItem value="Cursor" className="font-medium">Cursor IDE</SelectItem>
                <SelectItem value="Copilot" className="font-medium">GitHub Copilot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Stack Chart */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">LoC Stack by Squad</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI LoC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual LoC</span>
              </div>
            </div>
          </div>
          <EnhancedChart
            type="bar"
            data={teamChartData}
            index="name"
            categories={['aiLoC', 'manualLoC']}
            colors={['#6366f1', '#cbd5e1']}
            valueFormatter={(v) => formatNumber(v as number)}
            height={320}
            xAxisLabel="Engineering Squads"
            yAxisLabel="Lines of Code (LoC)"
          />
        </div>

        {/* Global Split Card */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Shield className="h-32 w-32 text-indigo-400" />
          </div>
          <h3 className="text-lg font-black tracking-widest text-indigo-400 uppercase mb-8 relative z-10">Organization Hybrid Split</h3>

          <div className="relative h-48 w-48 mb-6 mt-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  <Cell fill="#6366f1" stroke="transparent" />
                  <Cell fill="#334155" stroke="transparent" />
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px', color: 'white' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-black text-white font-metric">{orgData.aiCodePercent}%</p>
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">AI Powered</p>
            </div>
          </div>

          <div className="space-y-4 w-full relative z-10">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI LoC</span>
              </div>
              <span className="text-sm font-black text-white font-metric">{formatNumber(orgData.aiLoC)}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual LoC</span>
              </div>
              <span className="text-sm font-black text-white font-metric">{formatNumber(orgData.manualLoC)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Breakdown Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Repository Inventory</h3>
            <Badge className="bg-slate-100 text-slate-500 border-slate-200 font-bold">{filteredRepos.length} REPOS</Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
            <Search className="h-3 w-3" /> Indexed Real-time
          </div>
        </div>
        <DataTable data={filteredRepos} columns={repoColumns as any} className="shadow-premium" />
      </div>
    </motion.div>
  );
}
