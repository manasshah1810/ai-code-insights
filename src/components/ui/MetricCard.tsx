import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: React.ReactNode;
    gradient?: 'ai' | 'manual' | 'success' | 'warning' | 'none';
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    suffix = '',
    prefix = '',
    decimals = 1,
    subtitle,
    trend,
    icon,
    gradient = 'none',
    className,
}) => {
    const getGradientClass = () => {
        switch (gradient) {
            case 'ai': return 'bg-[var(--ai-primary)] text-slate-900 border-transparent';
            case 'manual': return 'bg-[var(--manual-primary)] text-slate-900 border-transparent';
            case 'success': return 'bg-[var(--success-gradient)] text-slate-900 border-transparent';
            case 'warning': return 'bg-[var(--warning-gradient)] text-slate-900 border-transparent';
            default: return 'bg-white text-slate-900 border-slate-200';
        }
    };

    const getGlowClass = () => {
        switch (gradient) {
            case 'ai': return 'bg-indigo-500/20';
            case 'manual': return 'bg-slate-500/20';
            case 'success': return 'bg-emerald-500/20';
            case 'warning': return 'bg-amber-500/20';
            default: return 'bg-slate-100';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
                "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 group",
                getGradientClass(),
                gradient === 'none' ? 'hover:shadow-xl' : 'shadow-lg',
                className
            )}
        >
            {/* Background Glow */}
            <div className={cn(
                "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-50",
                getGlowClass()
            )} />

            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110",
                        gradient === 'none' ? 'bg-slate-50 text-slate-700' : 'bg-white/80 text-slate-700'
                    )}>
                        {icon}
                    </div>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                            trend.isPositive
                                ? (gradient === 'none' ? 'bg-emerald-50 text-emerald-600' : 'bg-white/30 text-slate-900')
                                : (gradient === 'none' ? 'bg-rose-50 text-rose-600' : 'bg-white/30 text-slate-900')
                        )}>
                            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trend.isPositive ? '+' : ''}{parseFloat(trend.value.toFixed(2))}%
                        </div>
                    )}
                </div>

                <div className="mt-5">
                    <h3 className={cn(
                        "text-sm font-semibold uppercase tracking-wider",
                        gradient === 'none' ? 'text-slate-500' : 'text-slate-800'
                    )}>
                        {title}
                    </h3>

                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight font-metric">
                            {prefix}
                            <CountUp end={value} decimals={decimals} duration={2} separator="," />
                            {suffix}
                        </span>
                    </div>

                    {subtitle && (
                        <p className={cn(
                            "mt-2 text-sm",
                            gradient === 'none' ? 'text-slate-500 italic' : 'text-white/60 italic'
                        )}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Hover Arrow */}
                <div className={cn(
                    "absolute bottom-4 right-4 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
                    gradient === 'none' ? 'text-slate-300' : 'text-white/40'
                )}>
                    <ArrowUpRight className="h-5 w-5" />
                </div>
            </div>
        </motion.div>
    );
};
