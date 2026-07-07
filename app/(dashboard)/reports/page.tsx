"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { reportsApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatMoney } from "@/lib/format";
import type { ExpenseReport, ReportStatus } from "@/types";

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

  const load = async () => {
    // MANAGER/ADMIN ven todos los reportes; EMPLOYEE solo los suyos
    const { data } = isManager ? await reportsApi.getAll() : await reportsApi.getMine();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expense Reports</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isManager ? "All reports across the company" : "Your expense reports"}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> New report
        </button>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-glow-blue"
                : "border border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/25"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Modal de creación */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">New expense report</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
                <input
                  required
                  className="input-dark"
                  placeholder="Client visit — Berlin"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  className="input-dark min-h-20 resize-none"
                  placeholder="Purpose of the trip..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" className="btn-primary w-full">Create report</button>
            </form>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="glass-card overflow-hidden">
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
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No reports found</td></tr>
              ) : (
                filtered.map((report) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
