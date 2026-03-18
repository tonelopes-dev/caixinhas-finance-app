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

## 🧩 3. Componentes Assinatura

### 3.1 `DashboardBackground` (O Coração Visual)
O segredo do design é a camada fixa de fundo que flutua atrás de tudo:
- **Camada 1**: Gradientes radiais suaves (Salmon no topo, Gold no fundo).
- **Camada 2**: Overlay sutil (`bg-black/[0.03]`) para dar profundidade ao "vidro".
- **Camada 3**: Ruído/Grain sutil (opcional) para textura física.

### 3.2 Botões Premium (`StandardButton`)
- **Físico**: `h-14` (mínimo), `rounded-[20px]`.
- **Estilo**: Gradientes lineares (`bg-gradient-to-br from-[#ff6b7b] via-[#fa8292] to-[#ff6b7b]`).
- **Animação**: `tracking-widest capitalize`, `transition-all active:scale-95`.

### 3.3 Cards e Containers
- **Bordas**: `rounded-[32px]` ou `rounded-[40px]`.
- **Fundo**: `bg-white/60` ou `bg-white/30` com `backdrop-blur`.
- **Layout**: Uso ostensivo de `padding` interno (`p-8 md:p-12`).

---

## 📐 4. Padrões de Layout

### 4.1 Estrutura de Página
1. **Wrapper**: `relative min-h-screen overflow-x-hidden`.
2. **Background**: `<DashboardBackground />` (Posição fixa).
3. **Content Layer**: `relative z-10 pt-24 pb-32` (O `pt-24` garante espaço para o Header/Sidebar).
4. **Max Width**: Centralizado com `mx-auto max-w-5xl` ou `max-w-6xl`.

### 4.2 Navegação Uniforme
- Sempre usar o `StandardBackButton` no topo à esquerda do conteúdo principal.
- Títulos de página: `H1` com `font-headline text-4xl`, combinando a cor `primary` em palavras-chave.

---

## 🏁 5. Checklist de Refinamento (O "Wow Factor")

Ao criar uma nova página, verifique:
- [ ] **Badges**: São todos em `uppercase tracking-widest` com fonte `black`?
- [ ] **Hovers**: Os elementos rotacionam (`rotate-[360deg]`), brilham ou sobem (`-translate-y-1`) ao passar o mouse?
- [ ] **Skeletons**: Têm o mesmo border-radius dos componentes reais?
- [ ] **Empty States**: Usam ícones grandes com `bg-white/30 rounded-[40px]` e `animate-pulse`?
- [ ] **Contexto**: Os diálogos/modais respeitam o `DashboardBackground` (têm seu próprio fundo glass)?

---

## 🚀 6. Páginas Concluídas (Referências)
- **Dashboard**: O exemplo máximo de grid dinâmico.
- **Transactions**: Referência para tabelas e modais mobile-first.
- **Recurring**: Exemplo de consolidação de dados (agrupamento inteligente).
- **Goals**: Mix perfeito de progresso visual e cards interativos.

---

## 🛠️ 7. Guia Técnico (Backend-to-Frontend)
- **Fetch**: Usar `Promise.all` para todos os dados que não dependem entre si.
- **Grouping**: Agrupar transações repetitivas (Recorrência/Parcelas) para evitar poluição da UI.
- **Actions**: Utilizar Server Actions com `useActionState` para feedback instantâneo e robusto.
- **Types**: Manter interfaces no `definitions.ts` centralizado, evitando `any` a todo custo.

---

Este manifesto garante que o Caixinhas não seja apenas um app, mas uma **Experiência Premium**. Se for replicar em um Blog, foque na tipografia Alegreya para o corpo do texto e nos cards flutuantes para posts em destaque.
