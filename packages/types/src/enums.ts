// ===== User & Auth =====
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  PHARMACY_ADMIN = "PHARMACY_ADMIN",
  PHARMACY_STAFF = "PHARMACY_STAFF",
}

// ===== Appointment =====
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ===== Service =====
export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ===== Page Components =====
export enum ComponentType {
  HOME_SLIDER = "HOME_SLIDER",
  SERVICES_CARD = "SERVICES_CARD",
  TWO_COLUMN_CONTENT = "TWO_COLUMN_CONTENT",
  GALLERY = "GALLERY",
  DYNAMIC_TABLE = "DYNAMIC_TABLE",
}

export enum SliderLayout {
  CENTERED = "CENTERED",
  LEFT_ALIGNED = "LEFT_ALIGNED",
}

export enum GalleryLayout {
  GRID = "GRID",
  CAROUSEL = "CAROUSEL",
}

export enum ImageLayout {
  FULL_WIDTH = "FULL_WIDTH",
  CIRCULAR = "CIRCULAR",
}

// ===== Pages =====
export enum PageSlug {
  HOME = "home",
  SERVICES = "services",
  ABOUT = "about",
  CONTACT = "contact",
  BOOKING = "booking",
}

// ===== Form Builder =====
export enum FormFieldType {
  TEXT = "TEXT",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  DATE = "DATE",
  DROPDOWN = "DROPDOWN",
  FILE_UPLOAD = "FILE_UPLOAD",
  TEXTAREA = "TEXTAREA",
}

// ===== Instance (Control Plane) =====
export enum InstanceStatus {
  PROVISIONING = "PROVISIONING",
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  SUSPENDED = "SUSPENDED",
  DECOMMISSIONED = "DECOMMISSIONED",
}

export enum BillingStatus {
  ACTIVE = "ACTIVE",
  OVERDUE = "OVERDUE",
  SUSPENDED = "SUSPENDED",
}

// ===== Audit =====
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
}

// ===== Schedule =====
export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}
