'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">{children}</main>
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
          WorkforcePulse Enterprise Platform • Multi-Tenant Context Active
        </footer>
      </div>
    </AuthGuard>
  );
}
