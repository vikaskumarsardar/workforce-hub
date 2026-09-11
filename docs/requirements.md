# Software Requirements Specification (SRS)
## Project Name: WorkforcePulse - Global HR, Workflow Approval & Payroll Platform

---

## 1. Executive Summary
WorkforcePulse is an enterprise-grade, multi-tenant B2B SaaS platform designed to manage global employee onboarding, multi-tier leave approval workflows, automated monthly payroll calculations, tax withholdings, digital pay slip distribution, and immutable HR compliance audit logging.

---

## 2. Functional Requirements (FRs)

### Module 1: API Gateway & Perimeter Platform (`api-gateway`)
* **FR-1.1 (Multi-Tenant JWT Authentication)**: System MUST authenticate users via JWT Bearer tokens containing `userId`, `email`, `role`, and `tenantId`.
* **FR-1.2 (Tenant Isolation Guard)**: System MUST enforce `x-tenant-id` header validation to isolate multi-tenant data.
* **FR-1.3 (Fastify Engine & Throttling)**: API Gateway MUST run on `@nestjs/platform-express` / Fastify with sliding-window rate limiting per tenant tier.
* **FR-1.4 (OpenAPI / Swagger Specs)**: Gateway MUST serve interactive OpenAPI 3.0 (Swagger) documentation.

### Module 2: Employee & Identity Management (`employee-service`)
* **FR-2.1 (Employee Onboarding)**: System MUST manage employee and contractor profiles (`firstName`, `lastName`, `email`, `department`, `role`, `salary`, `bankDetails`, `kycStatus`).
* **FR-2.2 (Manager Hierarchy)**: System MUST maintain reporting hierarchies (`managerId`) to support multi-tier approval chains.
* **FR-2.3 (Role-Based Access Control - RBAC)**: System MUST enforce permissions across roles (`ADMIN`, `HR_MANAGER`, `LINE_MANAGER`, `EMPLOYEE`).

### Module 3: Leave & Workflow State Machine (`leave-service`)
* **FR-3.1 (Leave Request Creation)**: Employees MUST be able to submit leave requests specifying `leaveType` (Vacation, Sick, Parental), `startDate`, `endDate`, and `reason`.
* **FR-3.2 (Workflow State Machine)**: System MUST enforce strict state machine transitions:
  `SUBMITTED` ➔ `MANAGER_APPROVED` ➔ `HR_VERIFIED` ➔ `PAYROLL_LOCKED` (or `REJECTED`).
* **FR-3.3 (Leave Balance Calculation)**: System MUST track annual leave balances and automatically deduct approved leave days.

### Module 4: Automated Monthly Payroll Engine (`payroll-service`)
* **FR-4.1 (Monthly Payroll Run)**: System MUST run automated monthly payroll execution for all active employees in a tenant.
* **FR-4.2 (Salary & Tax Calculation)**: System MUST compute `Gross Salary + Bonuses - Tax Withholdings - Unpaid Leave Deductions = Net Pay`.
* **FR-4.3 (Digital Pay Slips)**: System MUST generate digital pay slip records for employees with breakdown of salary components.
* **FR-4.4 (Idempotent Payroll Execution)**: Re-running a payroll for the same month (`period: "2026-09"`) MUST be idempotent and return existing calculated pay slips without duplicate processing.

### Module 5: Notifications & Audit Logging (`notification-service`)
* **FR-5.1 (Approval & Pay Slip Email Alerts)**: System MUST send HTML email alerts for leave approval requests, approval/rejection outcomes, and monthly pay slip availability.
* **FR-5.2 (Immutable HR Audit Trail)**: System MUST record immutable audit log entries (`who`, `action`, `entityType`, `entityId`, `oldValue`, `newValue`, `timestamp`) for any salary modification, role change, or leave override.

---

## 3. Non-Functional Requirements (NFRs)

### Performance & Scalability
* **NFR-1.1 (Latency)**: API Gateway response latency MUST be <50ms for P95 and <100ms for P99.
* **NFR-1.2 (Stateless Workers)**: All services MUST remain 100% stateless to support horizontal pod autoscaling (HPA).

### Reliability & Consistency
* **NFR-2.1 (Transactional Outbox)**: State changes and outbox events MUST be saved in the same PostgreSQL SQL transaction (`BEGIN ... COMMIT`).
* **NFR-2.2 (Multi-Tenant Isolation)**: Queries MUST strictly enforce `tenantId` filtering to guarantee multi-tenant data privacy.

### Observability & Telemetry
* **NFR-3.1 (W3C OpenTelemetry Traces)**: W3C Trace Context MUST propagate across all HTTP endpoints and microservice TCP socket streams to Grafana Tempo.
* **NFR-3.2 (Structured JSON Logs)**: All services MUST emit stdout JSON log lines containing `timestamp`, `level`, `service`, `context`, `correlationId`, `traceId`, and `spanId`.
* **NFR-3.3 (Prometheus Metrics & Exemplars)**: Expose `/metrics` with latency histograms, request counters, system metrics, and trace exemplars.
