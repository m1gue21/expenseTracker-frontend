// Helpers de formato compartidos por todas las páginas

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(amount);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const formatMonth = (yyyyMM: string) => {
  const [year, month] = yyyyMM.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", { month: "short" });
};
