const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export async function fetchPage(slug: string) {
  // Strip leading slash — the API stores slugs with leading slash but the
  // route param expects the raw value (e.g. "about" not "/about").
  // For the home page ("/"), fetch all pages and find by slug.
  try {
    const res = await fetch(`${API_URL}/pages`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const pages = await res.json();
    return pages.find((p: any) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function fetchServices() {
  const res = await fetch(`${API_URL}/services`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchServicesData() {
  try {
    const res = await fetch(`${API_URL}/services-data`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

export async function fetchBrandSettings() {
  const res = await fetch(`${API_URL}/site-settings`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSlots(providerId: string, date: string, duration: number) {
  const res = await fetch(
    `${API_URL}/schedules/providers/${providerId}/slots?date=${date}&duration=${duration}`,
    { cache: "no-store" } // Always fresh for availability
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchProviders() {
  const res = await fetch(`${API_URL}/providers`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchFormFields() {
  const res = await fetch(`${API_URL}/form-fields`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPages() {
  try {
    const res = await fetch(`${API_URL}/pages`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createAppointment(data: {
  serviceId: string;
  providerId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  slotStart: string;
  slotEnd: string;
  notes?: string;
  formData?: Record<string, unknown>;
}) {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Booking failed" }));
    throw new Error(err.message || "Booking failed");
  }
  return res.json();
}
