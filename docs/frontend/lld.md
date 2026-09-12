# Frontend Low-Level Design (LLD) Document
## System Name: WorkforcePulse Enterprise Web Application Component Contracts

---

## 1. Data Contracts & TypeScript Interfaces

### A. Authentication & Tenant Contracts
```typescript
export interface Tenant {
  id: string;
  companyName: string;
  domain: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<'ADMIN' | 'HR_MANAGER' | 'LINE_MANAGER' | 'EMPLOYEE'>;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

### B. Employee Contracts
```typescript
export interface Employee {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  department?: { id: string; name: string; code: string };
  position?: { id: string; title: string; gradeLevel: string };
  manager?: { id: string; firstName: string; lastName: string; email: string };
}
```

### C. Leave State Machine Contracts
```typescript
export type LeaveStatus = 'SUBMITTED' | 'MANAGER_APPROVED' | 'HR_VERIFIED' | 'PAYROLL_LOCKED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  rejectionReason?: string;
  createdAt: string;
  employee?: Employee;
  leaveType?: { id: string; name: string; isPaid: boolean };
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  leaveType?: { name: string };
}
```

### D. Payroll & Outbox CDC Contracts
```typescript
export interface PayrollRun {
  payrollRunId: string;
  period: string;
  processedEmployees: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  executedAt: string;
}

export interface PaySlip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  createdAt: string;
  items?: Array<{ id: string; type: 'EARNING' | 'DEDUCTION'; name: string; amount: number }>;
}

export interface OutboxCdcEvent {
  id: string;
  eventType: string;
  payload: Record<string, any>;
  createdAt: string;
  sourceSchema?: string;
}
```

---

## 2. Component Design & Prop Specifications

### A. `LeaveKanban` Component
- **Props:**
  ```typescript
  interface LeaveKanbanProps {
    requests: LeaveRequest[];
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onVerify: (id: string) => void;
    currentUserRole: string;
  }
  ```
- **Behavior:** Renders 4 status columns (`SUBMITTED`, `MANAGER_APPROVED`, `HR_VERIFIED`, `PAYROLL_LOCKED`). Disables action buttons based on `currentUserRole`.

### B. `PayrollCalculator` Component
- **Props:**
  ```typescript
  interface PayrollCalculatorProps {
    onExecute: (period: string) => Promise<PayrollRun>;
    isExecuting: boolean;
  }
  ```
- **Behavior:** Displays tax calculation breakdown preview (20% Income Tax, 5% Health Insurance) and handles idempotency execution confirmation.

### C. `KafkaCdcFeed` Component
- **Props:**
  ```typescript
  interface KafkaCdcFeedProps {
    events: OutboxCdcEvent[];
    isConnected: boolean;
  }
  ```
- **Behavior:** Renders a real-time terminal-style stream of Kafka CDC events with event badges, sub-10ms timestamp logs, and JSON payload inspector.

---

## 3. Zod Form Validation Contracts

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid work email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const onboardEmployeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Default password must be at least 8 characters').optional(),
  baseSalary: z.number().min(1000, 'Minimum salary is 1,000'),
  currency: z.string().default('USD'),
});

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid('Select a valid leave type'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});
```
