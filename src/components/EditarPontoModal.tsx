"use client";

import { useState, useEffect, useRef } from "react";
import { editarPontoFisico, excluirPontoFisico } from "@/lib/actions";
import {
  Edit3,
  X,
  MapPin,
  Camera,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

interface EditarPontoModalProps {
  ponto: any;
  fornecedores?: any[];
  aberto: boolean;
  onClose: () => void;
  onSucesso?: (pontoAtualizado?: any, excluido?: boolean) => void;
}

const bairrosCoordenadas: Record<string, { lat: string; lng: string }> = {
  "Santa Mônica": { lat: "-12.2512", lng: "-38.9554" },
  Centro: { lat: "-12.2580", lng: "-38.9710" },
  Capuchinhos: { lat: "-12.2615", lng: "-38.9642" },
  "Fraga Maia": { lat: "-12.2390", lng: "-38.9605" },
  SIM: { lat: "-12.2685", lng: "-38.9320" },
  "Cidade Nova": { lat: "-12.2350", lng: "-38.9600" },
  Kalilândia: { lat: "-12.2550", lng: "-38.9680" },
  Muchila: { lat: "-12.2710", lng: "-38.9750" },
  Tomba: { lat: "-12.2850", lng: "-38.9620" },
  "Lagoa Grande": { lat: "-12.2470", lng: "-38.9420" },
};

// Comprime imagem no cliente para salvar rápido no banco
function comprimirImagem(file: File, maxWidth = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Erro no canvas"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function EditarPontoModal({
  ponto,
  fornecedores = [],
  aberto,
  onClose,
  onSucesso,
}: EditarPontoModalProps) {
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fornecedorId, setFornecedorId] = useState(ponto?.fornecedorId || "");
  const [codigoIdentificador, setCodigoIdentificador] = useState(
    ponto?.codigoIdentificador || ""
  );
  const [nomeLocal, setNomeLocal] = useState(ponto?.nomeLocal || "");
  const [tipoFormato, setTipoFormato] = useState(
    ponto?.tipoFormato || "Outdoor Lona 9x3m"
  );
  const [praca, setPraca] = useState(ponto?.praca || "Feira de Santana");
  const [bairro, setBairro] = useState(ponto?.bairro || "Centro");
  const [endereco, setEndereco] = useState(ponto?.endereco || "");
  const [latitude, setLatitude] = useState(
    ponto?.latitude ? String(ponto.latitude) : "-12.2575"
  );
  const [longitude, setLongitude] = useState(
    ponto?.longitude ? String(ponto.longitude) : "-38.9662"
  );
  const [fotoLocalUrl, setFotoLocalUrl] = useState(ponto?.fotoLocalUrl || "");
  const [statusPonto, setStatusPonto] = useState(
    ponto?.statusPonto || "Disponível / Mapeado"
  );
  const [observacoes, setObservacoes] = useState(ponto?.observacoes || "");

  useEffect(() => {
    if (ponto) {
      setFornecedorId(ponto.fornecedorId || "");
      setCodigoIdentificador(ponto.codigoIdentificador || "");
      setNomeLocal(ponto.nomeLocal || "");
      setTipoFormato(ponto.tipoFormato || "Outdoor Lona 9x3m");
      setPraca(ponto.praca || "Feira de Santana");
      setBairro(ponto.bairro || "Centro");
      setEndereco(ponto.endereco || "");
      setLatitude(ponto.latitude ? String(ponto.latitude) : "-12.2575");
      setLongitude(ponto.longitude ? String(ponto.longitude) : "-38.9662");
      setFotoLocalUrl(ponto.fotoLocalUrl || "");
      setStatusPonto(ponto.statusPonto || "Disponível / Mapeado");
      setObservacoes(ponto.observacoes || "");
    }
  }, [ponto]);

  if (!aberto || !ponto) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessandoFoto(true);
    try {
      const dataUrl = await comprimirImagem(file);
      setFotoLocalUrl(dataUrl);
    } catch (err) {
      console.error("Erro ao processar foto:", err);
      alert("Não foi possível carregar esta imagem.");
    } finally {
      setProcessandoFoto(false);
    }
  };

  const handleBairroChange = (novoBairro: string) => {
    setBairro(novoBairro);
    if (bairrosCoordenadas[novoBairro]) {
      setLatitude(bairrosCoordenadas[novoBairro].lat);
      setLongitude(bairrosCoordenadas[novoBairro].lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const payload = {
        fornecedorId: fornecedorId || ponto.fornecedorId,
        codigoIdentificador,
        nomeLocal,
        tipoFormato,
        praca: praca || ponto.praca || "Feira de Santana",
        bairro,
        endereco,
        latitude: parseFloat(latitude) || -12.2575,
        longitude: parseFloat(longitude) || -38.9662,
        fotoLocalUrl: fotoLocalUrl || null,
        statusPonto,
        observacoes,
      };

      await editarPontoFisico(ponto.id, payload);
      if (onSucesso) {
        onSucesso({ ...ponto, ...payload }, false);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao editar ponto:", err);
      alert("Erro ao salvar alterações do ponto.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o ponto "${ponto.nomeLocal}" do inventário?`
      )
    ) {
      return;
    }

    setExcluindo(true);
    try {
      await excluirPontoFisico(ponto.id);
      if (onSucesso) onSucesso(undefined, true);
      onClose();
    } catch (err) {
      console.error("Erro ao excluir ponto:", err);
      alert("Erro ao excluir ponto físico.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white border border-slate-300 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
        {/* TOPO */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">
                Editar Ponto & Trocar Foto da Mídia
              </h3>
              <p className="text-xs text-slate-500">
                Atualize a foto do outdoor/mídia, formato, endereço ou status
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

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* 1. SEÇÃO DE FOTO DO PONTO / MÍDIA */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-700 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" /> Foto do Ponto / Outdoor / Mídia
              </span>
              {fotoLocalUrl && (
                <button
                  type="button"
                  onClick={() => setFotoLocalUrl("")}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Remover foto
                </button>
              )}
            </div>

            {/* PREVIEW DA FOTO */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
              {fotoLocalUrl ? (
                <img
                  src={fotoLocalUrl}
                  alt="Preview do ponto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-500 space-y-1 p-4">
                  <Camera className="w-8 h-8 mx-auto text-slate-400" />
                  <div className="font-bold">Sem foto cadastrada</div>
                  <div className="text-[11px]">
                    Envie um arquivo do seu computador/celular ou cole o link abaixo
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processandoFoto}
                className="absolute bottom-3 right-3 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {processandoFoto ? "Processando..." : "Enviar Foto do Dispositivo"}
                </span>
              </button>
            </div>

            {/* OU COLAR URL */}
            <div>
              <label className="block text-slate-600 font-bold mb-1 flex items-center gap-1 text-[11px]">
                <LinkIcon className="w-3 h-3 text-slate-400" /> Ou cole o link direto da imagem (URL):
              </label>
              <input
                type="text"
                value={fotoLocalUrl.startsWith("data:") ? "" : fotoLocalUrl}
                onChange={(e) => setFotoLocalUrl(e.target.value)}
                placeholder={
                  fotoLocalUrl.startsWith("data:")
                    ? "Foto enviada do dispositivo (clique em 'Remover foto' para usar link externo)"
                    : "https://..."
                }
                disabled={fotoLocalUrl.startsWith("data:")}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* 2. DADOS DE IDENTIFICAÇÃO E LOCALIZAÇÃO */}
          <div className="space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> Dados do Local & Formato
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Nome do Local / Referência:
                </label>
                <input
                  type="text"
                  value={nomeLocal}
                  onChange={(e) => setNomeLocal(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Código / Placa:
                </label>
                <input
                  type="text"
                  value={codigoIdentificador}
                  onChange={(e) => setCodigoIdentificador(e.target.value)}
                  placeholder="Ex: OUT-01"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Formato / Dimensão da Mídia:
                </label>
                <input
                  type="text"
                  list="lista-formatos-ponto"
                  value={tipoFormato}
                  onChange={(e) => setTipoFormato(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-semibold"
                />
                <datalist id="lista-formatos-ponto">
                  <option value="Outdoor Lona 9x3m" />
                  <option value="Outdoor Iluminado 9x3m" />
                  <option value="Adesivo em Academia (Espelho 120x60cm)" />
                  <option value="Painel de LED 6x3m" />
                  <option value="Tela Indoor 55 Pol" />
                  <option value="Frontlight" />
                  <option value="Busdoor" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Status do Espaço:
                </label>
                <select
                  value={statusPonto}
                  onChange={(e) => setStatusPonto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-bold"
                >
                  <option value="Disponível / Mapeado">Disponível / Mapeado</option>
                  <option value="Comprado / Ativo">Comprado / Ativo</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                </select>
              </div>
            </div>

            {fornecedores.length > 0 && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Fornecedor / Exibidora Responsável:
                </label>
                <select
                  value={fornecedorId}
                  onChange={(e) => setFornecedorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-semibold"
                >
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome} ({f.tipoVeiculo})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Praça / Cidade:
                </label>
                <select
                  value={praca}
                  onChange={(e) => setPraca(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white font-bold"
                >
                  <option value="Feira de Santana">Feira de Santana</option>
                  <option value="Ipirá">Ipirá</option>
                  <option value="Irecê">Irecê</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bairro / Região:
                </label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Endereço Completo:
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Av. Getúlio Vargas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                  Latitude (GPS):
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                  Longitude (GPS):
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs font-semibold"
                />
              </div>
            </div>
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
              <span>{excluindo ? "Excluindo..." : "Excluir Ponto"}</span>
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
                disabled={salvando || excluindo || processandoFoto}
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
