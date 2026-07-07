"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useTheme } from "@/lib/theme-provider";

/** Proporción real del PNG: 1536 × 1024 (icono + wordmark integrados) */
const LOGO_RATIO = 1536 / 1024;

const widths = {
  sm: 112,
  md: 148,
  lg: 220,
  xl: 300,
  "2xl": 360,
} as const;

type LogoSize = keyof typeof widths;

interface BrandLogoProps {
  size?: LogoSize;
  href?: string | null;
  className?: string;
  align?: "left" | "center";
  /** Ajustes por contexto de uso */
  context?: "default" | "sidebar" | "auth";
}

export default function BrandLogo({
  size = "md",
  href = null,
  className,
  align = "left",
  context = "default",
}: BrandLogoProps) {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  const width = context === "sidebar" ? widths.sm : widths[size];
  const height = Math.round(width / LOGO_RATIO);

  const image = (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        context === "sidebar" && [
          "max-h-[88px] w-full rounded-lg border border-[var(--border-subtle)]",
          isDark ? "bg-white/[0.07] px-2 py-1.5" : "bg-black/[0.03] px-2 py-1.5",
        ],
        context === "auth" && [
          "rounded-2xl",
          isDark ? "bg-white/[0.05] px-4 py-3" : "bg-black/[0.02] px-4 py-3",
        ],
        context === "default" && isDark && "rounded-xl bg-white/[0.05] px-2 py-1",
      )}
    >
      <Image
        src="/logo.png"
        alt="expenseTracker"
        width={width}
        height={height}
        className={cn(
          "block h-auto max-w-full object-contain object-left",
          context === "sidebar" && "max-h-[160px] w-full brightness-[1.3] contrast-[1.1] saturate-[1.05]",
          context !== "sidebar" && isDark && "brightness-[1.3] contrast-[1.1] saturate-[1.05]",
          className
        )}
        priority
        style={{
          width: context === "sidebar" ? "100%" : width,
          height: "auto",
          maxWidth: context === "sidebar" ? 172 : width,
        }}
      />
    </div>
  );

  const wrapperClass = cn(
    "inline-flex shrink-0",
    align === "center" && "justify-center",
    align === "left" && "justify-start",
    context === "sidebar" && "w-full min-w-0"
  );

  const content = <div className={wrapperClass}>{image}</div>;

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex min-w-0 transition-opacity duration-fast ease-out hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-md",
          context === "sidebar" && "w-full"
        )}
        aria-label="expenseTracker home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export function Logo(props: Omit<BrandLogoProps, "href" | "context"> & { href?: string }) {
  return (
    <BrandLogo
      href={props.href ?? "/dashboard"}
      context="sidebar"
      size="sm"
      {...props}
    />
  );
}

export function AuthLogo(props: Omit<BrandLogoProps, "href" | "context">) {
  return <BrandLogo href={null} context="auth" align="left" {...props} />;
}
