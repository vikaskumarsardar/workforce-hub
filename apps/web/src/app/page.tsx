'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_ROUTES } from '@/lib/constants';
import { Users, Calendar, DollarSign, Activity, Shield, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              WP
            </div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">
              Workforce<span className="text-indigo-400">Pulse</span>
            </span>
            <Badge variant="indigo" size="sm">
              v1.0 Enterprise
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.push(APP_ROUTES.LOGIN)}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.REGISTER_TENANT)}>
              Register Tenant
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        {/* Hero Section */}
        <div className="relative glass-panel rounded-3xl p-10 overflow-hidden border border-slate-700/60">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-4 relative z-10">
            <Badge variant="purple">
              <Sparkles className="w-3 h-3 mr-1" /> Next.js 14 App Router + Tailwind v3
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Global HR, Workflows & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Automated Payroll Engine
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Enterprise B2B SaaS platform featuring Multi-Tenant Isolation, Leave State Machine Kanban, Redis-Locked Payroll, Transactional Outbox Relay, and Real-Time Kafka CDC.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <Button variant="primary" size="lg" onClick={() => router.push(APP_ROUTES.LOGIN)}>
                Launch HR Portal
              </Button>
              <Button variant="secondary" size="lg" onClick={() => window.open('http://localhost:3000/docs', '_blank')}>
                API Gateway Swagger
              </Button>
            </div>
          </div>
        </div>

        {/* Sprint 1 Design System Demo Cards */}
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-4 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Executive Metrics Overview (Design System Sample)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Employees"
              value="142"
              change="+12.4%"
              changeType="positive"
              icon={<Users className="w-5 h-5" />}
              subtitle="Across 3 global departments"
            />
            <StatCard
              title="Pending Leaves"
              value="8"
              change="State Machine"
              changeType="neutral"
              icon={<Calendar className="w-5 h-5" />}
              subtitle="SUBMITTED ➔ APPROVED"
            />
            <StatCard
              title="Monthly Net Payroll"
              value="$1,242,500"
              change="20% Tax / 5% Health"
              changeType="positive"
              icon={<DollarSign className="w-5 h-5" />}
              subtitle="Redis lock: 2026-09"
            />
            <StatCard
              title="API Gateway P95"
              value="24ms"
              change="Fastify"
              changeType="positive"
              icon={<Shield className="w-5 h-5" />}
              subtitle="Throttler rate limit: 100/min"
            />
          </div>
        </div>

        {/* Status Badges Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Leave State Machine & Workflow Status Indicators</CardTitle>
            <CardDescription>
              Enterprise status badges representing real-time domain transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge variant="amber">SUBMITTED</Badge>
            <Badge variant="indigo">MANAGER_APPROVED</Badge>
            <Badge variant="emerald">HR_VERIFIED</Badge>
            <Badge variant="purple">PAYROLL_LOCKED</Badge>
            <Badge variant="rose">REJECTED</Badge>
            <Badge variant="slate">INACTIVE</Badge>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
        WorkforcePulse Enterprise Platform • Next.js 14 App Router + NestJS API Gateway
      </footer>
    </div>
  );
}
