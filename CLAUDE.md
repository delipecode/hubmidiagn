# Hub Mídia Grupo Nobre (CLAUDE.md)
> Guia de Contexto, Governança e Regras do Sistema para o Claude Code / Claude Designer

Este repositório é a **Central Executiva de Campanhas & Hub de Mídias do Grupo Nobre** (veiculação OOH, outdoors, LEDs, TVs indoor, rádio e panfletagem em Feira de Santana, Ipirá e Irecê).

---

## 🤝 Fluxo Colaborativo: Como Trabalhamos (Felipe / Antigravity ⇄ Colega / Claude)

Você (Claude) está atuando como co-desenvolvedor em conjunto com **Felipe Damasceno** (Vice-Coordenador de Marketing do Grupo Nobre) e o assistente de IA **Antigravity**.

### 🔄 Regra de Ouro do Workflow:
1. **Antes de iniciar qualquer demanda:**
   - Execute **SEMPRE** `git pull origin main` no terminal.
   - Felipe e o Antigravity trabalham ativamente na branch `main`, subindo novas features, melhorias de layout e catalogação de pontos. Puxar antes evita qualquer conflito.

2. **Durante o desenvolvimento:**
   - Respeite as regras visuais, paletas de cores institucionais e a arquitetura Next.js 16 já estabelecida.
   - Sempre consulte `src/lib/bissemanas.ts` quando mexer em datas de outdoor — o sistema usa um calendário de Bi-Semanas conectado dinamicamente ao ano.

3. **Antes de fazer commit:**
   - Execute sempre a checagem de tipos e build:
     ```bash
     npx tsc --noEmit
     npm run build
     ```
   - O build DEVE terminar com código 0 (sem erros de compilação ou TypeScript).

4. **Publicação & Deploy:**
   - Faça o commit com mensagem clara e envie para a branch principal:
     ```bash
     git add .
     git commit -m "feat/fix: descrição clara do que foi feito"
     git push origin main
     ```
   - **Deploy Automático na Vercel:** Assim que o `git push origin main` for concluído, a Vercel dispara o deploy em produção no endereço oficial:  
     👉 [https://hubmidiagn.vercel.app](https://hubmidiagn.vercel.app)
   - **Notificação Automática para o Felipe:** O Antigravity possui um monitor em segundo plano ativo no chat do Felipe que detecta o seu commit no GitHub a cada 10 minutos e avisa o Felipe na hora para ele puxar e testar.

---

## 🗄️ Como Funciona o Banco de Dados

O projeto utiliza **Drizzle ORM com LibSQL / SQLite (`src/db/index.ts`)**.

* **Modo Padrão (Sem Configuração Adicional):**  
  Se não houver variáveis de ambiente no `.env`, o sistema roda perfeitamente usando o arquivo local **`local.db`** (SQLite embutido). Não é necessário criar conta na Turso nem configurar nada para rodar localmente.
* **Modo Produção Compartilhado (Turso Cloud):**  
  Se você tiver acesso ao arquivo `.env` com `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`, a aplicação local se conectará à mesma base de dados em nuvem da Vercel e do Felipe.

---

## 🛠️ Stack Tecnológica & Comandos
- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Linguagem:** TypeScript (Strict mode)
- **Estilos:** Tailwind CSS v4, Lucide React
- **Tipografia:** `Inter` (corpo e tabelas legíveis) e `Plus Jakarta Sans` (títulos executivos)
- **Mapas:** Leaflet / OpenStreetMap

```bash
npm install        # Instala dependências
npm run dev        # Inicia servidor local em http://localhost:3000
npx tsc --noEmit   # Valida tipagem TypeScript
npm run build      # Valida e compila build de produção
```

---

## 🎨 Governança de Marca do Grupo Nobre (Regras Inegociáveis)

1. **Terminologia Institucional Obrigatória:**
   - **NUNCA** use a palavra *"Holding"*.
   - Use **SEMPRE** a designação oficial: **"Grupo Nobre"**.
2. **Proibição de Co-branding:**
   - Nunca coloque o logotipo de uma empresa junto com o logotipo geral do Grupo Nobre na mesma arte ou módulo de campanha.
3. **Marcas Integradas & Tokens de Cor:**
   - **UNEF:** Laranja/Âmbar (`#F59E13`), tema titânio escuro (`#1C1C1E`).
   - **UNIFAN:** Azul Royal (`#2563EB` / `#29337D`).
   - **UNIFAN Ipirá:** Verde Esmeralda (`#059669`).
   - **UNIFAN Irecê:** Verde Floresta (`#166534`).
   - **Colégio Nobre:** Azul Claro (`#0284C7` / `#1E65B3`).
   - **Maple Bear:** Vermelho Canadense (`#E11D48` / `#C8102E`).
4. **Acessibilidade & Contraste (WCAG 2.1 AA):**
   - O contraste entre texto e fundo deve ser de no mínimo **4.5:1**.
   - Nunca use variáveis CSS inexistentes como `var(--bg-color)` em botões `.active` ou `:hover`.
5. **Autenticação Padrão do Painel:**
   - Usuário: `admin` | Senha: `1234`
