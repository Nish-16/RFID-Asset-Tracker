"use client";

import Link from "next/link";
import {
  Wifi,
  Database,
  LayoutDashboard,
  RefreshCw,
  CreditCard,
  KeySquare,
  ArrowRight,
  Cpu,
  LogIn,
  CheckCircle,
  AlertCircle,
  Users,
  Clock,
  Zap,
  Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const LIVE_FEED = [
  { name: "Rahul S.", component: "Arduino UNO", status: "issued", time: "10:32 AM", avatar: "bg-violet-100 text-violet-700" },
  { name: "Priya K.", component: "Breadboard", status: "returned", time: "10:28 AM", avatar: "bg-blue-100 text-blue-700" },
  { name: "Amit R.", component: "Servo Motor", status: "issued", time: "10:15 AM", avatar: "bg-amber-100 text-amber-700" },
  { name: "Sneha M.", component: "LCD Display", status: "returned", time: "10:08 AM", avatar: "bg-rose-100 text-rose-700" },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const ctaHref = !loading && user ? "/dashboard" : "/login";
  const isLoggedIn = !loading && !!user;

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Wifi className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-slate-900">RFID Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hidden text-sm text-slate-500 transition hover:text-slate-800 sm:block">
              How it works
            </a>
            <Link
              href={ctaHref}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
            >
              {isLoggedIn ? "Go to Dashboard" : "Sign In"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero — asymmetric ── */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_0%_0%,_#eef2ff,_transparent)]" />

        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_400px]">

            {/* Left — text */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Lab component tracker
              </div>

              <h1 className="text-[2.75rem] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                Stop losing track of<br />
                <span className="text-indigo-600">who took what.</span>
              </h1>

              <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-500">
                No more paper registers. No more "I don't know who has the Arduino."
                Tap an RFID card — the system does the rest.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={ctaHref}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  {isLoggedIn ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isLoggedIn ? "Go to Dashboard" : "Start Tracking"}
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-5">
                {["RFID tap-to-identify", "Live Firebase sync", "No manual entry"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — fake live feed */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <span className="text-sm font-bold text-slate-800">Live Activity</span>
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </div>
                </div>
                <div className="divide-y divide-slate-50 px-5">
                  {LIVE_FEED.map((row, i) => (
                    <div key={i} className="flex items-center gap-3 py-3.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${row.avatar}`}>
                        {row.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{row.component}</p>
                        <p className="text-xs text-slate-400">{row.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          row.status === "issued" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {row.status}
                        </span>
                        <span className="text-[11px] tabular-nums text-slate-400">{row.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 px-5 py-3">
                  <p className="text-xs text-slate-400">Showing 4 of 48 transactions today</p>
                </div>
              </div>

              {/* Floating chip */}
              <div className="absolute -bottom-4 -left-5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                <p className="text-[11px] font-medium text-slate-400">Components out</p>
                <p className="text-2xl font-extrabold text-slate-900">
                  12 <span className="text-sm font-normal text-slate-400">/ 34</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Pain points — tight ── */}
      <section className="border-b border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: AlertCircle,
                problem: "Paper registers go missing",
                fix: "Everything is logged digitally, in real time, permanently.",
              },
              {
                icon: Users,
                problem: '"Who has the oscilloscope?"',
                fix: "Always know which student has which component, right now.",
              },
              {
                icon: Clock,
                problem: "Manual tracking wastes time",
                fix: "One tap. Done. No forms, no chasing, no spreadsheets.",
              },
            ].map(({ icon: Icon, problem, fix }) => (
              <div key={problem} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                  <Icon className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 line-through decoration-red-300 decoration-2">
                    {problem}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-700">{fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — asymmetric ── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="mb-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-500">What it does</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Handles the boring parts<br className="hidden sm:block" /> so the lab actually runs.
            </h2>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Big card */}
            <div className="flex shrink-0 flex-col justify-between rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-7 lg:w-72">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">RFID Identification</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Students tap their card. No typing, no login, no forms. The RC522 reader on the ESP32 picks up the card UID in under a second.
                </p>
              </div>
              <div className="mt-8 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-semibold text-slate-400">Identification time</p>
                <p className="text-3xl font-extrabold text-indigo-600">&lt; 1s</p>
              </div>
            </div>

            {/* 2×2 grid */}
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Database,
                  color: "bg-emerald-50 text-emerald-600",
                  title: "Real-Time Firebase Sync",
                  desc: "Every tap writes to Firestore. The dashboard updates without a single refresh.",
                },
                {
                  icon: RefreshCw,
                  color: "bg-amber-50 text-amber-600",
                  title: "Issue & Return Tracking",
                  desc: "The system knows when something went out and when it came back. Inventory stays accurate.",
                },
                {
                  icon: LayoutDashboard,
                  color: "bg-blue-50 text-blue-600",
                  title: "Role-Based Dashboard",
                  desc: "Admin sees everything. Students only see their own history. Clean and simple.",
                },
                {
                  icon: Package,
                  color: "bg-violet-50 text-violet-600",
                  title: "Component Inventory",
                  desc: "See what's available before you go to the lab. No more wasted trips.",
                },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works — left-aligned ── */}
      <section id="how-it-works" className="border-y border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">

            {/* Left */}
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-500">The flow</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Three steps.<br />Everything tracked.
              </h2>
              <p className="mt-4 text-slate-500">
                Runs on an ESP32 with an RFID reader and keypad. No app install needed on the student's side.
              </p>

              <div className="mt-8 space-y-7">
                {[
                  {
                    n: "1",
                    icon: CreditCard,
                    title: "Tap RFID card",
                    desc: "Student holds their card to the reader. System identifies who they are from the Firestore student database.",
                  },
                  {
                    n: "2",
                    icon: KeySquare,
                    title: "Enter component code",
                    desc: "Using the keypad, the student types the component code. System checks availability instantly.",
                  },
                  {
                    n: "3",
                    icon: Zap,
                    title: "Logged to cloud",
                    desc: "Transaction hits Firebase, inventory updates, and the web dashboard reflects it live — no human in the loop.",
                  },
                ].map(({ n, icon: Icon, title, desc }) => (
                  <div key={n} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-extrabold text-white">
                      {n}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-indigo-400" />
                        <h3 className="font-bold text-slate-900">{title}</h3>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hardware card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm lg:mt-14">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Hardware in this build
              </p>
              <div className="space-y-5">
                {[
                  { label: "ESP32 Dev Board", detail: "Main controller — handles Wi-Fi and Firebase communication" },
                  { label: "RC522 RFID Module", detail: "Reads student RFID cards and extracts the card UID" },
                  { label: "4×4 Matrix Keypad", detail: "Student enters component code for issuing or returning" },
                  { label: "16×2 LCD Display", detail: "Shows feedback — name recognized, action confirmed" },
                ].map(({ label, detail }) => (
                  <div key={label} className="flex gap-3 border-b border-slate-50 pb-5 last:border-0 last:pb-0">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stack — informal ── */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Stack</p>
              <p className="mt-0.5 text-xl font-extrabold text-slate-900">What this is built with</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "ESP32", cls: "bg-slate-100 text-slate-700" },
                { label: "RC522 RFID", cls: "bg-indigo-50 text-indigo-700" },
                { label: "Firebase", cls: "bg-amber-50 text-amber-700" },
                { label: "Next.js", cls: "bg-slate-800 text-slate-100" },
                { label: "Tailwind CSS", cls: "bg-cyan-50 text-cyan-700" },
              ].map(({ label, cls }) => (
                <span key={label} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold ${cls}`}>
                  <Cpu className="h-3.5 w-3.5 opacity-50" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — dark ── */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-block rounded-md bg-indigo-900/60 px-2.5 py-1 text-xs font-bold text-indigo-400">
                Prototype system
              </p>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                See it running live.
              </h2>
              <p className="mt-3 max-w-md text-slate-400">
                The dashboard pulls real data from Firebase. Log in as admin to see all transactions and manage components.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href={ctaHref}
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-400 active:scale-95"
              >
                {isLoggedIn ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {isLoggedIn ? "Go to Dashboard" : "Sign In to Dashboard"}
              </Link>
              <Link
                href="/inventory"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-7 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                <Package className="h-4 w-4" />
                Browse Inventory
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-5 sm:px-10">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <Wifi className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">RFID Asset Tracker</span>
            </div>
            <p className="text-xs text-slate-600">
              IoT prototype &mdash; ESP32 + RC522 + Firebase + Next.js
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
