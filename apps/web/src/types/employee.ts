import { UserRole } from '@/lib/constants';

export const EMPLOYMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  ONBOARDING: 'ONBOARDING',
  ON_LEAVE: 'ON_LEAVE',
  TERMINATED: 'TERMINATED',
} as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUS)[keyof typeof EMPLOYMENT_STATUS];

export const DEFAULT_EMPLOYEE_SALARY = 120000;
export const DEFAULT_CURRENCY = 'USD';

export interface Department {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
}

export interface Employee {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  department: string;
  position: string;
  managerName?: string;
  managerId?: string;
  baseSalary: number;
  currency: string;
  status: EmploymentStatus;
  roles: UserRole[];
  hireDate: string;
  directReportsCount?: number;
}

export interface OnboardEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  managerId?: string;
  baseSalary: number;
  roles: UserRole[];
}
