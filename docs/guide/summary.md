# 📦 Caixinhas: Collaborative Financial Intelligence

Este documento detalha os aspectos técnicos e estratégicos do projeto **Caixinhas**, um sistema operacional financeiro colaborativo desenhado para casais.

---

### 🛠️ Stack completa:

- **Core:** Next.js 15 (App Router), React 18, TypeScript.
- **UI/UX:** Tailwind CSS, Radix UI (Componentes), Framer Motion (Animações), Lucide Icons, Recharts (Gráficos).
- **Inteligência Artificial:** Google Genkit + Google Generative AI (Gemini) para coaching financeiro e análise de gastos.
- **Banco de Dados & ORM:** Prisma ORM com PostgreSQL (Produção) e SQLite (Desenvolvimento/Testes).
- **Autenticação:** NextAuth.js com `@next-auth/prisma-adapter`.
- **Infraestrutura PWA:** Service Workers customizados para suporte offline e experiência nativa.
- **Comunicação:** SendGrid para e-mails transacionais e de ciclo de vida.
- **Storage:** AWS S3 / Cloud Storage para artefatos de transações.
- **Testes:** Jest (Unitários/Integração) e Playwright (E2E).
- **Tooling:** 26+ scripts de automação para benchmarks de API, troca de banco de dados e auditoria de performance.

---

### 🎯 Problema real que resolve:

O projeto ataca a "falta de transparência e os silos financeiros" em relacionamentos. Muitas vezes, casais brigam por dinheiro devido à falta de uma visão comum ou pelo medo de perder a autonomia individual. O **Caixinhas** resolve isso criando um terreno neutro onde a parceria encontra a privacidade:

- **Fim das planilhas complexas:** Interface visual e baseada em objetivos ("Sonhos").
- **Comunicação facilitada:** Transforma dados frios em conversas sobre o futuro.
- **Autonomia vs. Colaboração:** Permite manter contas pessoais separadas enquanto compartilha o que é necessário para a vida a dois.

---

### 🧠 Complexidade técnica:

- **IA de Análise Comportamental:** Uso de GenAI para processar centenas de transações e gerar relatórios mensais em linguagem humana, identificando padrões de gastos e oferecendo conselhos práticos.
- **Arquitetura de Serviços:** Lógica de negócio desacoplada em `src/services` para garantir testabilidade e manutenibilidade.
- **Gestão de Transações Complexas:** Implementação de transações recorrentes, parcelamentos de cartão de crédito e fluxos de transferência entre contas e objetivos ("Caixinhas").
- **Protocolo de Convites & RBAC:** Sistema sofisticado de convites com controle de acesso baseado em roles para membros de Cofres.

---

### 🔐 Autenticação?

**Sim.** Implementada com **NextAuth.js**, suportando fluxos de credenciais e persistência segura no banco de dados via Prisma.

---

### 🗄️ Banco?

**Sim.** Utiliza **PostgreSQL** para o ambiente de produção, garantindo integridade referencial e performance. O projeto também possui automação para alternar para **SQLite** em ambientes de desenvolvimento local ou CI.

---

### ⚖️ Regras de negócio?

**Extensas.** O sistema opera sob o protocolo **"Vault & Goal"**:

- Regras de visibilidade granular (Privado vs. Compartilhado).
- Lógica de cálculo de progresso de metas em tempo real.
- Validação de saldo e limite de crédito em múltiplas contas.
- Gestão de ciclo de vida de transações recorrentes.

---

### 🏢 Multi-tenant?

**Sim.** A arquitetura é centrada em **Cofres (Vaults)**. Cada usuário possui seu próprio "Tenant" pessoal e pode participar de múltiplos tenants compartilhados. O isolamento de dados é garantido por esquemas de relacionamento fortes no banco de dados (`vaultId` e `ownerId`).

---

### ⚡ Performance?

**Prioridade Máxima.**

- Consultas ao banco otimizadas com índices estratégicos (sub-100ms).
- Otimização de LCP (Largest Contentful Paint) usando `Critters`.
- Estratégia de Cache e PWA para carregamento instantâneo.
- Scripts dedicados de benchmark (`benchmark-api.ts`) para auditoria contínua de latência.

---

### 🚀 Deploy?

Configurado para **Firebase App Hosting / Google Cloud** via `apphosting.yaml`. A infraestrutura é escalável e utiliza serviços de nuvem para storage e envio de e-mails.

---

### 👥 Usuários reais?

O projeto é desenhado para **casais** (namorados, noivos ou casados). Embora seja um projeto de alto nível técnico ("Senior-First"), ele foi construído com foco em **product-market fit**, possuindo um manifesto de marca e fluxos de experiência do usuário validados para uso cotidiano e real.
