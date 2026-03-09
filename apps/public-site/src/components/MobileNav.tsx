"use client";

import { useState } from "react";

interface MobileNavProps {
  pages: { id: string; slug: string; title: string }[];
  navFontColor: string;
  primaryColor: string;
}

export default function MobileNav({ pages, navFontColor, primaryColor }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg transition-colors hover:bg-black/5"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <svg className="w-6 h-6" style={{ color: navFontColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" style={{ color: navFontColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-neutral-200 shadow-lg z-50 animate-fadeIn">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {pages.map((page) => (
              <a
                key={page.id}
                href={page.slug === "/" ? "/" : page.slug}
                className="px-4 py-3 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                {page.title}
              </a>
            ))}
            <a
              href="/booking"
              className="mt-2 px-4 py-3 rounded-lg text-sm font-medium text-white text-center transition-colors hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
              onClick={() => setOpen(false)}
            >
              Book Now
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
