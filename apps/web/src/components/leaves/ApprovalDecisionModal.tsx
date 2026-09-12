import React, { useState } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Lock, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { ApprovalDecisionPayload, LeaveRequest, LEAVE_STATUS } from '@/types/leave';

export interface ApprovalDecisionModalProps {
  request: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ApprovalDecisionPayload) => Promise<void> | void;
}

export const DECISION_CONFIG = {
  APPROVE: {
    label: 'Approve Request',
    icon: CheckCircle2,
    buttonVariant: 'primary' as const,
    colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  VERIFY: {
    label: 'Verify HR Compliance',
    icon: ShieldCheck,
    buttonVariant: 'primary' as const,
    colorClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  },
  LOCK: {
    label: 'Lock Payroll Period',
    icon: Lock,
    buttonVariant: 'primary' as const,
    colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  },
  REJECT: {
    label: 'Reject Request',
    icon: XCircle,
    buttonVariant: 'danger' as const,
    colorClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  },
};

export const ApprovalDecisionModal: React.FC<ApprovalDecisionModalProps> = ({
  request,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [comment, setComment] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<'APPROVE' | 'REJECT' | 'VERIFY' | 'LOCK'>('APPROVE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const isSubmittedState = request.status === LEAVE_STATUS.SUBMITTED;
  const isApprovedState = request.status === LEAVE_STATUS.MANAGER_APPROVED;
  const isVerifiedState = request.status === LEAVE_STATUS.HR_VERIFIED;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit({
        requestId: request.id,
        decision: selectedDecision,
        comment: comment.trim() || undefined,
      });
      setComment('');
      onClose();
    } catch {
      setError('Failed to record approval decision. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workflow Action & Decision"
      description={`Reviewing request #${request.id} for ${request.employeeName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {error && (
          <div role="alert" className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Employee:</span>
            <span className="font-semibold text-slate-100">{request.employeeName} ({request.department})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Duration:</span>
            <span className="font-mono text-indigo-300">{request.startDate} to {request.endDate} ({request.totalDays} Days)</span>
          </div>
          <div className="text-xs pt-1 border-t border-slate-800/60">
            <span className="text-slate-400 font-mono">Reason: </span>
            <span className="text-slate-300 italic">{request.reason}</span>
          </div>
        </div>

        {/* Decision Action Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Select Decision Action *</label>
          <div className="grid grid-cols-1 gap-2">
            {isSubmittedState && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedDecision('APPROVE')}
                  className={cn(
                    'p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all',
                    selectedDecision === 'APPROVE'
                      ? DECISION_CONFIG.APPROVE.colorClass
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Manager Approve
                  </span>
                  {selectedDecision === 'APPROVE' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDecision('REJECT')}
                  className={cn(
                    'p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all',
                    selectedDecision === 'REJECT'
                      ? DECISION_CONFIG.REJECT.colorClass
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject Request
                  </span>
                  {selectedDecision === 'REJECT' && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                </button>
              </>
            )}

            {isApprovedState && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedDecision('VERIFY')}
                  className={cn(
                    'p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all',
                    selectedDecision === 'VERIFY'
                      ? DECISION_CONFIG.VERIFY.colorClass
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> HR Verify Compliance
                  </span>
                  {selectedDecision === 'VERIFY' && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDecision('REJECT')}
                  className={cn(
                    'p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all',
                    selectedDecision === 'REJECT'
                      ? DECISION_CONFIG.REJECT.colorClass
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject Request
                  </span>
                  {selectedDecision === 'REJECT' && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                </button>
              </>
            )}

            {isVerifiedState && (
              <button
                type="button"
                onClick={() => setSelectedDecision('LOCK')}
                className={cn(
                  'p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all',
                  selectedDecision === 'LOCK'
                    ? DECISION_CONFIG.LOCK.colorClass
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                )}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Lock for Payroll Processing
                </span>
                {selectedDecision === 'LOCK' && <span className="w-2 h-2 rounded-full bg-purple-400" />}
              </button>
            )}
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="decision-comment" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Decision Comment (Optional)
          </label>
          <textarea
            id="decision-comment"
            rows={2}
            placeholder="Add reviewer notes or conditions..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-lg text-sm p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={selectedDecision === 'REJECT' ? 'danger' : 'primary'}
            size="md"
            isLoading={isLoading}
          >
            Confirm Decision
          </Button>
        </div>
      </form>
    </Modal>
  );
};
