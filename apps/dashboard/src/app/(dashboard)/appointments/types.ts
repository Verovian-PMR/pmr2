export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled" | "no-show";

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceName: string;
  serviceId: string;
  providerId: string;
  providerName: string;
  providerColor: string; // Tailwind color key
  date: string;          // "YYYY-MM-DD"
  startTime: string;     // "HH:mm"
  endTime: string;       // "HH:mm"
  status: AppointmentStatus;
  notes: string;
}

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; bg: string; text: string; dot: string }> = {
  confirmed: { label: "Confirmed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending:   { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  completed: { label: "Completed", bg: "bg-blue-50",    text: "text-blue-700",     dot: "bg-blue-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-50",     text: "text-red-700",      dot: "bg-red-500" },
  "no-show": { label: "No Show",   bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-500" },
};

export const PROVIDER_DOT_COLORS: Record<string, string> = {
  blue:    "bg-blue-500",
  violet:  "bg-violet-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
};

export const PROVIDER_BG_COLORS: Record<string, string> = {
  blue:    "bg-blue-50 border-blue-200 text-blue-800",
  violet:  "bg-violet-50 border-violet-200 text-violet-800",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
  amber:   "bg-amber-50 border-amber-200 text-amber-800",
  rose:    "bg-rose-50 border-rose-200 text-rose-800",
};

export const PROVIDER_BORDER_COLORS: Record<string, string> = {
  blue:    "border-l-blue-500",
  violet:  "border-l-violet-500",
  emerald: "border-l-emerald-500",
  amber:   "border-l-amber-500",
  rose:    "border-l-rose-500",
};
