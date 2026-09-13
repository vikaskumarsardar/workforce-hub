import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo' | 'slate';
export type BadgeSize = 'sm' | 'md';

export const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
  indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
};

export const BADGE_SIZES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] font-semibold',
  md: 'px-2.5 py-1 text-xs font-semibold',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  variant = 'indigo',
  size = 'md',
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-mono',
        BADGE_VARIANTS[variant],
        BADGE_SIZES[size],
        className,
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" aria-hidden="true" />
      {children}
    </span>
  );
};
