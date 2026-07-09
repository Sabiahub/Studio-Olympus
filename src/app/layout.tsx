import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PublicLayoutClient from "@/components/layouts/PublicLayoutClient";

export const metadata: Metadata = {
  title: "Studio Olympus",
  description: "Estúdio de Tatuagem Clássica e Contemporânea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body>
        <PublicLayoutClient>
          {children}
        </PublicLayoutClient>
      </body>
    </html>
  );
}
