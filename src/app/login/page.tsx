"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/auth";
import {
  Lock,
  Mail,
  ShieldCheck,
  Radio,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("marketing@gruponobre.edu.br");
  const [password, setPassword] = useState("nobre2026");
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
    <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-300 shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
      
      {/* LOGO & CABEÇALHO */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 text-white mb-1">
          <Radio className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Ambiente Seguro & Restrito</span>
          </div>
          
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            HUB MÍDIA <span className="text-blue-600">GN</span>
          </h1>
          
          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
            Central Executiva de Gestão de Mídia, Bi-Semanas & OOH da Holding Grupo Nobre
          </p>
        </div>
      </div>

      {/* MENSAGEM DE ERRO SE HOUVER */}
      {erro && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center gap-2.5 text-xs text-rose-950 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* FORMULÁRIO DE LOGIN */}
      <form onSubmit={handleLogin} className="space-y-4">
        
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-900 block">
            E-mail Institucional
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@gruponobre.edu.br"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-950 placeholder-slate-400 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-900 block">
            Senha de Acesso
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-950 placeholder-slate-400 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* BOTÃO ENTRAR */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
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

      {/* BOX DE CREDENCIAIS PADRÃO DE EQUIPE */}
      <div className="p-3.5 rounded-2xl bg-slate-100 border-2 border-slate-300 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-900 font-black">
          <KeyRound className="w-3.5 h-3.5 text-blue-700" />
          <span>Acesso da Equipe de Marketing:</span>
        </div>
        <div className="flex flex-col gap-1 text-[11px] text-slate-800 font-bold">
          <div className="flex items-center justify-between">
            <span>E-mail:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-blue-900">
              marketing@gruponobre.edu.br
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Senha:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-blue-900">
              nobre2026
            </code>
          </div>
        </div>
      </div>

      {/* ASSINATURA DAS MARCAS DA HOLDING */}
      <div className="pt-2 border-t border-slate-200 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-[#F59E13] text-black text-[10px] font-black">UNEF</span>
          <span className="px-2 py-0.5 rounded bg-[#2563EB] text-white text-[10px] font-black">UNIFAN</span>
          <span className="px-2 py-0.5 rounded bg-[#0284C7] text-white text-[10px] font-black">COLÉGIO NOBRE</span>
          <span className="px-2 py-0.5 rounded bg-[#E11D48] text-white text-[10px] font-black">MAPLE BEAR</span>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold">
          Confidencial • Uso restrito da Holding Grupo Nobre
        </p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] relative overflow-hidden font-sans">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-slate-600 font-bold">Carregando formulário...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
