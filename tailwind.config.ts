import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta del tema oscuro premium de ExpenseTrack
        background: "#050b18",
        card: "rgba(13, 25, 48, 0.8)",
        primary: "#3b82f6",
        secondary: "#06b6d4",
        foreground: "#f1f5f9",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "glow-blue": "0 0 24px rgba(59, 130, 246, 0.25)",
        "glow-cyan": "0 0 24px rgba(6, 182, 212, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
