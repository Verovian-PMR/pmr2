import { DEFAULT_PAGES } from "@/lib/site-config";
import ComponentRenderer from "@/components/renderers/ComponentRenderer";
import { fetchPage, fetchServicesData } from "@/lib/api";

async function getHomePage() {
  try {
    const remote = await fetchPage("/");
    if (remote && remote.components) {
      return {
        ...remote,
        components: remote.components.map((c: any) => ({
          id: c.id,
          defId: c.defId,
          config: typeof c.config === "string" ? JSON.parse(c.config) : c.config,
          order: c.order,
        })),
      };
    }
  } catch {}
  return DEFAULT_PAGES.find((p) => p.slug === "/") ?? null;
}

export default async function HomePage() {
  const [homePage, apiServices] = await Promise.all([
    getHomePage(),
    fetchServicesData(),
  ]);
  if (!homePage) return null;

  return (
    <div>
      <ComponentRenderer components={homePage.components} services={apiServices} />
    </div>
  );
}
