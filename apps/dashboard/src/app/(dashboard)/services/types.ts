// ── Service Metadata ─────────────────────────────────────────────
export interface ServiceMetadata {
  id: string;
  pharmacyId: string;

  // Core
  name: string;
  internalCode: string;
  categoryId: string;
  status: "active" | "draft" | "archived";

  // Descriptions
  shortDescription: string;
  fullDescriptionHtml: string;

  // Booking Logic
  durationMinutes: number;
  bufferMinutes: number;
  bookingWindowDays: number;
  minNoticeHours: number;
  maxCapacityPerSlot: number;
  allowWaitlist: boolean;
  cancellationPolicy: string;

  // Clinical
  requiresPrescription: boolean;
  ageMin: number | null;
  ageMax: number | null;
  genderRestriction: "any" | "male" | "female";
  preAppointmentInstructions: string;
  contraindicationsWarning: string;
  consentFormRequired: boolean;

  // Media
  heroImageUrl: string;
  thumbnailUrl: string;
  iconKey: string;
  isFeatured: boolean;
  videoUrl: string;
  pricePublic: number | null;
  currency: string;

  // Operations
  requiredRole: string;
  roomLocation: string;
  inventoryLink: string;
  internalNotes: string;
  priceInternal: number | null;

  // SEO
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ── Categories (re-exported from shared package) ─────────────────
export type { ServiceCategoryOption } from "@vivipractice/types";
export { DEFAULT_CATEGORIES, CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS, findCategory } from "@vivipractice/types";

// ── Form Steps ───────────────────────────────────────────────────
export interface FormStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string; // SVG path d attribute
}

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: "Basic Information",
    subtitle: "Name, category & description",
    icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  },
  {
    id: 2,
    title: "Booking & Scheduling",
    subtitle: "Duration, capacity & policies",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  },
  {
    id: 3,
    title: "Clinical & Eligibility",
    subtitle: "Safety, age & consent",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    id: 4,
    title: "Display & Media",
    subtitle: "Images, pricing & visibility",
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z",
  },
  {
    id: 5,
    title: "Operations",
    subtitle: "Staff, location & inventory",
    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
  },
  {
    id: 6,
    title: "SEO & Visibility",
    subtitle: "URL, meta tags & keywords",
    icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  },
];

// ── Empty service template ───────────────────────────────────────
export function createEmptyService(): Omit<ServiceMetadata, "id" | "pharmacyId" | "createdAt" | "updatedAt" | "createdBy"> {
  return {
    name: "",
    internalCode: "",
    categoryId: "",
    status: "draft",
    shortDescription: "",
    fullDescriptionHtml: "",
    durationMinutes: 30,
    bufferMinutes: 5,
    bookingWindowDays: 90,
    minNoticeHours: 2,
    maxCapacityPerSlot: 1,
    allowWaitlist: false,
    cancellationPolicy: "",
    requiresPrescription: false,
    ageMin: null,
    ageMax: null,
    genderRestriction: "any",
    preAppointmentInstructions: "",
    contraindicationsWarning: "",
    consentFormRequired: false,
    heroImageUrl: "",
    thumbnailUrl: "",
    iconKey: "",
    isFeatured: false,
    videoUrl: "",
    pricePublic: null,
    currency: "GBP",
    requiredRole: "any",
    roomLocation: "",
    inventoryLink: "",
    internalNotes: "",
    priceInternal: null,
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  };
}
