'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex font-sans transition-colors duration-200">
        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
          <Header />
          <main className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto">{children}</main>
          <footer className="border-t border-[var(--border-color)] py-4 px-6 text-center text-xs text-slate-500 font-mono">
            WorkforcePulse Enterprise Platform • Multi-Tenant Context Active
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}
