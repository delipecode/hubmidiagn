import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 1. Marcas do Grupo Nobre
export const marcas = sqliteTable("marcas", {
  id: text("id").primaryKey(), // UNEF, UNIFAN, NOBRE, MAPLE, FINC
  nome: text("nome").notNull(),
  corHex: text("cor_hex").notNull(),
  corBg: text("cor_bg").notNull(),
  corBorder: text("cor_border").notNull(),
  corText: text("cor_text").notNull(),
});

// 2. Campanhas Publicitárias (Macro)
export const campanhas = sqliteTable("campanhas", {
  id: text("id").primaryKey(),
  marcaId: text("marca_id").notNull().references(() => marcas.id),
  nome: text("nome").notNull(), // ex: "Vestibular 2026.2 - Medicina", "Matrículas 2027"
  objetivo: text("objetivo"),
  dataInicio: text("data_inicio").notNull(),
  dataFim: text("data_fim").notNull(),
  status: text("status").notNull().default("Ativa"), // 'Planejada', 'Ativa', 'Concluída'
  orcamentoTotal: real("orcamento_total"),
  corDestaque: text("cor_destaque"),
});

// 3. Fornecedores, Exibidoras & Veículos Contratados
export const fornecedores = sqliteTable("fornecedores", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(), // ex: "Mídia Bahia Outdoor", "Academia Biohit", "Princesa FM", "Meta / Facebook", "Portal Acorda Cidade"
  categoriaGeral: text("categoria_geral").notNull().default("OFFLINE"), // 'OFFLINE' | 'DIGITAL'
  tipoVeiculo: text("tipo_veiculo").notNull(), // 'Exibidora OOH', 'Parceiro / Academia', 'Rádio', 'TV', 'LED', 'Portal de Notícias', 'Plataforma Digital'
  praca: text("praca").notNull().default("Feira de Santana"),
  contatoNome: text("contato_nome"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  prazoEntregaDias: integer("prazo_entrega_dias").default(2),
  specsTecnicas: text("specs_tecnicas"),
  observacoes: text("observacoes"),
});

