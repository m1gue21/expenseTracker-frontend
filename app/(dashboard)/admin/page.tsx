"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Wallet, Clock, CheckCircle2 } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
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
    if (!isManager) { router.replace("/dashboard"); return; }
    (async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([dashboardApi.stats(), reportsApi.getAll()]);
        setStats(statsRes.data);
        setPending(reportsRes.data.filter((r) => r.status === "SUBMITTED"));
        if (isAdmin) {
          const usersRes = await usersApi.getAll();
          setUsers(usersRes.data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, isManager, isAdmin, router]);

  if (!isManager || loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-heading-sm font-semibold tracking-tight text-foreground">Admin</h1>
        <p className="mt-1 text-small text-foreground-muted">Global overview and pending approvals</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total users" value={stats.totalUsers} icon={Users} accent="secondary" />
        <MetricCard title="Approved spend" value={formatMoney(stats.totalExpenses)} icon={Wallet} accent="primary" />
        <MetricCard title="Pending approval" value={stats.pendingReports} icon={Clock} accent="warning" />
        <MetricCard title="Approved reports" value={stats.approvedReports} icon={CheckCircle2} accent="success" />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] px-6 py-4">
          <CardTitle>Awaiting approval ({pending.length})</CardTitle>
        </div>
        {pending.length === 0 ? (
          <p className="px-6 py-12 text-center text-small text-foreground-muted">All caught up 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-caption uppercase tracking-wider text-foreground-muted">
                  <th className="px-6 py-3 font-medium">Report</th>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Submitted</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => router.push(`/reports/${report.id}`)}
                    className="cursor-pointer border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{report.title}</td>
                    <td className="px-6 py-4 text-foreground-secondary">{report.user.firstName} {report.user.lastName}</td>
                    <td className="px-6 py-4 text-foreground">{formatMoney(report.totalAmount)}</td>
                    <td className="px-6 py-4 text-foreground-muted">{report.submittedAt ? formatDate(report.submittedAt) : "—"}</td>
                    <td className="px-6 py-4"><StatusBadge status={report.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isAdmin && (
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] px-6 py-4">
            <CardTitle>All users ({users.length})</CardTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-caption uppercase tracking-wider text-foreground-muted">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--border-subtle)] last:border-0">
                    <td className="px-6 py-4 font-medium text-foreground">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-foreground-secondary">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-caption font-medium text-primary-500">{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
