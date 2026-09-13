import React from 'react';
import { Palmtree, Stethoscope, Heart, ShieldAlert } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  LeaveBalance,
  LEAVE_CATEGORY,
  LEAVE_CATEGORY_LABELS,
} from '@/types/leave';

export interface LeaveBalanceMeterProps {
  balances: LeaveBalance[];
}

export const CATEGORY_ICONS = {
  [LEAVE_CATEGORY.VACATION]: Palmtree,
  [LEAVE_CATEGORY.SICK]: Stethoscope,
  [LEAVE_CATEGORY.PARENTAL]: Heart,
  [LEAVE_CATEGORY.BEREAVEMENT]: ShieldAlert,
};

export const CATEGORY_COLOR_VARIANTS = {
  [LEAVE_CATEGORY.VACATION]: {
    bar: 'bg-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  [LEAVE_CATEGORY.SICK]: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  [LEAVE_CATEGORY.PARENTAL]: {
    bar: 'bg-purple-500',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  [LEAVE_CATEGORY.BEREAVEMENT]: {
    bar: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
};

export const LeaveBalanceMeter: React.FC<LeaveBalanceMeterProps> = ({
  balances,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {balances.map((item) => {
        const IconComponent = CATEGORY_ICONS[item.category] || Palmtree;
        const colorConfig = CATEGORY_COLOR_VARIANTS[item.category] || CATEGORY_COLOR_VARIANTS[LEAVE_CATEGORY.VACATION];
        
        const remainingDays = item.allocatedDays - item.usedDays;
        const usagePercentage = Math.min(
          100,
          Math.round((item.usedDays / (item.allocatedDays || 1)) * 100)
        );

        const isHighUsage = usagePercentage >= 80;
        const isNearQuota = usagePercentage >= 60 && usagePercentage < 80;

        return (
          <Card key={item.category} hoverEffect className="relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight font-mono uppercase">
                {LEAVE_CATEGORY_LABELS[item.category]}
              </span>
              <div className={cn('p-2 rounded-xl border', colorConfig.badge)}>
                <IconComponent className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                  {remainingDays}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono ml-1.5">
                  / {item.allocatedDays} Days Remaining
                </span>
              </div>
              <span
                className={cn(
                  'text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border',
                  isHighUsage && 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
                  isNearQuota && 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
                  !isHighUsage && !isNearQuota && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                )}
              >
                {usagePercentage}% Used
              </span>
            </div>

            {/* Progress Bar */}
            <div
              role="progressbar"
              aria-valuenow={usagePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${LEAVE_CATEGORY_LABELS[item.category]} balance meter: ${remainingDays} days remaining out of ${item.allocatedDays}`}
              className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden"
            >
              <div
                className={cn('h-full transition-all duration-300 rounded-full', colorConfig.bar)}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Used: {item.usedDays}d</span>
              <span>Pending: {item.pendingDays}d</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
