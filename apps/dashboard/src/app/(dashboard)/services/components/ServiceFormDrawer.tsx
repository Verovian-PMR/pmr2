"use client";

import { useState, useCallback, useEffect } from "react";
import Drawer from "./Drawer";
import ImageDropzone from "./ImageDropzone";
import {
  type ServiceMetadata,
  type ServiceCategoryOption,
  FORM_STEPS,
  createEmptyService,
} from "../types";
import type { StaffRole } from "../../settings/types";
import type { InventoryItem } from "../../inventory/types";

type FormData = Omit<ServiceMetadata, "id" | "pharmacyId" | "createdAt" | "updatedAt" | "createdBy">;

interface ServiceFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData, status: "active" | "draft") => void;
  /** Pass existing service for edit mode */
  editService?: ServiceMetadata | null;
  /** Dynamic category list managed from the page */
  categories: ServiceCategoryOption[];
  /** Dynamic staff roles from Settings */
  roles: StaffRole[];
  /** Inventory items from Inventory tab */
  inventoryItems: InventoryItem[];
}

const TOTAL_STEPS = FORM_STEPS.length;

export default function ServiceFormDrawer({
  open,
  onClose,
  onSave,
  editService,
  categories,
  roles,
  inventoryItems,
}: ServiceFormDrawerProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(createEmptyService());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keywordInput, setKeywordInput] = useState("");

  // Populate form on edit
  useEffect(() => {
    if (editService) {
      const { id, pharmacyId, createdAt, updatedAt, createdBy, ...rest } = editService;
      setForm(rest);
    } else {
      setForm(createEmptyService());
    }
    setStep(1);
    setErrors({});
    setKeywordInput("");
  }, [editService, open]);

  // ── Field helpers ──────────────────────────────────────────────
  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  }, []);

  // Auto-generate slug from name
  const handleNameChange = useCallback((value: string) => {
    updateField("name", value);
    if (!editService) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      updateField("slug", slug);
    }
  }, [updateField, editService]);

  // ── Validation ─────────────────────────────────────────────────
  function validate(currentStep: number): boolean {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.name.trim()) errs.name = "Service name is required.";
      if (!form.categoryId) errs.categoryId = "Please select a category.";
      if (!form.shortDescription.trim()) errs.shortDescription = "Short description is required.";
      if (form.shortDescription.length > 150) errs.shortDescription = "Max 150 characters.";
    }
    if (currentStep === 2) {
      if (!form.durationMinutes || form.durationMinutes < 1) errs.durationMinutes = "Duration must be at least 1 minute.";
    }
    if (currentStep === 6) {
      if (!form.slug.trim()) errs.slug = "URL slug is required.";
      if (form.metaDescription && form.metaDescription.length > 160) errs.metaDescription = "Max 160 characters.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Navigation ─────────────────────────────────────────────────
  function goNext() {
    if (!validate(step)) return;
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function goToStep(target: number) {
    // Allow going back freely, validate going forward
    if (target < step) {
      setStep(target);
    } else {
      // Validate all steps between current and target
      for (let s = step; s < target; s++) {
        if (!validate(s)) return;
      }
      setStep(target);
    }
  }

  function handleSave(status: "active" | "draft") {
    if (status === "active") {
      // Validate step 1 (required fields) before publishing
      if (!validate(1)) {
        setStep(1);
        return;
      }
    }
    onSave({ ...form, status }, status);
  }

  // ── Keyword management ─────────────────────────────────────────
  function addKeyword() {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !form.keywords.includes(kw)) {
      updateField("keywords", [...form.keywords, kw]);
    }
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    updateField("keywords", form.keywords.filter((k) => k !== kw));
  }

  // ── Shared field components ────────────────────────────────────
  const inputCls = "w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors";
  const labelCls = "block text-sm font-medium text-neutral-700 mb-1.5";
  const errorCls = "text-xs text-red-600 mt-1";
  const helpCls = "text-xs text-neutral-400 mt-1";

  function FieldError({ field }: { field: string }) {
    return errors[field] ? <p className={errorCls}>{errors[field]}</p> : null;
  }

  // ── Step 1: Basic Information ──────────────────────────────────
  function renderStep1() {
    return (
      <div className="space-y-5">
        {/* Service Name */}
        <div>
          <label className={labelCls}>Service Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Flu Vaccination"
            className={inputCls}
          />
          <FieldError field="name" />
        </div>

        {/* Internal Code */}
        <div>
          <label className={labelCls}>Internal Code</label>
          <input
            type="text"
            value={form.internalCode}
            onChange={(e) => updateField("internalCode", e.target.value)}
            placeholder="e.g., VAC-FLU-01"
            className={inputCls}
          />
          <p className={helpCls}>SKU or internal reference for your team.</p>
        </div>

        {/* Category */}
        <div>
          <label className={labelCls}>Category <span className="text-red-500">*</span></label>
          <select
            value={form.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className={inputCls}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <FieldError field="categoryId" />
        </div>

        {/* Short Description */}
        <div>
          <label className={labelCls}>Short Description <span className="text-red-500">*</span></label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            placeholder="1-2 sentences for cards and search results"
            rows={2}
            maxLength={150}
            className={inputCls + " resize-none"}
          />
          <div className="flex items-center justify-between">
            <FieldError field="shortDescription" />
            <p className={helpCls}>{form.shortDescription.length}/150</p>
          </div>
        </div>

        {/* Full Description */}
        <div>
          <label className={labelCls}>Full Description</label>
          <textarea
            value={form.fullDescriptionHtml}
            onChange={(e) => updateField("fullDescriptionHtml", e.target.value)}
            placeholder="Detailed service description (supports HTML)"
            rows={5}
            className={inputCls + " resize-none"}
          />
          <p className={helpCls}>Supports HTML formatting. This appears on the service detail page.</p>
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <div className="flex gap-3">
            {(["active", "draft", "archived"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateField("status", s)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium border transition-all
                  ${form.status === s
                    ? s === "active"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : s === "draft"
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-neutral-100 border-neutral-300 text-neutral-600"
                    : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  }
                `}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Booking & Scheduling ───────────────────────────────
  function renderStep2() {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Duration (mins) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => updateField("durationMinutes", parseInt(e.target.value) || 0)}
              className={inputCls}
            />
            <FieldError field="durationMinutes" />
          </div>
          <div>
            <label className={labelCls}>Buffer Time (mins)</label>
            <input
              type="number"
              min={0}
              value={form.bufferMinutes}
              onChange={(e) => updateField("bufferMinutes", parseInt(e.target.value) || 0)}
              className={inputCls}
            />
            <p className={helpCls}>Prep/cleanup between slots.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Booking Window (days)</label>
            <input
              type="number"
              min={1}
              value={form.bookingWindowDays}
              onChange={(e) => updateField("bookingWindowDays", parseInt(e.target.value) || 1)}
              className={inputCls}
            />
            <p className={helpCls}>How far in advance users can book.</p>
          </div>
          <div>
            <label className={labelCls}>Min Notice (hours)</label>
            <input
              type="number"
              min={0}
              value={form.minNoticeHours}
              onChange={(e) => updateField("minNoticeHours", parseInt(e.target.value) || 0)}
              className={inputCls}
            />
            <p className={helpCls}>Minimum time before slot starts.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Max Capacity / Slot</label>
            <input
              type="number"
              min={1}
              value={form.maxCapacityPerSlot}
              onChange={(e) => updateField("maxCapacityPerSlot", parseInt(e.target.value) || 1)}
              className={inputCls}
            />
            <p className={helpCls}>Useful for group sessions.</p>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowWaitlist}
                onChange={(e) => updateField("allowWaitlist", e.target.checked)}
                className="w-4.5 h-4.5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/20"
              />
              <span className="text-sm text-neutral-700">Enable waitlist</span>
            </label>
          </div>
        </div>

        <div>
          <label className={labelCls}>Cancellation Policy</label>
          <textarea
            value={form.cancellationPolicy}
            onChange={(e) => updateField("cancellationPolicy", e.target.value)}
            placeholder="e.g., 24-hour cancellation notice required"
            rows={2}
            className={inputCls + " resize-none"}
          />
        </div>
      </div>
    );
  }

  // ── Step 3: Clinical & Eligibility ─────────────────────────────
  function renderStep3() {
    return (
      <div className="space-y-5">
        {/* Toggle Row */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-neutral-700">Requires Prescription</p>
              <p className="text-xs text-neutral-400">Triggers file upload in the booking form</p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.requiresPrescription ? "bg-primary-500" : "bg-neutral-300"}`}
              onClick={() => updateField("requiresPrescription", !form.requiresPrescription)}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.requiresPrescription ? "translate-x-5" : ""}`} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-neutral-700">Consent Form Required</p>
              <p className="text-xs text-neutral-400">Triggers digital signature step</p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.consentFormRequired ? "bg-primary-500" : "bg-neutral-300"}`}
              onClick={() => updateField("consentFormRequired", !form.consentFormRequired)}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.consentFormRequired ? "translate-x-5" : ""}`} />
            </div>
          </label>
        </div>

        {/* Age Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Minimum Age</label>
            <input
              type="number"
              min={0}
              value={form.ageMin ?? ""}
              onChange={(e) => updateField("ageMin", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="No minimum"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Maximum Age</label>
            <input
              type="number"
              min={0}
              value={form.ageMax ?? ""}
              onChange={(e) => updateField("ageMax", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="No maximum"
              className={inputCls}
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className={labelCls}>Gender Restriction</label>
          <div className="flex gap-3">
            {(["any", "male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => updateField("genderRestriction", g)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium border transition-all
                  ${form.genderRestriction === g
                    ? "bg-primary-50 border-primary-300 text-primary-700"
                    : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  }
                `}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-Appointment Instructions */}
        <div>
          <label className={labelCls}>Pre-Appointment Instructions</label>
          <textarea
            value={form.preAppointmentInstructions}
            onChange={(e) => updateField("preAppointmentInstructions", e.target.value)}
            placeholder="e.g., Fast for 8 hours, Bring insurance card"
            rows={2}
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Contraindications */}
        <div>
          <label className={labelCls}>Contraindications Warning</label>
          <textarea
            value={form.contraindicationsWarning}
            onChange={(e) => updateField("contraindicationsWarning", e.target.value)}
            placeholder="e.g., Not suitable for pregnant women"
            rows={2}
            className={inputCls + " resize-none"}
          />
          <p className={helpCls}>Displayed as a warning to patients during booking.</p>
        </div>
      </div>
    );
  }

  // ── Step 4: Display & Media ──────────────────────────────
  function renderStep4() {
    return (
      <div className="space-y-5">
        {/* Featured toggle */}
        <div className="bg-neutral-50 rounded-xl p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-neutral-700">Featured Service</p>
              <p className="text-xs text-neutral-400">Appears in featured components on the public site</p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.isFeatured ? "bg-primary-500" : "bg-neutral-300"}`}
              onClick={() => updateField("isFeatured", !form.isFeatured)}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isFeatured ? "translate-x-5" : ""}`} />
            </div>
          </label>
        </div>

        {/* Hero Image Dropzone */}
        <ImageDropzone
          label="Hero Image"
          value={form.heroImageUrl}
          onChange={(url) => updateField("heroImageUrl", url)}
          hint="1920×1080 recommended — PNG, JPG, WebP or SVG — max 5 MB"
        />

        {/* Thumbnail Dropzone */}
        <ImageDropzone
          label="Thumbnail"
          value={form.thumbnailUrl}
          onChange={(url) => updateField("thumbnailUrl", url)}
          hint="600×600 recommended — PNG, JPG, WebP or SVG — max 5 MB"
        />

        {/* Video URL (kept as text input — YouTube/Vimeo link) */}
        <div>
          <label className={labelCls}>Video URL</label>
          <input
            type="text"
            value={form.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            placeholder="YouTube or Vimeo link"
            className={inputCls}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Public Price</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.pricePublic ?? ""}
              onChange={(e) => updateField("pricePublic", e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="Leave empty if N/A"
              className={inputCls}
            />
          </div>
          {form.pricePublic !== null && (
            <div>
              <label className={labelCls}>Currency</label>
              <select
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                className={inputCls}
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 5: Operations ─────────────────────────────────
  function renderStep5() {
    return (
      <div className="space-y-5">
        <div>
          <label className={labelCls}>Required Staff Role</label>
          <select
            value={form.requiredRole}
            onChange={(e) => updateField("requiredRole", e.target.value)}
            className={inputCls}
          >
            <option value="any">Any Available</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Room / Location</label>
          <input
            type="text"
            value={form.roomLocation}
            onChange={(e) => updateField("roomLocation", e.target.value)}
            placeholder="e.g., Consultation Room 2"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Inventory Link</label>
          <select
            value={form.inventoryLink}
            onChange={(e) => updateField("inventoryLink", e.target.value)}
            className={inputCls}
          >
            <option value="">None (no stock item linked)</option>
            {inventoryItems.map((item) => (
              <option key={item.id} value={item.sku}>{item.sku} — {item.name}</option>
            ))}
          </select>
          <p className={helpCls}>Links to stock item for inventory tracking. Managed from the Inventory tab.</p>
        </div>

        <div>
          <label className={labelCls}>Internal Cost Price</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.priceInternal ?? ""}
            onChange={(e) => updateField("priceInternal", e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="For internal margin analysis"
            className={inputCls}
          />
          <p className={helpCls}>Hidden from public site. Used for profit analysis.</p>
        </div>

        <div>
          <label className={labelCls}>Internal Notes</label>
          <textarea
            value={form.internalNotes}
            onChange={(e) => updateField("internalNotes", e.target.value)}
            placeholder="Staff-only notes (not visible on public site)"
            rows={3}
            className={inputCls + " resize-none"}
          />
        </div>
      </div>
    );
  }

  // ── Step 6: SEO & Visibility ───────────────────────────────────
  function renderStep6() {
    return (
      <div className="space-y-5">
        <div>
          <label className={labelCls}>URL Slug <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400 shrink-0">/services/</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="flu-vaccination"
              className={inputCls}
            />
          </div>
          <FieldError field="slug" />
        </div>

        <div>
          <label className={labelCls}>Meta Title</label>
          <input
            type="text"
            value={form.metaTitle}
            onChange={(e) => updateField("metaTitle", e.target.value)}
            placeholder="Override page title for search engines"
            className={inputCls}
          />
          <p className={helpCls}>Defaults to service name if left empty.</p>
        </div>

        <div>
          <label className={labelCls}>Meta Description</label>
          <textarea
            value={form.metaDescription}
            onChange={(e) => updateField("metaDescription", e.target.value)}
            placeholder="Brief description for search engine results"
            rows={2}
            maxLength={160}
            className={inputCls + " resize-none"}
          />
          <div className="flex items-center justify-between">
            <FieldError field="metaDescription" />
            <p className={helpCls}>{form.metaDescription.length}/160</p>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className={labelCls}>Keywords</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
              placeholder="Type and press Enter"
              className={inputCls + " flex-1"}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shrink-0"
            >
              Add
            </button>
          </div>
          {form.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.keywords.map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                  {kw}
                  <button type="button" onClick={() => removeKeyword(kw)} className="text-neutral-400 hover:text-neutral-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step renderer ──────────────────────────────────────────────
  function renderCurrentStep() {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  }

  // ── Drawer footer ──────────────────────────────────────────────
  const footer = (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Back
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleSave("draft")}
          className="px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          Save as Draft
        </button>
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSave("active")}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Publish Service
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editService ? "Edit Service" : "Add New Service"}
      subtitle={`Step ${step} of ${TOTAL_STEPS}`}
      width="max-w-2xl"
      footer={footer}
      badge={
        editService ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Editing
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
            New
          </span>
        )
      }
    >
      <div className="flex h-full">
        {/* ── Vertical Step Indicator ── */}
        <div className="w-56 shrink-0 bg-neutral-50 border-r border-neutral-200 py-5 px-3">
          <nav className="space-y-1">
            {FORM_STEPS.map((s) => {
              const isCurrent = step === s.id;
              const isCompleted = step > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToStep(s.id)}
                  className={`
                    w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                    ${isCurrent
                      ? "bg-white shadow-sm border border-primary-200"
                      : isCompleted
                        ? "hover:bg-white/60"
                        : "hover:bg-white/40 opacity-60"
                    }
                  `}
                >
                  {/* Step icon */}
                  <div className={`
                    shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5
                    ${isCurrent
                      ? "bg-primary-500 text-white"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-neutral-200 text-neutral-400"
                    }
                  `}>
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? "text-primary-700" : isCompleted ? "text-neutral-700" : "text-neutral-500"}`}>
                      {s.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">{s.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Form Content ── */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-neutral-900">{FORM_STEPS[step - 1].title}</h3>
            <p className="text-sm text-neutral-500 mt-0.5">{FORM_STEPS[step - 1].subtitle}</p>
          </div>
          {renderCurrentStep()}
        </div>
      </div>
    </Drawer>
  );
}
