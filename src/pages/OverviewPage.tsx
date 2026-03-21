import { KpiCard } from "@/components/KpiCard";
import { orgData, teams, users, weeklyTrend, formatNumber } from "@/data/dashboard-data";
import { Users, Zap, Code2, GitMerge, Coins, FileDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { exportToPdf } from "@/lib/export-pdf";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {formatNumber(p.value)} LoC
        </p>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  const navigate = useNavigate();
  const topUsers = users.filter(u => u.rank <= 3);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">TechCorp Inc. — AI Code Intelligence</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard title="Total Developers" value={orgData.totalDevelopers} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <KpiCard title="Active AI Users" value={`${orgData.activeAIUsers} / ${orgData.totalDevelopers}`} subtitle={`${orgData.aiAdoptionRate}% adoption`} icon={<Zap className="h-4 w-4 text-ai" />} trend={{ value: 12, label: "vs last month" }} />
        <KpiCard title="AI Code %" value={`${orgData.aiCodePercent}%`} icon={<Code2 className="h-4 w-4 text-ai" />} trend={{ value: 10.2, label: "vs last month" }} gradient />
        <KpiCard title="AI Merge Rate" value={`${orgData.aiMergeRate}%`} icon={<GitMerge className="h-4 w-4 text-success" />} trend={{ value: 5.1, label: "vs last month" }} />
        <KpiCard title="Total AI Tokens" value={formatNumber(orgData.totalTokens)} icon={<Coins className="h-4 w-4 text-warning" />} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">AI vs Manual Code — 4 Week Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(245, 58%, 51%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(245, 58%, 51%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="manualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(215, 16%, 47%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(215, 16%, 47%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" tickFormatter={(v) => formatNumber(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="aiLoC" name="AI LoC" stroke="hsl(245, 58%, 51%)" fill="url(#aiGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="manualLoC" name="Manual LoC" stroke="hsl(215, 16%, 47%)" fill="url(#manualGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Team Comparison */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Team AI Code %</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teams} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} stroke="hsl(215, 16%, 47%)" />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(214, 32%, 91%)' }} />
              <Bar dataKey="aiCodePercent" fill="hsl(245, 58%, 51%)" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Contributors */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {topUsers.map((user, idx) => (
              <button key={user.id} onClick={() => navigate(`/users/${user.id}`)} className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-accent transition-colors text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-ai text-xs font-bold text-primary-foreground">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.team}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold gradient-ai-text">{user.aiPercent}%</p>
                  <p className="text-[10px] text-muted-foreground">AI Code</p>
                </div>
                <StatusBadge status={user.status} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Copilot Accept Rate</p>
              <p className="text-xl font-bold">{orgData.copilotAcceptRate}%</p>
            </div>
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Cursor Completions</p>
              <p className="text-xl font-bold">{formatNumber(orgData.cursorCompletionsAccepted)}</p>
            </div>
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">PR Merge Rate</p>
              <p className="text-xl font-bold">~{orgData.prMergeRate}%</p>
            </div>
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Total LoC</p>
              <p className="text-xl font-bold">{formatNumber(orgData.totalLoC)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
