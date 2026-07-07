"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { reportsApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
import type { ExpenseReport, ReportStatus } from "@/types";
import { cn } from "@/lib/cn";

const FILTERS: (ReportStatus | "ALL")[] = ["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"];

export default function ReportsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = isManager ? await reportsApi.getAll() : await reportsApi.getMine();
      setReports(data);
      setLoading(false);
    })();
  }, [user, isManager]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await reportsApi.create(form);
      router.push(`/reports/${data.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filtered = filter === "ALL" ? reports : reports.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-heading-sm font-semibold tracking-tight text-foreground">Reports</h1>
          <p className="mt-1 text-small text-foreground-muted">
            {isManager ? "All company expense reports" : "Your expense reports"}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          New report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-foreground-muted" strokeWidth={1.75} />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-caption font-medium transition-all duration-fast",
              filter === f
                ? "bg-primary-500/10 text-primary-500 ring-1 ring-primary-500/20"
                : "text-foreground-muted hover:bg-muted hover:text-foreground-secondary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New expense report" description="Create a draft report to start adding expenses.">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" required placeholder="Client visit — Berlin" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="space-y-2">
            <label className="block text-small font-medium text-foreground-secondary">Description</label>
            <textarea
              className="min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-small text-foreground placeholder:text-foreground-muted focus:border-primary-500 focus:shadow-glow focus:outline-none"
              placeholder="Purpose of the trip..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {error && <p className="text-small text-danger">{error}</p>}
          <Button type="submit" className="w-full">Create report</Button>
        </form>
      </Modal>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No reports found"
          description="Create your first expense report to get started."
          action={{ label: "New report", onClick: () => setShowForm(true) }}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-caption uppercase tracking-wider text-foreground-muted">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => router.push(`/reports/${report.id}`)}
                    className="cursor-pointer border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{report.title}</td>
                    <td className="px-6 py-4 text-foreground-secondary">{report.user.firstName} {report.user.lastName}</td>
                    <td className="px-6 py-4 text-foreground">{formatMoney(report.totalAmount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={report.status} /></td>
                    <td className="px-6 py-4 text-foreground-muted">{formatDate(report.createdAt)}</td>
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
