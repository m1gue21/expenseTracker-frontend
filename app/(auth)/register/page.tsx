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
      <div className="space-y-8">
      <div className="flex justify-center lg:hidden">
        <AuthLogo size="xl" />
      </div>

      <div className="space-y-2">
        <h2 className="text-heading-sm font-semibold tracking-tight text-foreground">Create your account</h2>
        <p className="text-small text-foreground-muted">Start managing expenses in minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" required placeholder="Jane" value={form.firstName} onChange={update("firstName")} />
          <Input label="Last name" required placeholder="Doe" value={form.lastName} onChange={update("lastName")} />
        </div>
        <Input label="Email" type="email" required placeholder="you@company.com" value={form.email} onChange={update("email")} autoComplete="email" />
        <Input label="Password" type="password" required placeholder="Min. 6 characters" value={form.password} onChange={update("password")} autoComplete="new-password" />

        {error && (
          <div className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 text-small text-danger" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-small text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary-500 transition-colors hover:text-primary-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
