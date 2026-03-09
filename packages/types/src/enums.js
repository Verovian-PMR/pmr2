"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayOfWeek = exports.AuditAction = exports.BillingStatus = exports.InstanceStatus = exports.FormFieldType = exports.PageSlug = exports.ImageLayout = exports.GalleryLayout = exports.SliderLayout = exports.ComponentType = exports.ServiceStatus = exports.AppointmentStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["PHARMACY_ADMIN"] = "PHARMACY_ADMIN";
    UserRole["PHARMACY_STAFF"] = "PHARMACY_STAFF";
})(UserRole || (exports.UserRole = UserRole = {}));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "PENDING";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["ACTIVE"] = "ACTIVE";
    ServiceStatus["INACTIVE"] = "INACTIVE";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var ComponentType;
(function (ComponentType) {
    ComponentType["HOME_SLIDER"] = "HOME_SLIDER";
    ComponentType["SERVICES_CARD"] = "SERVICES_CARD";
    ComponentType["TWO_COLUMN_CONTENT"] = "TWO_COLUMN_CONTENT";
    ComponentType["GALLERY"] = "GALLERY";
    ComponentType["DYNAMIC_TABLE"] = "DYNAMIC_TABLE";
})(ComponentType || (exports.ComponentType = ComponentType = {}));
var SliderLayout;
(function (SliderLayout) {
    SliderLayout["CENTERED"] = "CENTERED";
    SliderLayout["LEFT_ALIGNED"] = "LEFT_ALIGNED";
})(SliderLayout || (exports.SliderLayout = SliderLayout = {}));
var GalleryLayout;
(function (GalleryLayout) {
    GalleryLayout["GRID"] = "GRID";
    GalleryLayout["CAROUSEL"] = "CAROUSEL";
})(GalleryLayout || (exports.GalleryLayout = GalleryLayout = {}));
var ImageLayout;
(function (ImageLayout) {
    ImageLayout["FULL_WIDTH"] = "FULL_WIDTH";
    ImageLayout["CIRCULAR"] = "CIRCULAR";
})(ImageLayout || (exports.ImageLayout = ImageLayout = {}));
var PageSlug;
(function (PageSlug) {
    PageSlug["HOME"] = "home";
    PageSlug["SERVICES"] = "services";
    PageSlug["ABOUT"] = "about";
    PageSlug["CONTACT"] = "contact";
    PageSlug["BOOKING"] = "booking";
})(PageSlug || (exports.PageSlug = PageSlug = {}));
var FormFieldType;
(function (FormFieldType) {
    FormFieldType["TEXT"] = "TEXT";
    FormFieldType["EMAIL"] = "EMAIL";
    FormFieldType["PHONE"] = "PHONE";
    FormFieldType["DATE"] = "DATE";
    FormFieldType["DROPDOWN"] = "DROPDOWN";
    FormFieldType["FILE_UPLOAD"] = "FILE_UPLOAD";
    FormFieldType["TEXTAREA"] = "TEXTAREA";
})(FormFieldType || (exports.FormFieldType = FormFieldType = {}));
var InstanceStatus;
(function (InstanceStatus) {
    InstanceStatus["PROVISIONING"] = "PROVISIONING";
    InstanceStatus["ONLINE"] = "ONLINE";
    InstanceStatus["OFFLINE"] = "OFFLINE";
    InstanceStatus["SUSPENDED"] = "SUSPENDED";
    InstanceStatus["DECOMMISSIONED"] = "DECOMMISSIONED";
})(InstanceStatus || (exports.InstanceStatus = InstanceStatus = {}));
var BillingStatus;
(function (BillingStatus) {
    BillingStatus["ACTIVE"] = "ACTIVE";
    BillingStatus["OVERDUE"] = "OVERDUE";
    BillingStatus["SUSPENDED"] = "SUSPENDED";
})(BillingStatus || (exports.BillingStatus = BillingStatus = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["EXPORT"] = "EXPORT";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
//# sourceMappingURL=enums.js.map