"use client";

import { useEffect, useState } from "react";
import type { TimeSlot } from "../types";

interface ProviderScheduleData {
  weeklyHours: { day: string; startTime: string; endTime: string; isOff: boolean }[];
  blockedDates: { date: string; reason: string }[];
  bufferMinutes?: number;
}

interface BookedSlot {
  start: string; // ISO or "YYYY-MM-DDTHH:mm:00"
  end: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Convert an ISO/local time string to minutes since midnight. */
function toMinutes(timeStr: string): number {
  const d = new Date(timeStr);
  return d.getHours() * 60 + d.getMinutes();
}

/** Check if a candidate slot overlaps with any booked range (including buffer). */
function overlapsBooked(
  slotStartMin: number,
  slotEndMin: number,
  booked: { startMin: number; endMin: number }[],
): boolean {
  return booked.some(
    (b) => slotStartMin < b.endMin && slotEndMin > b.startMin,
  );
}

/** Generate time slots based on provider schedule, filtering out booked ranges. */
function generateSlots(
  dateStr: string,
  durationMin: number,
  schedule?: ProviderScheduleData,
  bookedSlots?: BookedSlot[],
): TimeSlot[] {
  if (!dateStr) return [];

  // Check blocked dates
  if (schedule?.blockedDates?.some((b) => b.date === dateStr)) return [];

  // Find working hours for this day of week
  const dayOfWeek = DAY_NAMES[new Date(`${dateStr}T00:00:00`).getDay()];
  const daySchedule = schedule?.weeklyHours?.find((d) => d.day === dayOfWeek);

  // If provider has schedule and this day is off, no slots
  if (daySchedule?.isOff) return [];

  // Parse start/end times (default 09:00–17:00)
  const startTimeStr = daySchedule?.startTime || "09:00";
  const endTimeStr = daySchedule?.endTime || "17:00";
  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Pre-compute booked ranges (with buffer applied) in minutes
  const buffer = schedule?.bufferMinutes ?? 15;
  const bookedRanges = (bookedSlots ?? []).map((b) => ({
    startMin: toMinutes(b.start),
    endMin: toMinutes(b.end) + buffer, // add buffer after each appointment
  }));

  const slots: TimeSlot[] = [];
  let currentMin = startMinutes;

  while (currentMin + durationMin <= endMinutes) {
    const h = Math.floor(currentMin / 60);
    const m = currentMin % 60;

    // Skip this slot if it overlaps with any booked appointment (+ buffer)
    if (!overlapsBooked(currentMin, currentMin + durationMin, bookedRanges)) {
      const start = new Date(`${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
      const end = new Date(start.getTime() + durationMin * 60_000);

      const label = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      slots.push({ start: start.toISOString(), end: end.toISOString(), label });
    }

    currentMin += durationMin;
  }

  return slots;
}

interface DateTimeStepProps {
  date: string;
  selectedSlot: TimeSlot | null;
  duration: number;
  providerId?: string;
  providerSchedule?: ProviderScheduleData;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: TimeSlot) => void;
}

export default function DateTimeStep({
  date,
  selectedSlot,
  duration,
  providerId,
  providerSchedule,
  onDateChange,
  onSlotSelect,
}: DateTimeStepProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Get today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split("T")[0];

  // Check if selected date is blocked
  const isBlocked = date && providerSchedule?.blockedDates?.some((b) => b.date === date);
  const blockedReason = isBlocked
    ? providerSchedule?.blockedDates?.find((b) => b.date === date)?.reason
    : null;

  // Fetch booked slots from API when provider + date change
  useEffect(() => {
    if (!providerId || !date) {
      setBookedSlots([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);

    fetch(`${API_URL}/appointments/booked-slots?providerId=${encodeURIComponent(providerId)}&date=${encodeURIComponent(date)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BookedSlot[]) => {
        if (!cancelled) setBookedSlots(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setBookedSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => { cancelled = true; };
  }, [providerId, date]);

  // Regenerate available slots when date, schedule, or booked slots change
  useEffect(() => {
    if (date && !loadingSlots) {
      setSlots(generateSlots(date, duration, providerSchedule, bookedSlots));
    } else {
      setSlots([]);
    }
  }, [date, duration, providerSchedule, bookedSlots, loadingSlots]);

  return (
    <div>
      <p className="text-neutral-500 text-sm mb-5">Pick a date and available time slot.</p>

      <div className="mb-6">
        <label htmlFor="booking-date" className="block text-sm font-semibold mb-2">
          Select Date
        </label>
        <input
          id="booking-date"
          type="date"
          min={today}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-3 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-colors"
        />
      </div>

      {date && (
        <div>
          <label className="block text-sm font-semibold mb-3">Available Time Slots</label>
          {isBlocked ? (
            <div className="text-center py-4">
              <p className="text-sm text-amber-600 font-medium">Provider unavailable on this date</p>
              {blockedReason && <p className="text-xs text-neutral-400 mt-1">{blockedReason}</p>}
            </div>
          ) : loadingSlots ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-sm text-neutral-400">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Checking availability...
              </div>
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">No slots available for this date.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => onSlotSelect(slot)}
                    className={`
                      py-2.5 px-2 border rounded-lg text-sm font-medium transition-all duration-150
                      ${isSelected
                        ? "bg-primary-500 text-white border-primary-500"
                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
                      }
                    `}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
