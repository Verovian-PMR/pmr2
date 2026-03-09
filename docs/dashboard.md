---
title: Dashboard
description: Pharmacy Dashboard features and functionality guide
---

# Pharmacy Dashboard

The dashboard (`apps/dashboard/`) is the admin portal for pharmacy staff. It runs on port 3002 and provides tools to manage services, schedules, appointments, inventory, and settings.

## Sidebar Navigation

The sidebar groups navigation into two sections:
- **Main:** Website, Services, Schedule, Appointments
- **Management:** Inventory, Settings

Active state is highlighted with a left accent bar and persisted to `localStorage`.

## Shared Components

### ConfirmModal
Located at `src/components/ConfirmModal.tsx`. A premium centered modal used for all destructive operations. Props:
- `open`, `onClose`, `onConfirm` — control lifecycle
- `title`, `description`, `itemName` — content
- `variant` — `"danger"` (red, default) or `"warning"` (amber)

Wired into Services, Settings, Inventory, and Schedule pages.

### Drawer
Located at `src/components/Drawer.tsx`. A slide-in panel with header, scrollable body, and optional footer. Used across Services, Schedule, and Appointments.

## Services Tab (`/services`)

Full service CRUD with:
- **Data Table** — search, category filter, bulk selection, row actions (edit, duplicate, delete)
- **6-Step Form Drawer** — Basic Info, Booking & Scheduling, Clinical & Eligibility, Display & Media (with image dropzones), Operations (dynamic staff roles + inventory links), SEO
- **Preview Drawer** — read-only view with edit and duplicate actions
- **Category Management** — add custom categories from shared `@vivipractice/types` package

## Schedule Tab (`/schedule`)

Provider schedule management:
- **Provider List** — color-coded cards (blue, violet, emerald) with avatar initials. Click to select.
- **Weekly Hours** — displays start/end times per day with toggle switches. Hours computed automatically.
- **Blocked Dates** — add/remove with date picker and reason field. Delete uses ConfirmModal.
- **Edit Drawer** — inline time inputs for each day with on/off toggles.
- **RBAC** — role-based access control. Providers can only edit their own schedule (edit button hidden for others, toggles disabled with reduced opacity, blocked date add/remove hidden). Admins can edit all providers. Demo role-switcher in page header for testing.

4 demo users (admin + 3 providers) matching the public-site booking wizard.

## Appointments Tab (`/appointments`)

Dual-view system with Calendar and Table modes:

### Calendar View
- **Monthly** — 7-column grid with color-coded dots per appointment. Click date → date drawer.
- **Weekly** — 8-column time grid (08:00–17:00) with provider-colored appointment blocks.
- **Daily** — Full appointment cards with reassignment dropdowns.
- Provider legend at bottom with color dots.

### Table View
- Premium data table with columns: Patient, Service, Provider, Date, Time, Status
- Filters: text search, status dropdown, provider dropdown
- Click row → opens Appointment Detail Drawer

### Appointment Drawers
- **Date Drawer** — lists all appointments for a clicked date as cards with reassignment
- **Detail Drawer** — patient info, appointment info, provider section with reassign dropdown

### Status Badges
Color-coded: Confirmed (emerald), Pending (amber), Completed (blue), Cancelled (red), No Show (neutral).

### Locale & Display Conventions
- **Titles:** Demo pharmacist names use Mr/Mrs/Miss (not Dr.) — matches UK pharmacy conventions.
- **Dates:** All dates display in dd/mm/yyyy format (en-GB locale).
- **Currency:** All prices display with £ symbol (not currency code).

## Website Tab (`/website`)

Full website customization hub with 3 horizontal sub-tabs. **Fully API-wired** — fetches settings/pages from API on mount, saves via `PATCH /site-settings` + `PUT /pages/bulk` (transactional). Loading spinner, error toast, success toast.

