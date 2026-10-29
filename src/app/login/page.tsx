"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/auth";
import {
  Lock,
  User,
  ShieldCheck,
  Radio,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setErro(res.error || "Falha na autenticação.");
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 relative z-10">
      {/* LOGO & CABEÇALHO */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-md text-white mb-1">
          <Radio className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Ambiente Seguro & Restrito</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            HUB MÍDIA <span className="text-blue-600">GN</span>
          </h1>

          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            Central Executiva de Gestão de Mídia, Bi-Semanas & OOH • Grupo Nobre
          </p>
        </div>
      </div>

      {/* MENSAGEM DE ERRO SE HOUVER */}
      {erro && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-900 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* FORMULÁRIO DE LOGIN */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 block">
            Usuário
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu usuário"
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-950 placeholder-slate-400 font-bold outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 block">
            Senha de Acesso
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-950 placeholder-slate-400 font-bold outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* BOTÃO ENTRAR */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <span>Autenticando...</span>
          ) : (
            <>
              <span>Acessar Central de Mídia</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* ASSINATURA DAS MARCAS DO GRUPO NOBRE */}
      <div className="pt-3 border-t border-slate-200 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-[#F59E13] text-black text-[10px] font-black">UNEF</span>
          <span className="px-2 py-0.5 rounded bg-[#2563EB] text-white text-[10px] font-black">UNIFAN</span>
          <span className="px-2 py-0.5 rounded bg-[#0284C7] text-white text-[10px] font-black">COLÉGIO NOBRE</span>
          <span className="px-2 py-0.5 rounded bg-[#E11D48] text-white text-[10px] font-black">MAPLE BEAR</span>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold">
          Confidencial • Uso restrito • Grupo Nobre
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] font-sans">
      <Suspense fallback={<div className="text-slate-600 font-bold text-xs">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
