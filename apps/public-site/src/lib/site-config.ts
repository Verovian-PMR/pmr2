/**
 * Site Configuration — Single source of truth for the public-site.
 *
 * Mirrors the dashboard Page Manager's DEFAULT_SETTINGS, DEFAULT_PAGES,
 * and service data. When the API is wired, replace these with fetch calls.
 */

// ── Types ────────────────────────────────────────────────────────

export interface BrandSettings {
  logoUrl: string;
  faviconUrl: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export type HeaderStyle = "classic" | "centered" | "transparent";

export interface HeaderSettings {
  bgColor: string;
  navFontColor: string;
  headerStyle: HeaderStyle;
}

export interface FooterSettings {
  bgColor: string;
  useCustomBg: boolean;
  textColor: string;
  privacyUrl: string;
  termsUrl: string;
}

export interface GlobalSettings {
  brand: BrandSettings;
  header: HeaderSettings;
  footer: FooterSettings;
}

export interface ComponentInstance {
  id: string;
  defId: string;
  config: Record<string, unknown>;
  order: number;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  isVisible: boolean;
  isDefault: boolean;
  isServices: boolean;
  isBooking: boolean;
  components: ComponentInstance[];
  order: number;
}

export interface PublicService {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  fullDescriptionHtml: string;
  durationMinutes: number;
  pricePublic: number | null;
  currency: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  // Booking & Scheduling
  bufferMinutes: number;
  bookingWindowDays: number;
  minNoticeHours: number;
  maxCapacityPerSlot: number;
  allowWaitlist: boolean;
  cancellationPolicy: string;
  // Clinical & Eligibility
  requiresPrescription: boolean;
  ageMin: number | null;
  ageMax: number | null;
  genderRestriction: string;
  preAppointmentInstructions: string;
  contraindicationsWarning: string;
  consentFormRequired: boolean;
}

// ── Default Settings (mirrors dashboard website/data.ts) ─────────

export const DEFAULT_SETTINGS: GlobalSettings = {
  brand: {
    logoUrl: "",
    faviconUrl: "",
    fontFamily: "Asap",
    primaryColor: "#0F52BA",
    secondaryColor: "#1E88E5",
    accentColor: "#E65100",
  },
  header: {
    bgColor: "#FFFFFF",
    navFontColor: "#0F52BA",
    headerStyle: "classic",
  },
  footer: {
    bgColor: "#0F52BA",
    useCustomBg: false,
    textColor: "#FFFFFF",
    privacyUrl: "",
    termsUrl: "",
  },
};

// ── Default Pages (mirrors dashboard website/data.ts) ────────────

export const DEFAULT_PAGES: SitePage[] = [
  {
    id: "pg-home",
    title: "Home",
    slug: "/",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: false,
    components: [
      {
        id: "ci-1",
        defId: "home-slider",
        config: {
          selectedServiceIds: [],
          layout: "centered",
          sliderLayout: "full-bleed",
          overlayColor: "rgba(0,0,0,0.45)",
          textColor: "#FFFFFF",
          buttonText: "Book Now",
          borderRadius: "0",
          padding: "64",
        },
        order: 0,
      },
      {
        id: "ci-2",
        defId: "services-list-card",
        config: {
          selectedServiceIds: [],
          bgColor: "#FFFFFF",
          cardBorderRadius: "16",
          padding: "48",
        },
        order: 1,
      },
      {
        id: "ci-3",
        defId: "cta-section",
        config: {
          heading: "Ready to get started?",
          buttonText: "Book an Appointment",
          buttonUrl: "/booking",
          bgColor: "#E8EEF9",
          textColor: "#0F52BA",
          buttonColor: "#0F52BA",
          borderRadius: "12",
          padding: "48",
        },
        order: 2,
      },
    ],
    order: 0,
  },
  {
    id: "pg-about",
    title: "About Us",
    slug: "/about",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: false,
    components: [
      {
        id: "ci-4",
        defId: "two-column-content",
        config: {
          leftContent:
            "We are a family-run pharmacy committed to delivering exceptional pharmaceutical care to our community.",
          rightType: "image",
          rightImageUrl: "",
          rightImageLayout: "full-width",
          mapAddress: "",
          bgColor: "#FFFFFF",
          padding: "48",
        },
        order: 0,
      },
      {
        id: "ci-5",
        defId: "team-grid",
        config: {
          columns: 3,
          bgColor: "#FFFFFF",
          cardBorderRadius: "16",
          showRole: true,
          padding: "48",
        },
        order: 1,
      },
    ],
    order: 1,
  },
  {
    id: "pg-services",
    title: "Services",
    slug: "/services",
    isVisible: true,
    isDefault: true,
    isServices: true,
    isBooking: false,
    components: [],
    order: 2,
  },
  {
    id: "pg-contact",
    title: "Contact",
    slug: "/contact",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: false,
    components: [
      {
        id: "ci-6",
        defId: "two-column-content",
        config: {
          leftContent:
            "Get in touch with our team for any questions or concerns.",
          rightType: "map",
          rightImageUrl: "",
          rightImageLayout: "full-width",
          mapAddress: "123 High Street, London, UK",
          bgColor: "#FFFFFF",
          padding: "48",
        },
        order: 0,
      },
    ],
    order: 3,
  },
  {
    id: "pg-booking",
    title: "Booking",
    slug: "/booking",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: true,
    components: [],
    order: 4,
  },
];

// ── Public Services Data (subset of dashboard DEMO_SERVICES) ─────

export const SERVICES: PublicService[] = [
  {
    id: "svc-001", name: "Flu Vaccination", slug: "flu-vaccination", categoryId: "vaccination",
    shortDescription: "Annual influenza immunization for all ages 6 months and up.",
    fullDescriptionHtml: "<p>Protect yourself and your family this flu season with our annual influenza vaccination. Administered by certified pharmacists in a comfortable clinical setting.</p>",
    durationMinutes: 15, pricePublic: 0, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: true,
    bufferMinutes: 5, bookingWindowDays: 90, minNoticeHours: 2, maxCapacityPerSlot: 1, allowWaitlist: false,
    cancellationPolicy: "Free cancellation up to 2 hours before appointment.",
    requiresPrescription: false, ageMin: null, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "Wear a short-sleeve shirt. Inform staff of any allergies.",
    contraindicationsWarning: "Not suitable for those with severe egg allergies.", consentFormRequired: true,
  },
  {
    id: "svc-002", name: "Pharmacist Consultation", slug: "pharmacist-consultation", categoryId: "consultation",
    shortDescription: "One-on-one consultation with a licensed pharmacist.",
    fullDescriptionHtml: "<p>Discuss your health concerns, medication questions, and treatment options with our experienced pharmacists in a private consultation room.</p>",
    durationMinutes: 20, pricePublic: null, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: true,
    bufferMinutes: 5, bookingWindowDays: 60, minNoticeHours: 4, maxCapacityPerSlot: 1, allowWaitlist: true,
    cancellationPolicy: "24-hour cancellation notice required.",
    requiresPrescription: false, ageMin: null, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "Bring a list of your current medications.",
    contraindicationsWarning: "", consentFormRequired: false,
  },
  {
    id: "svc-003", name: "Comprehensive Medication Review", slug: "comprehensive-medication-review", categoryId: "medication",
    shortDescription: "Full evaluation of all medications for safety and efficacy.",
    fullDescriptionHtml: "<p>Our pharmacists will review all your prescriptions, over-the-counter drugs, and supplements to identify interactions, optimize therapy, and simplify your regimen.</p>",
    durationMinutes: 30, pricePublic: 35, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: false,
    bufferMinutes: 10, bookingWindowDays: 90, minNoticeHours: 24, maxCapacityPerSlot: 1, allowWaitlist: false,
    cancellationPolicy: "48-hour cancellation notice required. \u00a325 late cancellation fee.",
    requiresPrescription: false, ageMin: 18, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "Bring ALL medications including supplements and OTC drugs.",
    contraindicationsWarning: "", consentFormRequired: true,
  },
  {
    id: "svc-004", name: "Pre-Travel Consultation", slug: "pre-travel-consultation", categoryId: "travel",
    shortDescription: "Risk assessment and recommended vaccinations for your destination.",
    fullDescriptionHtml: "<p>Planning a trip? Our travel health experts will assess your destination risks, recommend required and optional vaccinations, and provide preventive medications.</p>",
    durationMinutes: 30, pricePublic: 45, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: true,
    bufferMinutes: 5, bookingWindowDays: 120, minNoticeHours: 48, maxCapacityPerSlot: 1, allowWaitlist: false,
    cancellationPolicy: "72-hour cancellation notice required.",
    requiresPrescription: false, ageMin: null, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "Bring your travel itinerary and vaccination records.",
    contraindicationsWarning: "", consentFormRequired: true,
  },
  {
    id: "svc-005", name: "Blood Pressure Monitoring", slug: "blood-pressure-monitoring", categoryId: "screening",
    shortDescription: "Quick and accurate digital blood pressure screening.",
    fullDescriptionHtml: "<p>Get an accurate blood pressure reading using clinical-grade equipment. Results are recorded and can be shared with your healthcare provider.</p>",
    durationMinutes: 10, pricePublic: 0, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: false,
    bufferMinutes: 0, bookingWindowDays: 30, minNoticeHours: 1, maxCapacityPerSlot: 2, allowWaitlist: false,
    cancellationPolicy: "Free cancellation anytime.",
    requiresPrescription: false, ageMin: null, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "Avoid caffeine and exercise 30 minutes before your reading.",
    contraindicationsWarning: "", consentFormRequired: false,
  },
  {
    id: "svc-006", name: "Blood Glucose Test", slug: "blood-glucose-test", categoryId: "screening",
    shortDescription: "Finger-prick glucose screening with instant results.",
    fullDescriptionHtml: "<p>Quick finger-prick glucose test with results in minutes. Ideal for routine monitoring and early detection of diabetes risk.</p>",
    durationMinutes: 10, pricePublic: 10, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: false,
    bufferMinutes: 0, bookingWindowDays: 30, minNoticeHours: 1, maxCapacityPerSlot: 2, allowWaitlist: false,
    cancellationPolicy: "Free cancellation anytime.",
    requiresPrescription: false, ageMin: null, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "", contraindicationsWarning: "", consentFormRequired: false,
  },
  {
    id: "svc-007", name: "Prescription Pickup", slug: "prescription-pickup", categoryId: "dispensing",
    shortDescription: "Scheduled pickup window \u2014 skip the wait.",
    fullDescriptionHtml: "<p>Book a pickup window for your prescriptions. Simply arrive at your scheduled time and collect your medications without waiting.</p>",
    durationMinutes: 5, pricePublic: null, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: false,
    bufferMinutes: 0, bookingWindowDays: 14, minNoticeHours: 1, maxCapacityPerSlot: 4, allowWaitlist: false,
    cancellationPolicy: "Free cancellation anytime.",
    requiresPrescription: true, ageMin: null, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "Bring your prescription and insurance card.",
    contraindicationsWarning: "", consentFormRequired: false,
  },
  {
    id: "svc-008", name: "Smoking Cessation Program", slug: "smoking-cessation-program", categoryId: "consultation",
    shortDescription: "Personalised plan with NRT guidance and follow-up sessions.",
    fullDescriptionHtml: "<p>Our pharmacists create a tailored quit-smoking plan including nicotine replacement therapy guidance, behavioural support, and regular check-ins.</p>",
    durationMinutes: 30, pricePublic: null, currency: "GBP", heroImageUrl: "", thumbnailUrl: "", isFeatured: false,
    bufferMinutes: 5, bookingWindowDays: 60, minNoticeHours: 24, maxCapacityPerSlot: 1, allowWaitlist: false,
    cancellationPolicy: "24-hour cancellation notice required.",
    requiresPrescription: false, ageMin: 18, ageMax: null, genderRestriction: "any",
    preAppointmentInstructions: "Complete the Fagerstr\u00f6m Test for Nicotine Dependence online before your visit.",
    contraindicationsWarning: "", consentFormRequired: true,
  },
];

// ── Helpers ──────────────────────────────────────────────────────

export function getPageBySlug(slug: string): SitePage | undefined {
  return DEFAULT_PAGES.find((p) => p.slug === slug || p.slug === `/${slug}`);
}

export function getServiceBySlug(slug: string): PublicService | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getVisiblePages(): SitePage[] {
  return DEFAULT_PAGES.filter((p) => p.isVisible).sort((a, b) => a.order - b.order);
}

export function formatPrice(price: number | null): string {
  if (price === null) return "Enquire";
  if (price === 0) return "Free";
  return `£${price.toFixed(2)}`;
}
