"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Layers,
  MapPin,
  Building2,
  Camera,
  Radio,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Visão Geral & Alertas", icon: Flame },
    { href: "/campanhas", label: "Campanhas & Mídias", icon: Layers },
    { href: "/mapa", label: "Mapa da Cidade", icon: MapPin },
    { href: "/fornecedores", label: "Fornecedores & Veículos", icon: Building2 },
    { href: "/checking", label: "Checking de Fotos", icon: Camera },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* LOGO */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Hub Campanhas
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30">
                  Grupo Nobre
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Central de Campanhas, Mídias & Prazos
              </p>
            </div>
          </Link>
        </div>

        {/* NAVEGAÇÃO RAMIFICADA */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-800 text-amber-400 border border-amber-500/30 shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
