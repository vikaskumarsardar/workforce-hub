'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { USER_ROLES, APP_ROUTES } from '@/lib/constants';
import { Users, Calendar, DollarSign, Shield, ArrowRight, Activity, Building, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, tenantId, activeRole } = useAuthStore();

  const roleTitles = {
    [USER_ROLES.ADMIN]: 'Super Admin Control Center',
    [USER_ROLES.HR_MANAGER]: 'HR Operations & Compliance Hub',
    [USER_ROLES.LINE_MANAGER]: 'Team Leadership & Leave Approval Board',
    [USER_ROLES.EMPLOYEE]: 'Employee Self-Service Portal',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative glass-panel rounded-3xl p-8 overflow-hidden border border-slate-700/80">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="sm">
                <Building className="w-3 h-3 mr-1" aria-hidden="true" /> {tenantId || 'acme-corp'}
              </Badge>
              <Badge variant="purple" size="sm">
                <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" /> Role: {activeRole || 'ADMIN'}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Administrator'} 👋
            </h1>
            <p className="text-slate-400 text-sm">
              {roleTitles[activeRole || USER_ROLES.ADMIN]} • Multi-tenant isolation active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={APP_ROUTES.EMPLOYEES}>
              <Button variant="secondary" size="md" leftIcon={<Users className="w-4 h-4" />}>
                Employee Directory
              </Button>
            </Link>
            <Link href={APP_ROUTES.LEAVES}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Leave Requests
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Role-Specific Metric Overview Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200 tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" aria-hidden="true" /> Executive Metrics Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value="142"
            change="+12.4% this quarter"
            changeType="positive"
            icon={<Users className="w-5 h-5" />}
            subtitle={`Tenant: ${tenantId || 'acme-corp'}`}
          />
          <StatCard
            title="Pending Approvals"
            value="8"
            change="Action Required"
            changeType="neutral"
            icon={<Calendar className="w-5 h-5" />}
            subtitle="Leave State Machine: SUBMITTED"
          />
          <StatCard
            title="Monthly Net Payroll"
            value="$1,242,500"
            change="Redis Lock Active"
            changeType="positive"
            icon={<DollarSign className="w-5 h-5" />}
            subtitle="Period: 2026-09"
          />
          <StatCard
            title="Active Security Role"
            value={activeRole || 'ADMIN'}
            change="Authenticated"
            changeType="positive"
            icon={<Shield className="w-5 h-5" />}
            subtitle="Switch perspective in top bar"
          />
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit mb-2">
              <Users className="w-6 h-6" aria-hidden="true" />
            </div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Manage personnel records, departments, onboarding, and compensation history.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 border-t border-slate-800">
            <Link href={APP_ROUTES.EMPLOYEES}>
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Employees
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-2">
              <Calendar className="w-6 h-6" aria-hidden="true" />
            </div>
            <CardTitle>Leave Approval Kanban</CardTitle>
            <CardDescription>
              Review visual 4-column approval pipeline (SUBMITTED ➔ APPROVED ➔ VERIFIED).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 border-t border-slate-800">
            <Link href={APP_ROUTES.LEAVES}>
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Workflows
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-2">
              <DollarSign className="w-6 h-6" aria-hidden="true" />
            </div>
            <CardTitle>Automated Payroll Engine</CardTitle>
            <CardDescription>
              Execute gross-to-net tax calculations, Redis distributed locking, and payslips.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 border-t border-slate-800">
            <Link href={APP_ROUTES.PAYROLL}>
              <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Execute Payroll Run
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
