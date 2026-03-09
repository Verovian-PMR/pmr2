"use client";

import { useState } from "react";
import { SERVICES, formatPrice, DEFAULT_SETTINGS } from "@/lib/site-config";
import { DEFAULT_CATEGORIES } from "@vivipractice/types";

interface ServicesPageProps {
  services?: any[];
}

export default function ServicesPage({ services: propServices }: ServicesPageProps) {
  const allServices = propServices && propServices.length > 0 ? propServices : SERVICES;
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const primary = DEFAULT_SETTINGS.brand.primaryColor;

  const filtered = allServices.filter((s: any) => {
    const matchesCat = activeCategory === "all" || s.categoryId === activeCategory;
    const matchesSearch = !search.trim() ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDescription?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Only show categories that have services
  const usedCatIds = new Set(allServices.map((s: any) => s.categoryId));
  const categories = DEFAULT_CATEGORIES.filter((c) => usedCatIds.has(c.id));

  return (
    <div>
      {/* Hero */}
      <section
        className="py-16"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${DEFAULT_SETTINGS.brand.secondaryColor} 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Our Services</h1>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            Browse our full range of professional pharmacy services. Book online in just a few clicks.
          </p>
        </div>
      </section>

      {/* Search + Category Filters */}
      <section className="py-8 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-full text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
              style={activeCategory === "all" ? { backgroundColor: primary } : {}}
            >
              All Services ({allServices.length})
            </button>
            {categories.map((cat) => {
              const count = allServices.filter((s: any) => s.categoryId === cat.id).length;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                  style={isActive ? { backgroundColor: primary } : {}}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((svc) => {
              const cat = DEFAULT_CATEGORIES.find((c) => c.id === svc.categoryId);
              return (
                <div
                  key={svc.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
                >
                  {/* Thumbnail */}
                  <div
                    className="h-40 w-full"
                    style={
                      svc.thumbnailUrl
                        ? { backgroundImage: `url(${svc.thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : { background: `linear-gradient(135deg, ${primary}15 0%, ${primary}30 100%)` }
                    }
                  >
                    {!svc.thumbnailUrl && (
                      <div className="h-full flex items-center justify-center">
                        <svg className="w-12 h-12 opacity-20" style={{ color: primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {cat && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                        {cat.name}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{svc.name}</h3>
                    <p className="text-sm text-neutral-600 mb-4 flex-1 break-words">{svc.shortDescription}</p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {svc.durationMinutes} min
                        </span>
                        <span className="font-semibold text-neutral-900 text-sm">
                          {formatPrice(svc.pricePublic)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/services/${svc.slug}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 bg-emerald-600"
                        >
                          Details
                        </a>
                        <a
                          href={`/booking?service=${svc.id}&category=${svc.categoryId}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
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

          {filtered.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <p>No services found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
