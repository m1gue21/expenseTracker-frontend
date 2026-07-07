import { cn } from "@/lib/cn";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  accent?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const accentColors = {
  primary: "bg-primary-500",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export default function Progress({
  value,
  max = 100,
  label,
  showValue = true,
  accent = "primary",
  className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-small">
          {label && <span className="text-foreground-secondary">{label}</span>}
          {showValue && <span className="font-medium text-foreground">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-normal ease-out", accentColors[accent])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
