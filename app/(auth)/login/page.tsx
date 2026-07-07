"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
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
    <div className="glass-card p-8">
      <div className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-extrabold text-transparent">
          ExpenseTrack
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Corporate travel expense management
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            required
            className="input-dark"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            required
            className="input-dark"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <LogIn size={16} />
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>

      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-slate-500">
        <p className="mb-1 font-semibold text-slate-400">Demo credentials</p>
        <p>admin@expensetrack.com / admin123</p>
        <p>manager@expensetrack.com / manager123</p>
        <p>employee@expensetrack.com / employee123</p>
      </div>
    </div>
  );
}
