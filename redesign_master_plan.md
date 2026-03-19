# 🎨 Caixinhas Design Manifesto: A Estética Premium Sênior

Este documento é a **Bíblia de Design** do Caixinhas. Ele detalha os princípios, tokens e componentes necessários para replicar exatamente a mesma experiência visual em qualquer projeto (seja um blog, dashboard ou novo app).

---

## 🏛️ 1. Princípios de Design (O "Feeling")

A estética do Caixinhas baseia-se no conceito de **"Trustworthy Premium"** (Confiável e Premium).
- **Acolhimento**: Cores quentes (Salmon, Warm Brown, Gold) evocam conforto e cuidado financeiro.
- **Sofisticação**: Uso intensivo de *glassmorphism*, sombras difusas e tipografia clássica (Serif).
- **Simplicidade**: Interfaces limpas, botões grandes e arredondados, e baixa densidade de informação por "view".

---

## 🎨 2. Design Tokens (A Identidade)

### 2.1 Paleta de Cores
- **Primária (Pink/Salmon)**: `#ff6b7b` (Usada em botões principais, destaques e progresso).
- **Secundária (Gold)**: `#d4af37` (Acentos de luxo, bordas de destaque).
- **Texto Principal**: `#2D241E` (Um marrom profundo, nunca preto puro #000).
- **Texto Secundário**: `#2D241E/40` ou `/60` (Opacidade controlada para hierarquia).
- **Background Base**: `#fdfcf7` (Um bege off-white quentíssimo, evita a "frieza" do branco).

### 2.2 Tipografia (Google Fonts)
- **Títulos/Headers**: **Alegreya** (Serifada). Traz autoridade e elegância. 
  - Estilo: `font-bold`, `tracking-tight`.
- **Interface/Body**: **Inter** ou **Outfit** (Sans-serif). Focada em legibilidade extrema.
  - Estilo: `font-black`, `uppercase`, `tracking-[0.1em]` para badges e textos pequenos.

### 2.3 Efeitos de Profundidade
- **Glassmorphism**: `bg-white/40`, `backdrop-blur-xl`, `border-white/50`.
- **Sombras (Drop Shadows)**: 
  - Soft: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
  - Deep: `shadow-[0_20px_50px_rgba(45,36,30,0.08)]`

---

### 3.4 Premium Virtual Cards (Bancos e Cartões)
- **Estrutura**: `rounded-[32px]`, `bg-white/40`, `backdrop-blur-xl`, `border border-white/50`.
- **Elementos Visuais**:
  - **Header**: Logo do banco (`h-12 w-12 rounded-2xl bg-white p-1`).
  - **Chip**: Retângulo `h-8 w-11` com gradiente `amber-200` a `amber-500` e grid de 20% de opacidade.
  - **Tipografia de Saldo**: `text-2xl font-black tracking-tighter`. Verde (`emerald-500`) para positivo, Vermelho (`red-500`) para negativo/fatura.
- **Interatividade**: Botões de ação (`Edit/Delete`) ocultos por padrão (`opacity-0`), revelados no `hover` do card.

### 3.5 Glassmorphism Pills (Categorias e Badges)
- **Estilo**: `rounded-full`, `bg-white/40`, `backdrop-blur-md`, `border-white`.
- **Tipografia**: `font-bold text-[#2D241E]`. Prefixo `#` com `opacity-80`.

---

## 📐 4. Padrões de Layout

### 4.1 Estrutura de Página
1. **Wrapper**: `relative min-h-screen overflow-x-hidden`.
2. **Background**: `<DashboardBackground />` (Posição fixa).
3. **Content Layer**: `relative z-10 pt-24 pb-32` (O `pt-24` garante espaço para o Header/Sidebar).
4. **Max Width**: Centralizado com `mx-auto max-w-4xl` (para páginas de gestão) ou `max-w-6xl` (dashboards).

### 4.2 Grid de Gestão
- Usar `grid-cols-1 md:grid-cols-2 gap-6` para listar itens complexos como cards de contas.

---

## 🏁 5. Checklist de Refinamento (O "Wow Factor")

Ao criar uma nova página, verifique:
- [ ] **Badges**: São todos em `uppercase tracking-widest` com fonte `black`?
- [ ] **Hovers**: Os elementos rotacionam, brilham ou sobem (`-translate-y-1`) ao passar o mouse?
- [ ] **Skeletons**: Têm o mesmo border-radius dos componentes reais?
- [ ] **Empty States**: Usam ícones grandes com `bg-white/30 rounded-[40px]` e `animate-pulse`?
- [ ] **Diálogos**: Têm `rounded-[40px]`, fundo `fdfcf7` e headers com `bg-white/50 backdrop-blur`?

---

## 🚀 6. Páginas Concluídas (Referências)
- **Dashboard**: O exemplo máximo de grid dinâmico e widgets premium.
- **Transactions**: Referência para tabelas, filtros e modais mobile-first.
- **Accounts & Categories**: O padrão ouro para gestão de ativos com **Premium Virtual Cards** e **Glass Pills**.
- [x] Login (V2)
- [x] Landing Page (V2)
- [x] Dashboard (V2)
- [x] Contas (V2)
- [x] Categorias (V2)
- [x] Seleção de Cofres (Vaults V2)

## Novos Padrões Estabelecidos

### Premium Vault Gallery
- **Container**: `bg-white/40`, `backdrop-blur-xl`, `border-white/60`.
- **Tipografia**: Alegreya italic para títulos, Outfit para subtítulos.
- **Micro-interações**: Hover com escala (`scale-105`) e sombra profunda (`shadow-2xl`).

### Dialog Standards
- **Radius**: `rounded-[40px]`.
- **Background**: `#fdfcf7` (Off-white quente).
- **Inputs**: Borda de 2px, raio de 24px, tipografia de alto impacto.
- **Progresso**: Barra de progresso visível no topo para diálogos multi-step.

---

## 🛠️ 7. Guia Técnico (Backend-to-Frontend)
- **Fetch**: Usar `Promise.all` para todos os dados que não dependem entre si.
- **Grouping**: Agrupar transações repetitivas para evitar poluição da UI.
- **Actions**: Utilizar Server Actions com `useActionState` para feedback instantâneo.
- **Typing**: Garantir que propriedades dinâmicas (como `visibleIn`) sejam tratadas com segurança via casting ou schemas rigorosos.

---

Este manifesto garante que o Caixinhas não seja apenas um app, mas uma **Experiência Premium**. Se for replicar em um Blog, foque na tipografia Alegreya para o corpo do texto e nos cards flutuantes para posts em destaque.
