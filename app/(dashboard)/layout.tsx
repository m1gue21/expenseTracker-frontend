"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store";

// Guard del área privada: sin token no entras.
// Se hace client-side porque el token vive en localStorage (Zustand persist).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // hydrated evita el mismatch SSR/cliente: en el servidor no hay localStorage
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;

  return (
    <div className="min-h-screen">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="p-4 pt-6 sm:p-6 lg:ml-60">{children}</main>
    </div>
  );
}
