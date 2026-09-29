"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/penjualan", label: "Penjualan", icon: "🛒" },
  { href: "/database", label: "Database", icon: "🗄️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-xl">🍞</div>
          <div>
            <div className="font-bold text-slate-800">Sakera Bakery</div>
            <div className="text-xs text-slate-500">Sistem Manajemen</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        {menu.map((m) => {
          const active = pathname === m.href;
          return (
            <Link key={m.href} href={m.href} className={"flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm transition " + (active ? "bg-amber-500 text-white font-semibold" : "text-slate-600 hover:bg-slate-100")}>
              <span className="text-lg">{m.icon}</span>
              <span>{m.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 text-xs text-slate-400">© 2026 Sakera Bakery</div>
    </aside>
  );
}
