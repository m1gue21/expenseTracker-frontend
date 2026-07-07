"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

// La raíz solo decide a dónde mandarte según si hay sesión
export default function Home() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    router.replace(token ? "/dashboard" : "/login");
  }, [token, router]);

  return null;
}
