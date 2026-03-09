import type { ComponentInstance } from "@/lib/site-config";
import HomeSlider from "./HomeSlider";
import ServicesListCard from "./ServicesListCard";
import TwoColumnContent from "./TwoColumnContent";
import Gallery from "./Gallery";
import DynamicTable from "./DynamicTable";
import CTASection from "./CTASection";
import Testimonials from "./Testimonials";
import FAQAccordion from "./FAQAccordion";
import TeamGrid from "./TeamGrid";
import StatsBar from "./StatsBar";

const COMPONENT_MAP: Record<string, React.ComponentType<{ config: Record<string, unknown> }>> = {
  "home-slider": HomeSlider,
  "services-list-card": ServicesListCard,
  "two-column-content": TwoColumnContent,
  "gallery": Gallery,
  "dynamic-table": DynamicTable,
  "cta-section": CTASection,
  "testimonials": Testimonials,
  "faq-accordion": FAQAccordion,
  "team-grid": TeamGrid,
  "stats-bar": StatsBar,
};

// Components that need live services data injected into their config
const NEEDS_SERVICES = new Set(["home-slider", "services-list-card"]);

interface Props {
  components: ComponentInstance[];
  services?: any[] | null;
}

export default function ComponentRenderer({ components, services }: Props) {
  const sorted = [...components].sort((a, b) => a.order - b.order);

  return (
    <>
      {sorted.map((inst) => {
        const Component = COMPONENT_MAP[inst.defId];
        if (!Component) {
          return (
            <div key={inst.id} className="max-w-7xl mx-auto px-4 py-8 text-center text-neutral-400 text-sm">
              Unknown component: {inst.defId}
            </div>
          );
        }
        // Inject services data into components that need it
        const config = (services && NEEDS_SERVICES.has(inst.defId))
          ? { ...inst.config, _services: services }
          : inst.config;
        return <Component key={inst.id} config={config} />;
      })}
    </>
  );
}
