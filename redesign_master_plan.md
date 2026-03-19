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

## 🏁 5. Páginas Concluídas (Referências)
- [x] **Landing Page**: Vitrine principal com gradientes e o "feeling" original.
- [x] **Dashboard**: Centro de operações com widgets modulares e Alegreya headers.
- [x] **Transactions**: Grid de transações com filtros avançados e mobile-first design.
- [x] **Recurring**: Planejamento de fixas e parcelados com barras de progresso premium.
- [x] **Accounts & Categories**: O padrão ouro para gestão de ativos com **Premium Virtual Cards**.
- [x] **Vault Selection**: Galeria acolhedora para entrada no app.
- [x] **Profile (Tabs)**: Central de configurações organizada por abas e temas reativos.
- [x] **Patrimônio**: Visualização consolidada de ativos com foco editorial em Alegreya.
- [x] **Notifications**: Central de avisos com filtros glass e animações de estado.
- [x] **Auth Flow (Universal)**: Login, Registro, Recuperação e Reset de senha com estética 100% unificada.

---

## 🚀 Próximos Passos
- Expandir o sistema de temas para permitir customizações mais profundas de acentos (Gold vs Silver).
- Implementar micro-animações de "completude" em todas as telas de sucesso.
