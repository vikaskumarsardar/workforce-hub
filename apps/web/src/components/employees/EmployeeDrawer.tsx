import React, { useEffect } from 'react';
import {
  X,
  Mail,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  Shield,
  UserCheck,
  Award,
  Layers,
} from 'lucide-react';

import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KEYBOARD_KEYS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Employee, EMPLOYMENT_STATUS } from '@/types/employee';

export interface EmployeeDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const STATUS_VARIANTS: Record<
  Employee['status'],
  { label: string; variant: BadgeVariant }
> = {
  [EMPLOYMENT_STATUS.ACTIVE]: { label: 'Active', variant: 'emerald' },
  [EMPLOYMENT_STATUS.ONBOARDING]: { label: 'Onboarding', variant: 'indigo' },
  [EMPLOYMENT_STATUS.ON_LEAVE]: { label: 'On Leave', variant: 'amber' },
  [EMPLOYMENT_STATUS.TERMINATED]: { label: 'Terminated', variant: 'rose' },
};

export const EmployeeDrawer: React.FC<EmployeeDrawerProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !employee) return null;

  const statusConfig = STATUS_VARIANTS[employee.status] || {
    label: employee.status,
    variant: 'info',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Profile details for ${employee.firstName} ${employee.lastName}`}
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
      >
        <div className="w-screen max-w-md bg-[#0d1322] border-l border-slate-800 shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Employee Profile
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Close profile drawer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/30">
                {employee.firstName[0]}
                {employee.lastName[0]}
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-slate-100">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  {employee.position}
                </p>
                <div className="mt-2">
                  <Badge variant={statusConfig.variant} size="sm">
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Work Information
              </h4>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>Email Address</span>
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    {employee.email}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span>Department</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-300">
                    {employee.department}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>Reporting Manager</span>
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    {employee.managerName || 'Executive Board'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Hire Date</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {formatDate(employee.hireDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Direct Reports</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    {employee.directReportsCount ?? 0} team members
                  </span>
                </div>
              </div>

              {/* Roles Section */}
              <div className="pt-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                  Assigned Roles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {employee.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-1 rounded-md bg-indigo-600/15 border border-indigo-500/25 text-indigo-300 text-xs font-mono font-semibold flex items-center gap-1.5"
                    >
                      <Shield className="w-3 h-3 text-indigo-400" />
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compensation Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 mt-4 space-y-2">
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Base Compensation
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {formatCurrency(employee.baseSalary, employee.currency)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ Annual</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-6 border-t border-slate-800 mt-6">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={onClose}
            >
              Close Profile
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
};
