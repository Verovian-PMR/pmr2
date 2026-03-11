"use client";

import { useState, useEffect, useCallback } from "react";
import { SERVICES, DEFAULT_SETTINGS, formatPrice } from "@/lib/site-config";

interface Props {
  config: Record<string, unknown>;
}

export default function HomeSlider({ config }: Props) {
  const layout = (config.layout as string) || "centered";
  const sliderLayout = (config.sliderLayout as string) || "full-bleed";
  const overlayColor = (config.overlayColor as string) || "rgba(0,0,0,0.45)";
  const textColor = (config.textColor as string) || "#FFFFFF";
  const padding = Number(config.padding) || 128;
  const borderRadius = Number(config.borderRadius) || 0;
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
  const secondary = DEFAULT_SETTINGS.brand.secondaryColor;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = services.length || 1;

  const goTo = useCallback(
    (idx: number) => setCurrent(((idx % total) + total) % total),
    [total]
  );

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(() => goTo(current + 1), 6000);
    return () => clearInterval(timer);
  }, [current, paused, total, goTo]);

  // Fallback when no services
  if (services.length === 0) {
    return (
      <section
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 55%, ${primary} 100%)`, minHeight: "520px" }}
        className="relative flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>Welcome to VivIPractice</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90" style={{ color: textColor }}>Professional pharmacy services with easy online booking</p>
          <a href="/booking" className="inline-block px-8 py-3.5 rounded-lg font-semibold text-base transition-all hover:opacity-90 shadow-lg" style={{ backgroundColor: "#FFFFFF", color: primary }}>Book Now</a>
        </div>
      </section>
    );
  }

  const svc = services[current];
  const isCentered = layout === "centered";
  const isContained = sliderLayout === "contained-rounded";
  const containerRadius = isContained ? 24 : borderRadius;

  const bgStyle: React.CSSProperties = svc?.heroImageUrl
    ? { backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url(${svc.heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 55%, ${primary} 100%)` };

  // Outer wrapper for contained layouts
  const Wrapper = isContained ? (
    ({ children }: { children: React.ReactNode }) => (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        {children}
      </div>
    )
  ) : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <Wrapper>
    <section
      style={{
        ...bgStyle,
        minHeight: isContained ? "460px" : "520px",
        borderRadius: isContained ? `${containerRadius}px` : `${borderRadius}px`,
      }}
      className={`relative transition-all duration-700 flex items-center overflow-hidden ${
        isContained ? "shadow-xl" : ""
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isCentered ? "text-center" : "text-left"}`}
        style={!isCentered ? { maxWidth: "min(90%, 50%)", marginLeft: "clamp(1rem, 8vw, 8rem)" } : undefined}
      >
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm mb-4" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: textColor }}>
          {svc.categoryId}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight" style={{ color: textColor }}>{svc.name}</h1>
        <p className="text-base md:text-lg mb-2 opacity-90 max-w-2xl break-words" style={{ color: textColor, ...(isCentered ? { margin: "0 auto 8px" } : {}) }}>
          {svc.shortDescription}
        </p>
        <p className="text-sm mb-8 opacity-75" style={{ color: textColor }}>
          {svc.durationMinutes} min &middot; {formatPrice(svc.pricePublic)}
        </p>
        <div className={`flex gap-3 mb-2 ${isCentered ? "justify-center" : ""}`}>
          <a href={`/services/${svc.slug}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 shadow-md bg-emerald-600 text-white">Details</a>
          <a href={`/booking?service=${svc.id}&category=${svc.categoryId}&name=${encodeURIComponent(svc.name)}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 shadow-lg" style={{ backgroundColor: "#FFFFFF", color: primary }}>
            Book Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </div>

      {total > 1 && (
        <>
          <button type="button" onClick={() => goTo(current - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Previous slide">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button type="button" onClick={() => goTo(current + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Next slide">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </>
      )}

      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {services.map((_, i) => (
            <button key={i} type="button" onClick={() => goTo(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
    </Wrapper>
  );
}
