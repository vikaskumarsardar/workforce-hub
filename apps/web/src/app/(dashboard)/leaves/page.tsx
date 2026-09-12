'use client';

import React, { useState } from 'react';
import {
  Palmtree,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Clock,
  Calendar,
} from 'lucide-react';

import { ApprovalDecisionModal } from '@/components/leaves/ApprovalDecisionModal';
import { LeaveBalanceMeter } from '@/components/leaves/LeaveBalanceMeter';
import { LeaveRequestModal } from '@/components/leaves/LeaveRequestModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { USER_ROLES } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ApprovalDecisionPayload,
  LEAVE_CATEGORY,
  LEAVE_CATEGORY_LABELS,
  LEAVE_STATUS,
  LeaveBalance,
  LeaveRequest,
  LeaveStatus,
  SubmitLeavePayload,
} from '@/types/leave';

export const INITIAL_LEAVE_BALANCES: LeaveBalance[] = [
  { category: LEAVE_CATEGORY.VACATION, allocatedDays: 25, usedDays: 7, pendingDays: 5 },
  { category: LEAVE_CATEGORY.SICK, allocatedDays: 10, usedDays: 2, pendingDays: 0 },
  { category: LEAVE_CATEGORY.PARENTAL, allocatedDays: 60, usedDays: 0, pendingDays: 0 },
  { category: LEAVE_CATEGORY.BEREAVEMENT, allocatedDays: 5, usedDays: 1, pendingDays: 0 },
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lvr-501',
    tenantId: 'global-corp',
    employeeId: 'emp-102',
    employeeName: 'Michael Chang',
    department: 'Engineering',
    category: LEAVE_CATEGORY.VACATION,
    startDate: '2026-09-20',
    endDate: '2026-09-25',
    totalDays: 5,
    reason: 'Annual family vacation retreat in Hawaii.',
    status: LEAVE_STATUS.SUBMITTED,
    appliedDate: '2026-09-10',
  },
  {
    id: 'lvr-502',
    tenantId: 'global-corp',
    employeeId: 'emp-104',
    employeeName: 'David Kowalski',
    department: 'Finance & Accounting',
    category: LEAVE_CATEGORY.SICK,
    startDate: '2026-09-15',
    endDate: '2026-09-16',
    totalDays: 2,
    reason: 'Outpatient dental procedure recovery.',
    status: LEAVE_STATUS.MANAGER_APPROVED,
    appliedDate: '2026-09-08',
    managerComment: 'Approved by Line Manager.',
  },
  {
    id: 'lvr-503',
    tenantId: 'global-corp',
    employeeId: 'emp-105',
    employeeName: 'Amara Okafor',
    department: 'Product & Design',
    category: LEAVE_CATEGORY.VACATION,
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    totalDays: 5,
    reason: 'Personal time off for product launch prep recovery.',
    status: LEAVE_STATUS.HR_VERIFIED,
    appliedDate: '2026-08-25',
    managerComment: 'Approved by Line Manager.',
    hrComment: 'Verified HR compliance & PTO balance.',
  },
  {
    id: 'lvr-504',
    tenantId: 'global-corp',
    employeeId: 'emp-101',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    category: LEAVE_CATEGORY.VACATION,
    startDate: '2026-08-10',
    endDate: '2026-08-15',
    totalDays: 5,
    reason: 'Summer holiday break.',
    status: LEAVE_STATUS.PAYROLL_LOCKED,
    appliedDate: '2026-08-01',
    managerComment: 'Approved by Board.',
    hrComment: 'Payroll locked for period 2026-08.',
  },
];

export const KANBAN_COLUMNS: { status: LeaveStatus; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    status: LEAVE_STATUS.SUBMITTED,
    title: 'Submitted',
    subtitle: 'Pending Manager Approval',
    icon: Clock,
  },
  {
    status: LEAVE_STATUS.MANAGER_APPROVED,
    title: 'Manager Approved',
    subtitle: 'Pending HR Verification',
    icon: CheckCircle2,
  },
  {
    status: LEAVE_STATUS.HR_VERIFIED,
    title: 'HR Verified',
    subtitle: 'Pending Payroll Lock',
    icon: ShieldCheck,
  },
  {
    status: LEAVE_STATUS.PAYROLL_LOCKED,
    title: 'Payroll Locked',
    subtitle: 'Final Processed & Archived',
    icon: Lock,
  },
];

