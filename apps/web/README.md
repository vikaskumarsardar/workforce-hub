# 💼 WorkforcePulse - Enterprise B2B SaaS Frontend (`apps/web`)

Welcome to the frontend application of **WorkforcePulse** — a modern, high-density Enterprise Workforce Management B2B SaaS dashboard built with Next.js 16 App Router.

🌐 **Live Vercel Deployment**: [https://vercel.com/vikaskumarsardars-projects/workforce-hub](https://vercel.com/vikaskumarsardars-projects/workforce-hub)

---

## 🌟 Key Features

### 1. 👥 Employee Directory & Staff Management
- **High-Density Table & Grid Views**: Interactive toggle between structured table view and visual card layout.
- **Search & Multi-Facet Filtering**: Real-time client-side search by name, email, or position, with department and status filters (`Active`, `Onboarding`, `On Leave`).
- **Profile Slide-Over Drawer**: Detailed employee inspector presenting reporting chains, compensation breakdown, and system roles.
- **Onboarding Workflow Modal**: Interactive multi-step employee onboarding form.

### 2. 🌴 Leave Approval Studio (4-Stage State Machine)
- **Visual Kanban Pipeline**: 4-column approval flow (`Submitted` ➔ `Manager Approved` ➔ `HR Verified` ➔ `Payroll Locked`).
- **Policy Verification**: Interactive decision drawer for Manager approval, HR verification, and Payroll locking.
- **Allowance Meter Cards**: Interactive PTO balance breakdown (`Annual Vacation`, `Medical & Sick Leave`, `Parental Leave`, `Bereavement`).

### 3. 💰 Automated Monthly Payroll Engine
- **Gross-to-Net Engine**: Interactive tax withholding and statutory calculation simulator (20% Income Tax, 5% Healthcare Pool).
- **Redis Distributed Lock Simulator**: Displays distributed lock state (`lock:payroll:global-corp:2026-09`) to prevent concurrent double-run processing.
- **Itemized Payslip Viewer**: Modal view generating detailed itemized paystubs.

### 4. 🎨 Enterprise Theme Engine & RBAC Perspective Switcher
- **Light & Dark Themes**: Modern design system using CSS custom properties with WCAG AA compliant contrast ratios.
- **Theme Switcher**: Accessible toggle cycling between Light, Dark, and System modes with persistence.
- **Role Perspective Switcher**: Dynamic header widget (`ADMIN`, `HR_MANAGER`, `LINE_MANAGER`, `EMPLOYEE`) for previewing role-based access permissions in real time.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + CSS Custom Variables
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Auth & Theme stores)
- **Icons**: [Lucide React](https://lucide.dev)
- **Deployment**: [Vercel](https://vercel.com)

---

## 🏃 Local Development

From the root monorepo or `apps/web` directory:

```bash
# Install dependencies (from root)
npm install

# Run frontend dev server
npm run dev --workspace=apps/web
# or inside apps/web:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Vercel Deployment Settings

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Framework Preset**: `Next.js`
- **Root Directory**: `apps/web` (when deploying standalone)
