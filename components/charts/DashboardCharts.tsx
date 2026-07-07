"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { DashboardStats } from "@/types";
import { categoryLabels } from "@/components/ui/CategoryIcon";
import { formatMonth } from "@/lib/format";

const AXIS = "#64748b";
const GRID = "rgba(148,163,184,0.1)";

const tooltipStyle = {
  backgroundColor: "#0d1930",
  border: "1px solid rgba(148,163,184,0.2)",
  borderRadius: "12px",
  color: "#f1f5f9",
};

export function CategoryBarChart({ stats }: { stats: DashboardStats }) {
  const data = Object.entries(stats.expensesByCategory).map(([category, total]) => ({
    name: categoryLabels[category as keyof typeof categoryLabels],
    total,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke={AXIS} fontSize={12} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={{ stroke: GRID }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
        <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ stats }: { stats: DashboardStats }) {
  const data = stats.expensesByMonth.map((m) => ({
    name: formatMonth(m.month),
    total: m.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke={AXIS} fontSize={12} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={{ stroke: GRID }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#06b6d4"
          strokeWidth={2.5}
          dot={{ fill: "#06b6d4", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Draft: "#64748b",
  Submitted: "#eab308",
  Approved: "#10b981",
  Rejected: "#ef4444",
};

export function StatusPieChart({ stats }: { stats: DashboardStats }) {
  const data = [
    { name: "Draft", value: stats.draftReports },
    { name: "Submitted", value: stats.pendingReports },
    { name: "Approved", value: stats.approvedReports },
    { name: "Rejected", value: stats.rejectedReports },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
