import { notFound, redirect } from "next/navigation";
import { getPageBySlug } from "@/lib/site-config";
import ComponentRenderer from "@/components/renderers/ComponentRenderer";
import ServicesPage from "@/components/renderers/ServicesPage";
import { fetchPage, fetchServicesData } from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  try {
    const remote = await fetchPage(`/${slug}`);
    if (remote && remote.id) {
      return {
        ...remote,
        components: (remote.components ?? []).map((c: any) => ({
          id: c.id,
          defId: c.defId,
          config: typeof c.config === "string" ? JSON.parse(c.config) : c.config,
          order: c.order,
        })),
      };
    }
  } catch {}
  return getPageBySlug(slug);
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page || !page.isVisible) return notFound();

  // Booking page — handled by /booking route
  if (page.isBooking) redirect("/booking");

  // Services page — dedicated renderer
  if (page.isServices) {
    const apiServices = await fetchServicesData();
    return <ServicesPage services={apiServices ?? undefined} />;
  }

  // Standard page — render components from Page Manager
  const apiServices = await fetchServicesData();
  return (
    <div>
      {page.components.length > 0 ? (
        <ComponentRenderer components={page.components} services={apiServices} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-neutral-900">{page.title}</h1>
          <p className="text-neutral-500">This page has no components configured yet.</p>
        </div>
      )}
    </div>
  );
}
