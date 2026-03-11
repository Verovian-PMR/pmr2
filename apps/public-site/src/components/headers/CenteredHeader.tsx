import Link from "next/link";
import MobileNav from "../MobileNav";

interface Props {
  settings: any;
  navPages: any[];
  pathname: string;
}

export default function CenteredHeader({ settings, navPages, pathname }: Props) {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md bg-white/95"
      style={{ backgroundColor: settings.header.bgColor === "#FFFFFF" ? undefined : settings.header.bgColor }}
    >
      {/* Top tier — Logo centered */}
      <div className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
          {settings.brand.logoUrl ? (
            <Link href="/" className="shrink-0">
              <img src={settings.brand.logoUrl} alt="Logo" className="h-10" />
            </Link>
          ) : (
            <Link href="/" className="text-2xl font-bold tracking-tight" style={{ color: settings.header.navFontColor }}>
              VivIPractice
            </Link>
          )}
        </div>
      </div>

      {/* Bottom tier — Nav centered */}
      <div className="border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <nav className="hidden md:flex items-center gap-0.5 text-sm py-2" aria-label="Main navigation">
            {navPages.map((page: any) => {
              const href = page.slug === "/" ? "/" : page.slug;
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={page.id}
                  href={href}
                  className={`relative px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                    isActive
                      ? "bg-black/[0.06]"
                      : "hover:bg-black/[0.04]"
                  }`}
                  style={{ color: settings.header.navFontColor }}
                >
                  {page.title}
                  {isActive && (
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: settings.header.navFontColor }}
                    />
                  )}
                </Link>
              );
            })}
            <span className="mx-2 w-px h-5 bg-neutral-200" aria-hidden="true" />
            <Link
              href="/booking"
              className="px-5 py-2 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 shadow-sm hover:shadow-md"
              style={{ backgroundColor: settings.brand.primaryColor }}
            >
              Book Now
            </Link>
          </nav>

          <div className="md:hidden py-2 flex items-center justify-center w-full">
            <MobileNav
              pages={navPages}
              navFontColor={settings.header.navFontColor}
              primaryColor={settings.brand.primaryColor}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
