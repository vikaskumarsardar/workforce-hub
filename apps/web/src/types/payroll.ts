export const PAYROLL_STATUS = {
  IDLE: 'IDLE',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type PayrollStatus = (typeof PAYROLL_STATUS)[keyof typeof PAYROLL_STATUS];

export const REDIS_LOCK_STATUS = {
  ACQUIRED: 'ACQUIRED',
  RELEASED: 'RELEASED',
} as const;

export type RedisLockStatus = (typeof REDIS_LOCK_STATUS)[keyof typeof REDIS_LOCK_STATUS];

export const TAX_RATES = {
  INCOME_TAX: 0.20,      // 20% Income Tax
  HEALTH_INSURANCE: 0.05, // 5% Health Insurance
} as const;

export const DEFAULT_PAYROLL_PERIOD = '2026-09';
export const DEFAULT_CURRENCY = 'USD';

export interface TaxDeductionBreakdown {
  incomeTax: number;
  healthInsurance: number;
  totalTax: number;
}

export interface PayslipItem {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  position: string;
  period: string;
  grossSalary: number;
  bonus: number;
  incomeTax: number;
  healthInsurance: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  paymentDate: string;
  status: 'PAID' | 'PENDING';
}

export interface PayrollRunSummary {
  period: string;
  totalEmployees: number;
  totalGrossSpend: number;
  totalIncomeTax: number;
  totalHealthInsurance: number;
  totalNetPayout: number;
  currency: string;
  executedAt?: string;
}

export interface ExecutePayrollPayload {
  period: string;
}
