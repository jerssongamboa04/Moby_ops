import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOBY Ops",
  description: "Seguimiento de actuaciones de Public Order en Dublín.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
