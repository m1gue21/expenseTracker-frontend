import type { ExpenseCategory } from "@/types";

const icons: Record<ExpenseCategory, string> = {
  TRANSPORT: "✈️",
  ACCOMMODATION: "🏨",
  MEALS: "🍽️",
  OTHER: "📦",
};

export const categoryLabels: Record<ExpenseCategory, string> = {
  TRANSPORT: "Transport",
  ACCOMMODATION: "Accommodation",
  MEALS: "Meals",
  OTHER: "Other",
};

export default function CategoryIcon({
  category,
  withLabel = false,
}: {
  category: ExpenseCategory;
  withLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden>{icons[category]}</span>
      {withLabel && <span className="text-small text-foreground-secondary">{categoryLabels[category]}</span>}
    </span>
  );
}
