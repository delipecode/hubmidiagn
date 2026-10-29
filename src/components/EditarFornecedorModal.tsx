"use client";

import { useState, useEffect } from "react";
import { editarFornecedor, excluirFornecedor } from "@/lib/actions";
import {
  Edit3,
  X,
  Building2,
  Phone,
  Mail,
  FileCode,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface EditarFornecedorModalProps {
  fornecedor: any;
  aberto: boolean;
  onClose: () => void;
  onSucesso?: (fornecedorAtualizado?: any, excluido?: boolean) => void;
}

export function EditarFornecedorModal({
  fornecedor,
  aberto,
  onClose,
  onSucesso,
}: EditarFornecedorModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [nome, setNome] = useState(fornecedor?.nome || "");
  const [categoriaGeral, setCategoriaGeral] = useState<"OFFLINE" | "DIGITAL">(
    (fornecedor?.categoriaGeral as "OFFLINE" | "DIGITAL") || "OFFLINE"
  );
  const [tipoVeiculo, setTipoVeiculo] = useState(fornecedor?.tipoVeiculo || "Exibidora OOH");
  const [praca, setPraca] = useState(fornecedor?.praca || "Feira de Santana");
  const [contatoNome, setContatoNome] = useState(fornecedor?.contatoNome || "");
  const [whatsapp, setWhatsapp] = useState(fornecedor?.whatsapp || "");
  const [email, setEmail] = useState(fornecedor?.email || "");
  const [prazoEntregaDias, setPrazoEntregaDias] = useState(
    fornecedor?.prazoEntregaDias ? String(fornecedor.prazoEntregaDias) : "2"
  );
  const [specsTecnicas, setSpecsTecnicas] = useState(fornecedor?.specsTecnicas || "");
  const [observacoes, setObservacoes] = useState(fornecedor?.observacoes || "");

  useEffect(() => {
    if (fornecedor) {
      setNome(fornecedor.nome || "");
      setCategoriaGeral((fornecedor.categoriaGeral as "OFFLINE" | "DIGITAL") || "OFFLINE");
      setTipoVeiculo(fornecedor.tipoVeiculo || "Exibidora OOH");
      setPraca(fornecedor.praca || "Feira de Santana");
      setContatoNome(fornecedor.contatoNome || "");
      setWhatsapp(fornecedor.whatsapp || "");
      setEmail(fornecedor.email || "");
      setPrazoEntregaDias(
        fornecedor.prazoEntregaDias ? String(fornecedor.prazoEntregaDias) : "2"
      );
      setSpecsTecnicas(fornecedor.specsTecnicas || "");
      setObservacoes(fornecedor.observacoes || "");
    }
  }, [fornecedor]);

  if (!aberto || !fornecedor) return null;

  const sugestoesTipos = [
    "Exibidora OOH",
    "Mídia Indoor (Academia / Adesivos em Espelhos)",
    "Telas Indoor / Mídia Digital Urbana",
    "Painel de LED / Mobiliário Urbano",
    "Rádio",
    "Emissora de TV",
    "Portal de Notícias / Site",
    "Plataforma Digital",
    "Gráfica / Comunicação Visual",
    "Produtora Áudio / Vídeo",
    "Brindes & Eventos",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const payload = {
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
      };
      await editarFornecedor(fornecedor.id, payload);
      if (onSucesso) {
        onSucesso({ ...fornecedor, ...payload }, false);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao editar fornecedor:", err);
      alert("Erro ao salvar alterações do fornecedor.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o fornecedor "${fornecedor.nome}" e todos os seus pontos vinculados?`
      )
    ) {
      return;
    }

    setExcluindo(true);
    try {
      await excluirFornecedor(fornecedor.id);
      if (onSucesso) onSucesso(undefined, true);
      onClose();
    } catch (err) {
      console.error("Erro ao excluir fornecedor:", err);
      alert("Erro ao excluir fornecedor.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white border border-slate-300 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative my-8">
        {/* TOPO */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">
                Editar Fornecedor / Parceiro
              </h3>
              <p className="text-xs text-slate-500">
                Atualize contatos, tipo de veículo, prazos e especificações técnicas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* CATEGORIA */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Categoria Geral de Mídia:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategoriaGeral("OFFLINE")}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs cursor-pointer ${
                  categoriaGeral === "OFFLINE"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Mídia Offline / OOH / Indoor
              </button>
              <button
                type="button"
                onClick={() => setCategoriaGeral("DIGITAL")}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs cursor-pointer ${
                  categoriaGeral === "DIGITAL"
                    ? "bg-sky-600 border-sky-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Mídia Digital / Portais
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nome da Empresa / Veículo:
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tipo de Veículo / Segmento:
              </label>
              <input
                type="text"
                list="lista-tipos-veiculo"
                value={tipoVeiculo}
                onChange={(e) => setTipoVeiculo(e.target.value)}
                required
                placeholder="Selecione ou digite..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-semibold"
              />
              <datalist id="lista-tipos-veiculo">
                {sugestoesTipos.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Praça / Cidade:
              </label>
              <input
                type="text"
                value={praca}
                onChange={(e) => setPraca(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Contato Comercial:
              </label>
              <input
                type="text"
                value={contatoNome}
                onChange={(e) => setContatoNome(e.target.value)}
                placeholder="Nome do representante"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Prazo Arte (Dias):
              </label>
              <input
                type="number"
                value={prazoEntregaDias}
                onChange={(e) => setPrazoEntregaDias(e.target.value)}
                min="1"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Comercial:
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="75999990000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> E-mail Comercial:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@parceiro.com.br"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-blue-600" /> Especificações Técnicas / Formatos:
            </label>
            <input
              type="text"
              value={specsTecnicas}
              onChange={(e) => setSpecsTecnicas(e.target.value)}
              placeholder="Ex: Outdoor Lona 9x3m, 6 Espelhos 120x60cm, VT 30s..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Observações Contratuais / Tabelas de Preço:
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Observações sobre negociação, pacotes ou locais..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white resize-none"
            />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExcluir}
              disabled={excluindo || salvando}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{excluindo ? "Excluindo..." : "Excluir"}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando || excluindo}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{salvando ? "Salvando..." : "Salvar Alterações"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
