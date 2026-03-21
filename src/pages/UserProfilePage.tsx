import { useParams, useNavigate } from "react-router-dom";
import { users, formatNumber } from "@/data/dashboard-data";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, ToolBadge } from "@/components/StatusBadge";
import { GitCommit, Code2, GitMerge, Coins, FileCode, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = users.find(u => u.id === Number(userId));

  if (!user) return <p className="p-6 text-muted-foreground">User not found</p>;

  const pieData = [
    { name: "AI Code", value: user.aiLoC },
    { name: "Manual Code", value: user.manualLoC },
  ];

  const isIdle = user.status === "License Idle";

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => navigate(-1)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full gradient-ai flex items-center justify-center text-lg font-bold text-primary-foreground">
          {user.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <StatusBadge status={user.status} size="md" />
          </div>
          <p className="text-sm text-muted-foreground">{user.role} · {user.team}</p>
        </div>
        <ToolBadge tool={user.primaryTool} />
      </div>

      {isIdle ? (
        <div className="rounded-xl border-2 border-dashed border-warning/30 bg-warning/5 p-8 text-center">
          <p className="text-lg font-semibold text-warning mb-2">No AI Activity</p>
          <p className="text-sm text-muted-foreground mb-4">This developer hasn't used any AI coding tools yet.</p>
          <Button variant="outline" className="border-warning text-warning hover:bg-warning/10">Activate License</Button>
        </div>
      ) : null}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Commits" value={user.commits} icon={<GitCommit className="h-3.5 w-3.5 text-muted-foreground" />} />
        <KpiCard title="Total LoC" value={formatNumber(user.totalLoC)} icon={<Code2 className="h-3.5 w-3.5 text-muted-foreground" />} />
        <KpiCard title="AI Code %" value={`${user.aiPercent}%`} icon={<FileCode className="h-3.5 w-3.5 text-ai" />} gradient={user.aiPercent >= 50} />
        <KpiCard title="AI Merge Rate" value={`${user.aiMergeRate}%`} icon={<GitMerge className="h-3.5 w-3.5 text-success" />} />
        <KpiCard title="Tokens Used" value={formatNumber(user.tokensUsed)} icon={<Coins className="h-3.5 w-3.5 text-warning" />} />
        <KpiCard title="PR Merge Rate" value={`${user.prMergeRate}%`} icon={<CheckCircle className="h-3.5 w-3.5 text-success" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Donut */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">AI vs Manual Breakdown</h3>
          <div className="flex items-center justify-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  <Cell fill="hsl(245, 58%, 51%)" />
                  <Cell fill="hsl(215, 16%, 47%)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-ai" /><span>AI: {user.aiPercent}%</span></div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-manual" /><span>Manual: {(100 - user.aiPercent).toFixed(0)}%</span></div>
              {user.primaryTool.includes("Cursor") && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  <p className="text-muted-foreground">Fast tokens: {formatNumber(user.cursorFastTokens)}</p>
                  <p className="text-muted-foreground">Slow tokens: {formatNumber(user.cursorSlowTokens)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 30-day trend */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">30-Day AI % Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={user.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="aiPercent" stroke="hsl(245, 58%, 51%)" strokeWidth={2} dot={{ fill: "hsl(245, 58%, 51%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent PRs */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 border-b"><h3 className="text-sm font-semibold">Recent Pull Requests</h3></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Title</th>
              <th className="text-right p-3 font-medium text-muted-foreground text-xs">AI %</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Date</th>
            </tr>
          </thead>
          <tbody>
            {user.recentPRs.map((pr, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-3 text-xs font-medium">{pr.title}</td>
                <td className="p-3 text-right text-xs">{pr.aiPercent}%</td>
                <td className="p-3">
                  <Badge variant={pr.status === "Merged" ? "default" : pr.status === "Open" ? "secondary" : "destructive"} className="text-[10px]">
                    {pr.status}
                  </Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{pr.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
