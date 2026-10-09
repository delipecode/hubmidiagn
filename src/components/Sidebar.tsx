"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/lib/auth";
import {
  Flame,
  Layers,
  MapPin,
  Building2,
  Radio,
  Clock,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, startLogout] = useTransition();

  // Não exibe a sidebar na página de login
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  const navItems = [
    {
      href: "/",
      label: "Painel Executivo",
      icon: Flame,
    },
    {
      href: "/campanhas",
      label: "Campanhas & Mídias",
      icon: Layers,
    },
    {
      href: "/pontos",
      label: "Mapa de Mídia",
      icon: MapPin,
    },
    {
      href: "/fornecedores",
      label: "Veículos & Parceiros",
      icon: Building2,
    },
  ];

  return (
    <>
      {/* 📱 TOP BAR MOBILE */}
      <header className="lg:hidden sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30 text-white">
            <Radio className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-base text-slate-900">HUB MÍDIA</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              GN
            </span>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 📱 MENU DRAWER MOBILE */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[57px] z-40 bg-white/95 backdrop-blur-2xl p-6 overflow-y-auto space-y-6 shadow-2xl">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href) ||
                    (item.href === "/pontos" && (pathname === "/mapa" || pathname === "/checking"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={isActive ? "text-white font-bold" : "text-slate-900 font-bold"}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* PERFIL & LOGOUT MOBILE */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-slate-900">Marketing Grupo Nobre</div>
                <div className="text-[11px] text-slate-600">marketing@gruponobre.edu.br</div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖥️ SIDEBAR FIXA DESKTOP */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-200 flex-col justify-between p-6 z-40 overflow-y-auto shadow-sm">
        
        {/* TOPO: LOGO & STATUS */}
        <div className="space-y-6">
          
          {/* BRANDING EXECUTIVO */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all text-white">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  HUB MÍDIA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  GN
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold">
                Holding Grupo Nobre
              </p>
            </div>
          </Link>

          {/* STATUS OPERACIONAL */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-bold text-slate-800">Feira de Santana</span>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
              2026.2
            </span>
          </div>

          {/* LINKS DE NAVEGAÇÃO */}
          <nav className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Módulos Estratégicos
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href) ||
                    (item.href === "/pontos" && (pathname === "/mapa" || pathname === "/checking"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold transition-all group overflow-hidden ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`font-bold tracking-tight text-sm ${isActive ? "text-white" : "text-slate-900"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* RODAPÉ DA SIDEBAR: BI-SEMANA ATIVA & USUÁRIO COM LOGOUT */}
        <div className="pt-4 border-t border-slate-200 space-y-3 relative">
          
          {/* CARD DA BI-SEMANA - ALTO CONTRASTE */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Bi-Semana Ativa
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white shadow-sm">
                OOH
              </span>
            </div>
            <div className="text-base font-black text-white tracking-tight">
              BS 21 (06/10 a 19/10)
            </div>
            <div className="text-[11px] text-slate-200 font-bold flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-300">Próxima: BS 22</span>
              <span className="font-black text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-700">em 12 dias</span>
            </div>
          </div>

          {/* SESSÃO AUTENTICADA & BOTÃO DE LOGOUT */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-black">
                GN
              </div>
              <div className="truncate">
                <div className="text-xs font-black text-slate-900 truncate">Marketing GN</div>
                <div className="text-[10px] text-slate-600 font-bold truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Autenticado</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Encerrar sessão com segurança"
              className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] text-center font-bold text-slate-500 tracking-wider">
            UNEF • UNIFAN • NOBRE • MAPLE
          </div>
        </div>

      </aside>
    </>
  );
}
