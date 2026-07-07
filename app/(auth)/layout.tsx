"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

// Layout del grupo (auth): si ya hay sesión, fuera de aquí
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Orbes de gradiente decorativos */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
