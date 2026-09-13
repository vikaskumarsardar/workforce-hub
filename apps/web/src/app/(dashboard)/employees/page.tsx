'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Building,
  DollarSign,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  Briefcase,
  ChevronRight,
  Shield,
  User,
} from 'lucide-react';

import { EmployeeDrawer, STATUS_VARIANTS } from '@/components/employees/EmployeeDrawer';
import { OnboardingModal } from '@/components/employees/OnboardingModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { USER_ROLES } from '@/lib/constants';
import { formatCurrency, cn } from '@/lib/utils';
import { Employee, OnboardEmployeePayload, EMPLOYMENT_STATUS, DEFAULT_CURRENCY } from '@/types/employee';

export const FILTER_ALL = 'ALL';
export const VIEW_MODES = {
  GRID: 'grid',
  TABLE: 'table',
} as const;

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-101',
    tenantId: 'global-corp',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@workforce.io',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    managerName: 'Alex Morgan',
    managerId: 'emp-100',
    baseSalary: 145000,
    currency: DEFAULT_CURRENCY,
    status: EMPLOYMENT_STATUS.ACTIVE,
    roles: [USER_ROLES.ADMIN, USER_ROLES.LINE_MANAGER],
    hireDate: '2023-03-15',
    directReportsCount: 4,
  },
  {
    id: 'emp-102',
    tenantId: 'global-corp',
    firstName: 'Michael',
    lastName: 'Chang',
    email: 'michael.chang@workforce.io',
    department: 'Engineering',
    position: 'Frontend Lead',
    managerName: 'Sarah Jenkins',
    managerId: 'emp-101',
    baseSalary: 135000,
    currency: DEFAULT_CURRENCY,
    status: EMPLOYMENT_STATUS.ACTIVE,
    roles: [USER_ROLES.EMPLOYEE],
    hireDate: '2023-06-01',
    directReportsCount: 2,
  },
  {
    id: 'emp-103',
    tenantId: 'global-corp',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@workforce.io',
    department: 'Human Resources',
    position: 'HR Operations Lead',
    managerName: 'Corporate HR',
    baseSalary: 115000,
    currency: DEFAULT_CURRENCY,
    status: EMPLOYMENT_STATUS.ACTIVE,
    roles: [USER_ROLES.HR_MANAGER],
    hireDate: '2022-11-10',
    directReportsCount: 3,
  },
  {
    id: 'emp-104',
    tenantId: 'global-corp',
    firstName: 'David',
    lastName: 'Kowalski',
    email: 'david.k@workforce.io',
    department: 'Finance & Accounting',
    position: 'Senior Financial Analyst',
    managerName: 'Executive Board',
    baseSalary: 125000,
    currency: DEFAULT_CURRENCY,
    status: EMPLOYMENT_STATUS.ON_LEAVE,
    roles: [USER_ROLES.EMPLOYEE],
    hireDate: '2024-01-08',
    directReportsCount: 0,
  },
  {
    id: 'emp-105',
    tenantId: 'global-corp',
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'amara.o@workforce.io',
    department: 'Product & Design',
    position: 'Product Designer',
    managerName: 'Sarah Jenkins',
    managerId: 'emp-101',
    baseSalary: 110000,
    currency: DEFAULT_CURRENCY,
    status: EMPLOYMENT_STATUS.ONBOARDING,
    roles: [USER_ROLES.EMPLOYEE],
    hireDate: '2026-09-01',
    directReportsCount: 0,
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(FILTER_ALL);
  const [selectedStatus, setSelectedStatus] = useState<string>(FILTER_ALL);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.TABLE);

  // Modal & Drawer states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Departments list for filter dropdown
  const departmentsList = useMemo(() => {
    const set = new Set(employees.map((e) => e.department));
    return Array.from(set);
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        searchQuery === '' ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDepartment === FILTER_ALL || emp.department === selectedDepartment;
      const matchesStatus = selectedStatus === FILTER_ALL || emp.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, selectedDepartment, selectedStatus]);

  // Metrics
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === EMPLOYMENT_STATUS.ACTIVE).length;
  const avgSalary = Math.round(
    employees.reduce((acc, e) => acc + e.baseSalary, 0) / (totalEmployees || 1)
  );

  const handleOnboardSubmit = (payload: OnboardEmployeePayload) => {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      tenantId: 'global-corp',
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      department: payload.department,
      position: payload.position,
      managerName: payload.managerId || 'Department Manager',
      baseSalary: payload.baseSalary,
      currency: DEFAULT_CURRENCY,
      status: EMPLOYMENT_STATUS.ONBOARDING,
      roles: payload.roles,
      hireDate: new Date().toISOString().split('T')[0],
      directReportsCount: 0,
    };
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const columns: Column<Employee>[] = [
    {
      key: 'employee',
      header: 'Employee Name & Contact',
      render: (emp) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs">
            {emp.firstName[0]}
            {emp.lastName[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {emp.firstName} {emp.lastName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (emp) => <span className="font-medium text-indigo-600 dark:text-indigo-400">{emp.department}</span>,
    },
    {
      key: 'position',
      header: 'Position / Title',
      render: (emp) => <span className="text-slate-700 dark:text-slate-300 font-medium">{emp.position}</span>,
    },
    {
      key: 'baseSalary',
      header: 'Base Salary',
      render: (emp) => <span className="font-mono text-slate-900 dark:text-slate-100">{formatCurrency(emp.baseSalary)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (emp) => {
        const statusConfig = STATUS_VARIANTS[emp.status] || { label: emp.status, variant: 'info' };
        return <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (emp) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedEmployee(emp)}
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-tenant staff, role assignments, onboarding, and reporting chains.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsOnboardingOpen(true)}
          leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
        >
          Onboard Employee
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Workforce"
          value={totalEmployees}
          subtitle="Registered active & onboarding staff"
          icon={<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          change="+12% this quarter"
          changeType="positive"
        />
        <StatCard
          title="Active Status"
          value={activeCount}
          subtitle="Currently active in workforce"
          icon={<UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          title="Departments"
          value={departmentsList.length}
          subtitle="Active corporate departments"
          icon={<Building className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          title="Avg Base Salary"
          value={formatCurrency(avgSalary)}
          subtitle="Average annual base compensation"
          icon={<DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
      </div>

      {/* Search & Filter Control Bar */}
      <div className="glass-panel rounded-2xl p-4 space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by name, email, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value={FILTER_ALL}>All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value={FILTER_ALL}>All Statuses</option>
              <option value={EMPLOYMENT_STATUS.ACTIVE}>Active</option>
              <option value={EMPLOYMENT_STATUS.ONBOARDING}>Onboarding</option>
              <option value={EMPLOYMENT_STATUS.ON_LEAVE}>On Leave</option>
            </select>

            {/* Grid / Table View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 space-x-1">
              <button
                onClick={() => setViewMode(VIEW_MODES.TABLE)}
                className={cn(
                  'p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors',
                  viewMode === VIEW_MODES.TABLE && 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                )}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode(VIEW_MODES.GRID)}
                className={cn(
                  'p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors',
                  viewMode === VIEW_MODES.GRID && 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Content Display */}
      {viewMode === VIEW_MODES.TABLE ? (
        <DataTable
          columns={columns}
          data={filteredEmployees}
          keyExtractor={(emp) => emp.id}
          emptyMessage="No employees match your search query or department filters."
        />
      ) : (
        /* Grid View Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const statusConfig = STATUS_VARIANTS[emp.status] || { label: emp.status, variant: 'info' };
            return (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar: Avatar & Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 text-base group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{emp.email}</p>
                      </div>
                    </div>
                    <Badge variant={statusConfig.variant} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Title:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">{emp.position}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Dept:
                      </span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-300">{emp.department}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Salary:
                      </span>
                      <span className="font-mono text-slate-900 dark:text-slate-200">{formatCurrency(emp.baseSalary)}</span>
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {emp.roles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1"
                      >
                        <Shield className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                  <span>View Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboarding Form Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSubmit={handleOnboardSubmit}
      />

      {/* Profile Slide-Over Drawer */}
      <EmployeeDrawer
        employee={selectedEmployee}
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
}
