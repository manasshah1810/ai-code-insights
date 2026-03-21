import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, CheckCircle, Clock, Zap } from 'lucide-react';

interface StatusBadgeProps {
    status: 'Power User' | 'Active' | 'License Idle' | 'Warning' | string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    className,
    size = 'md'
}) => {
    const getStyles = () => {
        switch (status) {
            case 'Power User':
                return {
                    bg: 'bg-indigo-100 text-indigo-700 ring-indigo-200 shadow-indigo-100/50',
                    icon: <Sparkles className="h-3 w-3" />,
                    label: 'Power User'
                };
            case 'Active':
                return {
                    bg: 'bg-emerald-100 text-emerald-700 ring-emerald-200 shadow-emerald-100/50',
                    icon: <CheckCircle className="h-3 w-3" />,
                    label: 'Active'
                };
            case 'License Idle':
            case 'Warning':
                return {
                    bg: 'bg-amber-100 text-amber-700 ring-amber-200 shadow-amber-100/50',
                    icon: <Clock className="h-3 w-3" />,
                    label: status
                };
            default:
                return {
                    bg: 'bg-slate-100 text-slate-700 ring-slate-200 shadow-slate-100/50',
                    icon: <Zap className="h-3 w-3" />,
                    label: status
                };
        }
    };

    const { bg, icon, label } = getStyles();

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px] gap-1',
        md: 'px-3 py-1 text-xs gap-1.5',
        lg: 'px-4 py-1.5 text-sm gap-2',
    };

    return (
        <span className={cn(
            "inline-flex items-center font-bold rounded-full ring-1 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-default",
            bg,
            sizeClasses[size],
            className
        )}>
            {icon}
            {label}
        </span>
    );
};
