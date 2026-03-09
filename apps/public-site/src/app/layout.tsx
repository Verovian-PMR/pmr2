import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_SETTINGS, DEFAULT_PAGES } from "@/lib/site-config";
import { fetchBrandSettings, fetchPages } from "@/lib/api";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "VivIPractice Pharmacy",
  description: "Book your appointment online",
};

async function getSettings() {
  try {
    const remote = await fetchBrandSettings();
    if (remote && typeof remote === "object" && "brand" in remote) return remote;
  } catch {}
  return DEFAULT_SETTINGS;
}

async function getPages() {
  try {
    const remote = await fetchPages();
    if (Array.isArray(remote) && remote.length > 0) {
      return remote
        .filter((p: any) => p.isVisible)
        .sort((a: any, b: any) => a.order - b.order);
    }
  } catch {}
  return DEFAULT_PAGES.filter((p) => p.isVisible).sort((a, b) => a.order - b.order);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings: any = await getSettings();
  const font = settings.brand.fontFamily.replace(/\s+/g, "+");
  const footerBg = settings.footer.useCustomBg ? settings.footer.bgColor : settings.brand.primaryColor;
  const pages = await getPages();
  const navPages = pages.filter((p: any) => !p.isBooking);

  return (
    <html lang="en">
      <head>
        <link
          href={`https://fonts.googleapis.com/css2?family=${font}:wght@400;500;600;700&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-white text-neutral-900"
        style={{ fontFamily: `'${settings.brand.fontFamily}', system-ui, sans-serif` }}
      >
        {/* ── Header ── */}
        <header
          className="border-b border-neutral-200"
          style={{ backgroundColor: settings.header.bgColor }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {settings.brand.logoUrl ? (
              <a href="/">
                <img src={settings.brand.logoUrl} alt="VivIPractice" className="h-8" />
              </a>
            ) : (
              <a href="/" className="text-xl font-bold" style={{ color: settings.header.navFontColor }}>
                VivIPractice
              </a>
            )}

            <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main navigation">
              {navPages.map((page: any) => (
                <a
                  key={page.id}
                  href={page.slug === "/" ? "/" : page.slug}
                  className="transition-colors hover:opacity-75"
                  style={{ color: settings.header.navFontColor }}
                >
                  {page.title}
                </a>
              ))}
              <a
                href="/booking"
                className="px-4 py-1.5 rounded-md text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: settings.brand.primaryColor }}
              >
                Book Now
              </a>
            </nav>

            {/* Mobile hamburger */}
            <MobileNav
              pages={navPages}
              navFontColor={settings.header.navFontColor}
              primaryColor={settings.brand.primaryColor}
            />
          </div>
        </header>

        <main>{children}</main>

        {/* ── Footer ── */}
        <footer className="py-12 mt-16" style={{ backgroundColor: footerBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm" style={{ color: settings.footer.textColor }}>
            <p>&copy; {new Date().getFullYear()} VivIPractice. All rights reserved.</p>
            {(settings.footer.privacyUrl || settings.footer.termsUrl) && (
              <div className="flex justify-center gap-4 mt-3 opacity-80">
                {settings.footer.privacyUrl && (
                  <a href={settings.footer.privacyUrl} className="hover:underline" style={{ color: settings.footer.textColor }}>
                    Privacy &amp; Cookies
                  </a>
                )}
                {settings.footer.termsUrl && (
                  <a href={settings.footer.termsUrl} className="hover:underline" style={{ color: settings.footer.textColor }}>
                    Terms &amp; Conditions
                  </a>
                )}
              </div>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
