"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import TransactionTable from "@/components/TransactionTable";

export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/login");
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <main className="w-full px-6 py-8 sm:px-10">
      <TransactionTable />
    </main>
  );
}
