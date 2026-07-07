"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { DashboardStats } from "@/types";
import { categoryLabels } from "@/components/ui/CategoryIcon";
import { formatMonth } from "@/lib/format";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const PRIMARY = "#10B981";
const GRID = "var(--border-subtle)";
const AXIS = "var(--text-muted)";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-card px-3 py-2 shadow-md">
      <p className="text-caption text-foreground-muted">{label}</p>
      <p className="text-small font-semibold text-foreground">
        €{Number(payload[0].value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export function MainChart({ stats }: { stats: DashboardStats }) {
  const data = stats.expensesByMonth.map((m) => ({
    name: formatMonth(m.month),
    total: m.total,
  }));

  return (
    <Card padding="md" className="col-span-full xl:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Spending overview</CardTitle>
          <p className="mt-1 text-caption text-foreground-muted">Monthly approved expenses — last 6 months</p>
        </div>
      </CardHeader>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.2} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} dy={8} />
          <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} dx={-4} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={PRIMARY}
            strokeWidth={2}
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{ r: 4, fill: PRIMARY, stroke: "var(--bg-card)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CategoryChart({ stats }: { stats: DashboardStats }) {
  const data = Object.entries(stats.expensesByCategory)
    .map(([category, total]) => ({
      name: categoryLabels[category as keyof typeof categoryLabels],
      total,
    }))
    .filter((d) => d.total > 0);

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>By category</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} dy={8} />
          <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(16,185,129,0.04)" }} />
          <Bar dataKey="total" fill={PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

const STATUS_COLORS = ["#71717A", "#F59E0B", "#22C55E", "#EF4444"];

export function StatusChart({ stats }: { stats: DashboardStats }) {
  const data = [
    { name: "Draft", value: stats.draftReports },
    { name: "Pending", value: stats.pendingReports },
    { name: "Approved", value: stats.approvedReports },
    { name: "Rejected", value: stats.rejectedReports },
  ].filter((d) => d.value > 0);

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Report status</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-caption text-foreground-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[i] }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </Card>
  );
}
