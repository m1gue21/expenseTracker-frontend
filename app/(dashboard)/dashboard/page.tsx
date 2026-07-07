"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  ArrowUpRight, Target,
} from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Progress from "@/components/ui/Progress";
import { MainChart, CategoryChart, StatusChart } from "@/components/charts/DashboardCharts";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { dashboardApi, reportsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
import type { DashboardStats, ExpenseReport } from "@/types";

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
      total: approvedExpenses.filter((e) => e.expenseDate.startsWith(key)).reduce((a, e) => a + e.amount, 0),
    });
  }

  return {
    totalExpenses: approvedExpenses.reduce((a, e) => a + e.amount, 0),
    pendingReports: reports.filter((r) => r.status === "SUBMITTED").length,
    approvedReports: approved.length,
    rejectedReports: reports.filter((r) => r.status === "REJECTED").length,
    draftReports: reports.filter((r) => r.status === "DRAFT").length,
    totalUsers: 0,
    expensesByCategory: byCategory,
    expensesByMonth: months,
  };
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (isManager) {
          const [statsRes, reportsRes] = await Promise.all([dashboardApi.stats(), reportsApi.getAll()]);
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
    })();
  }, [user, isManager]);

  if (loading || !stats) {
    return (
      <div className="space-y-8">
        <SkeletonCard />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const monthName = MONTHS[new Date().getMonth()];
  const rejectedTotal = reports.filter((r) => r.status === "REJECTED").reduce((a, r) => a + r.totalAmount, 0);
  const pendingTotal = reports.filter((r) => r.status === "SUBMITTED").reduce((a, r) => a + r.totalAmount, 0);
  const balance = stats.totalExpenses - rejectedTotal;
  const budget = stats.totalExpenses * 1.25 || 5000;
  const savingsPct = Math.max(0, Math.round(((budget - stats.totalExpenses) / budget) * 100));

  const recentExpenses = reports
    .flatMap((r) => r.expenses.map((e) => ({ ...e, reportTitle: r.title, employee: r.user })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const categoryBudgets = Object.entries(stats.expensesByCategory).map(([cat, spent]) => ({
    category: cat,
    spent,
    budget: spent * 1.3 || 500,
  }));

  const goals = [
    { label: "Reduce travel costs", progress: savingsPct, target: "15% reduction" },
    { label: "Faster approvals", progress: stats.approvedReports > 0 ? 78 : 20, target: "< 48h turnaround" },
    { label: "Report compliance", progress: stats.draftReports === 0 ? 100 : 65, target: "Zero pending drafts" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-small text-foreground-muted">Good {new Date().getHours() < 12 ? "morning" : "afternoon"},</p>
          <h1 className="text-heading-md font-semibold tracking-tight text-foreground">
            {user?.firstName} 👋
          </h1>
          <p className="mt-1 text-small text-foreground-secondary">
            {monthName} summary · {isManager ? "Company overview" : "Your expenses"}
          </p>
        </div>
      </div>

      {/* 4 métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Reimbursed"
          value={formatMoney(stats.totalExpenses)}
          icon={TrendingUp}
          accent="primary"
          trend="+12% vs last month"
        />
        <MetricCard
          title="Pending"
          value={formatMoney(pendingTotal)}
          icon={TrendingDown}
          accent="warning"
          subtitle={`${stats.pendingReports} reports awaiting`}
        />
        <MetricCard
          title="Net balance"
          value={formatMoney(balance)}
          icon={Wallet}
          accent="success"
          trend={balance >= 0 ? "Healthy" : "Review needed"}
        />
        <MetricCard
          title="Savings"
          value={`${savingsPct}%`}
          icon={PiggyBank}
          accent="info"
          subtitle="Under monthly budget"
        />
      </div>

      {/* Gráfico principal + categorías + status */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <MainChart stats={stats} />
        <CategoryChart stats={stats} />
        <StatusChart stats={stats} />
      </div>

      {/* Transacciones + Presupuesto + Objetivos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Últimas transacciones */}
        <Card padding="none" className="lg:col-span-2 overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] px-6 py-4">
            <CardTitle>Recent transactions</CardTitle>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {recentExpenses.length === 0 ? (
              <p className="px-6 py-12 text-center text-small text-foreground-muted">No transactions yet</p>
            ) : (
              recentExpenses.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => router.push(`/reports/${exp.expenseReportId}`)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                    <CategoryIcon category={exp.category} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-small font-medium text-foreground">{exp.title}</p>
                    <p className="text-caption text-foreground-muted">{exp.reportTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-small font-semibold text-foreground">{formatMoney(exp.amount)}</p>
                    <p className="text-caption text-foreground-muted">{formatDate(exp.expenseDate)}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground-muted" />
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Presupuesto + Objetivos */}
        <div className="space-y-4">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
            <div className="space-y-5">
              <Progress value={stats.totalExpenses} max={budget} label="Monthly spend" accent="primary" />
              {categoryBudgets.filter((c) => c.spent > 0).slice(0, 4).map(({ category, spent, budget: b }) => (
                <Progress
                  key={category}
                  value={spent}
                  max={b}
                  label={category.charAt(0) + category.slice(1).toLowerCase()}
                  accent={spent / b > 0.85 ? "warning" : "primary"}
                />
              ))}
            </div>
          </Card>

          <Card padding="md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary-500" strokeWidth={1.75} />
                <CardTitle>Goals</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-4">
              {goals.map((g) => (
                <div key={g.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-small text-foreground-secondary">{g.label}</p>
                    <span className="text-caption text-foreground-muted">{g.target}</span>
                  </div>
                  <Progress value={g.progress} showValue accent="success" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Reportes recientes */}
      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] px-6 py-4">
          <CardTitle>Recent reports</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-small">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-caption uppercase tracking-wider text-foreground-muted">
                <th className="px-6 py-3 font-medium">Report</th>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 5).map((r) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/reports/${r.id}`)}
                  className="cursor-pointer border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-4 font-medium text-foreground">{r.title}</td>
                  <td className="px-6 py-4 text-foreground-secondary">{r.user.firstName} {r.user.lastName}</td>
                  <td className="px-6 py-4 text-foreground">{formatMoney(r.totalAmount)}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-4 text-foreground-muted">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
