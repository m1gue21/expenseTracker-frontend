"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Wallet, Clock, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { dashboardApi, reportsApi, usersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
import type { DashboardStats, ExpenseReport, User } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pending, setPending] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER" || isAdmin;

  useEffect(() => {
    if (!user) return;
    if (!isManager) {
      router.replace("/dashboard");
      return;
    }
    const load = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          dashboardApi.stats(),
          reportsApi.getAll(),
        ]);
        setStats(statsRes.data);
        setPending(reportsRes.data.filter((r) => r.status === "SUBMITTED"));
        // GET /api/users es solo ADMIN; el MANAGER no lo llama
        if (isAdmin) {
          const usersRes = await usersApi.getAll();
          setUsers(usersRes.data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isManager, isAdmin, router]);

  if (!isManager || loading || !stats) {
    return <p className="animate-pulse text-slate-400">Loading admin panel...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-400">Global overview and pending approvals</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} accent="cyan" />
        <StatCard title="Approved Spend" value={formatMoney(stats.totalExpenses)} icon={Wallet} accent="blue" />
        <StatCard title="Pending Approval" value={stats.pendingReports} icon={Clock} accent="yellow" />
        <StatCard title="Approved Reports" value={stats.approvedReports} icon={CheckCircle2} accent="green" />
      </div>

      {/* Reportes pendientes de aprobación */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-300">
            Reports awaiting approval ({pending.length})
          </h2>
        </div>
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Nothing to review 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => router.push(`/reports/${report.id}`)}
                    className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{report.title}</td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {report.user.firstName} {report.user.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{formatMoney(report.totalAmount)}</td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {report.submittedAt ? formatDate(report.submittedAt) : "—"}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={report.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usuarios (solo ADMIN) */}
      {isAdmin && (
        <div className="glass-card overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-300">All users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
