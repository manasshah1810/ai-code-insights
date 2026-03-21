import { useState } from "react";
import { users, formatNumber } from "@/data/dashboard-data";
import { StatusBadge, ToolBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy } from "lucide-react";

const rankColors = ["bg-yellow-400/10 border-yellow-400/30", "bg-gray-300/10 border-gray-300/30", "bg-amber-600/10 border-amber-600/30"];
const rankEmoji = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [privacyMode, setPrivacyMode] = useState(false);
  const navigate = useNavigate();
  const sorted = [...users].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">AI coding champions ranked by adoption and impact</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="privacy" checked={privacyMode} onCheckedChange={setPrivacyMode} />
          <Label htmlFor="privacy" className="text-xs text-muted-foreground">Privacy Mode</Label>
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {sorted.slice(0, 3).map((user, i) => (
          <button key={user.id} onClick={() => navigate(`/users/${user.id}`)}
            className={`rounded-xl border-2 p-5 text-left hover:shadow-md transition-all ${rankColors[i]}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{rankEmoji[i]}</span>
              <div className="h-10 w-10 rounded-full gradient-ai flex items-center justify-center text-sm font-bold text-primary-foreground">
                {user.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{privacyMode ? `Dev #${user.rank}` : user.name}</p>
                <p className="text-xs text-muted-foreground">{user.team}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">AI Code:</span> <span className="font-semibold gradient-ai-text">{user.aiPercent}%</span></div>
              <div><span className="text-muted-foreground">Merge Rate:</span> <span className="font-semibold">{user.aiMergeRate}%</span></div>
              <div><span className="text-muted-foreground">Tokens:</span> <span className="font-medium">{formatNumber(user.tokensUsed)}</span></div>
              <div><StatusBadge status={user.status} /></div>
            </div>
          </button>
        ))}
      </div>

      {/* Full Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground text-xs w-12">#</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Developer</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Team</th>
              <th className="text-right p-3 font-medium text-muted-foreground text-xs">AI Code %</th>
              <th className="text-right p-3 font-medium text-muted-foreground text-xs">AI Merge Rate</th>
              <th className="text-right p-3 font-medium text-muted-foreground text-xs">Tokens</th>
              <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(user => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => navigate(`/users/${user.id}`)}>
                <td className="p-3 text-xs font-bold">{user.rank <= 3 ? rankEmoji[user.rank - 1] : user.rank}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full gradient-ai flex items-center justify-center text-[10px] font-bold text-primary-foreground">{user.avatar}</div>
                    <span className="text-xs font-medium">{privacyMode ? `Developer #${user.rank}` : user.name}</span>
                  </div>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{user.team}</td>
                <td className="p-3 text-right text-xs font-medium gradient-ai-text">{user.aiPercent}%</td>
                <td className="p-3 text-right text-xs">{user.aiMergeRate}%</td>
                <td className="p-3 text-right text-xs">{formatNumber(user.tokensUsed)}</td>
                <td className="p-3"><StatusBadge status={user.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
