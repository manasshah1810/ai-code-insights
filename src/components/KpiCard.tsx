import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion, useInView } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: ReactNode;
  className?: string;
  gradient?: boolean;
}

function AnimatedValue({ value }: { value: string | number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const str = String(value);
    // Extract the numeric part for animation
    const match = str.match(/^([\d,.]+)/);
    if (!match) { setDisplay(str); return; }
    const numStr = match[1].replace(/,/g, "");
    const target = parseFloat(numStr);
    if (isNaN(target)) { setDisplay(str); return; }
    const suffix = str.slice(match[0].length); // e.g. "%", "K", "M", " / 6"
    const hasDecimal = numStr.includes(".");
    const decimals = hasDecimal ? (numStr.split(".")[1]?.length || 1) : 0;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = eased * target;
      setDisplay(current.toFixed(decimals) + suffix);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return <span ref={ref}>{display}</span>;
}

export function KpiCard({ title, value, subtitle, trend, icon, className, gradient }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-xl border p-4 md:p-5 transition-shadow hover:shadow-md",
        gradient ? "gradient-ai text-primary-foreground border-transparent" : "bg-card border-border",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-xs font-medium", gradient ? "text-primary-foreground/70" : "text-muted-foreground")}>{title}</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight">
            <AnimatedValue value={value} />
          </p>
          {subtitle && (
            <p className={cn("text-xs", gradient ? "text-primary-foreground/60" : "text-muted-foreground")}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-lg p-2 text-slate-700", gradient ? "bg-white/80" : "bg-accent")}> 
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
    </motion.div>
  );
}
