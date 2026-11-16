import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hub Mídia GN | Central Executiva de Campanhas",
  description: "Monitoramento executivo de campanhas, pontos físicos, outdoors, academias e bi-semanas do Grupo Nobre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${plusJakartaSans.variable} font-sans`}>
      <body className="min-h-screen bg-[#F4F6FB] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
