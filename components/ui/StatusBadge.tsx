import type { ReportStatus } from "@/types";

const styles: Record<ReportStatus, string> = {
  DRAFT: "bg-slate-700/60 text-slate-300 border-slate-500/30",
  SUBMITTED: "bg-yellow-900/50 text-yellow-300 border-yellow-500/30",
  APPROVED: "bg-emerald-900/50 text-emerald-300 border-emerald-500/30",
  REJECTED: "bg-red-900/50 text-red-300 border-red-500/30",
};

export default function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
