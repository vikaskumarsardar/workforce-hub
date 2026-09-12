import React, { useState } from 'react';
import { Mail, Briefcase, DollarSign, Building, UserCheck, Shield } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { USER_ROLES, UserRole } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { OnboardEmployeePayload, DEFAULT_EMPLOYEE_SALARY } from '@/types/employee';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: OnboardEmployeePayload) => Promise<void> | void;
}

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance & Accounting',
  'Operations & Logistics',
  'Sales & Marketing',
  'Product & Design',
];

export const POSITIONS: Record<string, string[]> = {
  Engineering: ['Senior Software Engineer', 'Frontend Lead', 'Backend Engineer', 'DevOps Specialist', 'QA Engineer'],
  'Human Resources': ['HR Generalist', 'Recruitment Specialist', 'HR Business Partner', 'People Operations Manager'],
  'Finance & Accounting': ['Financial Analyst', 'Senior Accountant', 'Payroll Specialist', 'Controller'],
  'Operations & Logistics': ['Operations Manager', 'Supply Chain Analyst', 'Facilities Coordinator'],
  'Sales & Marketing': ['Account Executive', 'Marketing Director', 'Sales Development Rep', 'Content Strategist'],
  'Product & Design': ['Product Manager', 'UX/UI Designer', 'Product Designer', 'Scrum Master'],
};

export const ONBOARDING_ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Please fill in all required employee contact fields.',
  INVALID_EMAIL: 'Please enter a valid work email address.',
  INVALID_SALARY: 'Please enter a valid positive base salary amount.',
  SUBMIT_FAILED: 'Failed to onboard employee. Please verify details.',
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface OnboardingFormState {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  managerName: string;
  baseSalary: string;
  role: UserRole;
}

export const INITIAL_FORM_STATE: OnboardingFormState = {
  firstName: '',
  lastName: '',
  email: '',
  department: DEPARTMENTS[0],
  position: POSITIONS[DEPARTMENTS[0]][0],
  managerName: '',
  baseSalary: String(DEFAULT_EMPLOYEE_SALARY),
  role: USER_ROLES.EMPLOYEE,
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<OnboardingFormState>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const updateFormField = <K extends keyof OnboardingFormState>(
    field: K,
    value: OnboardingFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDepartmentChange = (newDept: string) => {
    const defaultPos = POSITIONS[newDept]?.[0] || '';
    setFormData((prev) => ({
      ...prev,
      department: newDept,
      position: defaultPos,
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isMissingFields =
      !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim();
    if (isMissingFields) {
      setError(ONBOARDING_ERROR_MESSAGES.REQUIRED_FIELDS);
      return;
    }

    const isInvalidEmail = !EMAIL_REGEX.test(formData.email.trim());
    if (isInvalidEmail) {
      setError(ONBOARDING_ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    const numericSalary = Number(formData.baseSalary);
    const isInvalidSalary = isNaN(numericSalary) || numericSalary <= 0;
    if (isInvalidSalary) {
      setError(ONBOARDING_ERROR_MESSAGES.INVALID_SALARY);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        department: formData.department,
        position: formData.position,
        managerId: formData.managerName.trim() || undefined,
        baseSalary: numericSalary,
        roles: [formData.role],
      });
      resetForm();
      onClose();
    } catch {
      setError(ONBOARDING_ERROR_MESSAGES.SUBMIT_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Employee"
      description="Register a new staff member into enterprise workforce management."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            placeholder="Jane"
            value={formData.firstName}
            onChange={(e) => updateFormField('firstName', e.target.value)}
            required
            leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
          />
          <Input
            label="Last Name *"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => updateFormField('lastName', e.target.value)}
            required
            leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Input
          label="Work Email Address *"
          type="email"
          placeholder="jane.doe@workforce.io"
          value={formData.email}
          onChange={(e) => updateFormField('email', e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Department Select */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900 text-slate-100">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Position Select */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Job Title / Position *
            </label>
            <select
              value={formData.position}
              onChange={(e) => updateFormField('position', e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 text-slate-100 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {(POSITIONS[formData.department] || []).map((pos) => (
                <option key={pos} value={pos} className="bg-slate-900 text-slate-100">
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Annual Base Salary (USD) *"
            type="number"
            placeholder={String(DEFAULT_EMPLOYEE_SALARY)}
            value={formData.baseSalary}
            onChange={(e) => updateFormField('baseSalary', e.target.value)}
            required
            leftIcon={<DollarSign className="w-4 h-4 text-emerald-400" />}
          />
          <Input
            label="Reporting Manager (Optional)"
            placeholder="e.g. Alex Morgan"
            value={formData.managerName}
            onChange={(e) => updateFormField('managerName', e.target.value)}
            leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Role Selector */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            Assigned Portal Role *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(USER_ROLES).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => updateFormField('role', r)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-mono font-medium border transition-all text-center',
                  formData.role === r
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            Confirm Onboarding
          </Button>
        </div>
      </form>
    </Modal>
  );
};
