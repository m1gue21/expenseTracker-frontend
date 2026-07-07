import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-caption",
  md: "h-9 w-9 text-small",
  lg: "h-11 w-11 text-body",
};

export default function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-500/15 font-semibold text-primary-500",
        "ring-2 ring-[var(--border-subtle)]",
        sizes[size],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
