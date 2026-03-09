"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { ProviderSchedule, DaySchedule, BlockedDate } from "./types";
import { PROVIDER_COLORS, createDefaultWeek } from "./types";
import { DEMO_SCHEDULES } from "./data";
import Drawer from "@/components/Drawer";
import ConfirmModal from "@/components/ConfirmModal";
import { useProviders } from "@/hooks/useProviders";
import { syncProvidersToApi } from "@/lib/syncProviders";

const SCHEDULES_KEY = "vivi_schedules";

// Simulated current user — in production this comes from auth context
interface CurrentUser {
  role: "admin" | "provider";
  providerId: string | null;
  name: string;
}

export default function SchedulePage() {
  const providers = useProviders();
  const [schedules, setSchedules] = useState<ProviderSchedule[]>(DEMO_SCHEDULES);
  const [selectedId, setSelectedId] = useState<string>("");
  const [schedHydrated, setSchedHydrated] = useState(false);

  // Load schedules from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SCHEDULES_KEY);
      if (stored) setSchedules(JSON.parse(stored));
    } catch {}
    setSchedHydrated(true);
  }, []);

  // Persist schedules + sync to API
  useEffect(() => {
    if (!schedHydrated) return;
    try { localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules)); } catch {}
    syncProvidersToApi();
  }, [schedules, schedHydrated]);

  // Auto-select first provider once loaded
  useEffect(() => {
    if (providers.length > 0 && (!selectedId || !providers.some((p) => p.id === selectedId))) {
      setSelectedId(providers[0].id);
    }
  }, [providers, selectedId]);

  // Auto-create default schedule for new providers that don’t have one
  useEffect(() => {
    const missing = providers.filter((p) => !schedules.some((s) => s.providerId === p.id));
    if (missing.length > 0) {
      setSchedules((prev) => [
        ...prev,
        ...missing.map((p) => ({ providerId: p.id, weeklyHours: createDefaultWeek(), blockedDates: [], bufferMinutes: 15 })),
      ]);
    }
  }, [providers, schedules]);

  // Derive demo role-switcher entries from providers
  const demoUsers = useMemo<CurrentUser[]>(() => [
    { role: "admin", providerId: null, name: "Admin User" },
    ...providers.map((p) => ({ role: "provider" as const, providerId: p.id, name: p.name })),
  ], [providers]);

  const [currentUser, setCurrentUser] = useState<CurrentUser>({ role: "admin", providerId: null, name: "Admin User" });

  // Permission: can the current user edit the selected provider's schedule?
  const canEdit =
    currentUser.role === "admin" || currentUser.providerId === selectedId;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Blocked-date form
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const selectedProvider = providers.find((p) => p.id === selectedId) ?? providers[0];
  const selectedSchedule = schedules.find((s) => s.providerId === selectedId) ?? { providerId: selectedId, weeklyHours: createDefaultWeek(), blockedDates: [], bufferMinutes: 15 };
  const colors = PROVIDER_COLORS[selectedProvider?.color] ?? PROVIDER_COLORS.blue;

  if (!selectedProvider) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500 text-sm">
        No active providers. Add users in Settings first.
      </div>
    );
  }

  // ── Schedule Mutations ────────────────────────────────────────
  const updateDaySchedule = useCallback(
    (dayIndex: number, patch: Partial<DaySchedule>) => {
      setSchedules((prev) =>
        prev.map((s) =>
          s.providerId === selectedId
            ? {
                ...s,
                weeklyHours: s.weeklyHours.map((d, i) =>
                  i === dayIndex ? { ...d, ...patch } : d
                ),
              }
            : s
        )
      );
    },
    [selectedId]
  );

  const addBlockedDate = useCallback(() => {
    if (!newBlockDate) return;
    const bd: BlockedDate = {
      id: `bd-${Date.now()}`,
      date: newBlockDate,
      reason: newBlockReason.trim() || "Blocked",
    };
    setSchedules((prev) =>
      prev.map((s) =>
        s.providerId === selectedId
          ? { ...s, blockedDates: [...s.blockedDates, bd] }
          : s
      )
    );
    setNewBlockDate("");
    setNewBlockReason("");
  }, [selectedId, newBlockDate, newBlockReason]);

  const removeBlockedDate = useCallback(
    (bdId: string) => {
      setSchedules((prev) =>
        prev.map((s) =>
          s.providerId === selectedId
            ? { ...s, blockedDates: s.blockedDates.filter((b) => b.id !== bdId) }
            : s
        )
      );
      setDeleteTarget(null);
    },
    [selectedId]
  );

  const inputCls =
    "px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors";

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Schedule & Availability</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage provider working hours, days off, and blocked dates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Demo role switcher */}
          <select
            value={demoUsers.findIndex((u) => u.name === currentUser.name && u.role === currentUser.role)}
            onChange={(e) => setCurrentUser(demoUsers[parseInt(e.target.value)] ?? demoUsers[0])}
            className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            {demoUsers.map((u, i) => (
              <option key={i} value={i}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {providers.length} Provider{providers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ── Provider List (Left) ── */}
        <div className="col-span-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">Providers</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Select a provider to view or edit their schedule.</p>
            </div>
            <div className="divide-y divide-neutral-100">
              {providers.map((prov) => {
                const pc = PROVIDER_COLORS[prov.color] ?? PROVIDER_COLORS.blue;
                const isSelected = prov.id === selectedId;
                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setSelectedId(prov.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all ${
                      isSelected
                        ? `${pc.bg} border-l-[3px] ${pc.border}`
                        : "border-l-[3px] border-transparent hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${pc.dot} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {prov.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${isSelected ? pc.text : "text-neutral-800"} truncate`}>
                        {prov.name}
                      </p>
                      <p className="text-xs text-neutral-500">{prov.title}</p>
                    </div>
                    {isSelected && (
                      <svg className={`w-4 h-4 shrink-0 ${pc.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Schedule Detail (Right) ── */}
        <div className="col-span-8 space-y-6">
          {/* Provider info bar */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${colors.dot} flex items-center justify-center text-white text-sm font-bold`}>
                {selectedProvider.initials}
              </div>
              <div>
                <p className={`text-sm font-semibold ${colors.text}`}>{selectedProvider.name}</p>
                <p className="text-xs text-neutral-500">{selectedProvider.title}</p>
              </div>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                Edit Schedule
              </button>
            )}
            {!canEdit && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-500 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                View Only
              </span>
            )}
          </div>

          {/* Weekly Hours */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
            <div className="px-5 py-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">Weekly Hours</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Standard working hours for each day of the week.</p>
            </div>
            <div className="divide-y divide-neutral-100">
              {selectedSchedule.weeklyHours.map((d, idx) => (
                <div key={d.day} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-24 text-sm font-medium text-neutral-700">{d.day}</span>
                  {d.isOff ? (
                    <span className="flex-1 text-sm text-neutral-400 italic">Day off</span>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {d.startTime}
                      </span>
                      <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                      </svg>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {d.endTime}
                      </span>
                      <span className="text-xs text-neutral-400 ml-2">
                        {(() => {
                          const [sh, sm] = d.startTime.split(":").map(Number);
                          const [eh, em] = d.endTime.split(":").map(Number);
                          const hrs = eh - sh + (em - sm) / 60;
                          return `${hrs}h`;
                        })()}
                      </span>
                    </div>
                  )}
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => updateDaySchedule(idx, { isOff: !d.isOff })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        !d.isOff ? "bg-primary-500" : "bg-neutral-300"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                        !d.isOff ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  ) : (
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full opacity-40 cursor-not-allowed ${
                      !d.isOff ? "bg-primary-500" : "bg-neutral-300"
                    }`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm ${
                        !d.isOff ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blocked Dates */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Blocked Dates</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Days when this provider is unavailable for booking.</p>
              </div>
              <span className="text-xs text-neutral-400">
                {selectedSchedule.blockedDates.length} blocked
              </span>
            </div>

            {/* Add form — only shown if user can edit */}
            {canEdit && <div className="flex items-end gap-3 px-5 py-3 bg-neutral-50/50 border-b border-neutral-100">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Date</label>
                <input
                  type="date"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Reason</label>
                <input
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="e.g., Annual leave, Training"
                  className={`${inputCls} w-full`}
                />
              </div>
              <button
                type="button"
                onClick={addBlockedDate}
                disabled={!newBlockDate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
              </button>
            </div>}

            {/* List */}
            <div className="divide-y divide-neutral-100">
              {selectedSchedule.blockedDates.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-neutral-400">No blocked dates. This provider is available every working day.</p>
                </div>
              ) : (
                selectedSchedule.blockedDates
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((bd) => (
                    <div key={bd.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800">
                            {new Date(bd.date + "T00:00:00").toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-neutral-500">{bd.reason}</p>
                        </div>
                      </div>
                      {canEdit && <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: bd.id, name: `${bd.date} \u2014 ${bd.reason}` })}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Schedule Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Edit Schedule \u2014 ${selectedProvider.name}`}
        subtitle="Adjust working hours for each day"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          {selectedSchedule.weeklyHours.map((d, idx) => (
            <div
              key={d.day}
              className={`flex items-center gap-4 p-3.5 rounded-lg border transition-colors ${
                d.isOff ? "bg-neutral-50 border-neutral-200" : `${colors.bg} ${colors.border}`
              }`}
            >
              <div className="w-24">
                <p className="text-sm font-medium text-neutral-700">{d.day}</p>
              </div>

              <button
                type="button"
                onClick={() => updateDaySchedule(idx, { isOff: !d.isOff })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  !d.isOff ? "bg-primary-500" : "bg-neutral-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                  !d.isOff ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>

              {d.isOff ? (
                <span className="text-sm text-neutral-400 italic">Day off</span>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={d.startTime}
                    onChange={(e) => updateDaySchedule(idx, { startTime: e.target.value })}
                    className={`${inputCls} w-[120px]`}
                  />
                  <span className="text-neutral-400 text-xs">to</span>
                  <input
                    type="time"
                    value={d.endTime}
                    onChange={(e) => updateDaySchedule(idx, { endTime: e.target.value })}
                    className={`${inputCls} w-[120px]`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Drawer>

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeBlockedDate(deleteTarget.id)}
        title="Remove Blocked Date"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
