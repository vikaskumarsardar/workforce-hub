import { UserRole } from '@/lib/constants';

export const LEAVE_STATUS = {
  SUBMITTED: 'SUBMITTED',
  MANAGER_APPROVED: 'MANAGER_APPROVED',
  HR_VERIFIED: 'HR_VERIFIED',
  PAYROLL_LOCKED: 'PAYROLL_LOCKED',
  REJECTED: 'REJECTED',
} as const;

export type LeaveStatus = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS];

export const LEAVE_CATEGORY = {
  VACATION: 'VACATION',
  SICK: 'SICK',
  PARENTAL: 'PARENTAL',
  BEREAVEMENT: 'BEREAVEMENT',
} as const;

export type LeaveCategory = (typeof LEAVE_CATEGORY)[keyof typeof LEAVE_CATEGORY];

export const LEAVE_CATEGORY_LABELS: Record<LeaveCategory, string> = {
  [LEAVE_CATEGORY.VACATION]: 'Annual Vacation',
  [LEAVE_CATEGORY.SICK]: 'Medical & Sick Leave',
  [LEAVE_CATEGORY.PARENTAL]: 'Parental & Family Leave',
  [LEAVE_CATEGORY.BEREAVEMENT]: 'Bereavement & Special',
};

export const DEFAULT_ALLOCATED_DAYS: Record<LeaveCategory, number> = {
  [LEAVE_CATEGORY.VACATION]: 25,
  [LEAVE_CATEGORY.SICK]: 10,
  [LEAVE_CATEGORY.PARENTAL]: 60,
  [LEAVE_CATEGORY.BEREAVEMENT]: 5,
};

export const MS_PER_DAY = 86400000;

export interface LeaveBalance {
  category: LeaveCategory;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  category: LeaveCategory;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  managerComment?: string;
  hrComment?: string;
  reviewedByRole?: UserRole;
}

export interface SubmitLeavePayload {
  category: LeaveCategory;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApprovalDecisionPayload {
  requestId: string;
  decision: 'APPROVE' | 'REJECT' | 'VERIFY' | 'LOCK';
  comment?: string;
}
