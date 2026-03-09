"use client";

import type { ServiceCategory } from "../types";

/* ── Heroicon-based SVGs for each category ── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  vaccination: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3v2.25M14.25 3v2.25M12 21v-6m0 0l-2.25 2.25M12 15l2.25 2.25M3.75 7.5h16.5M6.75 7.5v9a2.25 2.25 0 002.25 2.25h6a2.25 2.25 0 002.25-2.25v-9" />
    </svg>
  ),
  consultation: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  medication: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  travel: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  screening: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
  ),
  dispensing: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
};

function getCategoryIcon(id: string) {
  return CATEGORY_ICONS[id] || CATEGORY_ICONS.dispensing;
}

interface CategoryStepProps {
  categories: ServiceCategory[];
  selected: ServiceCategory | null;
  onSelect: (cat: ServiceCategory) => void;
}

export default function CategoryStep({ categories, selected, onSelect }: CategoryStepProps) {
  return (
    <div>
      <p className="text-neutral-500 text-sm mb-6">
        What type of care are you looking for?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => {
          const isSelected = selected?.id === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat)}
              className={`
                group relative text-left rounded-xl border-2 p-4 transition-all duration-200
                ${isSelected
                  ? "border-primary-500 bg-primary-50/60 shadow-sm"
                  : "border-neutral-200 hover:border-primary-300 hover:shadow-sm"
                }
              `}
            >
              {/* Icon + Content row */}
              <div className="flex items-start gap-3.5">
                {/* Gradient icon badge */}
                <div
                  className={`
                    shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-200
                    ${isSelected
                      ? `${cat.gradient} text-white shadow-sm`
                      : `bg-neutral-100 ${cat.iconColor} group-hover:${cat.gradient} group-hover:text-white`
                    }
                  `}
                >
                  {getCategoryIcon(cat.id)}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-neutral-900 leading-tight">
                      {cat.name}
                    </span>
                    {/* Service count pill */}
                    <span
                      className={`
                        shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full
                        ${isSelected
                          ? "bg-primary-500 text-white"
                          : "bg-neutral-100 text-neutral-500"
                        }
                      `}
                    >
                      {cat.serviceCount} {cat.serviceCount === 1 ? "service" : "services"}
                    </span>
                  </div>
                  {/* Description */}
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5">
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
