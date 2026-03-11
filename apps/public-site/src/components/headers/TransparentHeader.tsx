"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MobileNav from "../MobileNav";

interface Props {
  settings: any;
  navPages: any[];
  pathname: string;
}

export default function TransparentHeader({ settings, navPages, pathname }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navColor = scrolled ? settings.header.navFontColor : "#FFFFFF";
  const ctaBg = scrolled ? settings.brand.primaryColor : "rgba(255,255,255,0.15)";
  const ctaText = scrolled ? "#FFFFFF" : "#FFFFFF";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-neutral-200/50"
          : "bg-transparent"
      }`}
    >
      {/* Gradient overlay for readability when transparent */}
      {!scrolled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)" }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {settings.brand.logoUrl ? (
          <Link href="/" className="shrink-0">
            <img
              src={settings.brand.logoUrl}
              alt="Logo"
              className={`transition-all duration-300 ${scrolled ? "h-8" : "h-9 drop-shadow-md"}`}
            />
          </Link>
        ) : (
          <Link
            href="/"
            className={`text-xl font-bold tracking-tight transition-all duration-300 ${!scrolled ? "drop-shadow-md" : ""}`}
            style={{ color: navColor }}
          >
            VivIPractice
          </Link>
        )}

        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Main navigation">
          {navPages.map((page: any) => {
            const href = page.slug === "/" ? "/" : page.slug;
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={page.id}
                href={href}
                className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive
                    ? scrolled ? "bg-black/[0.06]" : "bg-white/15"
                    : scrolled ? "hover:bg-black/[0.04]" : "hover:bg-white/10"
                }`}
                style={{ color: navColor }}
              >
                {page.title}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: navColor }}
                  />
                )}
              </Link>
            );
          })}
          <Link
            href="/booking"
            className={`ml-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              scrolled
                ? "shadow-sm hover:shadow-md hover:opacity-90"
                : "backdrop-blur-sm border border-white/20 hover:bg-white/25"
            }`}
            style={{ backgroundColor: ctaBg, color: ctaText }}
          >
            Book Now
          </Link>
        </nav>

        <MobileNav
          pages={navPages}
          navFontColor={navColor}
          primaryColor={settings.brand.primaryColor}
          variant="transparent"
          scrolled={scrolled}
        />
      </div>
    </header>
  );
}
