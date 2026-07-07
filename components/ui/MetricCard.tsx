import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "./Card";

type Accent = "primary" | "success" | "warning" | "danger" | "info" | "secondary";

const accents: Record<Accent, { border: string; icon: string; trend: string }> = {
  primary: { border: "border-l-primary-500", icon: "text-primary-500 bg-primary-500/10", trend: "text-primary-500" },
  success: { border: "border-l-success", icon: "text-success bg-success/10", trend: "text-success" },
  warning: { border: "border-l-warning", icon: "text-warning bg-warning/10", trend: "text-warning" },
  danger: { border: "border-l-danger", icon: "text-danger bg-danger/10", trend: "text-danger" },
  info: { border: "border-l-info", icon: "text-info bg-info/10", trend: "text-info" },
  secondary: { border: "border-l-secondary", icon: "text-secondary bg-secondary/10", trend: "text-secondary" },
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  trend?: string;
  subtitle?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  accent = "primary",
  trend,
  subtitle,
}: MetricCardProps) {
  const a = accents[accent];

  return (
    <Card
      hover
      className={cn("border-l-[3px]", a.border)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-small font-medium text-foreground-muted">{title}</p>
          <p className="text-heading-sm font-semibold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-caption text-foreground-muted">{subtitle}</p>}
          {trend && <p className={cn("text-caption font-medium", a.trend)}>{trend}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", a.icon)}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </Card>
  );
}
