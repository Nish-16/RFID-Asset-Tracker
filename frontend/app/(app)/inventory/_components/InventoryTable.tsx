"use client";

import React from "react";
import type { ComponentRow, IssuedEntry } from "./types";
import { EmptyState } from "./ui";

interface Props {
  rows: ComponentRow[];
  expandedRow: string | null;
  onToggleExpand: (id: string) => void;
  onReturn: (txId: string) => void;
  onIssue: (row: ComponentRow) => void;
  onAdjust: (row: ComponentRow, delta: number) => void;
}

export function InventoryTable({
  rows,
  expandedRow,
  onToggleExpand,
  onReturn,
  onIssue,
  onAdjust,
}: Props) {
  if (rows.length === 0) return <EmptyState hasFilters />;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Component
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Available
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Issued
            </th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              <ComponentRow
                row={row}
                expanded={expandedRow === row.id}
                onToggleExpand={() => row.issuedCount > 0 && onToggleExpand(row.id)}
                onIssue={() => onIssue(row)}
                onAdjust={(delta) => onAdjust(row, delta)}
              />
              {expandedRow === row.id && row.issuedTo.length > 0 && (
                <IssuedList entries={row.issuedTo} onReturn={onReturn} />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComponentRow({
  row,
  expanded,
  onToggleExpand,
  onIssue,
  onAdjust,
}: {
  row: ComponentRow;
  expanded: boolean;
  onToggleExpand: () => void;
  onIssue: () => void;
  onAdjust: (delta: number) => void;
}) {
  return (
    <tr className={`transition-colors ${expanded ? "bg-slate-50" : "hover:bg-slate-50/50"}`}>
      {/* Name + expand chevron */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleExpand}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
              row.issuedCount > 0
                ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                : "cursor-default text-transparent"
            }`}
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="font-mono text-xs text-slate-400">{row.code}</p>
          </div>
        </div>
      </td>

      {/* Total ± */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onAdjust(-1)}
            disabled={row.totalCount <= row.issuedCount || row.totalCount <= 1}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          <span className="w-6 text-center font-semibold tabular-nums text-slate-800">
            {row.totalCount}
          </span>
          <button
            onClick={() => onAdjust(1)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </td>

      {/* Available */}
      <td className="px-4 py-4 text-center">
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-semibold tabular-nums ${
            row.availableCount === 0
              ? "bg-red-50 text-red-600"
              : row.availableCount < row.totalCount
              ? "bg-amber-50 text-amber-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {row.availableCount}
        </span>
      </td>

      {/* Issued — click to expand */}
      <td className="px-4 py-4 text-center">
        {row.issuedCount > 0 ? (
          <button
            onClick={onToggleExpand}
            className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-0.5 text-xs font-semibold tabular-nums text-amber-700 transition-colors hover:bg-amber-100"
          >
            {row.issuedCount}
          </button>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>

      {/* Issue button */}
      <td className="px-5 py-4">
        <div className="flex justify-end">
          <button
            onClick={onIssue}
            disabled={row.availableCount === 0}
            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Issue
          </button>
        </div>
      </td>
    </tr>
  );
}

function IssuedList({
  entries,
  onReturn,
}: {
  entries: IssuedEntry[];
  onReturn: (txId: string) => void;
}) {
  return (
    <tr>
      <td colSpan={5} className="bg-amber-50/50 px-5 pb-4 pt-2">
        <div className="ml-9 space-y-2">
          <p className="mb-2 text-xs font-semibold text-amber-700">Currently Issued To</p>
          {entries.map((entry) => (
            <div
              key={entry.txId}
              className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{entry.studentName}</p>
                  <p className="text-xs text-slate-400">
                    {entry.issueTime
                      ? new Date(entry.issueTime).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onReturn(entry.txId)}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                Mark Returned
              </button>
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}
