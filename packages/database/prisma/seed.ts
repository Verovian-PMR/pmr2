import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  brand: {
    logoUrl: "",
    faviconUrl: "",
    fontFamily: "Asap",
    primaryColor: "#0F52BA",
    secondaryColor: "#1E88E5",
    accentColor: "#E65100",
  },
  header: { bgColor: "#FFFFFF", navFontColor: "#0F52BA" },
  footer: {
    bgColor: "#0F52BA",
    useCustomBg: false,
    textColor: "#FFFFFF",
    privacyUrl: "",
    termsUrl: "",
  },
};

interface PageSeed {
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
    type: string;
    config: Record<string, unknown>;
    order: number;
  }>;
}

const SEED_PAGES: PageSeed[] = [
  {
    id: "pg-home",
    title: "Home",
    slug: "/",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: false,
    order: 0,
    components: [
      {
        id: "ci-1",
        defId: "home-slider",
        type: "HOME_SLIDER",
        config: {
          selectedServiceIds: [],
          layout: "centered",
          overlayColor: "rgba(0,0,0,0.45)",
          textColor: "#FFFFFF",
          buttonText: "Book Now",
          borderRadius: "0",
          padding: "128",
        },
        order: 0,
      },
      {
        id: "ci-2",
        defId: "services-list-card",
        type: "SERVICES_CARD",
        config: {
          selectedServiceIds: [],
          bgColor: "#FFFFFF",
          cardBorderRadius: "16",
          padding: "48",
        },
        order: 1,
      },
      {
        id: "ci-3",
        defId: "cta-section",
        type: "CTA_SECTION",
        config: {
          heading: "Ready to get started?",
          buttonText: "Book an Appointment",
          bgColor: "#E8EEF9",
          textColor: "#0F52BA",
          buttonColor: "#0F52BA",
          borderRadius: "12",
          padding: "48",
        },
        order: 2,
      },
    ],
  },
  {
    id: "pg-about",
    title: "About Us",
    slug: "/about",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: false,
    order: 1,
    components: [
      {
        id: "ci-4",
        defId: "two-column-content",
        type: "TWO_COLUMN_CONTENT",
        config: {
          leftContent:
            "We are a family-run pharmacy committed to delivering exceptional pharmaceutical care to our community.",
          rightType: "image",
          rightImageUrl: "",
          rightImageLayout: "full-width",
          mapAddress: "",
          bgColor: "#FFFFFF",
          padding: "48",
        },
        order: 0,
      },
      {
        id: "ci-5",
        defId: "team-grid",
        type: "TEAM_GRID",
        config: {
          columns: 3,
          bgColor: "#FFFFFF",
          cardBorderRadius: "16",
          showRole: true,
          padding: "48",
        },
        order: 1,
      },
    ],
  },
  {
    id: "pg-services",
    title: "Services",
    slug: "/services",
    isVisible: true,
    isDefault: true,
    isServices: true,
    isBooking: false,
    order: 2,
    components: [],
  },
  {
    id: "pg-contact",
    title: "Contact",
    slug: "/contact",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: false,
    order: 3,
    components: [
      {
        id: "ci-6",
        defId: "two-column-content",
        type: "TWO_COLUMN_CONTENT",
        config: {
          leftContent:
            "Get in touch with our team for any questions or concerns.",
          rightType: "map",
          rightImageUrl: "",
          rightImageLayout: "full-width",
          mapAddress: "123 High Street, London, UK",
          bgColor: "#FFFFFF",
          padding: "48",
        },
        order: 0,
      },
    ],
  },
  {
    id: "pg-booking",
    title: "Booking",
    slug: "/booking",
    isVisible: true,
    isDefault: true,
    isServices: false,
    isBooking: true,
    order: 4,
    components: [],
  },
];

async function main() {
  console.log("Seeding database...");

  // 1. Site Settings (GlobalSettings JSON)
  await prisma.siteSettings.upsert({
    where: { id: "site_settings" },
    update: { settingsJson: DEFAULT_SETTINGS as any },
    create: { id: "site_settings", settingsJson: DEFAULT_SETTINGS as any },
  });
  console.log("  Site settings seeded");

  // 2. Brand Settings
  await prisma.brandSettings.upsert({
    where: { id: "brand_settings" },
    update: {},
    create: {
      id: "brand_settings",
      pharmacyName: "VivIPractice Pharmacy",
      primaryColor: "#0F52BA",
      secondaryColor: "#1E88E5",
    },
  });
  console.log("  Brand settings seeded");

  // 3. Pages + Components — wipe existing first to avoid duplicates
  await prisma.pageComponent.deleteMany({});
  await prisma.page.deleteMany({});

  for (const page of SEED_PAGES) {
    await prisma.page.upsert({
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

    await prisma.pageComponent.deleteMany({ where: { pageId: page.id } });
    for (const comp of page.components) {
      await prisma.pageComponent.create({
        data: {
          id: comp.id,
          pageId: page.id,
          defId: comp.defId,
          type: comp.type as any,
          config: comp.config as any,
          order: comp.order,
        },
      });
    }
  }
  console.log("  Pages & components seeded");

  // 4. Form Fields
  const formFields = [
    { label: "Full Name", type: "TEXT" as const, isRequired: true, order: 0 },
    { label: "Email", type: "EMAIL" as const, isRequired: true, order: 1 },
    { label: "Phone", type: "PHONE" as const, isRequired: false, order: 2 },
    { label: "Notes", type: "TEXTAREA" as const, isRequired: false, order: 3 },
  ];
  for (const field of formFields) {
    const existing = await prisma.formField.findFirst({
      where: { label: field.label },
    });
    if (!existing) {
      await prisma.formField.create({ data: field });
    }
  }
  console.log("  Form fields seeded");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