export default function LeavesPage() {
  const { activeRole, user } = useAuthStore();
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_LEAVE_BALANCES);

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedDecisionRequest, setSelectedDecisionRequest] = useState<LeaveRequest | null>(null);

  // Role Privileges
  const canApproveAsManager = activeRole === USER_ROLES.LINE_MANAGER || activeRole === USER_ROLES.ADMIN;
  const canVerifyAsHR = activeRole === USER_ROLES.HR_MANAGER || activeRole === USER_ROLES.ADMIN;
  const canLockAsAdmin = activeRole === USER_ROLES.ADMIN || activeRole === USER_ROLES.HR_MANAGER;

  const handleApplySubmit = (payload: SubmitLeavePayload) => {
    const start = new Date(payload.startDate).getTime();
    const end = new Date(payload.endDate).getTime();
    const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const newRequest: LeaveRequest = {
      id: `lvr-${Date.now()}`,
      tenantId: 'global-corp',
      employeeId: user?.id || 'emp-user',
      employeeName: user ? `${user.firstName} ${user.lastName}` : 'Current Employee',
      department: 'Engineering',
      category: payload.category,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalDays: diffDays,
      reason: payload.reason,
      status: LEAVE_STATUS.SUBMITTED,
      appliedDate: new Date().toISOString().split('T')[0],
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Update pending balance
    setBalances((prev) =>
      prev.map((b) =>
        b.category === payload.category ? { ...b, pendingDays: b.pendingDays + diffDays } : b
      )
    );
  };

  const handleDecisionSubmit = (payload: ApprovalDecisionPayload) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== payload.requestId) return req;

        let nextStatus: LeaveStatus = req.status;
        if (payload.decision === 'APPROVE') nextStatus = LEAVE_STATUS.MANAGER_APPROVED;
        if (payload.decision === 'VERIFY') nextStatus = LEAVE_STATUS.HR_VERIFIED;
        if (payload.decision === 'LOCK') nextStatus = LEAVE_STATUS.PAYROLL_LOCKED;
        if (payload.decision === 'REJECT') nextStatus = LEAVE_STATUS.REJECTED;

        return {
          ...req,
          status: nextStatus,
          managerComment: payload.decision === 'APPROVE' ? payload.comment || 'Approved' : req.managerComment,
          hrComment: payload.decision === 'VERIFY' ? payload.comment || 'Verified' : req.hrComment,
        };
      })
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Leave Approval Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual 4-stage state machine Kanban pipeline with automated policy verification.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsApplyModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Meters */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          Annual Allowance & Balance Breakdown
        </h2>
        <LeaveBalanceMeter balances={balances} />
      </div>

      {/* Kanban Workflow Board */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-indigo-400" /> State Machine Kanban Board
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Current Perspective: <span className="text-indigo-400 font-semibold">{activeRole}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const ColumnIcon = col.icon;
            const columnRequests = requests.filter((r) => r.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col space-y-4 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <ColumnIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-tight">
                        {col.title}
                      </h3>
                      <p className="text-[10px] text-slate-500">{col.subtitle}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                    {columnRequests.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3.5 flex-1">
                  {columnRequests.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-slate-800/80 text-slate-600 text-xs font-mono">
                      No requests in this stage
                    </div>
                  ) : (
                    columnRequests.map((req) => {
                      const isSubmitted = req.status === LEAVE_STATUS.SUBMITTED;
                      const isApproved = req.status === LEAVE_STATUS.MANAGER_APPROVED;
                      const isVerified = req.status === LEAVE_STATUS.HR_VERIFIED;

                      const showManagerAction = isSubmitted && canApproveAsManager;
                      const showHRAction = isApproved && canVerifyAsHR;
                      const showLockAction = isVerified && canLockAsAdmin;

                      return (
                        <Card
                          key={req.id}
                          className="p-4 bg-[#0d1322] border-slate-800 hover:border-indigo-500/40 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                                {req.employeeName[0]}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-100">
                                  {req.employeeName}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {req.department}
                                </span>
                              </div>
                            </div>
                            <Badge variant="indigo" size="sm">
                              {LEAVE_CATEGORY_LABELS[req.category]}
                            </Badge>
                          </div>

                          <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-indigo-400" /> Range:
                              </span>
                              <span className="text-slate-200">{req.startDate} ➔ {req.endDate}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Total Days:</span>
                              <span className="font-bold text-indigo-300">{req.totalDays} Days</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 italic">
                            &quot;{req.reason}&quot;
                          </p>

                          {/* Review Action Buttons */}
                          {(showManagerAction || showHRAction || showLockAction) && (
                            <div className="pt-2 border-t border-slate-800/80">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs py-1.5"
                                onClick={() => setSelectedDecisionRequest(req)}
                              >
                                Review Action
                              </Button>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Application Form Modal */}
      <LeaveRequestModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleApplySubmit}
      />

      {/* Decision Action Modal */}
      <ApprovalDecisionModal
        request={selectedDecisionRequest}
        isOpen={Boolean(selectedDecisionRequest)}
        onClose={() => setSelectedDecisionRequest(null)}
        onSubmit={handleDecisionSubmit}
      />
    </div>
  );
}
