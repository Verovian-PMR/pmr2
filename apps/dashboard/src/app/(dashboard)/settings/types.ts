export interface StaffRole {
  id: string;
  name: string;
  description: string;
}

export const DEFAULT_STAFF_ROLES: StaffRole[] = [
  { id: "pharmacist", name: "Pharmacist", description: "Licensed pharmacist — can administer vaccines and consultations" },
  { id: "clinical-pharmacist", name: "Clinical Pharmacist", description: "Advanced clinical duties including prescribing and chronic disease management" },
  { id: "technician", name: "Technician", description: "Pharmacy technician — dispensing support and basic screenings" },
  { id: "nurse", name: "Nurse", description: "Registered nurse — clinical procedures and patient care" },
  { id: "pharmacy-assistant", name: "Pharmacy Assistant", description: "Counter assistant — prescription pickup and general support" },
];

export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  status: UserStatus;
  avatarUrl: string;
}

export const DEFAULT_USERS: User[] = [
  { id: "usr-1", name: "Mrs. Sarah Johnson",  email: "sarah.johnson@vivipractice.co.uk", phone: "07700 200001", roleId: "pharmacist",          status: "active",   avatarUrl: "" },
  { id: "usr-2", name: "Mr. Michael Chen",    email: "michael.chen@vivipractice.co.uk",  phone: "07700 200002", roleId: "clinical-pharmacist", status: "active",   avatarUrl: "" },
  { id: "usr-3", name: "Miss Emily Williams", email: "emily.williams@vivipractice.co.uk",phone: "07700 200003", roleId: "pharmacist",          status: "active",   avatarUrl: "" },
  { id: "usr-4", name: "James Harper",        email: "james.harper@vivipractice.co.uk",  phone: "07700 200004", roleId: "technician",          status: "inactive", avatarUrl: "" },
];
