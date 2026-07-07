"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, LogOut, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/lib/store";
import { useTheme } from "@/lib/theme-provider";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import type { ThemeMode } from "@/design-system/tokens";

const themeOptions: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:pl-[calc(240px+1.5rem)]">
      <button
        onClick={onToggleSidebar}
        className="rounded-md p-2 text-foreground-muted transition-colors hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" strokeWidth={1.75} />
        <input
          type="search"
          placeholder="Search reports, expenses..."
          className="h-9 w-full rounded-md border border-[var(--border)] bg-muted/50 pl-9 pr-4 text-small text-foreground placeholder:text-foreground-muted transition-all focus:border-primary-500 focus:bg-[var(--input-bg)] focus:shadow-glow focus:outline-none"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setThemeOpen((v) => !v)}
            aria-label="Toggle theme"
            aria-expanded={themeOpen}
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "light" ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </Button>
          {themeOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} aria-hidden />
              <div className="glass absolute right-0 top-full z-50 mt-2 w-36 rounded-xl border border-[var(--border)] p-1 shadow-lg animate-slide-up">
                {themeOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => { setTheme(value); setThemeOpen(false); }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-small transition-colors",
                      theme === value ? "bg-primary-500/10 text-primary-500" : "text-foreground-secondary hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" strokeWidth={1.75} />
        </Button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <Avatar name={fullName} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-small font-medium text-foreground leading-tight">{fullName}</p>
              <p className="text-caption text-foreground-muted">{user.role}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-foreground-muted sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="glass absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] shadow-lg animate-slide-up">
                <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                  <p className="text-small font-medium text-foreground">{fullName}</p>
                  <p className="truncate text-caption text-foreground-muted">{user.email}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-500">
                    {user.role}
                  </span>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-small font-medium text-foreground-secondary transition-all duration-fast ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
                  >
                    <LogOut className="h-4 w-4 text-foreground-muted" strokeWidth={1.75} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
