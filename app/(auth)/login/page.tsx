"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthLogo } from "@/components/ui/BrandLogo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      login(data.user, data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-8">
      <div className="flex justify-center lg:hidden">
        <AuthLogo size="xl" />
      </div>

      <div className="space-y-2">
        <h2 className="text-heading-sm font-semibold tracking-tight text-foreground">Welcome back</h2>
        <p className="text-small text-foreground-muted">Sign in to your expenseTracker account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 text-small text-danger" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-small text-foreground-muted">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary-500 transition-colors hover:text-primary-400">
          Create one
        </Link>
      </p>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-muted/30 p-4">
        <p className="mb-2 text-caption font-medium uppercase tracking-wider text-foreground-muted">Demo access</p>
        <div className="space-y-1 text-caption text-foreground-secondary">
          <p>admin@expensetrack.com · admin123</p>
          <p>manager@expensetrack.com · manager123</p>
          <p>employee@expensetrack.com · employee123</p>
        </div>
      </div>
    </div>
  );
}
