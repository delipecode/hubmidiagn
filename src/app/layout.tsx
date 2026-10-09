import type { Metadata } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";

const saira = Saira({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-saira",
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
    <html lang="pt-BR" className={`${saira.variable} font-sans`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#F4F6FB] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
