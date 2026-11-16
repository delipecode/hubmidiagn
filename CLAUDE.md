# Hub Mídia Grupo Nobre (CLAUDE.md)

Este repositório é o **Hub de Mídias & Central de Campanhas do Grupo Nobre**.

## 🛠️ Stack Tecnológica
- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4, Lucide React
- **Banco de Dados:** Drizzle ORM + LibSQL / Turso (com fallback automático para SQLite `file:local.db` localmente)
- **Deploy:** Vercel (CI/CD automático via branch `main`)

## 🚀 Comandos Principais
- `npm install` - Instala dependências
- `npm run dev` - Roda servidor de desenvolvimento local (http://localhost:3000)
- `npx tsc --noEmit` - Checagem de tipagem TypeScript
- `npm run build` - Build de produção Next.js

## 🎨 Regras de Negócio e Governança do Grupo Nobre
1. **Terminologia:** NUNCA use a palavra "Holding". Use sempre **"Grupo Nobre"**.
2. **Marcas Integradas:**
   - `UNEF` (Laranja/Âmbar `#F59E13`)
   - `UNIFAN` (Azul Royal `#2563EB`)
   - `UNIFAN_IPIRA` (Verde Esmeralda `#059669`)
   - `UNIFAN_IRECE` (Verde Floresta `#166534`)
   - `NOBRE` (Colégio Nobre - Azul Claro `#0284C7`)
   - `MAPLE` (Maple Bear - Vermelho `#E11D48`)
3. **Autenticação Padrão:**
   - Usuário: `admin` | Senha: `1234`
4. **Deploy:**
   - Todo push na branch `main` dispara deploy automático na Vercel: `https://hubmidiagn.vercel.app`
