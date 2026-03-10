# Caixinhas: Inteligência Financeira Colaborativa 📦💼

Este documento serve como base técnica e estratégica para a criação de posts no LinkedIn sobre o projeto **Caixinhas**.

## 🚀 Visão Geral

O **Caixinhas** não é apenas mais um rastreador de finanças. É um **Sistema Operacional Financeiro Colaborativo**. Focado em casais, ele resolve a fragmentação financeira ("silos financeiros") que gera atritos nos relacionamentos, oferecendo um espaço neutro e transparente para transformar sonhos em metas reais.

## 🛠️ Stack Tecnológica (Modern Full-Stack)

- **Frontend & App Engine:** Next.js 15 (App Router), React 18, TypeScript.
- **Estilização:** Tailwind CSS, Radix UI, Framer Motion (animações premium).
- **Dados & Persistência:** Prisma ORM, PostgreSQL (Produção), SQLite (Dev/Test).
- **Autenticação:** NextAuth.js com fluxos de credenciais e persistência segura.
- **Inteligência Artificial:** Google Genkit + Gemini 2.5 Flash para relatórios financeiros humanizados.
- **PWA:** Implementação completa de Service Workers para resiliência offline.
- **Infraestrutura:** AWS S3 para armazenamento de artefatos.

## 💎 Diferenciais Técnicos & Funcionalidades Core

1. **Protocolo "Cofre & Meta":** Arquitetura multi-tenant onde cada usuário possui seu workspace pessoal e pode participar de múltiplos "Cofres" compartilhados.
2. **IA Coach Financeiro:** Uso de Generative AI para processar centenas de transações e gerar relatórios mensais em linguagem natural, oferecendo insights preditivos em vez de apenas gráficos estáticos.
3. **Engenharia de Performance:** Consultas otimizadas com índices estratégicos no PostgreSQL (sub-100ms) e auditoria contínua via scripts de benchmark customizados.
4. **Sistema de Convites & RBAC:** Lógica sofisticada de convites com controle de acesso baseado em funções (Role-Based Access Control) para garantir privacidade e integridade dos dados.
5. **Automação Industrial:** Mais de 25 scripts utilitários para CI/CD, benchmarks de API, troca de banco de dados em runtime e testes de fluxo de e-mail.

## 🧠 Desafios Superados & Aprendizados

- **Gestão de Estado Complexa:** Sincronizar dados entre espaços pessoais e compartilhados mantendo a segurança (isolamento de tenants).
- **Análise de Transações com LLMs:** Otimização de prompts para garantir que a IA forneça conselhos financeiros precisos e encorajadores, sem alucinações.
- **Resiliência de Offline:** Implementar uma estratégia de PWA robusta que permita ao usuário registrar transações mesmo sem conectividade estável.
- **Transação Atômica:** Garantir integridade de dados em fluxos de transferência entre contas e "Caixinhas" (metas de economia).

## 💡 Sugestões de Posts para o LinkedIn

### Post 1: Arquitetura & Stack

_Foco:_ Decisão técnica de usar Next.js 15 + Prisma + IA.
_Nicho:_ Devs, Arquitetos de Software.

### Post 2: IA na Prática (Fintech)

_Foco:_ Como o Google Genkit transformou transações chatas em relatórios humanizados.
_Nicho:_ Product Managers, Entusiastas de IA.

### Post 3: O Desafio da Colaboração

_Foco:_ Como construímos um sistema de permissões (RBAC) para casais que equilibra privacidade e transparência.
_Nicho:_ UX Designers, Founders.

### Post 4: Performance & DX (Developer Experience)

_Foco:_ A importância de scripts de automação e benchmarks para manter um projeto senior-ready.
_Nicho:_ DevOps, Tech Leads.
