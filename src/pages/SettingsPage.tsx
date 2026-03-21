import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { attributionEngine } from "@/lib/attribution-engine";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { FileDown } from "lucide-react";

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
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434/api/generate");
  const [ollamaModel, setOllamaModel] = useState("deepseek-coder");
  const [testingConnection, setTestingConnection] = useState(false);
  const { strictPrivacyMode, setStrictPrivacyMode, userOptInList, toggleUserOptIn, monthlySeatCost, manualHourlyRate, setFiscalConfig } = useAppStore();

  const testOllama = async () => {
    setTestingConnection(true);
    try {
      const result = await attributionEngine.attributeSnippet("const x = 1;");
      if (result.confidence > 0) {
        toast.success("Ollama connection successful!");
      } else {
        toast.error("Ollama connection failed or returned no result.");
      }
    } catch (e) {
      toast.error("Ollama connection failed.");
    } finally {
      setTestingConnection(false);
    }
  };

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

      {/* Attribution Engine (Local Ollama) - Refactored as per Section 8.1 */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Attribution Engine (Section 8.1)</h2>
          <Badge variant="outline" className="text-[10px] bg-ai/5 text-ai border-ai/20">Local Inference Mode</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Ollama API Endpoint</Label>
            <Input
              value={ollamaUrl}
              onChange={e => setOllamaUrl(e.target.value)}
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Local Model</Label>
            <Select value={ollamaModel} onValueChange={setOllamaModel}>
              <SelectTrigger className="h-8 text-xs font-mono"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="deepseek-coder">deepseek-coder</SelectItem>
                <SelectItem value="llama3">llama3</SelectItem>
                <SelectItem value="codellama">codellama</SelectItem>
                <SelectItem value="qwen2.5-coder">qwen2.5-coder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testOllama}
            disabled={testingConnection}
          >
            {testingConnection ? "Testing..." : "Test Local Connection"}
          </Button>
          <Button size="sm" onClick={() => {
            attributionEngine.updateConfig(ollamaUrl, ollamaModel);
            toast.success("Ollama settings saved.");
          }}>Save Engine Config</Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Replaces external OpenAI/Anthropic APIs with local inference to ensure data privacy and reduce latency.
        </p>
      </section>

      {/* VCS Integration: Webhook & Heuristics - Section 8.3 Replacement */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">VCS Webhook Integration (Section 8.3)</h2>
          <Badge variant="outline" className="text-[10px] bg-success/5 text-success border-success/20">Operational</Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div><Label className="text-sm font-medium">Git Metadata Heuristic Engine</Label><p className="text-xs text-muted-foreground">Automatic analysis of push events for AI signatures.</p></div>
            <Switch checked={true} disabled />
          </div>
          <div className="flex items-center justify-between">
            <div><Label className="text-sm font-medium">Velocity Threshold Blocking</Label><p className="text-xs text-muted-foreground">Flag high-volume commits (&gt;500 LoC) with generic messages.</p></div>
            <Switch checked={true} disabled />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const { vcsWebhookHandler } = await import("@/lib/vcs-webhook-handler");
              vcsWebhookHandler.onPushEvent({
                id: "test-push",
                message: "update codebase",
                stats: { additions: 650 },
                diff: "Modified some files..."
              });
            }}
          >
            Simulate Webhook Push
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("VCS Webhook URL: http://localhost:5173/api/hooks/git-vcs")}>View Webhook URL</Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Replaces 'Local Log Ingestion Agent' for enhanced security and zero-overhead performance.
        </p>
      </section>

      {/* Issue Tracker Integration: Productivity Correlation Layer */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Issue Tracker Integration (Jira / Linear)</h2>
          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Productivity Layer</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Jira Cloud</h3>
            <div className="space-y-2">
              <Label className="text-[10px]">Site Host</Label>
              <Input placeholder="company.atlassian.net" className="h-7 text-xs" />
              <Label className="text-[10px]">API Token</Label>
              <Input type="password" placeholder="••••••••" className="h-7 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs h-8">Connect Jira</Button>
          </div>
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Linear</h3>
            <div className="space-y-2">
              <Label className="text-[10px]">API Key</Label>
              <Input type="password" placeholder="lin_api_••••" className="h-7 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs h-8 mt-11">Connect Linear</Button>
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div><Label className="text-sm font-medium">Cycle Time Mapping</Label><p className="text-xs text-muted-foreground">Match commits to tickets via Regex patterns (PROJ-123).</p></div>
            <Switch checked={true} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Calculates velocity boost by comparing AI vs Manual cycle times across integrated platforms.
        </p>
      </section>

      {/* Privacy & Compliance Toggle - User IDs and Dashboard Restrictions */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Privacy & Compliance</h2>
            <Badge variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/20">GDPR Compliance</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Strict Privacy Mode</Label>
            <Switch checked={strictPrivacyMode} onCheckedChange={setStrictPrivacyMode} />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-4">
            When enabled, User IDs are anonymized using salted SHA-256 hashes.
            Individual dashboards are restricted, and Leaderboard access requires explicit Opt-In.
          </p>

          <h3 className="text-[10px] font-bold uppercase text-muted-foreground mt-4">Developer Leaderboard Permissions (Opt-In)</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {roleUsers.filter(u => u.role === "Developer").map(u => {
              const id = u.email.split("@")[0].length; // Dummy ID for mock
              return (
                <div key={u.email} className="flex items-center justify-between py-1 border-b last:border-0 border-muted">
                  <span className="text-xs">{u.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{userOptInList[id] ? "Opted-In" : "Opted-Out"}</span>
                    <Switch checked={userOptInList[id] || false} onCheckedChange={() => toggleUserOptIn(id)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Turning on Strict mode will hide the individual performance views from non-admin users.
        </p>
      </section>

      {/* Fiscal ROI & Cost Analysis: Board-Level PDF Integration */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Fiscal ROI Configuration</h2>
            <Badge variant="outline" className="text-[10px] bg-success/5 text-success border-success/20">Board Reporting</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Operational Costs (Manual)</h3>
            <div className="space-y-2">
              <Label className="text-[10px]">Manual Hourly Rate ($/hr)</Label>
              <Input
                type="number"
                value={manualHourlyRate}
                onChange={(e) => setFiscalConfig({ manualHourlyRate: Number(e.target.value) })}
                className="h-7 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Used to calculate savings based on "Time Saved".</p>
            </div>
          </div>
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">AI Tool Costs (Monthly)</h3>
            <div className="space-y-2">
              <Label className="text-[10px]">Monthly Seat Cost ($)</Label>
              <Input
                type="number"
                value={monthlySeatCost}
                onChange={(e) => setFiscalConfig({ monthlySeatCost: Number(e.target.value) })}
                className="h-7 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Investment cost for AI tools (Copilot, Cursor, etc).</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <Button size="sm" variant="outline" className="w-full text-xs h-8 border-dashed flex items-center gap-2 group">
            <FileDown className="h-3.5 w-3.5 group-hover:animate-bounce" />
            Download Board-Level ROI Report (PDF)
          </Button>
          <p className="text-[10px] text-muted-foreground text-center italic">Includes charts for Cost-per-LoC and overall Fiscal Savings.</p>
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
