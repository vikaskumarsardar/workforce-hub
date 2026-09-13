'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm', className)}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3.5 font-semibold whitespace-nowrap', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40 text-slate-800 dark:text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    <span>Loading workforce records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                    <span className="font-medium text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5 whitespace-nowrap', col.className)}>
                      {col.render ? col.render(row, idx) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Showing {data.length} records</span>
        <div className="flex items-center space-x-2">
          <button
            disabled
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold">1</span>
          <button
            disabled
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
