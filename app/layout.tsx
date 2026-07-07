import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// next/font descarga Inter en build time y la sirve self-hosted (sin FOUT)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ExpenseTrack — Corporate Travel Expenses",
  description:
    "Plataforma de gestión de gastos corporativos de viaje. Portafolio para Arago Consulting.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased app-gradient`}>
        {children}
      </body>
    </html>
  );
}
