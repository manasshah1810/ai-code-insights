import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Power User" | "Active" | "License Idle";
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium",
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      status === "Power User" && "bg-ai/10 text-ai",
      status === "Active" && "bg-success/10 text-success",
      status === "License Idle" && "bg-warning/10 text-warning",
    )}>
      {status}
    </span>
  );
}

interface ToolBadgeProps {
  tool: string;
}

export function ToolBadge({ tool }: ToolBadgeProps) {
  if (tool === "None") return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
      tool.includes("Cursor") && "bg-ai/10 text-ai",
      tool === "GitHub Copilot" && "bg-foreground/5 text-foreground",
      tool === "Cursor + Copilot" && "bg-ai/10 text-ai",
    )}>
      {tool}
    </span>
  );
}
