import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { KEYBOARD_KEYS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PayslipItem, TAX_RATES } from '@/types/payroll';

export interface PayslipModalProps {
  payslip: PayslipItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PAYSLIP_MODAL_LABELS = {
  TITLE: 'Itemized Digital Payslip',
  DESCRIPTION: 'Official tax withholdings, deductions, and net compensation statement.',
} as const;

export const PayslipModal: React.FC<PayslipModalProps> = ({
  payslip,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const incomeTaxRatePercentage = TAX_RATES.INCOME_TAX * 100;
  const healthInsuranceRatePercentage = TAX_RATES.HEALTH_INSURANCE * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={PAYSLIP_MODAL_LABELS.TITLE}
      description={PAYSLIP_MODAL_LABELS.DESCRIPTION}
      maxWidth="lg"
    >
      <div className="space-y-6 mt-2">
        {/* Header Voucher Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-white text-sm">
              WP
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">WorkforcePulse Payroll System</h3>
              <p className="text-[11px] text-slate-400 font-mono">Period: {payslip.period}</p>
            </div>
          </div>
          <Badge variant="emerald" size="sm">
            {payslip.status}
          </Badge>
        </div>

        {/* Employee & Company Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
          <div className="space-y-1.5">
            <span className="text-slate-500 font-mono uppercase text-[10px] tracking-wider block">
              Employee Details
            </span>
            <div className="font-bold text-slate-100 text-sm">{payslip.employeeName}</div>
            <div className="text-slate-400 font-mono">{payslip.email}</div>
            <div className="text-indigo-300 font-medium">{payslip.position}</div>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="text-slate-500 font-mono uppercase text-[10px] tracking-wider block">
              Voucher Meta
            </span>
            <div className="text-slate-300 font-mono">ID: #{payslip.id}</div>
            <div className="text-slate-300 font-mono">Department: {payslip.department}</div>
            <div className="text-slate-400 font-mono">Payment Date: {formatDate(payslip.paymentDate)}</div>
          </div>
        </div>

        {/* Itemized Calculation Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Gross Earnings & Tax Withholdings
          </h4>

          <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
            {/* Earnings Header */}
            <div className="bg-slate-900/80 px-4 py-2.5 font-mono text-indigo-400 font-semibold border-b border-slate-800 flex items-center justify-between">
              <span>Earnings Category</span>
              <span>Amount ({payslip.currency})</span>
            </div>

            <div className="divide-y divide-slate-800/60 bg-slate-900/40">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-300">Base Salary</span>
                <span className="font-mono text-slate-100 font-medium">
                  {formatCurrency(payslip.grossSalary - payslip.bonus, payslip.currency)}
                </span>
              </div>
              {payslip.bonus > 0 && (
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-300">Performance Bonus</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    + {formatCurrency(payslip.bonus, payslip.currency)}
                  </span>
                </div>
              )}
              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-900/80 font-bold">
                <span className="text-slate-200 font-mono">Total Gross Earnings</span>
                <span className="font-mono text-slate-100">{formatCurrency(payslip.grossSalary, payslip.currency)}</span>
              </div>
            </div>

            {/* Deductions Header */}
            <div className="bg-slate-900/80 px-4 py-2.5 font-mono text-rose-400 font-semibold border-t border-b border-slate-800 flex items-center justify-between">
              <span>Statutory Deductions & Tax</span>
              <span>Amount ({payslip.currency})</span>
            </div>

            <div className="divide-y divide-slate-800/60 bg-slate-900/40">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-300">Income Tax ({incomeTaxRatePercentage}%)</span>
                <span className="font-mono text-rose-400 font-medium">
                  - {formatCurrency(payslip.incomeTax, payslip.currency)}
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-slate-300">Health Insurance ({healthInsuranceRatePercentage}%)</span>
                <span className="font-mono text-rose-400 font-medium">
                  - {formatCurrency(payslip.healthInsurance, payslip.currency)}
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-900/80 font-bold">
                <span className="text-slate-200 font-mono">Total Statutory Deductions</span>
                <span className="font-mono text-rose-400">- {formatCurrency(payslip.totalDeductions, payslip.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Payout Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider block">
              Net Take-Home Pay
            </span>
            <span className="text-xs text-slate-400">Direct Deposited to Bank Account</span>
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
            {formatCurrency(payslip.netPay, payslip.currency)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" aria-hidden="true" />}
            >
              Print Payslip
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
