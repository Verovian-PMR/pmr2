import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../config/database.module";
import { Prisma } from "@prisma/client";

@Injectable()
export class ComponentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Site Settings (GlobalSettings JSON blob) ─────────────────
  async getSiteSettings() {
    const row = await this.prisma.siteSettings.findUnique({
      where: { id: "site_settings" },
    });
    return row?.settingsJson ?? null;
  }

  async updateSiteSettings(settingsJson: Record<string, unknown>) {
    return this.prisma.siteSettings.upsert({
      where: { id: "site_settings" },
      update: { settingsJson: settingsJson as unknown as Prisma.InputJsonValue },
      create: {
        id: "site_settings",
        settingsJson: settingsJson as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // ── Pages ────────────────────────────────────────────────────
  async getPageWithComponents(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        components: { orderBy: { order: "asc" } },
      },
    });
    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  async getAllPages() {
    return this.prisma.page.findMany({
      orderBy: { order: "asc" },
      include: { components: { orderBy: { order: "asc" } } },
    });
  }

  async updatePage(slug: string, data: {
    title?: string;
    metaTitle?: string;
    metaDescription?: string;
    isVisible?: boolean;
  }) {
    return this.prisma.page.update({ where: { slug }, data });
  }

  /** Bulk save all pages — replaces visibility, order, and component stacks */
  async bulkSavePages(
    pages: Array<{
      id: string;
      title: string;
      slug: string;
      isVisible: boolean;
      isDefault: boolean;
      isServices: boolean;
      isBooking: boolean;
      order: number;
      components: Array<{
        id: string;
        defId: string;
        config: Record<string, unknown>;
        order: number;
      }>;
    }>,
  ) {
    // Wrap in a transaction so it's all-or-nothing
    return this.prisma.$transaction(async (tx) => {
      for (const page of pages) {
        // Upsert the page row
        await tx.page.upsert({
          where: { id: page.id },
          update: {
            title: page.title,
            slug: page.slug,
            isVisible: page.isVisible,
            isDefault: page.isDefault,
            isServices: page.isServices,
            isBooking: page.isBooking,
            order: page.order,
          },
          create: {
            id: page.id,
            title: page.title,
            slug: page.slug,
            isVisible: page.isVisible,
            isDefault: page.isDefault,
            isServices: page.isServices,
            isBooking: page.isBooking,
            order: page.order,
          },
        });

        // Delete existing components for this page, then re-create
        await tx.pageComponent.deleteMany({ where: { pageId: page.id } });

        if (page.components.length > 0) {
          await tx.pageComponent.createMany({
            data: page.components.map((c) => ({
              id: c.id,
              pageId: page.id,
              defId: c.defId,
              type: defIdToComponentType(c.defId),
              config: c.config as unknown as Prisma.InputJsonValue,
              order: c.order,
            })),
          });
        }
      }
      // Return fresh data
      return tx.page.findMany({
        orderBy: { order: "asc" },
        include: { components: { orderBy: { order: "asc" } } },
      });
    });
  }

  // ── Components (individual CRUD) ─────────────────────────────
  async addComponent(pageId: string, data: {
    type: string;
    defId: string;
    config: Record<string, unknown>;
  }) {
    const maxOrder = await this.prisma.pageComponent.aggregate({
      where: { pageId },
      _max: { order: true },
    });
    return this.prisma.pageComponent.create({
      data: {
        pageId,
        defId: data.defId,
        type: data.type as any,
        config: data.config as unknown as Prisma.InputJsonValue,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async updateComponent(id: string, data: {
    config?: Record<string, unknown>;
    order?: number;
  }) {
    return this.prisma.pageComponent.update({ where: { id }, data: data as any });
  }

  async deleteComponent(id: string) {
    return this.prisma.pageComponent.delete({ where: { id } });
  }

  // ── Services Data (JSON blob synced from dashboard) ────────────
  async getServicesData() {
    const row = await this.prisma.siteSettings.findUnique({
      where: { id: "services_data" },
    });
    return row?.settingsJson ?? [];
  }

  async updateServicesData(data: unknown[]) {
    return this.prisma.siteSettings.upsert({
      where: { id: "services_data" },
      update: { settingsJson: data as unknown as Prisma.InputJsonValue },
      create: {
        id: "services_data",
        settingsJson: data as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // ── Providers Data (JSON blob synced from dashboard) ─────────
  async getProvidersData() {
    const row = await this.prisma.siteSettings.findUnique({
      where: { id: "providers_data" },
    });
    return row?.settingsJson ?? [];
  }

  async updateProvidersData(data: unknown[]) {
    return this.prisma.siteSettings.upsert({
      where: { id: "providers_data" },
      update: { settingsJson: data as unknown as Prisma.InputJsonValue },
      create: {
        id: "providers_data",
        settingsJson: data as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // ── Appointments Data (JSON blob synced from dashboard) ──────
  async getAppointmentsData() {
    const row = await this.prisma.siteSettings.findUnique({
      where: { id: "appointments_data" },
    });
    return row?.settingsJson ?? [];
  }

  async updateAppointmentsData(data: unknown[]) {
    return this.prisma.siteSettings.upsert({
      where: { id: "appointments_data" },
      update: { settingsJson: data as unknown as Prisma.InputJsonValue },
      create: {
        id: "appointments_data",
        settingsJson: data as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // ── Brand Settings ───────────────────────────────────────────
  async getBrandSettings() {
    return this.prisma.brandSettings.findUnique({
      where: { id: "brand_settings" },
    });
  }

  async updateBrandSettings(data: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    pharmacyName?: string;
    pharmacyPhone?: string;
    pharmacyEmail?: string;
    pharmacyAddress?: string;
  }) {
    return this.prisma.brandSettings.upsert({
      where: { id: "brand_settings" },
      update: data,
      create: { ...data, pharmacyName: data.pharmacyName || "My Pharmacy" },
    });
  }
}

/** Map component library defId to Prisma ComponentType enum */
function defIdToComponentType(defId: string): any {
  const map: Record<string, string> = {
    "home-slider": "HOME_SLIDER",
    "services-list-card": "SERVICES_CARD",
    "two-column-content": "TWO_COLUMN_CONTENT",
    "gallery": "GALLERY",
    "dynamic-table": "DYNAMIC_TABLE",
    "cta-section": "CTA_SECTION",
    "testimonials": "TESTIMONIALS",
    "faq-accordion": "FAQ_ACCORDION",
    "team-grid": "TEAM_GRID",
    "stats-bar": "STATS_BAR",
  };
  return map[defId] ?? "HOME_SLIDER";
}
