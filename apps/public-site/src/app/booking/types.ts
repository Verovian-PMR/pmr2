export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  serviceCount: number;
  gradient: string; // tailwind gradient classes for the icon bg
  iconColor: string;
}

export interface ServiceOption {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  duration: number;
  price?: string; // e.g. "Free", "$25", "Covered by insurance"
}

export interface ProviderOption {
  id: string;
  name: string;
  title: string;
}

export interface TimeSlot {
  start: string; // ISO datetime
  end: string;
  label: string; // e.g. "09:00 AM"
}

export interface BookingData {
  category: ServiceCategory | null;
  service: ServiceOption | null;
  provider: ProviderOption | null;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  insurance: string;
  notes: string;
}

export const INITIAL_BOOKING: BookingData = {
  category: null,
  service: null,
  provider: null,
  date: "",
  timeSlot: null,
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  insurance: "",
  notes: "",
};

export const STEP_TITLES = [
  "Service Category",
  "Choose Service",
  "Choose Provider",
  "Date & Time",
  "Your Details",
  "Review Booking",
];

export const TOTAL_STEPS = 6;
