"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Appointment, AppointmentStatus } from "./types";
import { STATUS_CONFIG, PROVIDER_DOT_COLORS, PROVIDER_BG_COLORS, PROVIDER_BORDER_COLORS } from "./types";
import { DEMO_APPOINTMENTS } from "./data";
import Drawer from "@/components/Drawer";
import { useProviders } from "@/hooks/useProviders";

const APPOINTMENTS_KEY = "vivi_appointments";

type ViewMode = "calendar" | "table";
type CalendarView = "monthly" | "weekly" | "daily";

// ── Helpers ─────────────────────────────────────────────────────
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  return d;
}

function fmt(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fmtDisplay(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 08:00 – 17:00

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_KEY);
      if (stored) setAppointments(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage (skip initial default write) + sync to API
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments)); } catch {}
    // Sync to API so booking form can check booked slots
    import("@/lib/syncAppointments").then(({ syncAppointmentsToApi }) => syncAppointmentsToApi()).catch(() => {});
  }, [appointments, hydrated]);

  const providers = useProviders();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [calView, setCalView] = useState<CalendarView>("monthly");

  // Current month navigation
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(2); // March = 2 (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Drawer
  const [drawerApt, setDrawerApt] = useState<Appointment | null>(null);
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [reassignToast, setReassignToast] = useState<string | null>(null);

  // Table filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProvider, setFilterProvider] = useState<string>("all");

  // ── Reassignment ─────────────────────────────────────────────
  const reassign = useCallback((aptId: string, newProviderId: string) => {
    const prov = providers.find((p) => p.id === newProviderId);
    if (!prov) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === aptId
          ? { ...a, providerId: prov.id, providerName: prov.name, providerColor: prov.color }
          : a
      )
    );
    setDrawerApt((prev) =>
      prev?.id === aptId
        ? { ...prev, providerId: prov.id, providerName: prov.name, providerColor: prov.color }
        : prev
    );
    setReassignToast(prov.name);
    setTimeout(() => setReassignToast(null), 2500);
  }, [providers]);

  // ── Month calendar data ──────────────────────────────────────
  const monthDays = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
    const cells: { date: string; day: number; inMonth: boolean }[] = [];

    // Previous month padding
    const prevTotal = daysInMonth(viewYear, viewMonth - 1);
    for (let i = offset - 1; i >= 0; i--) {
      const d = prevTotal - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, inMonth: false });
    }

    // Current month
    for (let d = 1; d <= total; d++) {
      cells.push({ date: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, inMonth: true });
    }

    // Next month padding
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, inMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  // ── Week data ─────────────────────────────────────────────────
  const weekDates = useMemo(() => {
    const base = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date(viewYear, viewMonth, 1);
    const start = startOfWeek(base);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return fmt(d);
    });
  }, [selectedDate, viewYear, viewMonth]);

  // ── Appointments for a date ──────────────────────────────────
  const aptsForDate = useCallback(
    (date: string) => appointments.filter((a) => a.date === date),
    [appointments]
  );

  // ── Filtered (table view) ────────────────────────────────────
  const filtered = useMemo(() => {
    let list = appointments;
    if (filterStatus !== "all") list = list.filter((a) => a.status === filterStatus);
    if (filterProvider !== "all") list = list.filter((a) => a.providerId === filterProvider);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.patientName.toLowerCase().includes(q) || a.serviceName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [appointments, filterStatus, filterProvider, search]);

  const today = fmt(new Date());
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function openDateDrawer(date: string) {
    setSelectedDate(date);
    setDateDrawerOpen(true);
  }

  // ── Status badge ──────────────────────────────────────────────
  function StatusBadge({ status }: { status: AppointmentStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  // ── Appointment Card (for drawers) ────────────────────────────
  function AptCard({ apt, showReassign = false }: { apt: Appointment; showReassign?: boolean }) {
    const borderCls = PROVIDER_BORDER_COLORS[apt.providerColor] ?? "border-l-neutral-400";
    return (
      <div
        className={`border-l-[3px] ${borderCls} bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-sm transition-shadow cursor-pointer`}
        onClick={() => setDrawerApt(apt)}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900">{apt.patientName}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{apt.serviceName}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-neutral-600 font-medium">{apt.startTime} – {apt.endTime}</span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500">{apt.providerName}</span>
            </div>
          </div>
          <StatusBadge status={apt.status} />
        </div>
        {showReassign && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Reassign to</label>
            <select
              value={apt.providerId}
              onChange={(e) => { e.stopPropagation(); reassign(apt.id, e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Appointments</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            View and manage all patient appointments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                viewMode === "calendar" ? "bg-primary-500 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3.5 py-2 text-xs font-medium transition-colors ${
                viewMode === "table" ? "bg-primary-500 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M12 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M21.375 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M12 17.25v-5.25" />
              </svg>
              Table
            </button>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200">
            {appointments.length} total
          </span>
        </div>
      </div>

      {/* ════════════════ CALENDAR VIEW ════════════════ */}
      {viewMode === "calendar" && (
        <div>
          {/* Calendar controls */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm mb-6">
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <h3 className="text-sm font-semibold text-neutral-900 min-w-[160px] text-center">{monthLabel}</h3>
                <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
              {/* Sub-view toggle */}
              <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
                {(["monthly", "weekly", "daily"] as CalendarView[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCalView(v)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      calView === v ? "bg-primary-500 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Monthly Grid ── */}
            {calView === "monthly" && (
              <div className="p-3">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-neutral-400 uppercase tracking-wider py-2">{d}</div>
                  ))}
                </div>
                {/* Cells */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((cell) => {
                    const dayApts = aptsForDate(cell.date);
                    const isToday = cell.date === today;
                    const isSelected = cell.date === selectedDate;
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        onClick={() => openDateDrawer(cell.date)}
                        className={`relative min-h-[72px] p-1.5 rounded-lg text-left transition-all border ${
                          isSelected
                            ? "border-primary-400 bg-primary-50/50 ring-2 ring-primary-500/20"
                            : isToday
                              ? "border-primary-300 bg-primary-50/30"
                              : cell.inMonth
                                ? "border-transparent hover:bg-neutral-50 hover:border-neutral-200"
                                : "border-transparent opacity-40"
                        }`}
                      >
                        <span className={`text-xs font-medium ${
                          isToday ? "text-primary-700" : cell.inMonth ? "text-neutral-700" : "text-neutral-400"
                        }`}>
                          {cell.day}
                        </span>
                        {dayApts.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {dayApts.slice(0, 3).map((a) => (
                              <span
                                key={a.id}
                                className={`w-2 h-2 rounded-full ${PROVIDER_DOT_COLORS[a.providerColor] ?? "bg-neutral-400"}`}
                                title={`${a.patientName} — ${a.serviceName}`}
                              />
                            ))}
                            {dayApts.length > 3 && (
                              <span className="text-[9px] text-neutral-500 font-medium ml-0.5">+{dayApts.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Weekly Grid ── */}
            {calView === "weekly" && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-neutral-200">
                    <div className="p-2" />
                    {weekDates.map((d) => {
                      const isToday = d === today;
                      return (
                        <div
                          key={d}
                          className={`p-2 text-center border-l border-neutral-200 ${
                            isToday ? "bg-primary-50/50" : ""
                          }`}
                        >
                          <p className="text-[10px] font-semibold text-neutral-400 uppercase">
                            {new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" })}
                          </p>
                          <p className={`text-sm font-medium ${isToday ? "text-primary-700" : "text-neutral-700"}`}>
                            {new Date(d + "T00:00:00").getDate()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Hour rows */}
                  {HOURS.map((hr) => (
                    <div key={hr} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-neutral-100">
                      <div className="p-2 text-right pr-3">
                        <span className="text-[10px] text-neutral-400">{String(hr).padStart(2, "0")}:00</span>
                      </div>
                      {weekDates.map((d) => {
                        const hrStr = String(hr).padStart(2, "0");
                        const apts = aptsForDate(d).filter((a) => a.startTime.startsWith(hrStr));
                        return (
                          <div
                            key={d}
                            className="border-l border-neutral-200 min-h-[48px] p-0.5 cursor-pointer hover:bg-neutral-50/50 transition-colors"
                            onClick={() => openDateDrawer(d)}
                          >
                            {apts.map((a) => {
                              const bgCls = PROVIDER_BG_COLORS[a.providerColor] ?? "bg-neutral-50 border-neutral-200 text-neutral-800";
                              return (
                                <div
                                  key={a.id}
                                  className={`text-[10px] px-1.5 py-1 rounded border mb-0.5 truncate ${bgCls}`}
                                  title={`${a.patientName} — ${a.startTime}`}
                                >
                                  {a.patientName.split(" ")[0]} · {a.startTime}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Daily View ── */}
            {calView === "daily" && (
              <div className="p-4">
                <p className="text-sm font-semibold text-neutral-700 mb-3">
                  {selectedDate ? fmtDisplay(selectedDate) : fmtDisplay(today)}
                </p>
                <div className="space-y-3">
                  {aptsForDate(selectedDate || today).length === 0 ? (
                    <p className="text-sm text-neutral-400 text-center py-8">No appointments on this date.</p>
                  ) : (
                    aptsForDate(selectedDate || today).map((a) => (
                      <AptCard key={a.id} apt={a} showReassign />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Provider legend */}
          <div className="flex items-center gap-4">
            {providers.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${PROVIDER_DOT_COLORS[p.color] ?? "bg-neutral-400"}`} />
                <span className="text-xs text-neutral-600">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ TABLE VIEW ════════════════ */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          {/* Filters */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-200">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search patient or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="all">All providers</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="text-xs text-neutral-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50">
                  <th className="text-left font-medium text-neutral-500 px-5 py-3">Patient</th>
                  <th className="text-left font-medium text-neutral-500 px-5 py-3">Service</th>
                  <th className="text-left font-medium text-neutral-500 px-5 py-3">Provider</th>
                  <th className="text-left font-medium text-neutral-500 px-5 py-3">Date</th>
                  <th className="text-left font-medium text-neutral-500 px-5 py-3">Time</th>
                  <th className="text-left font-medium text-neutral-500 px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((apt) => {
                  const dotCls = PROVIDER_DOT_COLORS[apt.providerColor] ?? "bg-neutral-400";
                  return (
                    <tr
                      key={apt.id}
                      className="hover:bg-neutral-50/50 transition-colors cursor-pointer"
                      onClick={() => setDrawerApt(apt)}
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-neutral-800">{apt.patientName}</p>
                        <p className="text-xs text-neutral-400">{apt.patientEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-neutral-700">{apt.serviceName}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dotCls}`} />
                          <span className="text-neutral-700">{apt.providerName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{fmtDisplay(apt.date)}</td>
                      <td className="px-5 py-3 text-neutral-600 font-mono text-xs">{apt.startTime} – {apt.endTime}</td>
                      <td className="px-5 py-3"><StatusBadge status={apt.status} /></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                      No appointments match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ DATE DRAWER (calendar click) ════════════════ */}
      <Drawer
        open={dateDrawerOpen}
        onClose={() => setDateDrawerOpen(false)}
        title={selectedDate ? fmtDisplay(selectedDate) : "Appointments"}
        subtitle={`${selectedDate ? aptsForDate(selectedDate).length : 0} appointment(s)`}
        width="max-w-lg"
      >
        <div className="p-5 space-y-3">
          {selectedDate && aptsForDate(selectedDate).length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">No appointments on this date.</p>
          ) : (
            selectedDate &&
            aptsForDate(selectedDate)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((a) => <AptCard key={a.id} apt={a} showReassign />)
          )}
        </div>
      </Drawer>

      {/* Reassign success toast */}
      {reassignToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg animate-[fadeIn_0.2s_ease-out]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">Reassigned to {reassignToast}</span>
        </div>
      )}

      {/* ════════════════ APPOINTMENT DETAIL DRAWER ════════════════ */}
      <Drawer
        open={!!drawerApt}
        onClose={() => setDrawerApt(null)}
        title="Appointment Details"
        subtitle={drawerApt?.patientName}
        width="max-w-lg"
        badge={drawerApt ? <StatusBadge status={drawerApt.status} /> : undefined}
      >
        {drawerApt && (
          <div className="p-6 space-y-5">
            {/* Patient info */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Patient</h4>
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-500">Name</span>
                  <span className="text-sm font-medium text-neutral-800">{drawerApt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-500">Email</span>
                  <span className="text-sm text-neutral-700">{drawerApt.patientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-500">Phone</span>
                  <span className="text-sm text-neutral-700">{drawerApt.patientPhone}</span>
                </div>
              </div>
            </div>

            {/* Appointment info */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Appointment</h4>
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-500">Service</span>
                  <span className="text-sm font-medium text-neutral-800">{drawerApt.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-500">Date</span>
                  <span className="text-sm text-neutral-700">{fmtDisplay(drawerApt.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-500">Time</span>
                  <span className="text-sm text-neutral-700 font-mono">{drawerApt.startTime} – {drawerApt.endTime}</span>
                </div>
                {drawerApt.notes && (
                  <div className="flex justify-between">
                    <span className="text-xs text-neutral-500">Notes</span>
                    <span className="text-sm text-neutral-700">{drawerApt.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reassignment */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Provider</h4>
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-3 h-3 rounded-full ${PROVIDER_DOT_COLORS[drawerApt.providerColor] ?? "bg-neutral-400"}`} />
                  <span className="text-sm font-medium text-neutral-800">{drawerApt.providerName}</span>
                </div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Reassign to a different provider</label>
                <select
                  value={drawerApt.providerId}
                  onChange={(e) => reassign(drawerApt.id, e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
