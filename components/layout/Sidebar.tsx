"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/lib/store";
import { Logo } from "@/components/ui/BrandLogo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/admin", label: "Admin", icon: ShieldCheck, roles: ["MANAGER", "ADMIN"] },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const links = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-[var(--border)]",
          "bg-[var(--sidebar-bg)] transition-transform duration-normal ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo — contenido acotado para no desbordar hacia arriba */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-4">
          <div className="min-w-0 flex-1">
            <Logo href="/dashboard" />
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-foreground-muted hover:bg-muted lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-small font-medium",
                  "transition-all duration-fast ease-out",
                  active
                    ? "bg-[var(--sidebar-active)] text-primary-500"
                    : "text-foreground-secondary hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary-500" />
                )}
                <Icon
                  className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary-500" : "text-foreground-muted group-hover:text-foreground-secondary")}
                  strokeWidth={1.75}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border-subtle)] p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-small font-medium text-foreground-muted transition-colors hover:bg-muted/60 hover:text-foreground-secondary"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
