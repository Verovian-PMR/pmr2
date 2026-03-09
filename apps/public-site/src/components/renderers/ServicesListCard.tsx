import { SERVICES, formatPrice, DEFAULT_SETTINGS } from "@/lib/site-config";
import { DEFAULT_CATEGORIES } from "@vivipractice/types";

interface Props {
  config: Record<string, unknown>;
}

export default function ServicesListCard({ config }: Props) {
  const bgColor = (config.bgColor as string) || "#FFFFFF";
  const cardBorderRadius = Number(config.cardBorderRadius) || 16;
  const padding = Number(config.padding) || 48;
  const ids = (config.selectedServiceIds as string[]) || [];

  // Use API services if injected by ComponentRenderer, else fall back to hardcoded
  const allServices = (config._services as typeof SERVICES) || SERVICES;

  // Show selected services if IDs specified, otherwise show all active services
  // (featured first, then the rest)
  const services = ids.length > 0
    ? allServices.filter((s) => ids.includes(s.id))
    : [...allServices]
        .filter((s: any) => s.status !== "archived")
        .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

  const primary = DEFAULT_SETTINGS.brand.primaryColor;

  return (
    <section style={{ backgroundColor: bgColor, padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-neutral-900">Our Services</h2>
          <p className="text-neutral-500 mt-2 text-sm">Explore our range of professional pharmacy services</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => {
            const cat = DEFAULT_CATEGORIES.find((c) => c.id === svc.categoryId);
            return (
              <div
                key={svc.id}
                className="bg-white border border-neutral-200 overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
                style={{ borderRadius: `${cardBorderRadius}px` }}
              >
                {/* Thumbnail or gradient */}
                <div
                  className="h-40 w-full"
                  style={
                    svc.thumbnailUrl
                      ? { backgroundImage: `url(${svc.thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: `linear-gradient(135deg, ${primary}22 0%, ${primary}44 100%)` }
                  }
                >
                  {!svc.thumbnailUrl && (
                    <div className="h-full flex items-center justify-center">
                      <svg className="w-12 h-12 opacity-30" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {cat && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      {cat.name}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">{svc.name}</h3>
                  <p className="text-sm text-neutral-600 mb-4 flex-1">{svc.shortDescription}</p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {svc.durationMinutes} min
                      </span>
                      <span className="font-semibold text-neutral-900">{formatPrice(svc.pricePublic)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/services/${svc.slug}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 bg-emerald-600"
                      >
                        Details
                      </a>
                      <a
                        href={`/booking?service=${svc.id}&category=${svc.categoryId}&name=${encodeURIComponent(svc.name)}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: primary }}
                      >
                        Book Now
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
