import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VivIPractice Control Hub",
  description: "Platform Administration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
