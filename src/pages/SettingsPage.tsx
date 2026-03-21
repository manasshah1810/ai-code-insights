import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const repos = [
  { name: "api-gateway", platform: "GitHub", status: "Connected" },
  { name: "auth-service", platform: "GitHub", status: "Connected" },
  { name: "web-dashboard", platform: "GitHub", status: "Connected" },
  { name: "ml-pipeline", platform: "GitLab", status: "Connected" },
  { name: "data-ingestion", platform: "GitLab", status: "Connected" },
];

const roleUsers = [
  { name: "Admin User", email: "admin@techcorp.com", role: "Admin" },
  { name: "Sarah Manager", email: "sarah@techcorp.com", role: "Manager" },
  { name: "Jordan Lee", email: "jordan@techcorp.com", role: "Developer" },
  { name: "Alex Reyes", email: "alex@techcorp.com", role: "Developer" },
];

export default function SettingsPage() {
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [copilotEnabled, setCopilotEnabled] = useState(true);
  const [aiThreshold, setAiThreshold] = useState("50");
  const [mergeThreshold, setMergeThreshold] = useState("70");
  const [exportSchedule, setExportSchedule] = useState("weekly");

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure integrations, roles, and alert preferences</p>
      </div>

      {/* Repository Connections */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Repository Connections</h2>
        <div className="space-y-2">
          {repos.map(r => (
            <div key={r.name} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-medium">{r.name}</span>
                <Badge variant="outline" className="text-[10px]">{r.platform}</Badge>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-success/10 text-success border-0">{r.status}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* AI Tool Integrations */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">AI Tool Integrations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div><Label className="text-sm font-medium">Cursor</Label><p className="text-xs text-muted-foreground">AI-powered code editor</p></div>
            <Switch checked={cursorEnabled} onCheckedChange={setCursorEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label className="text-sm font-medium">GitHub Copilot</Label><p className="text-xs text-muted-foreground">AI pair programmer</p></div>
            <Switch checked={copilotEnabled} onCheckedChange={setCopilotEnabled} />
          </div>
        </div>
      </section>

      {/* User Role Management */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 border-b"><h2 className="text-sm font-semibold">User Role Management</h2></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Email</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground">Role</th>
          </tr></thead>
          <tbody>
            {roleUsers.map(u => (
              <tr key={u.email} className="border-b last:border-0">
                <td className="p-3 text-xs font-medium">{u.name}</td>
                <td className="p-3 text-xs text-muted-foreground">{u.email}</td>
                <td className="p-3"><Badge variant="outline" className="text-[10px]">{u.role}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Alert Thresholds */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Alert Thresholds</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">AI Code % Benchmark</Label>
            <Input type="number" value={aiThreshold} onChange={e => setAiThreshold(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Merge Rate Benchmark</Label>
            <Input type="number" value={mergeThreshold} onChange={e => setMergeThreshold(e.target.value)} className="h-8 text-sm" />
          </div>
        </div>
      </section>

      {/* Export Preferences */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Export Preferences</h2>
        <div className="flex items-center gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Automated Report Schedule</Label>
            <Select value={exportSchedule} onValueChange={setExportSchedule}>
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="mt-5">Save Preferences</Button>
        </div>
      </section>
    </div>
  );
}
