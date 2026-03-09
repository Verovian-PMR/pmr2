"use client";

import type { ProviderOption } from "../types";

interface ProviderStepProps {
  providers: ProviderOption[];
  selected: ProviderOption | null;
  onSelect: (provider: ProviderOption) => void;
}

export default function ProviderStep({ providers, selected, onSelect }: ProviderStepProps) {
  return (
    <div>
      <p className="text-neutral-500 text-sm mb-5">Select a provider for your appointment.</p>

      {providers.length === 0 ? (
        <div className="text-center py-8 text-neutral-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-sm">No providers available. Please check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((prov) => {
            const isSelected = selected?.id === prov.id;
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => onSelect(prov)}
                className={`
                  w-full flex items-center gap-4 border-2 rounded-xl p-4 transition-all duration-200 text-left
                  ${isSelected
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 hover:border-primary-400 hover:bg-neutral-50"
                  }
                `}
              >
                {/* Avatar circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0
                    ${isSelected ? "bg-primary-500 text-white" : "bg-neutral-200 text-neutral-600"}
                  `}
                >
                  {prov.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="block font-semibold text-sm truncate">{prov.name}</span>
                  <span className="block text-xs text-neutral-500">{prov.title}</span>
                </div>
                {isSelected && (
                  <svg className="w-5 h-5 text-primary-500 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
