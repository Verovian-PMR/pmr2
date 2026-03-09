"use client";

import type { ServiceOption, ServiceCategory } from "../types";

interface ServiceStepProps {
  category: ServiceCategory;
  services: ServiceOption[];
  selected: ServiceOption | null;
  onSelect: (service: ServiceOption) => void;
}

export default function ServiceStep({ category, services, selected, onSelect }: ServiceStepProps) {
  return (
    <div>
      {/* Breadcrumb context */}
      <div className="flex items-center gap-1.5 text-xs mb-5">
        <span className="text-primary-500 font-medium">{category.name}</span>
        <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-neutral-500">Select a service</span>
      </div>

      <div className="space-y-2.5">
        {services.map((svc) => {
          const isSelected = selected?.id === svc.id;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => onSelect(svc)}
              className={`
                w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden
                ${isSelected
                  ? "border-primary-500 shadow-sm"
                  : "border-neutral-200 hover:border-primary-300 hover:shadow-sm"
                }
              `}
            >
              <div className="flex">
                {/* Left accent bar */}
                <div
                  className={`
                    w-1 shrink-0 transition-colors duration-200
                    ${isSelected ? "bg-primary-500" : "bg-transparent"}
                  `}
                />

                <div className="flex-1 p-4 flex items-center gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="font-semibold text-sm text-neutral-900">{svc.name}</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{svc.description}</p>
                  </div>

                  {/* Right meta */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {/* Duration pill */}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {svc.duration} min
                    </span>
                    {/* Price tag */}
                    {svc.price && (
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        {svc.price}
                      </span>
                    )}
                  </div>

                  {/* Checkmark */}
                  {isSelected && (
                    <svg className="w-5 h-5 text-primary-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-10 text-neutral-400">
          <p className="text-sm">No services available in this category.</p>
        </div>
      )}
    </div>
  );
}
