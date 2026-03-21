import { useState } from "react";
import { teams, repositories, orgData, formatNumber } from "@/data/dashboard-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = { ai: "hsl(245, 58%, 51%)", manual: "hsl(215, 16%, 47%)" };

export default function CodeBreakdownPage() {
  const [teamFilter, setTeamFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");

  const filteredRepos = repositories.filter(r => {
    if (teamFilter !== "all" && r.team !== teamFilter) return false;
    if (toolFilter === "Cursor" && r.primaryTool !== "Cursor") return false;
    if (toolFilter === "Copilot" && !r.primaryTool.includes("Copilot")) return false;
    return true;
  });

  const teamChartData = teams.map(t => ({
    name: t.name.replace(" Engineering", " Eng.").replace(" Product", " Prod."),
    "AI LoC": t.aiLoC,
    "Manual LoC": t.manualLoC,
  }));

  const pieData = [
    { name: "AI Code", value: orgData.aiLoC },
    { name: "Manual Code", value: orgData.manualLoC },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Code Breakdown</h1>
        <p className="text-sm text-muted-foreground mt-1">AI vs Manual code analysis across teams and repositories</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Team" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Tool" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tools</SelectItem>
            <SelectItem value="Cursor">Cursor</SelectItem>
            <SelectItem value="Copilot">GitHub Copilot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">AI vs Manual LoC by Team</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => formatNumber(v)} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(214, 32%, 91%)' }} formatter={(v: number) => formatNumber(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="AI LoC" stackId="a" fill={COLORS.ai} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Manual LoC" stackId="a" fill={COLORS.manual} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-4 self-start">Org-Wide Split</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                <Cell fill={COLORS.ai} />
                <Cell fill={COLORS.manual} />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => formatNumber(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ai" />AI ({orgData.aiCodePercent}%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-manual" />Manual ({(100 - orgData.aiCodePercent).toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Repository Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Repository Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Repository</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Team</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs">Total LoC</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs">AI %</th>
                <th className="text-right p-3 font-medium text-muted-foreground text-xs">Merge Rate</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Tool</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepos.map(r => (
                <tr key={r.name} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-mono text-xs font-medium">{r.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{r.team}</td>
                  <td className="p-3 text-right text-xs">{formatNumber(r.totalLoC)}</td>
                  <td className="p-3 text-right">
                    <span className="text-xs font-medium gradient-ai-text">{r.aiPercent}%</span>
                  </td>
                  <td className="p-3 text-right text-xs">{r.mergeRate}%</td>
                  <td className="p-3 text-xs">{r.primaryTool}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