// 4. Pontos Físicos (Para Mídia OFF: Outdoors, Academias, LEDs, Abrigos, Busdoors)
export const pontosFisicos = sqliteTable("pontos_fisicos", {
  id: text("id").primaryKey(),
  fornecedorId: text("fornecedor_id").notNull().references(() => fornecedores.id),
  codigoIdentificador: text("codigo_identificador"), // ex: 'OUT-GV-01', 'BIOHIT-ESP-01'
  nomeLocal: text("nome_local").notNull(), // ex: 'Av. Getúlio Vargas, em frente ao Boulevard', 'Academia Biohit - Espelho Musculação'
  tipoFormato: text("tipo_formato").notNull(), // 'Outdoor Lona 9x3m', 'Adesivo em Academia', 'Painel de LED', 'Busdoor', 'Totem Clínicas'
  praca: text("praca").notNull().default("Feira de Santana"),
  bairro: text("bairro").notNull(),
  endereco: text("endereco"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  fotoLocalUrl: text("foto_local_url"),
  statusPonto: text("status_ponto").notNull().default("Disponível / Mapeado"), // 'Comprado / Ativo', 'Disponível / Mapeado', 'Em Manutenção'
  observacoes: text("observacoes"),
});

// 5. Itens de Mídia da Campanha (Ramificação: OFFLINE e DIGITAL)
export const midiasCampanha = sqliteTable("midias_campanha", {
  id: text("id").primaryKey(),
  campanhaId: text("campanha_id").notNull().references(() => campanhas.id),
  marcaId: text("marca_id").notNull().references(() => marcas.id),
  fornecedorId: text("fornecedor_id").notNull().references(() => fornecedores.id),
  pontoFisicoId: text("ponto_fisico_id").references(() => pontosFisicos.id), // Opcional (apenas para OOH/Indoor físico)
  
  // Categorização Ramificada
  categoriaMidia: text("categoria_midia").notNull().default("OFFLINE"), // 'OFFLINE' | 'DIGITAL'
  subtipoMidia: text("subtipo_midia").notNull(), // 'OUTDOOR_BISEMANA', 'INDOOR_ACADEMIA', 'LED_DIGITAL', 'RADIO', 'TV', 'BUSDOOR', 'META_ADS', 'GOOGLE_ADS', 'PORTAL_NOTICIAS'
  formatoPeca: text("formato_peca").notNull(), // 'Lona 9x3m', 'Adesivo Espelho/Catraca', 'VT 30s', 'Spot 30s', 'Vídeo LED 10s', 'Cards Feed/Stories', 'Banner Web 300x250'
  
  // Regra de Prazos
  tipoRegraPrazo: text("tipo_regra_prazo").notNull().default("MANUAL_DATAS"), // 'BISEMANA_FIXA' | 'MANUAL_DATAS'
  biSemana: text("bi_semana"), // ex: 'BS 20 (22/09 a 05/10)', 'BS 21 (06/10 a 19/10)'
  dataInicio: text("data_inicio").notNull(),
  dataFim: text("data_fim").notNull(),
  deadlineMaterial: text("deadline_material"),
  
  // Status Operacional
  statusVeiculacao: text("status_veiculacao").notNull().default("No Ar / Ativo"), // 'Planejado', 'Em Produção', 'Material Enviado', 'No Ar / Ativo', 'Desmobilizado'
  tipoAcaoFinal: text("tipo_acao_final").default("Renovação Contrato"), // 'Troca de Lona/Adesivo', 'Retirada Definitiva', 'Renovação Contrato', 'Pausar Anúncios'
  
  // Financeiro & Contratual
  numPI: text("num_pi"),
  valorNegociado: real("valor_negociado"),
  linkMaterialDrive: text("link_material_drive"),
  observacoes: text("observacoes"),
});

// 6. Checking Fotográfico & Comprovações
export const checkings = sqliteTable("checkings", {
  id: text("id").primaryKey(),
  midiaCampanhaId: text("midia_campanha_id").references(() => midiasCampanha.id),
  pontoFisicoId: text("ponto_fisico_id").references(() => pontosFisicos.id),
  dataChecagem: text("data_checagem").notNull(),
  fotoCheckingUrl: text("foto_checking_url"),
  status: text("status").notNull().default("Recebido"), // 'Recebido', 'Aprovado', 'Divergente'
  observacoes: text("observacoes"),
});

// Relações do Drizzle ORM
export const campanhasRelations = relations(campanhas, ({ one, many }) => ({
  marca: one(marcas, {
    fields: [campanhas.marcaId],
    references: [marcas.id],
  }),
  midias: many(midiasCampanha),
}));

export const fornecedoresRelations = relations(fornecedores, ({ many }) => ({
  pontosFisicos: many(pontosFisicos),
  midias: many(midiasCampanha),
}));

export const pontosFisicosRelations = relations(pontosFisicos, ({ one, many }) => ({
  fornecedor: one(fornecedores, {
    fields: [pontosFisicos.fornecedorId],
    references: [fornecedores.id],
  }),
  midias: many(midiasCampanha),
  checkings: many(checkings),
}));

export const midiasCampanhaRelations = relations(midiasCampanha, ({ one, many }) => ({
  campanha: one(campanhas, {
    fields: [midiasCampanha.campanhaId],
    references: [campanhas.id],
  }),
  marca: one(marcas, {
    fields: [midiasCampanha.marcaId],
    references: [marcas.id],
  }),
  fornecedor: one(fornecedores, {
    fields: [midiasCampanha.fornecedorId],
    references: [fornecedores.id],
  }),
  pontoFisico: one(pontosFisicos, {
    fields: [midiasCampanha.pontoFisicoId],
    references: [pontosFisicos.id],
  }),
  checkings: many(checkings),
}));

export const checkingsRelations = relations(checkings, ({ one }) => ({
  midiaCampanha: one(midiasCampanha, {
    fields: [checkings.midiaCampanhaId],
    references: [midiasCampanha.id],
  }),
  pontoFisico: one(pontosFisicos, {
    fields: [checkings.pontoFisicoId],
    references: [pontosFisicos.id],
  }),
}));
