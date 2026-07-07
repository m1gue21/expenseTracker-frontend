"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Trash2, Check, X, Plus, Circle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import CategoryIcon, { categoryLabels } from "@/components/ui/CategoryIcon";
import { reportsApi, expensesApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ExpenseCategory, ExpenseReport } from "@/types";

const emptyExpense = {
  title: "",
  amount: "",
  category: "TRANSPORT" as ExpenseCategory,
  expenseDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await reportsApi.getOne(Number(id));
      setReport(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-danger">{error}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/reports")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Card>
    );
  }

  if (!report) {
    return <div className="animate-pulse space-y-4"><div className="h-32 rounded-xl bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div>;
  }

  const isOwner = user?.id === report.user.id;
  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";
  const canEdit = isOwner && report.status === "DRAFT";
  const canReview = isManager && report.status === "SUBMITTED" && !isOwner;

  const run = async (action: () => Promise<unknown>, redirect = false) => {
    setActionError("");
    setBusy(true);
    try {
      await action();
      if (redirect) router.push("/reports");
      else await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await expensesApi.add(report.id, {
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        expenseDate: expenseForm.expenseDate,
        notes: expenseForm.notes || null,
      });
      setExpenseForm(emptyExpense);
    });
  };

  const timeline = [
    { label: "Report created", date: report.createdAt, done: true },
    { label: "Submitted for review", date: report.submittedAt, done: !!report.submittedAt },
    {
      label: report.status === "APPROVED" ? "Approved" : report.status === "REJECTED" ? "Rejected" : "Awaiting decision",
      date: null,
      done: report.status === "APPROVED" || report.status === "REJECTED",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => router.push("/reports")}>
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Back to reports
      </Button>

      {/* Header */}
      <Card padding="md">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-heading-sm font-semibold tracking-tight text-foreground">{report.title}</h1>
              <StatusBadge status={report.status} />
            </div>
            <p className="max-w-xl text-small text-foreground-secondary">{report.description || "No description"}</p>
            <p className="text-caption text-foreground-muted">
              {report.user.firstName} {report.user.lastName} · {formatDate(report.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption text-foreground-muted">Total amount</p>
            <p className="text-heading-md font-semibold tracking-tight text-primary-500">{formatMoney(report.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {canEdit && (
            <>
              <Button disabled={busy || report.expenses.length === 0} onClick={() => run(() => reportsApi.submit(report.id))}>
                <Send className="h-4 w-4" strokeWidth={1.75} /> Submit
              </Button>
              <Button variant="danger" disabled={busy} onClick={() => run(() => reportsApi.remove(report.id), true)}>
                <Trash2 className="h-4 w-4" strokeWidth={1.75} /> Delete
              </Button>
            </>
          )}
          {canReview && (
            <>
              <Button variant="success" disabled={busy} onClick={() => run(() => reportsApi.approve(report.id))}>
                <Check className="h-4 w-4" strokeWidth={1.75} /> Approve
              </Button>
              <Button variant="danger" disabled={busy} onClick={() => run(() => reportsApi.reject(report.id))}>
                <X className="h-4 w-4" strokeWidth={1.75} /> Reject
              </Button>
            </>
          )}
        </div>
        {actionError && <p className="mt-3 text-small text-danger">{actionError}</p>}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] px-6 py-4">
              <CardTitle>Expenses ({report.expenses.length})</CardTitle>
            </div>
            {report.expenses.length === 0 ? (
              <p className="px-6 py-12 text-center text-small text-foreground-muted">No expenses yet</p>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {report.expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <CategoryIcon category={expense.category} />
                      </div>
                      <div>
                        <p className="text-small font-medium text-foreground">{expense.title}</p>
                        <p className="text-caption text-foreground-muted">
                          {categoryLabels[expense.category]} · {formatDate(expense.expenseDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-small font-semibold text-foreground">{formatMoney(expense.amount)}</span>
                      {canEdit && (
                        <Button variant="ghost" size="icon" disabled={busy} onClick={() => run(() => expensesApi.remove(expense.id))} aria-label="Delete expense">
                          <Trash2 className="h-4 w-4 text-danger" strokeWidth={1.75} />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {canEdit && (
            <Card padding="md">
              <CardHeader><CardTitle>Add expense</CardTitle></CardHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input required placeholder="Expense title" value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} />
                  <Input required type="number" step="0.01" min="0.01" placeholder="Amount (€)" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                  <select
                    className="h-10 rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 text-small text-foreground focus:border-primary-500 focus:shadow-glow focus:outline-none"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                  >
                    {(Object.keys(categoryLabels) as ExpenseCategory[]).map((c) => (
                      <option key={c} value={c}>{categoryLabels[c]}</option>
                    ))}
                  </select>
                  <Input required type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} />
                </div>
                <Input placeholder="Notes (optional)" value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
                <Button type="submit" disabled={busy}>
                  <Plus className="h-4 w-4" strokeWidth={1.75} /> Add expense
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <Card padding="md" className="h-fit">
          <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
          <ol className="space-y-0">
            {timeline.map((step, i) => (
              <li key={i} className="flex gap-3 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <Circle
                    className={cn("h-4 w-4", step.done ? "fill-primary-500 text-primary-500" : "text-foreground-muted")}
                    strokeWidth={0}
                  />
                  {i < timeline.length - 1 && (
                    <div className={cn("mt-1 w-px flex-1 min-h-[24px]", step.done ? "bg-primary-500/30" : "bg-[var(--border)]")} />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className={cn("text-small font-medium", step.done ? "text-foreground" : "text-foreground-muted")}>{step.label}</p>
                  {step.date && <p className="text-caption text-foreground-muted">{formatDate(step.date)}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
