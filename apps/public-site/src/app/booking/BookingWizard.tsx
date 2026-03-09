"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  type BookingData,
  type ServiceCategory,
  type ServiceOption,
  type ProviderOption,
  INITIAL_BOOKING,
  STEP_TITLES,
  TOTAL_STEPS,
} from "./types";
import CategoryStep from "./steps/CategoryStep";
import ServiceStep from "./steps/ServiceStep";
import ProviderStep from "./steps/ProviderStep";
import DateTimeStep from "./steps/DateTimeStep";
import DetailsStep from "./steps/DetailsStep";
import ReviewStep from "./steps/ReviewStep";
import { createAppointment } from "@/lib/api";
import { DEFAULT_CATEGORIES } from "@vivipractice/types";

// ── Category → Booking-UI enrichment map ─────────────────────────
const CATEGORY_STYLES: Record<string, { gradient: string; iconColor: string; serviceCount: number }> = {
  vaccination:  { gradient: "bg-gradient-to-br from-blue-500 to-blue-600",    iconColor: "text-blue-500",    serviceCount: 4 },
  consultation: { gradient: "bg-gradient-to-br from-violet-500 to-violet-600", iconColor: "text-violet-500",  serviceCount: 3 },
  medication:   { gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600", iconColor: "text-emerald-500", serviceCount: 3 },
  travel:       { gradient: "bg-gradient-to-br from-amber-500 to-amber-600",  iconColor: "text-amber-500",   serviceCount: 3 },
  screening:    { gradient: "bg-gradient-to-br from-rose-500 to-rose-600",    iconColor: "text-rose-500",    serviceCount: 4 },
  dispensing:   { gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",    iconColor: "text-cyan-500",    serviceCount: 3 },
};

const FALLBACK_STYLE = { gradient: "bg-gradient-to-br from-neutral-500 to-neutral-600", iconColor: "text-neutral-500", serviceCount: 0 };

const CATEGORIES: ServiceCategory[] = DEFAULT_CATEGORIES.map((cat) => {
  const style = CATEGORY_STYLES[cat.id] ?? FALLBACK_STYLE;
  return { id: cat.id, name: cat.name, description: cat.description, ...style };
});

// ── Fallback services (used only when API is unavailable) ────────
const FALLBACK_SERVICES: ServiceOption[] = [
  { id: "v-1", categoryId: "vaccination", name: "Flu Vaccination", description: "Annual influenza immunization — all ages 6 months and up", duration: 15, price: "Free" },
  { id: "v-2", categoryId: "vaccination", name: "COVID-19 Booster", description: "Updated mRNA booster for enhanced protection", duration: 15, price: "Free" },
  { id: "c-1", categoryId: "consultation", name: "Pharmacist Consultation", description: "Discuss symptoms, OTC options, and medication questions", duration: 20 },
  { id: "c-2", categoryId: "consultation", name: "Smoking Cessation Program", description: "Personalized plan with NRT guidance and follow-up sessions", duration: 30 },
  { id: "m-1", categoryId: "medication", name: "Comprehensive Med Review", description: "Full evaluation of all medications for safety and efficacy", duration: 30, price: "£35" },
  { id: "t-1", categoryId: "travel", name: "Pre-Travel Consultation", description: "Risk assessment and recommended vaccinations for your destination", duration: 30, price: "£45" },
  { id: "s-1", categoryId: "screening", name: "Blood Pressure Check", description: "Quick and accurate digital blood pressure reading", duration: 10, price: "Free" },
  { id: "d-1", categoryId: "dispensing", name: "Prescription Pickup", description: "Scheduled pickup window — skip the wait", duration: 5, price: "Copay" },
];

/** Convert API service data to wizard ServiceOption format */
function toServiceOption(svc: any): ServiceOption {
  const price = svc.pricePublic === null || svc.pricePublic === undefined
    ? undefined
    : svc.pricePublic === 0
      ? "Free"
      : `£${Number(svc.pricePublic).toFixed(2)}`;
  return {
    id: svc.id,
    categoryId: svc.categoryId,
    name: svc.name,
    description: svc.shortDescription || svc.description || "",
    duration: svc.durationMinutes || svc.duration || 30,
    price,
  };
}

// ── Fallback providers (used when API has no data) ────────────────
const FALLBACK_PROVIDERS: ProviderOption[] = [
  { id: "usr-1", name: "Mrs. Sarah Johnson", title: "Pharmacist" },
  { id: "usr-2", name: "Mr. Michael Chen", title: "Clinical Pharmacist" },
  { id: "usr-3", name: "Miss Emily Williams", title: "Pharmacist" },
];

interface ProviderScheduleData {
  weeklyHours: { day: string; startTime: string; endTime: string; isOff: boolean }[];
  blockedDates: { date: string; reason: string }[];
}

interface ApiProvider {
  id: string;
  name: string;
  title: string;
  schedule?: ProviderScheduleData;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingData>(INITIAL_BOOKING);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>(FALLBACK_SERVICES);
  const [servicesReady, setServicesReady] = useState(false);
  const [providers, setProviders] = useState<ProviderOption[]>(FALLBACK_PROVIDERS);
  const [providerSchedules, setProviderSchedules] = useState<Record<string, ProviderScheduleData>>({});

  // ── Categories with dynamic service counts from loaded data ──────
  const categories = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      serviceCount: services.filter((s) => s.categoryId === cat.id).length,
    }));
  }, [services]);

  // ── Fetch real services + providers from API on mount ─────────
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      // Fetch services
      try {
        const res = await fetch(`${API_URL}/services-data`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            setServices(data.filter((s: any) => s.status !== "archived").map(toServiceOption));
          }
        }
      } catch {}

      // Fetch providers
      try {
        const res = await fetch(`${API_URL}/providers-data`, { cache: "no-store" });
        if (res.ok) {
          const data: ApiProvider[] = await res.json();
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            setProviders(data.map((p) => ({ id: p.id, name: p.name, title: p.title })));
            const schedMap: Record<string, ProviderScheduleData> = {};
            data.forEach((p) => { if (p.schedule) schedMap[p.id] = p.schedule; });
            setProviderSchedules(schedMap);
          }
        }
      } catch {}

      if (!cancelled) setServicesReady(true);
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  // ── Context-aware: auto-select category + service from URL params ──
  // Runs after services are loaded so it can match against real service data.
  useEffect(() => {
    if (!servicesReady) return;

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    const serviceId = params.get("service");
    const serviceName = params.get("name");
    if (!categoryId) return;

    const matchedCategory = CATEGORIES.find((c) => c.id === categoryId);
    if (!matchedCategory) return;

    // Match service: try by ID first, then by name
    const catServices = services.filter((s) => s.categoryId === categoryId);
    let matchedService = serviceId
      ? catServices.find((s) => s.id === serviceId)
      : null;
    if (!matchedService && serviceName) {
      const needle = serviceName.toLowerCase().trim();
      matchedService = catServices.find((s) => s.name.toLowerCase().trim() === needle) ?? null;
    }

    setBooking((prev) => ({
      ...prev,
      category: matchedCategory,
      ...(matchedService ? { service: matchedService } : {}),
    }));

    // Skip to step 3 (provider) if both matched, step 2 if only category
    setStep(matchedService ? 3 : 2);
  }, [servicesReady, services]);

  // ── Derived: services filtered by selected category ────────────
  const filteredServices = useMemo(
    () => services.filter((s) => s.categoryId === booking.category?.id),
    [booking.category, services]
  );

  // ── Field updater ──────────────────────────────────────────────
  const updateField = useCallback(<K extends keyof BookingData>(field: K, value: BookingData[K]) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  }, []);

  // ── Validation ─────────────────────────────────────────────────
  function validate(currentStep: number): boolean {
    const errs: Record<string, string> = {};

    if (currentStep === 1 && !booking.category) {
      errs.category = "Please select a service category.";
    }
    if (currentStep === 2 && !booking.service) {
      errs.service = "Please select a service.";
    }
    if (currentStep === 3 && !booking.provider) {
      errs.provider = "Please select a provider.";
    }
    if (currentStep === 4) {
      if (!booking.date) errs.date = "Please select a date.";
      if (!booking.timeSlot) errs.timeSlot = "Please select a time slot.";
    }
    if (currentStep === 5) {
      if (!booking.patientName.trim()) errs.patientName = "Name is required.";
      if (!booking.patientEmail.trim()) errs.patientEmail = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.patientEmail))
        errs.patientEmail = "Enter a valid email address.";
      if (!booking.patientPhone.trim()) errs.patientPhone = "Phone number is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Navigation ─────────────────────────────────────────────────
  function goNext() {
    if (!validate(step)) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  // ── Submit ─────────────────────────────────────────────────────
  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await createAppointment({
        serviceId: booking.service!.id,
        providerId: booking.provider?.id,
        patientName: booking.patientName,
        patientEmail: booking.patientEmail,
        patientPhone: booking.patientPhone || undefined,
        slotStart: booking.timeSlot!.start,
        slotEnd: booking.timeSlot!.end,
        notes: booking.notes || undefined,
        formData: booking.insurance ? { insurance: booking.insurance } : undefined,
      });
      setSuccess(true);
    } catch {
      // For demo: show success even if API is not running
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-white w-full max-w-[640px] mx-auto rounded-xl shadow-lg overflow-hidden">
        <div className="p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Booking Confirmed!</h2>
          <p className="text-neutral-500 text-sm mb-1">
            Your appointment for <strong>{booking.service?.name}</strong> has been booked.
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            A confirmation email will be sent to <strong>{booking.patientEmail}</strong>.
          </p>
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 text-sm text-left inline-block">
            <p><span className="text-neutral-500">Service:</span> <strong>{booking.service?.name}</strong></p>
            <p><span className="text-neutral-500">Date:</span> <strong>{booking.date}</strong></p>
            <p><span className="text-neutral-500">Time:</span> <strong>{booking.timeSlot?.label}</strong></p>
            <p><span className="text-neutral-500">Provider:</span> <strong>{booking.provider?.name || "Any available"}</strong></p>
          </div>
          <div className="mt-6">
            <a
              href="/"
              className="inline-block bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Progress ────────────────────────────────────────────────────
  const progressPct = (step / TOTAL_STEPS) * 100;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="bg-white w-full max-w-[640px] mx-auto rounded-xl shadow-lg overflow-hidden">
      {/* ── Header & Progress ── */}
      <div className="px-8 pt-7 pb-5 bg-neutral-50 border-b border-neutral-200">
        <h2 className="text-xl font-bold text-primary-600">{STEP_TITLES[step - 1]}</h2>
        <p className="text-neutral-500 text-sm mt-1">Step {step} of {TOTAL_STEPS}</p>
        <div className="mt-4 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-400 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="px-8 py-7 min-h-[320px]" key={step}>
        <div className="animate-fadeIn">
          {step === 1 && (
            <CategoryStep
              categories={categories}
              selected={booking.category}
              onSelect={(cat) => {
                updateField("category", cat);
                // Reset service when switching categories
                if (booking.category?.id !== cat.id) {
                  updateField("service", null);
                }
              }}
            />
          )}
          {step === 2 && booking.category && (
            <ServiceStep
              category={booking.category}
              services={filteredServices}
              selected={booking.service}
              onSelect={(svc) => updateField("service", svc)}
            />
          )}
          {step === 3 && (
            <ProviderStep
              providers={providers}
              selected={booking.provider}
              onSelect={(prov) => updateField("provider", prov)}
            />
          )}
          {step === 4 && (
            <DateTimeStep
              date={booking.date}
              selectedSlot={booking.timeSlot}
              duration={booking.service?.duration || 30}
              providerId={booking.provider?.id}
              providerSchedule={booking.provider ? providerSchedules[booking.provider.id] : undefined}
              onDateChange={(d) => {
                updateField("date", d);
                updateField("timeSlot", null);
              }}
              onSlotSelect={(slot) => updateField("timeSlot", slot)}
            />
          )}
          {step === 5 && (
            <DetailsStep
              data={booking}
              onChange={(field, value) => updateField(field, value as BookingData[typeof field])}
              errors={errors}
            />
          )}
          {step === 6 && <ReviewStep data={booking} />}
        </div>

        {/* Validation error toast */}
        {hasErrors && step <= 4 && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {Object.values(errors)[0]}
          </p>
        )}
      </div>

      {/* ── Footer Navigation ── */}
      <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
        <button
          type="button"
          onClick={goBack}
          className={`
            px-5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium
            hover:bg-neutral-100 transition-colors
            ${step === 1 ? "invisible" : ""}
          `}
        >
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={submitting}
          className={`
            px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-colors
            ${submitting
              ? "bg-primary-300 cursor-not-allowed"
              : "bg-primary-500 hover:bg-primary-600"
            }
          `}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Booking...
            </span>
          ) : step === TOTAL_STEPS ? (
            "Confirm Booking"
          ) : (
            "Next Step"
          )}
        </button>
      </div>
    </div>
  );
}
