import { AppointmentStatus, AuditAction, BillingStatus, ComponentType, DayOfWeek, FormFieldType, InstanceStatus, PageSlug, ServiceStatus, UserRole } from "./enums";
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    instanceId?: string;
    iat?: number;
    exp?: number;
}
export interface User extends BaseEntity {
    email: string;
    name: string;
    role: UserRole;
    mfaEnabled: boolean;
    mfaSecret?: string | null;
    isActive: boolean;
    lastLoginAt?: Date | null;
}
export interface Service extends BaseEntity {
    name: string;
    description: string;
    duration: number;
    featuredImageUrl?: string | null;
    status: ServiceStatus;
    order: number;
}
export interface Provider extends BaseEntity {
    name: string;
    title: string;
    email: string;
    isActive: boolean;
}
export interface WorkingHours extends BaseEntity {
    providerId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    slotDuration: number;
}
export interface ScheduleException extends BaseEntity {
    providerId: string;
    date: Date;
    startTime?: string | null;
    endTime?: string | null;
    isBlocked: boolean;
    reason?: string | null;
}
export interface Appointment extends BaseEntity {
    serviceId: string;
    providerId?: string | null;
    patientName: string;
    patientEmail: string;
    patientPhone?: string | null;
    slotStart: Date;
    slotEnd: Date;
    status: AppointmentStatus;
    notes?: string | null;
    formData?: Record<string, unknown> | null;
}
export interface Page extends BaseEntity {
    slug: PageSlug;
    title: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
    isVisible: boolean;
    order: number;
}
export interface PageComponent extends BaseEntity {
    pageId: string;
    type: ComponentType;
    config: Record<string, unknown>;
    order: number;
}
export interface FormField extends BaseEntity {
    label: string;
    type: FormFieldType;
    placeholder?: string | null;
    isRequired: boolean;
    options?: string[] | null;
    validationRegex?: string | null;
    order: number;
}
export interface BrandSettings {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor: string;
    secondaryColor: string;
    pharmacyName: string;
    pharmacyPhone?: string | null;
    pharmacyEmail?: string | null;
    pharmacyAddress?: string | null;
}
export interface AuditLog extends BaseEntity {
    userId: string;
    action: AuditAction;
    entity: string;
    entityId?: string | null;
    details?: Record<string, unknown> | null;
    ipAddress: string;
}
export interface Instance extends BaseEntity {
    pharmacyName: string;
    subdomain: string;
    customDomain?: string | null;
    adminEmail: string;
    status: InstanceStatus;
    billingStatus: BillingStatus;
    featureFlags: Record<string, boolean>;
    containerUrl?: string | null;
    databaseUrl?: string | null;
    version: string;
    lastHealthCheck?: Date | null;
    cpuUsage?: number | null;
    memoryUsage?: number | null;
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}
export interface ApiError {
    success: false;
    message: string;
    code: string;
    details?: Record<string, unknown>;
}
export interface TimeSlot {
    start: Date;
    end: Date;
    providerId: string;
    isAvailable: boolean;
}
//# sourceMappingURL=models.d.ts.map