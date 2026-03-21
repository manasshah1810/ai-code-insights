import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function KpiCard({ title, value, subtitle, trend, icon, className, gradient }: KpiCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4 md:p-5 transition-shadow hover:shadow-md",
      gradient ? "gradient-ai text-primary-foreground border-transparent" : "bg-card border-border",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-xs font-medium", gradient ? "text-primary-foreground/70" : "text-muted-foreground")}>{title}</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight animate-count">{value}</p>
          {subtitle && (
            <p className={cn("text-xs", gradient ? "text-primary-foreground/60" : "text-muted-foreground")}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-lg p-2", gradient ? "bg-white/15" : "bg-accent")}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          {trend.value >= 0 ? (
            <TrendingUp className="h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-success" : "text-destructive")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className={cn("text-xs", gradient ? "text-primary-foreground/50" : "text-muted-foreground")}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
