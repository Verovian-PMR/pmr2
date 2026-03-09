export interface Provider {
  id: string;
  name: string;
  title: string;
  color: string;         // Tailwind color key, e.g. "blue", "violet", "emerald"
  initials: string;
}

export interface DaySchedule {
  day: string;           // "Monday" | "Tuesday" | ...
  startTime: string;     // "09:00"
  endTime: string;       // "17:00"
  isOff: boolean;
}

export interface BlockedDate {
  id: string;
  date: string;          // "YYYY-MM-DD"
  reason: string;
}

export interface ProviderSchedule {
  providerId: string;
  weeklyHours: DaySchedule[];
  blockedDates: BlockedDate[];
  bufferMinutes: number; // buffer time between appointments (default 15)
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function createDefaultWeek(): DaySchedule[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    startTime: "09:00",
    endTime: "17:00",
    isOff: day === "Saturday" || day === "Sunday",
  }));
}

export const PROVIDER_COLORS: Record<string, { bg: string; text: string; border: string; ring: string; dot: string }> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-400",    ring: "ring-blue-500/20",    dot: "bg-blue-500" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-400",  ring: "ring-violet-500/20",  dot: "bg-violet-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-400", ring: "ring-emerald-500/20", dot: "bg-emerald-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-400",   ring: "ring-amber-500/20",   dot: "bg-amber-500" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-400",    ring: "ring-rose-500/20",    dot: "bg-rose-500" },
};
