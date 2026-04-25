"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="bg-white">
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      <header className="border-b border-slate-200/80">
        <div className="w-full px-6 sm:px-10">
          <div className="flex items-center gap-4 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.212c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 leading-tight tracking-tight">
                  RFID Asset Tracker
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Smart component issuance &amp; tracking
                </p>
              </div>
            </Link>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
              {/* Live badge */}
              <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-700">Live</span>
              </div>

              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-2">
                      {/* Role + name chip */}
                      {profile?.role === "admin" ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5">
                          <Shield className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="text-xs font-semibold text-indigo-700">Admin</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          <span className="max-w-[120px] truncate text-xs font-medium text-slate-700">
                            {profile?.name || user.email}
                          </span>
                        </div>
                      )}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Login
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex gap-1 -mb-px">
            {NAV.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </div>
  );
}
