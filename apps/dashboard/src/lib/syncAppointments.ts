import type { Appointment } from "@/app/(dashboard)/appointments/types";
import { DEMO_APPOINTMENTS } from "@/app/(dashboard)/appointments/data";

const APPOINTMENTS_KEY = "vivi_appointments";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Reads appointments from localStorage and PATCHes them to the API
 * so the public-site booking wizard can query booked slots.
 */
export async function syncAppointmentsToApi(): Promise<void> {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    const appointments: Appointment[] = raw ? JSON.parse(raw) : DEMO_APPOINTMENTS;

    await fetch(`${API_URL}/appointments-data`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointments),
    });
  } catch {
    // Silently fail — API may be unavailable
  }
}
