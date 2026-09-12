'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User, Building, Users, Calendar, DollarSign, LayoutDashboard } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { USER_ROLES, UserRole, APP_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenantId, activeRole, setActiveRole, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(APP_ROUTES.LOGIN);
  };

  const navItems = [
    { label: 'Dashboard', href: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Employees', href: APP_ROUTES.EMPLOYEES, icon: Users },
    { label: 'Leaves', href: APP_ROUTES.LEAVES, icon: Calendar },
    { label: 'Payroll', href: APP_ROUTES.PAYROLL, icon: DollarSign },
  ];

  const availableRoles: UserRole[] = user?.roles && user.roles.length > 0
    ? user.roles
    : [USER_ROLES.EMPLOYEE, USER_ROLES.LINE_MANAGER, USER_ROLES.HR_MANAGER, USER_ROLES.ADMIN];

  return (
    <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Tenant Badge */}
        <div className="flex items-center space-x-6">
          <Link href={APP_ROUTES.DASHBOARD} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
              WP
            </div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">
              Workforce<span className="text-indigo-400">Pulse</span>
            </span>
          </Link>

          {/* Active Tenant Context Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Building className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
            <span className="text-slate-400">Tenant:</span>
            <span className="font-semibold text-slate-200">{tenantId || 'global-corp'}</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all',
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Role Switcher & User Profile Menu */}
        <div className="flex items-center space-x-4">
          {/* Active Role Selector */}
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase px-2 hidden lg:inline">
                Perspective:
              </span>
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all',
                    activeRole === role
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          {/* User Profile / Logout */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200">
                  {user ? `${user.firstName} ${user.lastName}` : 'User Account'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {user?.email || 'admin@workforce.io'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Log out"
                leftIcon={<LogOut className="w-4 h-4 text-slate-400" aria-hidden="true" />}
              />
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(APP_ROUTES.LOGIN)}
              leftIcon={<User className="w-4 h-4" aria-hidden="true" />}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
