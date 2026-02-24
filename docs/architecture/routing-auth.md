# Arquitetura de Rotas e Controle de Acesso

Este documento descreve a arquitetura de roteamento do projeto, baseada no App Router do Next.js, e como ela é organizada para separar claramente as áreas públicas e privadas da aplicação, garantindo o controle de acesso.

## 1. Visão Geral da Estrutura

O projeto utiliza **Route Groups** (Grupos de Rotas) do Next.js para organizar o código sem afetar a estrutura da URL.

### Estrutura de Pastas Principal (`app/`)

```
app/
├── (private)/         # Rotas que exigem autenticação
│   ├── dashboard/
│   ├── subscription/
│   ├── transactions/
│   └── layout.tsx       # Layout para a área logada
│
├── (public)/          # Rotas abertas a todos os usuários
│   ├── blog/
│   ├── landing-page/
│   ├── login/
│   └── layout.tsx       # Layout para a área pública
│
├── api/               # API Routes (ex: webhooks)
└── layout.tsx         # Layout raiz
```

## 2. Rotas Públicas `(public)`

- **Localização:** `app/(public)/`
- **Exemplos:** `landing-page`, `blog`, `login`, `privacy-policy`.
- **Layout:** `app/(public)/layout.tsx` — cabeçalho de marketing, navegação e rodapé.

## 3. Rotas Privadas `(private)`

- **Localização:** `app/(private)/`
- **Exemplos:** `dashboard`, `transactions`, `subscription`.
- **Layout:** `app/(private)/layout.tsx` — barra lateral, header do usuário.

## 4. O Mecanismo de Proteção: `middleware.ts`

O controle de acesso é implementado no `middleware.ts` na raiz do projeto.

- **Autenticação:** Utiliza **NextAuth.js** com sessões JWT para verificar se o usuário está autenticado.
- **Funcionamento:** O middleware intercepta todas as requisições. Verifica se o usuário tenta acessar uma rota privada sem sessão ativa e redireciona para `/login`.
- **Cookie:** No login, um cookie de sessão é definido para ser lido pelo middleware.
- **Vault ID:** O `sessionStorage` armazena o `Caixinhas_VAULT_ID`, que define o cofre ativo na sessão atual.

## 5. Stack Tecnológica

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript
- **UI Components:** Radix UI, Tailwind CSS
- **Estilo:** CSS Variables para theming dinâmico
- **Inteligência Artificial:** Google Genkit com modelos Gemini
- **Backend:** Prisma ORM + PostgreSQL (prod) / SQLite (dev)
- **Autenticação:** NextAuth.js com `@next-auth/prisma-adapter`
- **E-mails:** SendGrid
- **Storage:** AWS S3

## 6. Estrutura do Projeto

- `/src/app/` — Rotas da aplicação (App Router)
- `/src/components/` — Componentes React, organizados por funcionalidade e UI (Radix/shadcn)
- `/src/services/` — Lógica de negócio desacoplada
- `/src/lib/` — Utilitários, types e configurações
- `/src/ai/` — Fluxos e configurações do Genkit para IA
- `/prisma/` — Schema, migrations e seed
- `/docs/` — Documentação do projeto
