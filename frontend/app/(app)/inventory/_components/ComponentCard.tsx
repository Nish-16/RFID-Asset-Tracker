import { ComponentRow } from "./types";

export function ComponentCard({ row }: { row: ComponentRow }) {
  const available = row.availableCount > 0;
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        available ? "border-slate-200" : "border-amber-200/60"
      }`}
    >
      <div className={`h-1 w-full ${available ? "bg-emerald-400" : "bg-amber-400"}`} />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
              available
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
                : "bg-amber-50 text-amber-700 ring-amber-200/60"
            }`}
          >
            {available ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            )}
            {available ? "Available" : "Issued Out"}
          </span>
        </div>
        <h3 className="font-semibold leading-snug text-slate-900">{row.name || "—"}</h3>
        <p className="mt-1 font-mono text-xs text-slate-500">{row.code || "—"}</p>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            {row.availableCount} available
          </span>
          {row.issuedCount > 0 && (
            <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              {row.issuedCount} issued
            </span>
          )}
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
            {row.totalCount} total
          </span>
        </div>
      </div>
    </div>
  );
}
