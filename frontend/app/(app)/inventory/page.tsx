"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

import { ComponentType, ComponentRow, IssuedEntry, Filter } from "./_components/types";
import { StatCard, EmptyState, Spinner } from "./_components/ui";
import { InventoryTable } from "./_components/InventoryTable";
import { ComponentCard } from "./_components/ComponentCard";
import { AddComponentModal } from "./_components/AddComponentModal";
import { IssueModal } from "./_components/IssueModal";

export default function InventoryPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [components, setComponents] = useState<ComponentType[]>([]);
  const [issuedMap, setIssuedMap] = useState<Record<string, IssuedEntry[]>>({});
  const [loadingC, setLoadingC] = useState(true);
  const [loadingT, setLoadingT] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [issueModal, setIssueModal] = useState<ComponentRow | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "components"), (snap) => {
      setComponents(
        snap.docs.map((d) => ({
          id: d.id,
          code: (d.data().code as string) ?? d.id,
          name: (d.data().name as string) ?? "",
          totalCount: (d.data().totalCount as number) ?? 1,
        }))
      );
      setLoadingC(false);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "transactions"), where("status", "==", "issued"));
    return onSnapshot(q, (snap) => {
      const map: Record<string, IssuedEntry[]> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const code = data.componentCode as string;
        if (!code) return;
        if (!map[code]) map[code] = [];
        map[code].push({
          txId: d.id,
          studentName: (data.studentName as string) ?? "Unknown",
          uid: (data.uid as string) ?? "",
          issueTime: (data.issueTime as string) ?? "",
        });
      });
      setIssuedMap(map);
      setLoadingT(false);
    });
  }, []);

  const rows: ComponentRow[] = components.map((c) => {
    const issued = issuedMap[c.code] ?? [];
    return {
      ...c,
      issuedCount: issued.length,
      availableCount: Math.max(0, c.totalCount - issued.length),
      issuedTo: issued,
    };
  });

  const totalTypes = rows.length;
  const totalUnits = rows.reduce((s, r) => s + r.totalCount, 0);
  const availableUnits = rows.reduce((s, r) => s + r.availableCount, 0);
  const issuedUnits = rows.reduce((s, r) => s + r.issuedCount, 0);

  const filtered = rows.filter((r) => {
    const matchFilter =
      filter === "all" ||
      (filter === "available" && r.availableCount > 0) ||
      (filter === "issued" && r.issuedCount > 0);
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      r.name.toLowerCase().includes(s) ||
      r.code.toLowerCase().includes(s) ||
      r.issuedTo.some((e) => e.studentName.toLowerCase().includes(s));
    return matchFilter && matchSearch;
  });

  async function handleReturn(txId: string) {
    await updateDoc(doc(db, "transactions", txId), {
      status: "returned",
      returnTime: new Date().toISOString(),
    });
  }

  async function handleAdjust(component: ComponentRow, delta: number) {
    const next = Math.max(component.issuedCount, component.totalCount + delta);
    await updateDoc(doc(db, "components", component.id), { totalCount: next });
  }

  if (loadingC || loadingT) return <Spinner />;

  const hasFilters = filter !== "all" || search !== "";

  return (
    <main className="w-full px-6 py-8 sm:px-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              Component Inventory
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isAdmin
                ? "Manage quantities, issue and return lab components"
                : "Real-time availability of all lab components"}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Component
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Component Types" value={totalTypes} variant="slate" />
          <StatCard label="Total Units" value={totalUnits} variant="slate" />
          <StatCard label="Available" value={availableUnits} variant="emerald" />
          <StatCard label="Issued Out" value={issuedUnits} variant="amber" />
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search components or students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(["all", "available", "issued"] as Filter[]).map((f) => (
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

        {/* Content */}
        {isAdmin ? (
          <InventoryTable
            rows={filtered}
            expandedRow={expandedRow}
            onToggleExpand={(id) => setExpandedRow(expandedRow === id ? null : id)}
            onReturn={handleReturn}
            onIssue={(row) => setIssueModal(row)}
            onAdjust={handleAdjust}
          />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r) => (
              <ComponentCard key={r.id} row={r} />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filtered.length} of {rows.length} component types</span>
            {hasFilters && (
              <button
                onClick={() => { setFilter("all"); setSearch(""); }}
                className="text-indigo-500 transition-colors hover:text-indigo-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {addModal && <AddComponentModal onClose={() => setAddModal(false)} />}
      {issueModal && <IssueModal component={issueModal} onClose={() => setIssueModal(null)} />}
    </main>
  );
}
