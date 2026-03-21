import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Download } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

export function TopBar() {
  const { currentRole, setRole, lastUpdated, refreshTimestamp } = useAppStore();

  useEffect(() => {
    const interval = setInterval(refreshTimestamp, 300000);
    return () => clearInterval(interval);
  }, [refreshTimestamp]);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-success/30 text-success">Live</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ai" />
        </Button>
        <Select value={currentRole} onValueChange={(v) => setRole(v as any)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Developer">Developer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
