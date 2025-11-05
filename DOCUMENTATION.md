# Guia do Projeto: DreamVault

**Versão:** 1.0
**Última Atualização:** 30 de Julho de 2024

## 1. Visão Geral (Produto & Marketing)

### 1.1. O que é o DreamVault?

**DreamVault** é um aplicativo de finanças colaborativo, projetado especificamente para casais que desejam planejar seu futuro financeiro juntos. Ele transforma o gerenciamento de dinheiro em uma jornada compartilhada, ajudando-os a organizar despesas, criar metas e, o mais importante, realizar seus sonhos em conjunto.

### 1.2. Slogan

> “Sonhar juntos é o primeiro passo para conquistar.”

### 1.3. Público-Alvo

Casais em qualquer estágio do relacionamento (namorados, noivos, casados) que buscam alinhar suas vidas financeiras, aumentar a transparência e trabalhar em equipe para alcançar objetivos comuns.

### 1.4. Benefícios e Proposta de Valor

- **Transparência e Confiança:** Centraliza as finanças do casal, eliminando suposições e promovendo um diálogo aberto sobre dinheiro.
- **Planejamento Orientado a Sonhos:** Foca em "Caixinhas" para objetivos claros (ex: "Viagem ao Japão", "Reforma da Cozinha"), tornando a economia mais tangível e motivadora.
- **Redução do Estresse Financeiro:** Oferece ferramentas claras para gerenciar orçamentos e despesas, diminuindo a ansiedade associada ao dinheiro.
- **Inteligência Artificial como Aliada:** Fornece relatórios financeiros mensais gerados por IA, que traduzem dados complexos em insights práticos e encorajadores.
- **Flexibilidade Total:** Permite a separação clara entre finanças pessoais e conjuntas através do sistema de "Cofres", respeitando a individualidade de cada um.

## 2. Identidade da Marca (Brand & Design)

### 2.1. Brand Voice & Tom

O tom do DreamVault é **encorajador, positivo, colaborativo e confiável**. A comunicação deve ser clara, evitando jargões financeiros complexos. Queremos que os casais se sintam empoderados e otimistas, nunca julgados.

### 2.2. Logotipo

O logotipo combina duas formas: um **coração** e um **cofre**. Isso simboliza a união da segurança emocional (confiança no relacionamento) com a segurança financeira (construção de patrimônio). As duas metades, com cores diferentes, representam os dois indivíduos que se unem para formar um todo.

### 2.3. Tipografia

A tipografia foi escolhida para ser elegante, legível e com um toque clássico, reforçando a seriedade e a importância do planejamento de vida.

- **Títulos e Manchetes (`font-headline`):** `Alegreya`, `serif`
- **Corpo de Texto (`font-body`):** `Alegreya`, `serif`

### 2.4. Paleta de Cores (Padrão)

A paleta de cores transmite calor, otimismo e confiança.

- **Background (`--background`):** `hsl(60 56% 91%)` - Um bege claro e acolhedor, que serve como uma tela neutra e confortável.
- **Primária / Destaque (`--primary`):** `hsl(45 65% 52%)` - Um dourado/amarelo que representa otimismo, riqueza e a "recompensa" dos sonhos alcançados.
- **Accent (`--accent`):** `hsl(26 29% 50%)` - Um marrom suave que complementa o dourado, usado para interações sutis e elementos secundários.
- **Texto Principal (`--foreground`):** `hsl(26 29% 20%)` - Um marrom escuro que oferece excelente legibilidade sobre o fundo claro.
- **Destrutivo / Alerta (`--destructive`):** `hsl(0 84.2% 60.2%)` - Um vermelho vibrante, usado com moderação para ações perigosas como exclusões.

## 3. Regras de Negócio e Funcionalidades (Produto)

### 3.1. Conceitos Fundamentais

