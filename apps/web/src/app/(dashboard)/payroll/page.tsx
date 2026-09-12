'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Play,
  FileText,
  CheckCircle2,
} from 'lucide-react';

import { PayslipModal } from '@/components/payroll/PayslipModal';
import { RedisLockIndicator } from '@/components/payroll/RedisLockIndicator';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils';
import {
  DEFAULT_CURRENCY,
  DEFAULT_PAYROLL_PERIOD,
  PAYROLL_STATUS,
  PayrollRunSummary,
  PayrollStatus,
  PayslipItem,
  REDIS_LOCK_STATUS,
  RedisLockStatus,
} from '@/types/payroll';

export const PAYROLL_PERIODS = ['2026-09', '2026-10', '2026-11', '2026-12'];

export const INITIAL_PAYSLIPS: PayslipItem[] = [
  {
    id: 'ps-901',
    tenantId: 'global-corp',
    employeeId: 'emp-101',
    employeeName: 'Sarah Jenkins',
    email: 'sarah.jenkins@workforce.io',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    period: '2026-09',
    grossSalary: 12083,
    bonus: 1000,
    incomeTax: 2616.6,
    healthInsurance: 654.15,
    totalDeductions: 3270.75,
    netPay: 9812.25,
    currency: 'USD',
    paymentDate: '2026-09-30',
    status: 'PAID',
  },
  {
    id: 'ps-902',
    tenantId: 'global-corp',
    employeeId: 'emp-102',
    employeeName: 'Michael Chang',
    email: 'michael.chang@workforce.io',
    department: 'Engineering',
    position: 'Frontend Lead',
    period: '2026-09',
    grossSalary: 11250,
    bonus: 500,
    incomeTax: 2350,
    healthInsurance: 587.5,
    totalDeductions: 2937.5,
    netPay: 8812.5,
    currency: 'USD',
    paymentDate: '2026-09-30',
    status: 'PAID',
  },
  {
    id: 'ps-903',
    tenantId: 'global-corp',
    employeeId: 'emp-103',
    employeeName: 'Elena Rostova',
    email: 'elena.rostova@workforce.io',
    department: 'Human Resources',
    position: 'HR Operations Lead',
    period: '2026-09',
    grossSalary: 9583,
    bonus: 0,
    incomeTax: 1916.6,
    healthInsurance: 479.15,
    totalDeductions: 2395.75,
    netPay: 7187.25,
    currency: 'USD',
    paymentDate: '2026-09-30',
    status: 'PAID',
  },
  {
    id: 'ps-904',
    tenantId: 'global-corp',
    employeeId: 'emp-104',
    employeeName: 'David Kowalski',
    email: 'david.k@workforce.io',
    department: 'Finance & Accounting',
    position: 'Senior Financial Analyst',
    period: '2026-09',
    grossSalary: 10416,
    bonus: 800,
    incomeTax: 2243.2,
    healthInsurance: 560.8,
    totalDeductions: 2804,
    netPay: 8412,
    currency: 'USD',
    paymentDate: '2026-09-30',
    status: 'PAID',
  },
];

export default function PayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(DEFAULT_PAYROLL_PERIOD);
  const [payslips] = useState<PayslipItem[]>(INITIAL_PAYSLIPS);
  const [payrollStatus, setPayrollStatus] = useState<PayrollStatus>(PAYROLL_STATUS.IDLE);
  const [redisLockStatus, setRedisLockStatus] = useState<RedisLockStatus>(REDIS_LOCK_STATUS.RELEASED);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipItem | null>(null);

  // Aggregated Summary Calculations
  const summary: PayrollRunSummary = useMemo(() => {
    const totalEmployees = payslips.length;
    const totalGrossSpend = payslips.reduce((acc, p) => acc + p.grossSalary, 0);
    const totalIncomeTax = payslips.reduce((acc, p) => acc + p.incomeTax, 0);
    const totalHealthInsurance = payslips.reduce((acc, p) => acc + p.healthInsurance, 0);
    const totalNetPayout = payslips.reduce((acc, p) => acc + p.netPay, 0);

    return {
      period: selectedPeriod,
      totalEmployees,
      totalGrossSpend,
      totalIncomeTax,
      totalHealthInsurance,
      totalNetPayout,
      currency: DEFAULT_CURRENCY,
    };
  }, [payslips, selectedPeriod]);

  // Execute Monthly Payroll Action
  const handleExecutePayroll = async () => {
    const isAlreadyRunning = payrollStatus === PAYROLL_STATUS.PROCESSING;
    if (isAlreadyRunning) return;

    setPayrollStatus(PAYROLL_STATUS.PROCESSING);
    setRedisLockStatus(REDIS_LOCK_STATUS.ACQUIRED);

    // Simulate async Redis lock acquire -> calculate tax withholdings -> release lock
    setTimeout(() => {
      setPayrollStatus(PAYROLL_STATUS.COMPLETED);
      setRedisLockStatus(REDIS_LOCK_STATUS.RELEASED);
    }, 2500);
  };

  const isProcessing = payrollStatus === PAYROLL_STATUS.PROCESSING;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Automated Monthly Payroll Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gross-to-Net tax calculation engine with Redis distributed lock concurrency protection.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            aria-label="Select payroll execution period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-100 rounded-lg text-xs font-mono px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
          >
            {PAYROLL_PERIODS.map((period) => (
              <option key={period} value={period}>
                Period: {period}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="md"
            onClick={handleExecutePayroll}
            isLoading={isProcessing}
            leftIcon={<Play className="w-4 h-4 fill-current" aria-hidden="true" />}
          >
            Run Payroll
          </Button>
        </div>
      </div>

      {/* Distributed Redis Lock Status Indicator */}
      <RedisLockIndicator status={redisLockStatus} period={selectedPeriod} ttlSeconds={30} />

      {/* Gross-to-Net Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Gross Spend"
          value={formatCurrency(summary.totalGrossSpend)}
          subtitle={`Across ${summary.totalEmployees} active employees`}
          icon={<DollarSign className="w-5 h-5 text-indigo-400" />}
        />
        <StatCard
          title="Income Tax (20%)"
          value={formatCurrency(summary.totalIncomeTax)}
          subtitle="Statutory withholding tax"
          icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
        />
        <StatCard
          title="Health Insurance (5%)"
          value={formatCurrency(summary.totalHealthInsurance)}
          subtitle="Mandatory healthcare pool"
          icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Total Net Payout"
          value={formatCurrency(summary.totalNetPayout)}
          subtitle="Direct deposited take-home pay"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Itemized Employee Payslips Table */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Itemized Employee Payslips ({selectedPeriod})
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Total Records: <span className="text-slate-300 font-semibold">{payslips.length}</span>
          </span>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Employee</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Gross Salary</th>
                <th className="py-3.5 px-4 font-semibold">Tax (20%)</th>
                <th className="py-3.5 px-4 font-semibold">Insurance (5%)</th>
                <th className="py-3.5 px-4 font-semibold">Net Payout</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {payslips.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-white text-xs">
                        {item.employeeName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{item.employeeName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-300">{item.department}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200 font-medium">
                    {formatCurrency(item.grossSalary)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-rose-400">
                    - {formatCurrency(item.incomeTax)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-400">
                    - {formatCurrency(item.healthInsurance)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold text-sm">
                    {formatCurrency(item.netPay)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPayslip(item)}
                      leftIcon={<FileText className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />}
                    >
                      View Payslip
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Payslip Modal */}
      <PayslipModal
        payslip={selectedPayslip}
        isOpen={Boolean(selectedPayslip)}
        onClose={() => setSelectedPayslip(null)}
      />
    </div>
  );
}
