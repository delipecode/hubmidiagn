"use client";

import { useState } from "react";
import { criarFornecedor } from "@/lib/actions";
import { Plus, X, Building2, Phone, Mail, FileCode, Clock, CheckCircle2 } from "lucide-react";

export function NovoFornecedorModal({ onSucesso }: { onSucesso?: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [categoriaGeral, setCategoriaGeral] = useState<"OFFLINE" | "DIGITAL">("OFFLINE");
  const [tipoVeiculo, setTipoVeiculo] = useState("Exibidora OOH");
  const [praca, setPraca] = useState("Feira de Santana");
  const [contatoNome, setContatoNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [prazoEntregaDias, setPrazoEntregaDias] = useState("2");
  const [specsTecnicas, setSpecsTecnicas] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const tiposVeiculosOffline = [
    "Exibidora OOH",
    "Parceiro / Academia",
    "Rádio",
    "TV",
    "LED",
    "Busdoor",
    "Gráfica / Impressos",
  ];

  const tiposVeiculosDigital = [
    "Plataforma Digital",
    "Portal de Notícias",
    "Influenciador / Creator",
    "Agência de Mídia",
  ];

  const handleCategoriaChange = (novaCategoria: "OFFLINE" | "DIGITAL") => {
    setCategoriaGeral(novaCategoria);
    if (novaCategoria === "OFFLINE") {
      setTipoVeiculo("Exibidora OOH");
      setSpecsTecnicas("Lona 9x3m com ilhós a cada 20cm");
    } else {
      setTipoVeiculo("Plataforma Digital");
      setSpecsTecnicas("Cards Feed (1080x1350) e Stories (1080x1920)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      await criarFornecedor({
        nome,
        categoriaGeral,
        tipoVeiculo,
        praca,
        contatoNome,
        whatsapp,
        email,
        prazoEntregaDias: parseInt(prazoEntregaDias) || 2,
        specsTecnicas,
        observacoes,
      });

      setNome("");
      setContatoNome("");
      setWhatsapp("");
      setEmail("");
      setSpecsTecnicas("");
      setObservacoes("");
      setAberto(false);
      if (onSucesso) onSucesso();
    } catch (err) {
      console.error("Erro ao salvar fornecedor:", err);
      alert("Erro ao cadastrar fornecedor. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Novo Fornecedor / Veículo</span>
      </button>

      {/* MODAL */}
      {aberto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
            
            {/* TOPO */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">
                    Cadastrar Fornecedor / Veículo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cadastre exibidoras, emissoras, academias parceiras e portais
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAberto(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* CATEGORIA: OFFLINE OU DIGITAL */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Categoria Geral de Mídia:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoriaChange("OFFLINE")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                      categoriaGeral === "OFFLINE"
                        ? "bg-purple-100 border-purple-300 text-purple-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🌳 Mídia Offline (Outdoors, Academias, Rádios)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoriaChange("DIGITAL")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                      categoriaGeral === "DIGITAL"
                        ? "bg-sky-100 border-sky-300 text-sky-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    💻 Mídia Digital (Meta, Google, Portais)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nome da Empresa / Veículo:
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Central de Outdoors, Smart Fit"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tipo de Veículo:
                  </label>
                  <select
                    value={tipoVeiculo}
                    onChange={(e) => setTipoVeiculo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                  >
                    {(categoriaGeral === "OFFLINE"
                      ? tiposVeiculosOffline
                      : tiposVeiculosDigital
                    ).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Praça / Cidade:
                  </label>
                  <input
                    type="text"
                    value={praca}
                    onChange={(e) => setPraca(e.target.value)}
                    placeholder="Feira de Santana"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Contato / Executivo Comercial:
                  </label>
                  <input
                    type="text"
                    value={contatoNome}
                    onChange={(e) => setContatoNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Prazo Envio (Dias):
                  </label>
                  <input
                    type="number"
                    value={prazoEntregaDias}
                    onChange={(e) => setPrazoEntregaDias(e.target.value)}
                    placeholder="2"
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Comercial:
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="75999990000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> E-mail Comercial:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-blue-600" /> Especificações Técnicas:
                </label>
                <input
                  type="text"
                  value={specsTecnicas}
                  onChange={(e) => setSpecsTecnicas(e.target.value)}
                  placeholder="Ex: Lona 9,00 x 3,00m Frontlight com ilhós a cada 20cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Observações Contratuais / Comerciais:
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Fechamento sempre por Bi-Semanas oficiais. 10% de desconto para contratos semestrais."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>

              {/* AÇÕES */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{salvando ? "Salvando..." : "Salvar Fornecedor"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
