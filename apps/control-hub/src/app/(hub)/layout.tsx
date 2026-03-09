import Link from "next/link";

const navItems = [
  { label: "Instances", href: "/instances", icon: "🏗️" },
  { label: "Monitoring", href: "/monitoring", icon: "📊" },
];

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-neutral-900 text-white flex flex-col">
        <div className="p-6 border-b border-neutral-700">
          <h1 className="text-xl font-bold">Control Hub</h1>
          <p className="text-xs text-neutral-400 mt-1">Super Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
