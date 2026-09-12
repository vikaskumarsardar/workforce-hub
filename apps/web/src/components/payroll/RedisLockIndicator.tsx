import { Lock, Unlock, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';
import { REDIS_LOCK_STATUS, RedisLockStatus } from '@/types/payroll';

export interface RedisLockIndicatorProps {
  status: RedisLockStatus;
  period: string;
  tenantId?: string;
  ttlSeconds?: number;
}

export const RedisLockIndicator: React.FC<RedisLockIndicatorProps> = ({
  status,
  period,
  tenantId = 'global-corp',
  ttlSeconds = 30,
}) => {
  const isLockAcquired = status === REDIS_LOCK_STATUS.ACQUIRED;
  const lockKey = `lock:payroll:${tenantId}:${period}`;

  return (
    <div
      aria-label={`Distributed Redis Concurrency Lock status for ${lockKey}`}
      className={cn(
        'p-3.5 rounded-xl border font-mono text-xs transition-all flex items-center justify-between',
        isLockAcquired
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md shadow-amber-500/5'
          : 'bg-slate-900/90 border-slate-800 text-slate-400'
      )}
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            'p-2 rounded-lg border',
            isLockAcquired
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-500'
          )}
        >
          {isLockAcquired ? (
            <Lock className="w-4 h-4 animate-pulse" aria-hidden="true" />
          ) : (
            <Unlock className="w-4 h-4" aria-hidden="true" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-200">
              Redis Distributed Lock
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border',
                isLockAcquired
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              )}
            >
              {isLockAcquired ? 'LOCKED (ACTIVE)' : 'RELEASED (IDLE)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
            Key: <code className="text-indigo-300">{lockKey}</code>
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-2 text-right">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-500 uppercase">Engine Protection</span>
          <span className="text-xs font-semibold text-slate-300 flex items-center justify-end gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> TTL: {isLockAcquired ? `${ttlSeconds}s` : '0s'}
          </span>
        </div>
      </div>
    </div>
  );
};
