# Frontend Software Requirements Specification (SRS)
## Application Name: WorkforcePulse Enterprise Web Application

---

## 1. Executive Summary

The **WorkforcePulse Enterprise Web Application** is a modern B2B SaaS web portal engineered for global employee management, multi-tier leave approval workflows, automated monthly payroll execution, and real-time observability. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS v3**, **TanStack Query (React Query)**, and **Zustand**, it connects directly to the WorkforcePulse API Gateway (`http://localhost:3000`).

---

## 2. User Personas & Access Matrix

| Role | Target User | Portal Privileges |
| :--- | :--- | :--- |
| **`ADMIN`** | System & Enterprise IT Admins | Tenant bootstrapping, full employee onboarding, role mapping, system metrics, CDC outbox monitoring. |
| **`HR_MANAGER`** | HR Operations & Compliance Leads | Final leave verification (`HR_VERIFIED`), payroll execution, compensation setup, audit log inspection. |
| **`LINE_MANAGER`**| Department Managers | Direct report leave approval/rejection (`MANAGER_APPROVED` / `REJECTED`), team balance oversight. |
| **`EMPLOYEE`** | Standard Staff & Contractors | Leave application submission, personal leave balance breakdown, monthly pay slip download. |

---

## 3. Functional Requirements (FRs)

### Module 1: Authentication, Multi-Tenancy & Perimeter (`/login`, `/register-tenant`)
* **FR-FE-1.1 (Tenant Bootstrapping)**: Users MUST be able to register new B2B client company tenants (`companyName`, `domain`, `adminEmail`, `adminPassword`).
* **FR-FE-1.2 (JWT Login & Refresh Rotation)**: System MUST authenticate credentials, store JWT access tokens, and handle 15-minute access token refresh rotation seamlessly.
* **FR-FE-1.3 (Tenant Selector & Header Context)**: UI MUST inject `x-tenant-id` into all API calls and display active tenant context in top navbar.
* **FR-FE-1.4 (Role Switcher & Guard)**: UI MUST dynamically restrict component visibility and route access based on active role (`ADMIN`, `HR_MANAGER`, `LINE_MANAGER`, `EMPLOYEE`).

### Module 2: Executive HR & System Dashboard (`/dashboard`)
* **FR-FE-2.1 (Executive KPI Cards)**: Display live counts of Active Employees, Pending Leave Requests, Monthly Payroll Gross/Net Spend, and API Gateway Latency.
* **FR-FE-2.2 (Department Distribution)**: Render interactive pie/bar charts showing employee breakdown by department and employment tier.
* **FR-FE-2.3 (System Health Indicator)**: Real-time status indicator showing API Gateway, PostgreSQL schemas, Redis Cluster, and Kafka CDC pipeline health.

### Module 3: Employee Directory & Onboarding (`/employees`)
* **FR-FE-3.1 (Employee Grid & Search)**: Interactive table listing employees with real-time text search, department filter, and status badges.
* **FR-FE-3.2 (Employee Onboarding Modal)**: Form modal for onboarding employees (`firstName`, `lastName`, `email`, `departmentId`, `positionId`, `managerId`, `baseSalary`).
* **FR-FE-3.3 (Profile Drawer)**: Slide-over drawer displaying full employee details, reporting manager, role assignments, and salary breakdown.

### Module 4: Leave State Machine Studio (`/leaves`)
* **FR-FE-4.1 (Leave Submission Form)**: Form modal for requesting leave (`leaveTypeId`, `startDate`, `endDate`, `reason`) with automatic day count calculation.
* **FR-FE-4.2 (State Machine Kanban Board)**: Visual workflow board grouping requests by status (`SUBMITTED` ➔ `MANAGER_APPROVED` ➔ `HR_VERIFIED` ➔ `PAYROLL_LOCKED` or `REJECTED`).
* **FR-FE-4.3 (Approval Action Panel)**: Managers/HR can trigger transition actions (`Approve`, `Reject`, `Verify`) with comment modal dialogs.
* **FR-FE-4.4 (Leave Balance Meters)**: Visual progress meters showing allocated vs. used vs. pending leave days per category.

### Module 5: Automated Payroll Engine (`/payroll`)
* **FR-FE-5.1 (Monthly Payroll Trigger)**: Interactive control panel to trigger automated monthly payroll (`period: "2026-09"`) with Redis lock indicator.
* **FR-FE-5.2 (Gross-to-Net Breakdown)**: Live summary card displaying Total Gross, Total Tax Withholdings (20%), Total Health Insurance (5%), and Net Pay.
* **FR-FE-5.3 (Digital Pay Slip Viewer)**: Printable/downloadable itemized pay slip modal featuring breakdown of base salary, bonus, tax, and net pay.

### Module 6: Real-Time CDC & Telemetry Monitor (`/telemetry`)
* **FR-FE-6.1 (Live Kafka CDC Stream)**: Real-time event log feed capturing sub-10ms Debezium CDC outbox events (`leave.outbox_events` and `payroll.outbox_events`).
* **FR-FE-6.2 (OpenTelemetry Span Graph)**: Visual trace waterfalls demonstrating end-to-end W3C trace propagation from Gateway ➔ Microservices.

---

## 4. Non-Functional Requirements (NFRs)

* **NFR-FE-1 (Performance)**: Page navigation latency MUST be <50ms; Initial Cumulative Layout Shift (CLS) MUST be 0.
* **NFR-FE-2 (Aesthetics & Design System)**: Ultra-sleek enterprise dark theme (Slate/Obsidian palette `#090d16`, glassmorphism cards, Inter typography scale).
* **NFR-FE-3 (Accessibility)**: Compliance with WCAG 2.1 AA standards including keyboard navigation and aria-labels.
* **NFR-FE-4 (Responsiveness)**: 100% responsive fluid grid system supporting Desktop (1440px+), Laptop (1024px), Tablet (768px), and Mobile (375px).
