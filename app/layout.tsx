import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barbería",
  description: "Corte y arreglo de barba. Consulta servicios y horario de atención.",
  themeColor: "#09090b",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full scheme-dark">
      <body className="min-h-full bg-zinc-950 text-zinc-50 antialiased">{children}</body>
    </html>
  );
}
