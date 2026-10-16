import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barbería",
  description: "Corte y arreglo de barba. Consulta servicios, tarifas y horario de atención.",
  themeColor: "#140e0c",
};

export const viewport: Viewport = {
  themeColor: "#140e0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full scheme-dark">
      <body className="min-h-full bg-fondo text-tinta antialiased">{children}</body>
    </html>
  );
}
