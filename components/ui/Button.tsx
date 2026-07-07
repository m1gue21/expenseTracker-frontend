"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] shadow-sm hover:shadow-glow",
  secondary:
    "bg-muted text-foreground hover:bg-neutral-700/20 active:scale-[0.98]",
  outline:
    "border border-[var(--border)] bg-transparent text-foreground hover:bg-muted/50 active:scale-[0.98]",
  ghost:
    "bg-transparent text-foreground-secondary hover:bg-muted/50 hover:text-foreground active:scale-[0.98]",
  danger:
    "bg-danger/10 text-danger hover:bg-danger/20 active:scale-[0.98]",
  success:
    "bg-success/10 text-success hover:bg-success/20 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-small gap-1.5 rounded-md",
  md: "h-10 px-4 text-small gap-2 rounded-md",
  lg: "h-12 px-6 text-body gap-2 rounded-lg",
  icon: "h-10 w-10 rounded-md",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-normal ease-out",
        "disabled:pointer-events-none disabled:opacity-40",
        "hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export default Button;