### Global Settings
- **Branding** — Logo URL, Favicon URL, Font Family selector (Asap default, 8 Google Fonts options)
- **Brand Colors** — Primary (#0F52BA default), Secondary, Accent with color pickers + hex input
- **Header** — Background color, Navbar font color (also used as active page indicator color)
- **Footer** — Background color (wired to primary by default, custom override toggle), Text color, Privacy & Cookies URL, Terms & Conditions URL. Links are hidden on the frontend when their URL is blank.

### Page Manager
- **Page List** — 5 default pages (Home, About, Services, Contact, Booking) with show/hide toggles, reorder arrows, and FORM badge for Booking
- **Standard Pages** (Home, About, Contact) — Component sidebar + component stack canvas. Click any component to expand inline config panel with typed fields based on `configFields` schema (multi-select services, layout selects, image dropzones, address search with OpenStreetMap preview, color pickers, toggles, textareas).
- **Services Page (Preset)** — No component sidebar. Features:
  - Service dropdown to preview any service
  - Fullwidth hero image with gradient overlay, service title, and short description
  - 4 quick-info stat cards (Duration, Public Price, Status, Category)
  - 4 information panels: Service Description, Booking & Scheduling, Clinical & Eligibility (Operations and SEO sections removed — internal-only data)
  - "Book Now" button that auto-selects the service + category → redirects to booking form at provider-selection step
- **Booking Page (Form)** — No component sidebar. Informational placeholder. Accepts query params for service/category pre-selection.

### Component Library
- **Component Grid** — 10 component definitions (5 PRD + 5 supplementary)
  - **PRD Components:** Home Slider (service multi-select, centered/left-aligned layouts), Services List Card (service multi-select), 2 Column Content (rich text + image/map with layout options), Gallery (multi-image dropzone, grid/carousel), Dynamic Table (configurable headers, striped rows)
  - **Supplementary:** CTA Section, Testimonials, FAQ Accordion, Team Grid, Stats Bar
- **Config Panel** — Click any component to edit its default config via typed fields. Live JSON preview at bottom.
- **Config Schema** — `ConfigField` supports: text, textarea, color, number, select, multiselect-services, toggle, image, images, address, faq-items, table-rows. Conditional `showWhen` for dependent fields (e.g. image layout only shows when rightType=image).
- Changes here are the single source of truth for all pages and the public frontend.

**Files:** `website/types.ts` (type definitions + ConfigField schema), `website/data.ts` (defaults and component library with configFields), `website/page.tsx` (full implementation).

## Public-Site ↔ Page Manager Integration

The public-site renders pages using the same data the Page Manager configures:
- **Data bridge:** `public-site/src/lib/api.ts` fetches from the API (`GET /site-settings`, `GET /pages?slug=...`) with ISR revalidation. Falls back to `site-config.ts` hardcoded defaults if the API is unavailable.
- **Component renderers:** 10 renderers in `public-site/src/components/renderers/` map each `defId` to a React component. All config values (colors, padding, border-radius, layout) are applied via inline styles.
- **Layout:** Header/footer are driven by `GlobalSettings` (brand colors, font, nav links from visible pages, conditional Privacy/Terms links). Layout fetches settings from API.
- **Routes:** Home fetches page via API and renders its component stack. `/services` renders `ServicesPage` with category filters. `/services/[slug]` renders a statically-generated service detail page. `/about` and `/contact` render their components. `/booking` is the existing wizard.
- **Service Detail Page** (`/services/[slug]`) — Hero with gradient/image, category badge, 5 quick-info cards (Price, Duration, Booking Window, Capacity, Status), Service Description, Booking & Scheduling, Clinical & Eligibility panels, contraindications amber alert, gradient CTA card with Book Now, and Back to Services link. All 8 services are pre-generated via `generateStaticParams`.
- **Details Button** — Green `bg-emerald-600` button on all service cards (ServicesListCard, ServicesPage) linking to `/services/{slug}`. HomeSlider featured service tags are also clickable links to detail pages.

## Settings Tab (`/settings`)

Staff roles management with inline add/edit form. 5 default roles: Pharmacist, Clinical Pharmacist, Technician, Nurse, Pharmacy Assistant. Roles are used in the service form's "Required Staff Role" dropdown.

## Inventory Tab (`/inventory`)

Full inventory management:
- **Data Table** — SKU, name, category, quantity, status, actions
- **Inline Form** — add/edit with SKU, name, category, quantity, unit, reorder level, notes
- **Filters** — search by name/SKU, category filter
- **Status** — auto-derived: In Stock (emerald), Low Stock (amber), Out of Stock (red)
