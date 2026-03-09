// ── Brand & Global Settings ──────────────────────────────────────
export interface BrandSettings {
  logoUrl: string;
  faviconUrl: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface HeaderSettings {
  bgColor: string;
  navFontColor: string; // Also used as active page indicator color
}

export interface FooterSettings {
  bgColor: string;
  useCustomBg: boolean; // If false, bgColor defaults to primaryColor
  textColor: string;
  privacyUrl: string;
  termsUrl: string;
}

export interface GlobalSettings {
  brand: BrandSettings;
  header: HeaderSettings;
  footer: FooterSettings;
}

// ── Pages ────────────────────────────────────────────────────────
export interface SitePage {
  id: string;
  title: string;
  slug: string;
  isVisible: boolean;
  isDefault: boolean;
  isServices: boolean;  // Special services page (no component sidebar)
  isBooking: boolean;   // Booking form page (no component sidebar)
  components: ComponentInstance[];
  order: number;
}

// ── Component Config Schema ──────────────────────────────────────
export type ConfigFieldType =
  | "text"
  | "textarea"
  | "color"
  | "number"
  | "select"
  | "multiselect-services"
  | "toggle"
  | "image"
  | "images"
  | "address"
  | "faq-items"
  | "table-rows";

export interface ConfigFieldOption {
  value: string;
  label: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  placeholder?: string;
  options?: ConfigFieldOption[];
  /** Only show this field when another field matches a value */
  showWhen?: { field: string; value: string };
}

// ── Components ───────────────────────────────────────────────────
export type ComponentCategory = "content" | "media" | "engagement" | "layout";

export interface ComponentDef {
  id: string;
  name: string;
  description: string;
  icon: string;           // SVG path d
  category: ComponentCategory;
  defaultConfig: Record<string, unknown>;
  configFields: ConfigField[];
}

export interface ComponentInstance {
  id: string;
  defId: string;
  config: Record<string, unknown>;
  order: number;
}

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  content: "Content",
  media: "Media",
  engagement: "Engagement",
  layout: "Layout",
};

export const CATEGORY_COLORS: Record<ComponentCategory, { bg: string; text: string }> = {
  content:    { bg: "bg-blue-50",    text: "text-blue-700" },
  media:      { bg: "bg-violet-50",  text: "text-violet-700" },
  engagement: { bg: "bg-emerald-50", text: "text-emerald-700" },
  layout:     { bg: "bg-amber-50",   text: "text-amber-700" },
};

export const FONT_OPTIONS = [
  "Asap",
  "Inter",
  "Poppins",
  "DM Sans",
  "Source Sans 3",
  "Nunito",
  "Lato",
  "Open Sans",
  "Roboto",
] as const;
