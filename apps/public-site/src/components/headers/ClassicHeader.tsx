import Link from "next/link";
import MobileNav from "../MobileNav";

interface Props {
  settings: any;
  navPages: any[];
  pathname: string;
}

export default function ClassicHeader({ settings, navPages, pathname }: Props) {
  return (
    <header
      className="border-b border-neutral-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95"
      style={{ backgroundColor: settings.header.bgColor === "#FFFFFF" ? undefined : settings.header.bgColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {settings.brand.logoUrl ? (
          <Link href="/" className="shrink-0">
            <img src={settings.brand.logoUrl} alt="Logo" className="h-8" />
          </Link>
        ) : (
          <Link href="/" className="text-xl font-bold tracking-tight" style={{ color: settings.header.navFontColor }}>
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
                className={`relative px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActive ? "bg-black/[0.06]" : "hover:bg-black/[0.04]"
                }`}
                style={{ color: settings.header.navFontColor }}
              >
                {page.title}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: settings.header.navFontColor }}
                  />
                )}
              </Link>
            );
          })}
          <Link
            href="/booking"
            className="ml-2 px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 shadow-sm hover:shadow-md"
            style={{ backgroundColor: settings.brand.primaryColor }}
          >
            Book Now
          </Link>
        </nav>

        <MobileNav
          pages={navPages}
          navFontColor={settings.header.navFontColor}
          primaryColor={settings.brand.primaryColor}
        />
      </div>
    </header>
  );
}
