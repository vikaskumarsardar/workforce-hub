import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type StatCardChangeType = 'positive' | 'negative' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: StatCardChangeType;
  icon: React.ReactNode;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  subtitle,
}) => {
  return (
    <Card hoverEffect className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border',
              changeType === 'positive' && 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
              changeType === 'negative' && 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
              changeType === 'neutral' && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
            )}
          >
            {changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" aria-hidden="true" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>}
    </Card>
  );
};
