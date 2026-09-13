'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { APP_ROUTES } from '@/lib/constants';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Building,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, tenantId, activeRole, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(APP_ROUTES.LOGIN);
  };

  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        { label: 'Dashboard', href: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
        { label: 'Employees', href: APP_ROUTES.EMPLOYEES, icon: Users },
        { label: 'Leaves', href: APP_ROUTES.LEAVES, icon: Calendar },
        { label: 'Payroll', href: APP_ROUTES.PAYROLL, icon: DollarSign },
      ],
    },
    {
      group: 'Administration',
      items: [
        { label: 'Roles & Security', href: '#', icon: Shield },
        { label: 'Settings', href: '#', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 z-30 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Tenant Context */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-color)]">
          <Link href={APP_ROUTES.DASHBOARD} className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white shrink-0 shadow-md shadow-indigo-600/30">
              WP
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)] whitespace-nowrap">
                Workforce<span className="text-indigo-600 dark:text-indigo-400">Pulse</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Tenant Workspace Selector */}
        {!isCollapsed ? (
          <div className="m-3 p-2.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-xs flex items-center gap-2.5">
            <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
            <div className="flex flex-col truncate">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400">Workspace</span>
              <span className="font-semibold text-[var(--text-primary)] truncate">{tenantId || 'acme-corp'}</span>
            </div>
          </div>
        ) : (
          <div className="m-3 flex justify-center">
            <span title={`Tenant: ${tenantId || 'acme-corp'}`}>
              <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </span>
          </div>
        )}

        {/* Navigation List */}
        <nav className="px-3 py-2 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/60 dark:border-indigo-500/20'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} aria-hidden="true" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer User Profile & Theme Switcher */}
      <div className="p-3 border-t border-[var(--border-color)] space-y-3">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0">
                {user ? `${user.firstName[0]}${user.lastName[0]}` : 'US'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Enterprise User'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  Role: {activeRole || 'ADMIN'}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center gap-3 py-1">
            <ThemeToggle />
          </div>
        )}

        <button
          onClick={handleLogout}
          aria-label="Sign out of workspace"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
