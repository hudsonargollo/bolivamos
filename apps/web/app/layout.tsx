import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoliVamos",
  description: "What to do in Santa Cruz de la Sierra — plus BoliPass 2-for-1 deals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
