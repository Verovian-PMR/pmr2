"use client";

import { useState, useCallback, useEffect } from "react";
import type { ServiceMetadata, ServiceCategoryOption } from "./types";
import { DEFAULT_CATEGORIES } from "./types";
import { DEMO_SERVICES } from "./data";
import ServiceTable from "./components/ServiceTable";
import ServiceFormDrawer from "./components/ServiceFormDrawer";
import ServicePreviewDrawer from "./components/ServicePreviewDrawer";
import CategoryFormDrawer from "./components/CategoryFormDrawer";
import ConfirmModal from "@/components/ConfirmModal";
import type { StaffRole } from "../settings/types";
import { DEFAULT_STAFF_ROLES } from "../settings/types";
import type { InventoryItem } from "../inventory/types";
import { DEMO_INVENTORY } from "../inventory/data";

type DrawerMode = "closed" | "add" | "edit" | "preview" | "addCategory" | "editCategory";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function persistServices(services: ServiceMetadata[]) {
  try {
    localStorage.setItem("vivipractice_services", JSON.stringify(services));
  } catch {}
  // Fire-and-forget sync to API so public-site can fetch updated list
  // Keep base64 images so they render on the frontend
  fetch(`${API_URL}/services-data`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(services),
  }).catch(() => {});
}

export default function ServicesPage() {
  // Always initialise with DEMO_SERVICES so SSR and first client render match.
  // Then hydrate from localStorage in useEffect to avoid mismatch.
  const [services, setServices] = useState<ServiceMetadata[]>(DEMO_SERVICES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vivipractice_services");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed);
          return;
        }
      }
    } catch {}
    // No persisted data — persist the defaults so future saves work
    persistServices(DEMO_SERVICES);
  }, []);
  const [categories, setCategories] = useState<ServiceCategoryOption[]>(DEFAULT_CATEGORIES);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("closed");
  const [activeService, setActiveService] = useState<ServiceMetadata | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryOption | null>(null);
  const [roles] = useState<StaffRole[]>(DEFAULT_STAFF_ROLES);
  const [inventoryItems] = useState<InventoryItem[]>(DEMO_INVENTORY);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; name: string } | null>(null);

  // ── Drawer openers ────────────────────────────────────────────
  const openAdd = useCallback(() => {
    setActiveService(null);
    setDrawerMode("add");
  }, []);

  const openEdit = useCallback((svc: ServiceMetadata) => {
    setActiveService(svc);
    setDrawerMode("edit");
  }, []);

  const openPreview = useCallback((svc: ServiceMetadata) => {
    setActiveService(svc);
    setDrawerMode("preview");
  }, []);

  const openAddCategory = useCallback(() => {
    setActiveCategory(null);
    setDrawerMode("addCategory");
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerMode("closed");
    setActiveService(null);
    setActiveCategory(null);
  }, []);

  // ── Service CRUD ──────────────────────────────────────────────
  const handleSave = useCallback(
    (data: Omit<ServiceMetadata, "id" | "pharmacyId" | "createdAt" | "updatedAt" | "createdBy">) => {
      const now = new Date().toISOString();

      if (drawerMode === "edit" && activeService) {
        setServices((prev) => {
          const updated = prev.map((s) =>
            s.id === activeService.id
              ? { ...s, ...data, updatedAt: now }
              : s
          );
          persistServices(updated);
          return updated;
        });
      } else {
        const newService: ServiceMetadata = {
          ...data,
          id: `svc-${Date.now()}`,
          pharmacyId: "ph-001",
          createdAt: now,
          updatedAt: now,
          createdBy: "admin@vivipractice.com",
        };
        setServices((prev) => {
          const updated = [newService, ...prev];
          persistServices(updated);
          return updated;
        });
      }

      closeDrawer();
    },
    [drawerMode, activeService, closeDrawer]
  );

  const handleDuplicate = useCallback((svc: ServiceMetadata) => {
    const now = new Date().toISOString();
    const dup: ServiceMetadata = {
      ...svc,
      id: `svc-${Date.now()}`,
      name: `${svc.name} (Copy)`,
      slug: `${svc.slug}-copy`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    setServices((prev) => {
      const updated = [dup, ...prev];
      persistServices(updated);
      return updated;
    });
    setDrawerMode("closed");
  }, []);

  const requestDelete = useCallback(
    (id: string) => {
      const svc = services.find((s) => s.id === id);
      setDeleteTarget({ ids: [id], name: svc?.name || "this service" });
    },
    [services]
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setServices((prev) => {
      const updated = prev.filter((s) => !deleteTarget.ids.includes(s.id));
      persistServices(updated);
      return updated;
    });
    setDeleteTarget(null);
  }, [deleteTarget]);

  // ── Category CRUD ─────────────────────────────────────────────
  const handleSaveCategory = useCallback(
    (cat: ServiceCategoryOption) => {
      if (drawerMode === "editCategory" && activeCategory) {
        setCategories((prev) => prev.map((c) => (c.id === activeCategory.id ? cat : c)));
      } else {
        setCategories((prev) => [...prev, cat]);
      }
      closeDrawer();
    },
    [drawerMode, activeCategory, closeDrawer]
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Services</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Manage your pharmacy services, booking rules, and public listings.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openAddCategory}
            className="flex items-center gap-2 border border-neutral-300 bg-white text-neutral-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            Add Category
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Service
          </button>
        </div>
      </div>

      {/* ── Data Table ── */}
      <ServiceTable
        services={services}
        categories={categories}
        onView={openPreview}
        onEdit={openEdit}
        onDuplicate={handleDuplicate}
        onDelete={requestDelete}
      />

      {/* ── Service Form Drawer (Add / Edit) ── */}
      <ServiceFormDrawer
        open={drawerMode === "add" || drawerMode === "edit"}
        onClose={closeDrawer}
        onSave={handleSave}
        editService={drawerMode === "edit" ? activeService : null}
        categories={categories}
        roles={roles}
        inventoryItems={inventoryItems}
      />

      {/* ── Service Preview Drawer ── */}
      <ServicePreviewDrawer
        open={drawerMode === "preview"}
        onClose={closeDrawer}
        service={activeService}
        categories={categories}
        onEdit={(svc) => {
          setActiveService(svc);
          setDrawerMode("edit");
        }}
        onDuplicate={handleDuplicate}
      />

      {/* ── Category Form Drawer ── */}
      <CategoryFormDrawer
        open={drawerMode === "addCategory" || drawerMode === "editCategory"}
        onClose={closeDrawer}
        onSave={handleSaveCategory}
        editCategory={drawerMode === "editCategory" ? activeCategory : null}
      />

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Service"
        itemName={deleteTarget?.name}
      />
    </div>
  );
}
