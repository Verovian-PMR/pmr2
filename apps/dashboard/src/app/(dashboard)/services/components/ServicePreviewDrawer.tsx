"use client";

import Drawer from "./Drawer";
import type { ServiceMetadata, ServiceCategoryOption } from "../types";
import { findCategory } from "../types";

interface ServicePreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  service: ServiceMetadata | null;
  categories: ServiceCategoryOption[];
  onEdit: (service: ServiceMetadata) => void;
  onDuplicate: (service: ServiceMetadata) => void;
}

const STATUS_CONFIG = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "Draft", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  archived: { label: "Archived", cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
} as const;

export default function ServicePreviewDrawer({
  open,
  onClose,
  service,
  categories,
  onEdit,
  onDuplicate,
}: ServicePreviewDrawerProps) {
  if (!service) return null;

  const cat = findCategory(categories, service.categoryId);
  const statusCfg = STATUS_CONFIG[service.status];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(v: number | null, currency: string) {
    if (v === null) return "—";
    if (v === 0) return "Free";
    return `${currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "NGN" ? "₦" : ""}${v.toFixed(2)}`;
  }

  // ── Section component ──────────────────────────────────────────
  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-neutral-200" />
          <span>{title}</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </h4>
        <div className="space-y-2.5">{children}</div>
      </div>
    );
  }

  function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    if (!value || value === "—") return null;
    return (
      <div className="flex items-start gap-3">
        <span className="text-xs text-neutral-500 w-36 shrink-0 pt-0.5">{label}</span>
        <span className={`text-sm text-neutral-900 flex-1 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
      </div>
    );
  }

  function BoolField({ label, value }: { label: string; value: boolean }) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-500 w-36 shrink-0">{label}</span>
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${value ? "text-emerald-600" : "text-neutral-400"}`}>
          {value ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          )}
          {value ? "Yes" : "No"}
        </span>
      </div>
    );
  }

  const footer = (
    <div className="flex items-center justify-between">
      <p className="text-xs text-neutral-400">
        Created {formatDate(service.createdAt)}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onDuplicate(service)}
          className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => onEdit(service)}
          className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          Edit Service
        </button>
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={service.name}
      subtitle={`/services/${service.slug}`}
      width="max-w-xl"
      footer={footer}
      badge={
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusCfg.cls}`}>
          {statusCfg.label}
        </span>
      }
    >
      <div className="p-6">
        {/* ── Hero Summary ── */}
        <div className="bg-neutral-50 rounded-xl p-5 mb-6">
          <p className="text-sm text-neutral-700 leading-relaxed break-words overflow-hidden">{service.shortDescription}</p>
          <div className="flex items-center gap-4 mt-3">
            {cat && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cat.color}`}>
                {cat.name}
              </span>
            )}
            {service.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            )}
            {service.internalCode && (
              <span className="text-xs text-neutral-400 font-mono">{service.internalCode}</span>
            )}
          </div>
        </div>

        {/* ── Booking & Scheduling ── */}
        <Section title="Booking & Scheduling">
          <Field label="Duration" value={`${service.durationMinutes} minutes`} />
          <Field label="Buffer Time" value={service.bufferMinutes > 0 ? `${service.bufferMinutes} minutes` : null} />
          <Field label="Booking Window" value={`${service.bookingWindowDays} days`} />
          <Field label="Min Notice" value={`${service.minNoticeHours} hours`} />
          <Field label="Max Capacity" value={`${service.maxCapacityPerSlot} per slot`} />
          <BoolField label="Waitlist Enabled" value={service.allowWaitlist} />
          <Field label="Cancellation Policy" value={service.cancellationPolicy || null} />
        </Section>

        {/* ── Clinical & Eligibility ── */}
        <Section title="Clinical & Eligibility">
          <BoolField label="Requires Prescription" value={service.requiresPrescription} />
          <BoolField label="Consent Required" value={service.consentFormRequired} />
          <Field label="Age Range" value={
            service.ageMin || service.ageMax
              ? `${service.ageMin ?? "Any"} – ${service.ageMax ?? "Any"}`
              : null
          } />
          <Field label="Gender" value={service.genderRestriction !== "any" ? service.genderRestriction.charAt(0).toUpperCase() + service.genderRestriction.slice(1) : null} />
          <Field label="Pre-Appointment" value={service.preAppointmentInstructions || null} />
          {service.contraindicationsWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-amber-700">{service.contraindicationsWarning}</p>
              </div>
            </div>
          )}
        </Section>

        {/* ── Pricing ── */}
        <Section title="Pricing">
          <Field label="Public Price" value={formatPrice(service.pricePublic, service.currency)} />
          <Field label="Internal Cost" value={formatPrice(service.priceInternal, service.currency)} />
          {service.pricePublic !== null && service.priceInternal !== null && service.pricePublic > 0 && (
          <Field label="Margin" value={`£${(service.pricePublic - service.priceInternal).toFixed(2)} (${Math.round(((service.pricePublic - service.priceInternal) / service.pricePublic) * 100)}%)`} />
          )}
        </Section>

        {/* ── Operations ── */}
        <Section title="Operations">
          <Field label="Required Role" value={service.requiredRole !== "any" ? service.requiredRole.charAt(0).toUpperCase() + service.requiredRole.slice(1) : "Any Available"} />
          <Field label="Room / Location" value={service.roomLocation || null} />
          <Field label="Inventory Link" value={service.inventoryLink || null} mono />
          {service.internalNotes && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mt-2">
              <p className="text-xs text-neutral-500 font-medium mb-1">Internal Notes</p>
              <p className="text-xs text-neutral-700">{service.internalNotes}</p>
            </div>
          )}
        </Section>

        {/* ── SEO ── */}
        <Section title="SEO & Visibility">
          <Field label="URL Slug" value={`/services/${service.slug}`} mono />
          <Field label="Meta Title" value={service.metaTitle || null} />
          <Field label="Meta Description" value={service.metaDescription || null} />
          {service.keywords.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-neutral-500 w-36 shrink-0 pt-1">Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {service.keywords.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ── Audit ── */}
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Last updated {formatDate(service.updatedAt)}</span>
            <span>By {service.createdBy}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
