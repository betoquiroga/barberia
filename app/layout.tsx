import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hola EDteam",
  description: "Hola EDteam",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
