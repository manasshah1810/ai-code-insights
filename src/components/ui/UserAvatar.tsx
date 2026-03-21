import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    name: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, className, size = 'md' }) => {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const sizeClasses = {
        sm: 'h-8 w-8 text-[10px]',
        md: 'h-10 w-10 text-xs',
        lg: 'h-14 w-14 text-sm',
        xl: 'h-20 w-20 text-lg',
    };

    const ringClasses = {
        sm: 'ring-1',
        md: 'ring-2',
        lg: 'ring-2',
        xl: 'ring-4',
    };

    return (
        <div className={cn(
            "relative inline-flex items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-inner",
            "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
            sizeClasses[size],
            ringClasses[size],
            "ring-white/20",
            className
        )}>
            {initials}
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-black/5" />
        </div>
    );
};