- **Usuário:** Cada pessoa tem sua própria conta individual.
- **Cofre (Vault):** Um espaço de trabalho compartilhado. Um casal pode criar um cofre (ex: "Família Silva") para gerenciar contas e metas conjuntas. Um usuário também tem seu "espaço pessoal", que funciona como um cofre privado.
- **Contas (Account):** Representam contas bancárias, cartões de crédito ou contas de investimento.
  - **Pessoal:** Pertence a um usuário e é, por padrão, privada. Pode ser tornada "visível" dentro de um cofre.
  - **Compartilhada:** Pertence diretamente a um cofre. Todos os membros do cofre podem vê-la e, dependendo das permissões, gerenciá-la.
- **Caixinha (Goal):** Um objetivo de economia com um valor alvo. Pode ser "Privada" (visível apenas para o criador e convidados) ou "Compartilhada" (visível para todos no cofre).
- **Transações (Transaction):** Registros de movimentações financeiras.
  - **Entrada (Income):** Dinheiro que entra no sistema (ex: salário).
  - **Saída (Expense):** Dinheiro que sai do sistema (ex: uma compra).
  - **Transferência (Transfer):** Dinheiro que se move *dentro* do sistema (ex: da conta corrente para uma caixinha).

### 3.2. Fluxo Principal do Usuário

1.  **Cadastro/Login:** Usuário cria uma conta ou faz login.
2.  **Seleção de Cofre:** O usuário escolhe em qual espaço de trabalho deseja operar (seu espaço pessoal ou um cofre compartilhado).
3.  **Painel Principal:** Visualiza um resumo do cofre selecionado: patrimônio, caixinhas e transações recentes.
4.  **Gerenciamento:**
    - Adiciona e gerencia contas e cartões em `Perfil > Contas e Cartões`.
    - Cria e acompanha o progresso das "Caixinhas" de sonhos.
    - Registra transações diárias (entradas, saídas, transferências).
5.  **Análise:** Gera relatórios financeiros via IA para entender a saúde financeira e obter insights.
6.  **Colaboração:** Convida seu parceiro(a) para criar um cofre compartilhado e começar a planejar juntos.

## 4. Especificações Técnicas (Desenvolvimento)

### 4.1. Stack Tecnológica

- **Frontend:** Next.js (App Router), React, TypeScript
- **UI Components:** ShadCN UI, Tailwind CSS
- **Estilo:** CSS Variables para theming dinâmico.
- **Inteligência Artificial:** Google Genkit com modelos Gemini.
- **Backend (BaaS):** Firebase (Authentication e Firestore).

### 4.2. Estrutura do Projeto

- **/src/app/**: Rotas da aplicação (App Router).
- **/src/components/**: Componentes React, organizados por funcionalidade (dashboard, goals, profile, etc.) e UI (shadcn).
- **/src/lib/**: Lógica de negócio, definições de tipo (TypeScript) e dados simulados (mock data).
- **/src/ai/**: Fluxos e configurações do Genkit para funcionalidades de IA.
- **/src/firebase/**: Configuração e hooks do Firebase.
- **/docs/backend.json**: Define a estrutura de dados (schema) para o Firestore e Auth, servindo como "verdade" para a geração de código e regras de segurança.
- **/firestore.rules**: Regras de segurança do Firestore, que são automaticamente aplicadas com base na estrutura definida.

### 4.3. Lógica de Autenticação e Sessão

- A autenticação é gerenciada pelo Firebase Authentication.
- No login, um cookie `DREAMVAULT_USER_ID` é definido para ser lido pelo `middleware`.
- O `middleware.ts` protege as rotas, redirecionando usuários não autenticados para `/login`.
- O `sessionStorage` armazena o `DREAMVAULT_VAULT_ID`, que define o cofre ativo na sessão atual. Isso permite que o usuário navegue entre diferentes espaços de trabalho.

---
*Este documento deve ser mantido atualizado à medida que o projeto evolui.*
