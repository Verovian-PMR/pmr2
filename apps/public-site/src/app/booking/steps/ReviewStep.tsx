"use client";

import type { BookingData } from "../types";

interface ReviewStepProps {
  data: BookingData;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-3.5 border-b border-neutral-100 last:border-b-0">
      <span className="text-sm text-neutral-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-right ml-4">{value || "—"}</span>
    </div>
  );
}

export default function ReviewStep({ data }: ReviewStepProps) {
  const dateFormatted = data.date
    ? new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const timeLabel = data.timeSlot?.label || "—";

  return (
    <div>
      <p className="text-neutral-500 text-sm mb-5">Please review your booking details before confirming.</p>

      <div className="bg-neutral-50 rounded-xl border border-neutral-200 px-5 py-1">
        <SummaryRow label="Service" value={data.service?.name || "—"} />
        <SummaryRow label="Duration" value={data.service ? `${data.service.duration} min` : "—"} />
        <SummaryRow label="Provider" value={data.provider?.name || "Any available"} />
        <SummaryRow label="Date" value={dateFormatted} />
        <SummaryRow label="Time" value={timeLabel} />
        <SummaryRow label="Patient" value={data.patientName} />
        <SummaryRow label="Email" value={data.patientEmail} />
        <SummaryRow label="Phone" value={data.patientPhone} />
        {data.insurance && <SummaryRow label="Insurance" value={data.insurance} />}
        {data.notes && <SummaryRow label="Notes" value={data.notes} />}
      </div>

      <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-start gap-2.5">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <span>
          By clicking <strong>Confirm Booking</strong>, you agree to our cancellation policy.
          You will receive a confirmation email at <strong>{data.patientEmail}</strong>.
        </span>
      </div>
    </div>
  );
}
