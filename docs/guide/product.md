# Guia do Projeto: Caixinhas — Produto & Regras de Negócio

**Versão:** 1.0
**Última Atualização:** Fevereiro de 2026

## 1. Visão Geral (Produto & Marketing)

### 1.1. O que é o Caixinhas?

**Caixinhas** é um aplicativo de finanças colaborativo, projetado especificamente para casais que desejam planejar seu futuro financeiro juntos. Ele transforma o gerenciamento de dinheiro em uma jornada compartilhada, ajudando-os a organizar despesas, criar metas e, o mais importante, realizar seus sonhos em conjunto.

### 1.2. Slogan

> "Sonhar é o primeiro passo para conquistar."

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

O tom do Caixinhas é **encorajador, positivo, colaborativo e confiável**. A comunicação deve ser clara, evitando jargões financeiros complexos. Queremos que os casais se sintam empoderados e otimistas, nunca julgados.

### 2.2. Logotipo

O logotipo combina duas formas: um **coração** e um **cofre**. Isso simboliza a união da segurança emocional (confiança no relacionamento) com a segurança financeira (construção de patrimônio). As duas metades, com cores diferentes, representam os dois indivíduos que se unem para formar um todo.

### 2.3. Tipografia

- **Títulos e Manchetes (`font-headline`):** `Alegreya`, `serif`
- **Corpo de Texto (`font-body`):** `Alegreya`, `serif`

### 2.4. Paleta de Cores (Padrão)

- **Background (`--background`):** `hsl(60 56% 91%)` - Um bege claro e acolhedor.
- **Primária / Destaque (`--primary`):** `hsl(45 65% 52%)` - Um dourado/amarelo que representa otimismo e riqueza.
- **Accent (`--accent`):** `hsl(26 29% 50%)` - Um marrom suave que complementa o dourado.
- **Texto Principal (`--foreground`):** `hsl(26 29% 20%)` - Um marrom escuro com excelente legibilidade.
- **Destrutivo / Alerta (`--destructive`):** `hsl(0 84.2% 60.2%)` - Vermelho vibrante para ações perigosas.

## 3. Regras de Negócio e Funcionalidades

### 3.1. Conceitos Fundamentais

- **Usuário:** Cada pessoa tem sua própria conta individual.
- **Cofre (Vault):** Um espaço de trabalho compartilhado. Um casal pode criar um cofre (ex: "Família Silva") para gerenciar contas e metas conjuntas. Um usuário também tem seu "espaço pessoal", que funciona como um cofre privado.
- **Contas (Account):** Representam contas bancárias, cartões de crédito ou contas de investimento.
  - **Pessoal:** Pertence a um usuário e é, por padrão, privada. Pode ser tornada "visível" dentro de um cofre.
  - **Compartilhada:** Pertence diretamente a um cofre. Todos os membros do cofre podem vê-la.
- **Caixinha (Goal):** Um objetivo de economia com um valor alvo. Pode ser "Privada" ou "Compartilhada".
- **Transações (Transaction):**
  - **Entrada (Income):** Dinheiro que entra no sistema.
  - **Saída (Expense):** Dinheiro que sai do sistema.
  - **Transferência (Transfer):** Dinheiro que se move _dentro_ do sistema.

### 3.2. Fluxo Principal do Usuário

1.  **Cadastro/Login:** Usuário cria uma conta ou faz login.
2.  **Seleção de Cofre:** O usuário escolhe em qual espaço de trabalho deseja operar.
3.  **Painel Principal:** Visualiza um resumo do cofre selecionado: patrimônio, caixinhas e transações recentes.
4.  **Gerenciamento:** Adiciona contas, cria caixinhas, registra transações.
5.  **Análise:** Gera relatórios financeiros via IA.
6.  **Colaboração:** Convida seu parceiro(a) para criar um cofre compartilhado.

---

_Este documento deve ser mantido atualizado à medida que o projeto evolui._
