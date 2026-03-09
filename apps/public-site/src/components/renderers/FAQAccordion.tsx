"use client";

import { useState } from "react";

interface Props {
  config: Record<string, unknown>;
}

const DEMO_FAQS = [
  { q: "Do I need an appointment for a flu vaccination?", a: "While walk-ins are welcome, we recommend booking online to guarantee your preferred time slot and minimise waiting." },
  { q: "How long does a pharmacist consultation take?", a: "Consultations typically last 15–30 minutes depending on the service. You'll receive a confirmation email with your appointment duration." },
  { q: "Is there a charge for blood pressure checks?", a: "Blood pressure monitoring is free of charge. No appointment necessary — simply visit during opening hours." },
  { q: "Can I cancel or reschedule my appointment?", a: "Yes. You can cancel or reschedule from your confirmation email up to 2 hours before your appointment time." },
  { q: "Do you offer home delivery for prescriptions?", a: "Yes, we offer same-day delivery within a 5-mile radius. Ask at the counter or select delivery when booking online." },
];

export default function FAQAccordion({ config }: Props) {
  const bgColor = (config.bgColor as string) || "#FFFFFF";
  const headerColor = (config.headerColor as string) || "#0F52BA";
  const textColor = (config.textColor as string) || "#424242";
  const borderRadius = Number(config.borderRadius) || 12;
  const padding = Number(config.padding) || 32;

  const configItems = Array.isArray(config.items) ? (config.items as { q: string; a: string }[]) : [];
  const faqs = configItems.length > 0 ? configItems : DEMO_FAQS;

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section style={{ backgroundColor: bgColor, padding: `${padding}px 0` }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: headerColor }}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="border border-neutral-200 overflow-hidden transition-shadow"
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  style={{ color: headerColor }}
                >
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: textColor }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
