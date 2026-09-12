import React, { useState, useMemo } from 'react';
import { Calendar, FileText, Palmtree } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import {
  LeaveCategory,
  LEAVE_CATEGORY,
  LEAVE_CATEGORY_LABELS,
  SubmitLeavePayload,
  MS_PER_DAY,
} from '@/types/leave';

export interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SubmitLeavePayload) => Promise<void> | void;
}

export const LEAVE_MODAL_MESSAGES = {
  TITLE: 'Apply for Leave',
  DESCRIPTION: 'Submit a new leave request into the automated approval pipeline.',
  ERROR_REQUIRED: 'Please fill in all required leave application fields.',
  ERROR_INVALID_DATES: 'End date must be on or after the start date.',
  ERROR_PAST_DATE: 'Start date cannot be in the past.',
  ERROR_SUBMIT_FAILED: 'Failed to submit leave request. Please try again.',
} as const;

export const INITIAL_LEAVE_FORM_STATE = {
  category: LEAVE_CATEGORY.VACATION as LeaveCategory,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + MS_PER_DAY * 4).toISOString().split('T')[0],
  reason: '',
};

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(INITIAL_LEAVE_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatedDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate).getTime();
    const end = new Date(formData.endDate).getTime();
    const isInvalidRange = isNaN(start) || isNaN(end) || end < start;
    if (isInvalidRange) return 0;
    const diffDays = Math.round((end - start) / MS_PER_DAY) + 1;
    return diffDays;
  }, [formData.startDate, formData.endDate]);

  const updateField = (field: keyof typeof INITIAL_LEAVE_FORM_STATE, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_LEAVE_FORM_STATE);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isMissingReason = !formData.reason.trim();
    const isInvalidDates = calculatedDays <= 0;

    if (isMissingReason) {
      setError(LEAVE_MODAL_MESSAGES.ERROR_REQUIRED);
      return;
    }

    if (isInvalidDates) {
      setError(LEAVE_MODAL_MESSAGES.ERROR_INVALID_DATES);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onSubmit({
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });
      resetForm();
      onClose();
    } catch {
      setError(LEAVE_MODAL_MESSAGES.ERROR_SUBMIT_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={LEAVE_MODAL_MESSAGES.TITLE}
      description={LEAVE_MODAL_MESSAGES.DESCRIPTION}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium"
          >
            {error}
          </div>
        )}

        {/* Category Selector */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Palmtree className="w-3.5 h-3.5 text-indigo-400" /> Leave Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(LEAVE_CATEGORY).map((cat) => {
              const isSelected = formData.category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => updateField('category', cat)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center justify-between',
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  )}
                >
                  <span>{LEAVE_CATEGORY_LABELS[cat]}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="End Date *"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Days Preview Counter */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">Calculated Business Days:</span>
          <span className="text-sm font-bold text-indigo-300 font-mono">{calculatedDays} Days</span>
        </div>

        {/* Reason Textarea */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="leave-reason" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" /> Reason / Notes *
          </label>
          <textarea
            id="leave-reason"
            rows={3}
            placeholder="Provide context or coverage arrangements for your leave..."
            value={formData.reason}
            onChange={(e) => updateField('reason', e.target.value)}
            required
            className="w-full bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 rounded-lg text-sm p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            Submit Leave Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
