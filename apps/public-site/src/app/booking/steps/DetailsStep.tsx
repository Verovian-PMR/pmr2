"use client";

import type { BookingData } from "../types";

interface DetailsStepProps {
  data: BookingData;
  onChange: (field: keyof BookingData, value: string) => void;
  errors: Record<string, string>;
}

const inputClass =
  "w-full px-3 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-colors";
const errorInputClass =
  "w-full px-3 py-3 border border-red-400 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-colors";

export default function DetailsStep({ data, onChange, errors }: DetailsStepProps) {
  return (
    <div>
      <p className="text-neutral-500 text-sm mb-5">Enter your contact information.</p>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="patientName" className="block text-sm font-semibold mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="patientName"
            type="text"
            placeholder="John Doe"
            value={data.patientName}
            onChange={(e) => onChange("patientName", e.target.value)}
            className={errors.patientName ? errorInputClass : inputClass}
          />
          {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="patientEmail" className="block text-sm font-semibold mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="patientEmail"
            type="email"
            placeholder="john@example.com"
            value={data.patientEmail}
            onChange={(e) => onChange("patientEmail", e.target.value)}
            className={errors.patientEmail ? errorInputClass : inputClass}
          />
          {errors.patientEmail && <p className="text-red-500 text-xs mt-1">{errors.patientEmail}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="patientPhone" className="block text-sm font-semibold mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="patientPhone"
            type="tel"
            placeholder="(555) 123-4567"
            value={data.patientPhone}
            onChange={(e) => onChange("patientPhone", e.target.value)}
            className={errors.patientPhone ? errorInputClass : inputClass}
          />
          {errors.patientPhone && <p className="text-red-500 text-xs mt-1">{errors.patientPhone}</p>}
        </div>

        {/* Insurance */}
        <div>
          <label htmlFor="insurance" className="block text-sm font-semibold mb-1.5">
            Insurance Provider <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            id="insurance"
            type="text"
            placeholder="Provider name"
            value={data.insurance}
            onChange={(e) => onChange("insurance", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold mb-1.5">
            Additional Notes <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Any allergies, special requirements, or questions..."
            value={data.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
