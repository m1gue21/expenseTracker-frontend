import type { LucideIcon } from "lucide-react";

const accentStyles = {
  blue: {
    border: "border-l-[#3b82f6]",
    icon: "text-[#3b82f6] bg-[#3b82f6]/10",
  },
  yellow: {
    border: "border-l-[#f59e0b]",
    icon: "text-[#f59e0b] bg-[#f59e0b]/10",
  },
  green: {
    border: "border-l-[#10b981]",
    icon: "text-[#10b981] bg-[#10b981]/10",
  },
  red: {
    border: "border-l-[#ef4444]",
    icon: "text-[#ef4444] bg-[#ef4444]/10",
  },
  cyan: {
    border: "border-l-[#06b6d4]",
    icon: "text-[#06b6d4] bg-[#06b6d4]/10",
  },
} as const;

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent = "blue",
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: keyof typeof accentStyles;
}) {
  const style = accentStyles[accent];

  return (
    <div className={`glass-card glass-card-hover border-l-[3px] p-5 ${style.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${style.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
