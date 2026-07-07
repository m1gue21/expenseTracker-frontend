export const fontFamily = {
  sans: "var(--font-inter), system-ui, sans-serif",
} as const;

export const fontSize = {
  display: { lg: "64px", md: "56px", sm: "48px" },
  heading: { xl: "40px", lg: "32px", md: "28px", sm: "24px" },
  title: { lg: "20px", md: "18px" },
  body: "16px",
  small: "14px",
  caption: "12px",
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  tight: "1.2",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
} as const;
