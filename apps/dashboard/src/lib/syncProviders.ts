import type { User, StaffRole } from "@/app/(dashboard)/settings/types";
import { DEFAULT_USERS, DEFAULT_STAFF_ROLES } from "@/app/(dashboard)/settings/types";
import type { ProviderSchedule } from "@/app/(dashboard)/schedule/types";
import { createDefaultWeek } from "@/app/(dashboard)/schedule/types";
import { DEMO_SCHEDULES } from "@/app/(dashboard)/schedule/data";

const USERS_KEY = "vivi_users";
const ROLES_KEY = "vivi_staff_roles";
const SCHEDULES_KEY = "vivi_schedules";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface ProviderPayload {
  id: string;
  name: string;
  title: string;
  schedule: {
    weeklyHours: { day: string; startTime: string; endTime: string; isOff: boolean }[];
    blockedDates: { date: string; reason: string }[];
    bufferMinutes: number;
  };
}

/**
 * Reads users, roles, and schedules from localStorage,
 * derives the provider list, and PATCHes it to the API
 * so the public-site booking wizard can fetch it.
 */
export async function syncProvidersToApi(): Promise<void> {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);
    const rawRoles = localStorage.getItem(ROLES_KEY);
    const rawSchedules = localStorage.getItem(SCHEDULES_KEY);

    const users: User[] = rawUsers ? JSON.parse(rawUsers) : DEFAULT_USERS;
    const roles: StaffRole[] = rawRoles ? JSON.parse(rawRoles) : DEFAULT_STAFF_ROLES;
    const schedules: ProviderSchedule[] = rawSchedules ? JSON.parse(rawSchedules) : DEMO_SCHEDULES;

    const roleMap: Record<string, string> = {};
    roles.forEach((r) => { roleMap[r.id] = r.name; });

    const payload: ProviderPayload[] = users
      .filter((u) => u.status === "active")
      .map((u) => {
        const sched = schedules.find((s) => s.providerId === u.id);
        return {
          id: u.id,
          name: u.name,
          title: roleMap[u.roleId] || u.roleId,
          schedule: {
            weeklyHours: sched?.weeklyHours ?? createDefaultWeek(),
            blockedDates: (sched?.blockedDates ?? []).map((b) => ({ date: b.date, reason: b.reason })),
            bufferMinutes: sched?.bufferMinutes ?? 15,
          },
        };
      });

    await fetch(`${API_URL}/providers-data`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently fail — API may be unavailable
  }
}
