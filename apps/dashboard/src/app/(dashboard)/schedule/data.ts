import type { ProviderSchedule } from "./types";
import { createDefaultWeek } from "./types";

export const DEMO_SCHEDULES: ProviderSchedule[] = [
  {
    providerId: "usr-1",
    weeklyHours: createDefaultWeek().map((d) =>
      d.day === "Wednesday" ? { ...d, startTime: "10:00", endTime: "18:00" } : d
    ),
    blockedDates: [
      { id: "bd-1", date: "2026-03-20", reason: "Annual leave" },
      { id: "bd-2", date: "2026-03-21", reason: "Annual leave" },
    ],
    bufferMinutes: 15,
  },
  {
    providerId: "usr-2",
    weeklyHours: createDefaultWeek().map((d) =>
      d.day === "Friday" ? { ...d, startTime: "09:00", endTime: "13:00" } : d
    ),
    blockedDates: [
      { id: "bd-3", date: "2026-03-25", reason: "Conference" },
    ],
    bufferMinutes: 15,
  },
  {
    providerId: "usr-3",
    weeklyHours: createDefaultWeek().map((d) =>
      d.day === "Monday" ? { ...d, startTime: "08:00", endTime: "16:00" } : d
    ),
    blockedDates: [
      { id: "bd-4", date: "2026-04-01", reason: "Training day" },
    ],
    bufferMinutes: 15,
  },
];
