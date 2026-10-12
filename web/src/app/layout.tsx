import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { LocaleProvider } from "../i18n/locale-provider";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  style: "normal",
  display: "swap",
  variable: "--font-archivo",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MOBY Ops",
  description: "Seguimiento de actuaciones de Public Order en Dublín.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${inter.variable}`}>
      <body><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
