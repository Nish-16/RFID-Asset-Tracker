"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface Transaction {
  id: string;
  rfidUid: string;
  componentCode: string;
  studentName: string;
  componentName: string;
  issueTime: string;
  returnTime?: string;
  status: "issued" | "returned";
}

type FilterStatus = "all" | "issued" | "returned";

function timestampToString(val: any): string {
  if (!val) return "";
  // If it's a Firestore Timestamp object (has toDate method)
  if (typeof val.toDate === "function") {
    return val.toDate().toISOString();
  }
  // If it's already a string
  if (typeof val === "string") {
    return val;
  }
  return "";
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTime(val: string | undefined) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function TransactionTable() {
  const { profile, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (authLoading) return;

    // Student with no linked RFID card — show empty state
    if (!isAdmin && !profile?.rfidUid) {
      setLoading(false);
      return;
    }

    const q = isAdmin
      ? query(collection(db, "transactions"))
      : // Students: filter by their RFID uid
        query(
          collection(db, "transactions"),
          where("rfidUid", "==", profile!.rfidUid),
        );

    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          rfidUid: raw.rfidUid || "",
          componentCode: raw.componentCode || "",
          studentName: raw.studentName || "",
          componentName: raw.componentName || "",
          issueTime: timestampToString(raw.issueTime),
          returnTime: timestampToString(raw.returnTime),
          status: raw.status || "issued",
        } as Transaction;
      });
      // Sort by issueTime descending (client-side for all users)
      data = data.sort(
        (a, b) =>
          new Date(b.issueTime).getTime() - new Date(a.issueTime).getTime(),
      );
      setTransactions(data);
      setLoading(false);
    });

    return () => unsub();
  }, [authLoading, isAdmin, profile?.rfidUid]);

  const issuedCount = transactions.filter((t) => t.status === "issued").length;
  const returnedCount = transactions.filter(
    (t) => t.status === "returned",
  ).length;

  const filtered = transactions.filter((t) => {
    const matchesFilter = filter === "all" || t.status === filter;
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      t.studentName?.toLowerCase().includes(s) ||
      t.rfidUid?.toLowerCase().includes(s) ||
      t.componentName?.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  if (loading || authLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-500" />
          </div>
          <p className="text-sm text-slate-500">Connecting to live feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            {isAdmin ? "All Transactions" : "My Issued Components"}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {isAdmin
              ? "Live feed of every issuance and return across all students"
              : "Components currently issued to you or previously returned"}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total"
          value={transactions.length}
          iconClass="bg-slate-100 text-slate-600"
          valueClass="text-slate-800"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
              />
            </svg>
          }
        />
        <StatCard
          label="Issued"
          value={issuedCount}
          iconClass="bg-amber-50 text-amber-600"
          valueClass="text-amber-700"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7a6 6 0 11-8.485-8.486 6 6 0 018.486 8.485z"
              />
            </svg>
          }
        />
        <StatCard
          label="Returned"
          value={returnedCount}
          iconClass="bg-emerald-50 text-emerald-600"
          valueClass="text-emerald-700"
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder={
              isAdmin
                ? "Search name, UID, or component..."
                : "Search component..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {(["all", "issued", "returned"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState
            hasFilters={filter !== "all" || search !== ""}
            isAdmin={isAdmin}
            hasRfid={!!profile?.rfidUid}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {(isAdmin
                    ? [
                        "Student",
                        "RFID UID",
                        "Component",
                        "Status",
                        "Issue Time",
                        "Return Time",
                      ]
                    : ["Component", "Status", "Issue Time", "Return Time"]
                  ).map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-slate-50 transition-colors last:border-0 hover:bg-indigo-50/30 ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}
                  >
                    {isAdmin && (
                      <>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(t.studentName || "")}`}
                            >
                              {initials(t.studentName || "?")}
                            </div>
                            <span className="font-medium text-slate-800">
                              {t.studentName || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600">
                            {t.rfidUid || "—"}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {t.componentName || t.componentCode || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {t.status === "returned" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          Returned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/60">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                          Issued
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 tabular-nums">
                      {formatTime(t.issueTime)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 tabular-nums">
                      {formatTime(t.returnTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {filtered.length} of {transactions.length} transactions
          </span>
          {(filter !== "all" || search) && (
            <button
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="text-indigo-500 transition hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
  valueClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className={`mt-1.5 text-3xl font-bold tabular-nums ${valueClass}`}>
            {value}
          </p>
        </div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  isAdmin,
  hasRfid,
}: {
  hasFilters: boolean;
  isAdmin: boolean;
  hasRfid: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <svg
          className="h-6 w-6 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">
          No transactions found
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {hasFilters
            ? "Try a different search or filter"
            : !isAdmin && !hasRfid
              ? "Your account has no linked RFID card yet"
              : "Transactions will appear here in real-time"}
        </p>
      </div>
    </div>
  );
}
