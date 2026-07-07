"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Trash2, Check, X, Plus, CircleDot,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { reportsApi, expensesApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
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

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => router.push("/reports")} className="btn-ghost mt-4">
          <ArrowLeft size={16} /> Back to reports
        </button>
      </div>
    );
  }

  if (!report) return <p className="animate-pulse text-slate-400">Loading report...</p>;

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

  // Timeline sencillo derivado de los datos del reporte
  const timeline = [
    { label: "Report created", date: report.createdAt, active: true },
    { label: "Submitted for review", date: report.submittedAt, active: !!report.submittedAt },
    {
      label:
        report.status === "APPROVED"
          ? "Approved"
          : report.status === "REJECTED"
            ? "Rejected"
            : "Pending decision",
      date: null,
      active: report.status === "APPROVED" || report.status === "REJECTED",
    },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/reports")} className="btn-ghost">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{report.title}</h1>
              <StatusBadge status={report.status} />
            </div>
            <p className="mt-2 text-sm text-slate-400">{report.description || "No description"}</p>
            <p className="mt-2 text-xs text-slate-500">
              By {report.user.firstName} {report.user.lastName} · {formatDate(report.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total amount</p>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-extrabold text-transparent">
              {formatMoney(report.totalAmount)}
            </p>
          </div>
        </div>

        {/* Acciones según rol y estado */}
        <div className="mt-5 flex flex-wrap gap-3">
          {canEdit && (
            <>
              <button
                disabled={busy || report.expenses.length === 0}
                onClick={() => run(() => reportsApi.submit(report.id))}
                className="btn-primary"
                title={report.expenses.length === 0 ? "Add at least one expense first" : ""}
              >
                <Send size={16} /> Submit for review
              </button>
              <button
                disabled={busy}
                onClick={() => run(() => reportsApi.remove(report.id), true)}
                className="btn-ghost !border-red-500/30 !text-red-400 hover:!bg-red-500/10"
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
          {canReview && (
            <>
              <button
                disabled={busy}
                onClick={() => run(() => reportsApi.approve(report.id))}
                className="btn-primary !from-emerald-500 !to-emerald-600"
              >
                <Check size={16} /> Approve
              </button>
              <button
                disabled={busy}
                onClick={() => run(() => reportsApi.reject(report.id))}
                className="btn-ghost !border-red-500/30 !text-red-400 hover:!bg-red-500/10"
              >
                <X size={16} /> Reject
              </button>
            </>
          )}
        </div>
        {actionError && <p className="mt-3 text-sm text-red-400">{actionError}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lista de gastos */}
        <div className="space-y-4 lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="border-b border-white/5 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-300">
                Expenses ({report.expenses.length})
              </h2>
            </div>
            {report.expenses.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                No expenses yet. Add your first one below.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {report.expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-lg">
                        <CategoryIcon category={expense.category} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{expense.title}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(expense.expenseDate)}
                          {expense.notes ? ` · ${expense.notes}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-200">
                        {formatMoney(expense.amount)}
                      </span>
                      {canEdit && (
                        <button
                          disabled={busy}
                          onClick={() => run(() => expensesApi.remove(expense.id))}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          aria-label="Delete expense"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Formulario inline para agregar gasto */}
          {canEdit && (
            <form onSubmit={handleAddExpense} className="glass-card space-y-4 p-5">
              <h2 className="text-sm font-semibold text-slate-300">Add expense</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  required
                  className="input-dark"
                  placeholder="Expense title"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                />
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input-dark"
                  placeholder="Amount (€)"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
                <select
                  className="input-dark"
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })
                  }
                >
                  <option value="TRANSPORT">✈️ Transport</option>
                  <option value="ACCOMMODATION">🏨 Accommodation</option>
                  <option value="MEALS">🍽️ Meals</option>
                  <option value="OTHER">📦 Other</option>
                </select>
                <input
                  required
                  type="date"
                  className="input-dark"
                  value={expenseForm.expenseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                />
              </div>
              <input
                className="input-dark"
                placeholder="Notes (optional)"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              />
              <button type="submit" disabled={busy} className="btn-primary">
                <Plus size={16} /> Add expense
              </button>
            </form>
          )}
        </div>

        {/* Timeline */}
        <div className="glass-card h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Activity timeline</h2>
          <ol className="space-y-5">
            {timeline.map((step, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <CircleDot
                    size={18}
                    className={step.active ? "text-secondary" : "text-slate-600"}
                  />
                  {i < timeline.length - 1 && (
                    <div className={`mt-1 h-8 w-px ${step.active ? "bg-secondary/40" : "bg-slate-700"}`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm ${step.active ? "text-foreground" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-slate-500">{formatDate(step.date)}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
