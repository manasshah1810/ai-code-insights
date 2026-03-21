import { teams, users, formatNumber } from "@/data/dashboard-data";
import { useNavigate, useParams } from "react-router-dom";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, ToolBadge } from "@/components/StatusBadge";
import { Users as UsersIcon, Zap, GitMerge, Trophy, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { exportToPdf } from "@/lib/export-pdf";

export default function TeamsPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  if (teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return <p>Team not found</p>;
    const teamMembers = users.filter(u => u.teamId === teamId);
    const topPerformer = teamMembers.reduce((a, b) => a.aiPercent > b.aiPercent ? a : b);

    const exportCSV = () => {
      const csv = Papa.unparse(teamMembers.map(u => ({
        Name: u.name, Role: u.role, "AI Code %": u.aiPercent, "AI Merge Rate": u.aiMergeRate,
        Commits: u.commits, "Tokens Used": u.tokensUsed, Tool: u.primaryTool, Status: u.status,
      })));
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${teamId}-team.csv`; a.click();
    };

    return (
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/teams")} className="text-xs text-muted-foreground hover:text-foreground mb-1 block">← All Teams</button>
            <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm">Export CSV</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard title="Team Size" value={team.headCount} icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />} />
          <KpiCard title="AI Adoption" value={`${Math.round((team.aiUsers / team.headCount) * 100)}%`} icon={<Zap className="h-4 w-4 text-ai" />} />
          <KpiCard title="AI Merge Rate" value={`${team.aiMergeRate}%`} icon={<GitMerge className="h-4 w-4 text-success" />} />
          <KpiCard title="Top Performer" value={topPerformer.name} icon={<Trophy className="h-4 w-4 text-warning" />} />
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Developer", "AI Code %", "AI Merge Rate", "Commits", "Tokens Used", "Tool", "Status"].map(h => (
                  <th key={h} className="text-left p-3 font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => navigate(`/users/${u.id}`)}>
                  <td className="p-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full gradient-ai flex items-center justify-center text-[10px] font-bold text-primary-foreground">{u.avatar}</div><span className="text-xs font-medium">{u.name}</span></div></td>
                  <td className="p-3 text-xs font-medium gradient-ai-text">{u.aiPercent}%</td>
                  <td className="p-3 text-xs">{u.aiMergeRate}%</td>
                  <td className="p-3 text-xs">{u.commits}</td>
                  <td className="p-3 text-xs">{formatNumber(u.tokensUsed)}</td>
                  <td className="p-3"><ToolBadge tool={u.primaryTool} /></td>
                  <td className="p-3"><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground mt-1">Team-level AI adoption and performance metrics</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {teams.map(team => (
          <button key={team.id} onClick={() => navigate(`/teams/${team.id}`)} className="rounded-xl border bg-card p-5 text-left hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold group-hover:text-ai transition-colors">{team.name}</h3>
              <span className="text-xs text-muted-foreground">{team.headCount} members</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">AI Code %</span>
                <span className="font-semibold gradient-ai-text">{team.aiCodePercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full gradient-ai" style={{ width: `${team.aiCodePercent}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">AI Merge Rate</span>
                <span className="font-medium">{team.aiMergeRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Primary Tool</span>
                <ToolBadge tool={team.primaryTool} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
