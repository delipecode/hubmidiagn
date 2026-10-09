# 📍 Hub Mídia GN — Central Executiva de Mídia, Presença & OOH

Plataforma de gestão de presença territorial, canais e veiculações de mídia para a holding **Grupo Nobre** (*UNEF, UNIFAN, Colégio Nobre e Maple Bear*).

---

## 🌟 Principais Módulos

1. **📊 Painel Executivo:**
   - Métricas globais de investimento, total de veiculações ativas e distribuição por empresa e canal.
   - Prazos de bi-semanas OOH e renovações em tempo real.

2. **📁 Campanhas & Mídias:**
   - Estrutura hierárquica `EMPRESA > CAMPANHA > CANAIS UTILIZADOS / MÍDIAS ATIVAS`.
   - Gestão completa de campanhas (criar, editar, excluir, vincular/desvincular pontos físicos e canais diretos).
   - Filtros dinâmicos por empresa (*UNEF, UNIFAN, Colégio Nobre, Maple Bear*) e tipo de mídia (*Outdoors, TV Indoor, LED, Academias, Rádios, TVs, Digital*).

3. **🗺️ Mapa de Mídia & Central Territorial:**
   - Mapa interativo de Feira de Santana e região com visualização de pontos físicos por satélite e modo claro/escuro.
   - Pins coloridos por marca com popups contendo foto do local, formato da lona, bi-semana, fornecedor e contato via WhatsApp.
   - Inventário técnico e galeria de checking fotográfico de comprovação de veiculação.

4. **🏢 Veículos & Parceiros:**
   - Catálogo com mais de 90 veículos e fornecedores cadastrados organizados por categoria (*OOH, TV Indoor, Painéis LED, Academias, Rádios, Emissoras de TV, Portais Digitais e Gráficas*).

---

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS + Lucide Icons
- **Mapas:** Leaflet + React-Leaflet + OpenStreetMap & Esri World Imagery
- **Banco de Dados:** Drizzle ORM + LibSQL Driver
  - **Local:** SQLite (`local.db`)
  - **Produção (Vercel):** Turso Cloud Serverless LibSQL

---

## 🚀 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar tabelas no banco SQLite local
npm run db:push

# 3. Popular o banco com os dados oficiais do catálogo
npm run db:seed

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra no navegador em: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy no GitHub & Vercel (`delipecode`)

```bash
# 1. Conectar ao repositório no GitHub do usuário delipecode
git remote add origin https://github.com/delipecode/hub-midia-gn.git

# 2. Enviar o código para a branch main
git branch -M main
git push -u origin main
```

