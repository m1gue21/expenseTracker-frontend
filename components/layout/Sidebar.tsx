"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reports", label: "Reports", icon: FileText },
    // Admin solo visible para MANAGER/ADMIN
    ...(user && user.role !== "EMPLOYEE"
      ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }]
      : []),
  ];

  return (
    <>
      {/* Overlay para cerrar en mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-60 border-r border-[rgba(59,130,246,0.1)] bg-[rgba(8,15,30,0.95)] p-4 backdrop-blur-sm transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-primary/20 to-secondary/10 text-primary shadow-glow-blue"
                    : "text-slate-400 hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
