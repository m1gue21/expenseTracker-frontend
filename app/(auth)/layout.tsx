"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLogo } from "@/components/ui/BrandLogo";
import { useAuthStore } from "@/lib/store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  return (
    <div className="relative flex min-h-screen">
      {/* Panel izquierdo — branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-[var(--bg-surface)] p-12 lg:flex">
        <AuthLogo size="2xl" />
        <div className="max-w-md space-y-6">
          <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">
            Financial clarity for modern teams
          </h1>
          <p className="text-body text-foreground-secondary leading-relaxed">
            Track corporate travel expenses, submit reports, and get approvals — all in one premium workspace built for productivity.
          </p>
          <div className="flex gap-8 pt-4">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "2min", label: "Avg. approval" },
              { value: "256-bit", label: "Encryption" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-title-lg font-semibold text-primary-500">{value}</p>
                <p className="text-caption text-foreground-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-caption text-foreground-muted">© 2026 expenseTracker · @m1gue21</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] animate-slide-up">{children}</div>
      </div>
    </div>
  );
}
