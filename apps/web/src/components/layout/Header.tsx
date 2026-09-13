'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { USER_ROLES, UserRole } from '@/lib/constants';
import { Search, Sparkles, Command, Plus } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, activeRole, setActiveRole, isAuthenticated } = useAuthStore();

  const routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard Overview',
    '/employees': 'Employee Directory',
    '/leaves': 'Leave Approval Studio',
    '/payroll': 'Automated Payroll Engine',
  };

  const pageTitle = routeTitles[pathname] || 'Workspace Portal';

  const availableRoles: UserRole[] = user?.roles && user.roles.length > 0
    ? user.roles
    : [USER_ROLES.EMPLOYEE, USER_ROLES.LINE_MANAGER, USER_ROLES.HR_MANAGER, USER_ROLES.ADMIN];

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Breadcrumb / Page Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
          {pageTitle}
        </h1>
        <Badge variant="indigo" size="sm">
          <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" /> Enterprise SaaS
        </Badge>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex items-center w-80 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search personnel, requests, policies..."
          className="w-full pl-9 pr-12 py-1.5 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-surface-hover)] text-[10px] font-mono text-slate-500 border border-[var(--border-color)]">
          <Command className="w-3 h-3" /> K
        </div>
      </div>

      {/* Right: Active Role Switcher & Action Button */}
      <div className="flex items-center space-x-4">
        {isAuthenticated && (
          <div className="hidden sm:flex items-center gap-1 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase px-2">Role View:</span>
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                  activeRole === role
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
          onClick={() => {
            const event = new CustomEvent('open-onboarding-modal');
            window.dispatchEvent(event);
          }}
        >
          Quick Action
        </Button>
      </div>
    </header>
  );
};
