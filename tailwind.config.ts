import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        secondary: "#3B82F6",
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        info: "#0EA5E9",
        background: "var(--bg)",
        surface: "var(--bg-surface)",
        card: "var(--bg-card)",
        muted: "var(--bg-muted)",
        foreground: "var(--text-primary)",
        "foreground-secondary": "var(--text-secondary)",
        "foreground-muted": "var(--text-muted)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["56px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["48px", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "heading-xl": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "heading-lg": ["32px", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "heading-md": ["28px", { lineHeight: "1.3" }],
        "heading-sm": ["24px", { lineHeight: "1.35" }],
        "title-lg": ["20px", { lineHeight: "1.4" }],
        "title-md": ["18px", { lineHeight: "1.45" }],
        body: ["16px", { lineHeight: "1.5" }],
        small: ["14px", { lineHeight: "1.5" }],
        caption: ["12px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 8px 24px rgba(0,0,0,0.08)",
        lg: "0 16px 48px rgba(0,0,0,0.10)",
        glow: "0 0 0 3px rgba(16,185,129,0.15)",
        "glow-lg": "0 0 24px rgba(16,185,129,0.12)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0, 0, 0.2, 1)",
      },
      spacing: {
        18: "72px",
        22: "88px",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 200ms ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
