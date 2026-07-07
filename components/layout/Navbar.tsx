"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ChevronDown, Menu } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(59,130,246,0.1)] bg-[rgba(5,11,24,0.85)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-extrabold text-transparent">
              ExpenseTrack
            </span>
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {user.role}
              </span>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="glass-card absolute right-0 mt-2 w-48 overflow-hidden py-1 shadow-xl">
              <div className="border-b border-white/5 px-4 py-2 sm:hidden">
                <p className="text-sm text-foreground">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
