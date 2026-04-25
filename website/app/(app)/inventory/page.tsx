"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface Component {
  id: string;
  code: string;
  name: string;
}

interface MergedComponent extends Component {
  issuedTo: string | null;
}

type FilterStatus = "all" | "available" | "issued";

function mergeData(
  components: Component[],
  issuedMap: Record<string, string>
): MergedComponent[] {
  return components.map((c) => ({
    ...c,
    issuedTo: issuedMap[c.code] ?? null,
  }));
}

export default function InventoryPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [issuedMap, setIssuedMap] = useState<Record<string, string>>({});
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "components"), (snap) => {
      setComponents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Component)));
      setLoadingComponents(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "transactions"), where("status", "==", "issued"));
    const unsub = onSnapshot(q, (snap) => {
      const map: Record<string, string> = {};
      snap.docs.forEach((doc) => {
        const d = doc.data();
        if (d.componentCode) map[d.componentCode] = d.studentName ?? "Unknown";
      });
      setIssuedMap(map);
      setLoadingTransactions(false);
    });
    return () => unsub();
  }, []);

  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const loading = loadingComponents || loadingTransactions;
  const merged = mergeData(components, issuedMap);
  const availableCount = merged.filter((c) => c.issuedTo === null).length;
  const issuedCount = merged.filter((c) => c.issuedTo !== null).length;

  const filtered = merged.filter((c) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && c.issuedTo === null) ||
      (filter === "issued" && c.issuedTo !== null);
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      c.name?.toLowerCase().includes(s) ||
      c.code?.toLowerCase().includes(s) ||
      c.issuedTo?.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <main className="w-full px-6 py-8 sm:px-10">
        <div className="flex min-h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-500" />
            </div>
            <p className="text-sm text-slate-500">Loading inventory...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-6 py-8 sm:px-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Component Inventory</h2>
          <p className="mt-0.5 text-sm text-slate-500">Real-time availability of all lab components</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Components" value={merged.length} iconClass="bg-slate-100 text-slate-600" valueClass="text-slate-800"
            icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
          />
          <StatCard label="Available" value={availableCount} iconClass="bg-emerald-50 text-emerald-600" valueClass="text-emerald-700"
            icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard label="Issued Out" value={issuedCount} iconClass="bg-amber-50 text-amber-600" valueClass="text-amber-700"
            icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search by name, code, or student..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(["all", "available", "issued"] as FilterStatus[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all ${filter === f ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >{f}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState hasFilters={filter !== "all" || search !== ""} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => <ComponentCard key={c.id} component={c} isAdmin={isAdmin} />)}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filtered.length} of {merged.length} components</span>
            {(filter !== "all" || search) && (
              <button onClick={() => { setFilter("all"); setSearch(""); }} className="text-indigo-500 hover:text-indigo-700 transition-colors">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ComponentCard({ component, isAdmin }: { component: MergedComponent; isAdmin: boolean }) {
  const available = component.issuedTo === null;
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${available ? "border-slate-200" : "border-amber-200/60"}`}>
      <div className={`h-1 w-full ${available ? "bg-emerald-400" : "bg-amber-400"}`} />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${available ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60" : "bg-amber-50 text-amber-700 ring-amber-200/60"}`}>
            {available ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            ) : (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            )}
            {available ? "Available" : "Issued"}
          </span>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${available ? "bg-slate-100" : "bg-amber-50"}`}>
            <svg className={`h-4 w-4 ${available ? "text-slate-500" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M3 8.25v7.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 15.75v-7.5A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25z" />
            </svg>
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 leading-snug">{component.name || "—"}</h3>
        <p className="mt-1 font-mono text-xs text-slate-500">{component.code || "—"}</p>
        {!available ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
            {isAdmin ? (
              <>
                <svg className="h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                <span className="truncate text-xs font-medium text-amber-800">{component.issuedTo}</span>
              </>
            ) : (
              <span className="text-xs font-medium text-amber-700">Currently checked out</span>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2">
            <p className="text-xs text-emerald-600 font-medium">Ready to issue</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, iconClass, valueClass }: { label: string; value: number; icon: React.ReactNode; iconClass: string; valueClass: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className={`mt-1.5 text-3xl font-bold tabular-nums ${valueClass}`}>{value}</p>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">No components found</p>
        <p className="mt-1 text-xs text-slate-400">{hasFilters ? "Try a different search or filter" : "Components will appear here once added to Firestore"}</p>
      </div>
    </div>
  );
}
