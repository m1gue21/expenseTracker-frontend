"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Clock, CheckCircle2, XCircle } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  CategoryBarChart,
  MonthlyLineChart,
  StatusPieChart,
} from "@/components/charts/DashboardCharts";
import { dashboardApi, reportsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
import type { DashboardStats, ExpenseReport } from "@/types";

// Los EMPLOYEE no pueden llamar a /api/dashboard/stats (403),
// así que calculamos sus estadísticas localmente desde sus reportes.
function statsFromReports(reports: ExpenseReport[]): DashboardStats {
  const approved = reports.filter((r) => r.status === "APPROVED");
  const approvedExpenses = approved.flatMap((r) => r.expenses);

  const byCategory = { TRANSPORT: 0, ACCOMMODATION: 0, MEALS: 0, OTHER: 0 };
  approvedExpenses.forEach((e) => (byCategory[e.category] += e.amount));

  const months: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      month: key,
      total: approvedExpenses
        .filter((e) => e.expenseDate.startsWith(key))
        .reduce((acc, e) => acc + e.amount, 0),
    });
  }

  return {
    totalExpenses: approvedExpenses.reduce((acc, e) => acc + e.amount, 0),
    pendingReports: reports.filter((r) => r.status === "SUBMITTED").length,
    approvedReports: approved.length,
    rejectedReports: reports.filter((r) => r.status === "REJECTED").length,
    draftReports: reports.filter((r) => r.status === "DRAFT").length,
    totalUsers: 0,
    expensesByCategory: byCategory,
    expensesByMonth: months,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (isManager) {
          const [statsRes, reportsRes] = await Promise.all([
            dashboardApi.stats(),
            reportsApi.getAll(),
          ]);
          setStats(statsRes.data);
          setReports(reportsRes.data);
        } else {
          const { data } = await reportsApi.getMine();
          setReports(data);
          setStats(statsFromReports(data));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isManager]);

  if (loading || !stats) {
    return <p className="animate-pulse text-slate-400">Loading dashboard...</p>;
  }

  const recent = reports.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {isManager ? "Company-wide expense overview" : "Your expense overview"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Expenses" value={formatMoney(stats.totalExpenses)} icon={Wallet} accent="blue" />
        <StatCard title="Pending Reports" value={stats.pendingReports} icon={Clock} accent="yellow" />
        <StatCard title="Approved Reports" value={stats.approvedReports} icon={CheckCircle2} accent="green" />
        <StatCard title="Rejected Reports" value={stats.rejectedReports} icon={XCircle} accent="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass-card p-5 xl:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Expenses by category</h2>
          <CategoryBarChart stats={stats} />
        </div>
        <div className="glass-card p-5 xl:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Monthly spend (last 6 months)</h2>
          <MonthlyLineChart stats={stats} />
        </div>
        <div className="glass-card p-5 xl:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Report status distribution</h2>
          <StatusPieChart stats={stats} />
        </div>
      </div>

      {/* Recent reports */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-300">Recent reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((report) => (
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
                  <td className="px-5 py-3.5"><StatusBadge status={report.status} /></td>
                  <td className="px-5 py-3.5 text-slate-400">{formatDate(report.createdAt)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No reports yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
