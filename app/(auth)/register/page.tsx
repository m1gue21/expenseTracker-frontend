"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
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
          Create account
        </h1>
        <p className="mt-2 text-sm text-slate-400">Join ExpenseTrack as an employee</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">First name</label>
            <input required className="input-dark" placeholder="Jane" value={form.firstName} onChange={update("firstName")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Last name</label>
            <input required className="input-dark" placeholder="Doe" value={form.lastName} onChange={update("lastName")} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
          <input type="email" required className="input-dark" placeholder="you@company.com" value={form.email} onChange={update("email")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
          <input type="password" required className="input-dark" placeholder="Min. 6 characters" value={form.password} onChange={update("password")} />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <UserPlus size={16} />
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
