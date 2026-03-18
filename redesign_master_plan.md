# 🗺️ Redesign Master Plan: Caixinhas Finance App

Este documento serve como o roteiro estratégico para a modernização da interface do Caixinhas, focando em uma estética **Premium Sênior**, alta performance e arquitetura limpa.

## 🎯 Objetivos de Design & Arquitetura

- **Estética Premium**: Uso de paletas de cores sofisticadas (Gold, Warm Brown, Salmon Pink), tipografia serifada (Alegreya) para títulos e efeitos de profundidade (glassmorphism/sombras suaves).
- **Acessibilidade & Contraste**: Garantir que todos os elementos sejam legíveis e intuitivos, mesmo para usuários com baixa literacia.
- **Clean Code & Performance**:
  - Unificação de componentes reutilizáveis.
  - Carregamento paralelo (`Promise.all`) e `Suspense` para evitar bloqueios de UI.
  - Lazy loading de componentes pesados.
  - Otimização de imagens e ícones.

---

## ✅ Checklist de Redesign

### 🚀 Páginas Concluídas (Design System Aplicado)
- [x] **Landing Page**: Estética futurista e convidativa.
- [x] **Página de Login**: Interface limpa e elegante.
- [x] **Lista de Cofres (Vaults)**: Cards premium e fluxos simplificados.
- [x] **Dashboard Principal**: Background dinâmico, grid dourado e cards de alta definição.
- [x] **Gestão de Caixinhas (Goals)**: Página `/goals` redesenhada com cards premium e background sofisticado.
- [x] **Navegação Mobile**: Menu flutuante com área de segurança global.

---

### 🛠️ Próximas Etapas (Pendentes)

#### 1. Gestão de Caixinhas (Goals)
- [x] **Lista de Metas (`/goals`)**: Redesenhar a listagem principal para usar o novo `GoalCard` premium.
- [x] **Detalhes da Caixinha (`/goals/[id]`)**: Implementar visualização focada no progresso, com gráficos e histórico de transações premium.
- [ ] **Criação/Edição de Metas**: Refinar os formulários e seletores de ícones/cores.

#### 2. Transações & Contas
- [ ] **Página de Transações (`/transactions`)**: Tabela/Lista premium com filtros avançados e extrato categorizado.
- [ ] **Gestão de Contas (`/accounts`)**: Redesenhar a listagem de bancos e cartões como "cartões físicos" virtuais.

#### 3. Análise & Patrimônio
- [ ] **Resumo de Patrimônio (`/patrimonio`)**: Gráficos de alta fidelidade e cards de distribuição de ativos.
- [ ] **Relatórios Salvos (`/reports`)**: Interface de leitura limpa e exportação elegante.

#### 4. Social & Perfil
- [ ] **Convites (`/invitations`)**: Cartões de convite premium com tooltips de membros.
- [ ] **Perfil do Usuário (`/profile`)**: Configurações simplificas e troca de avatar com compressão de imagem.
- [ ] **Notificações**: Dropdown e página de histórico com design unificado.

#### 5. Onboarding & Recuperação
- [ ] **Registro (`/register`)**: Fluxo de boas-vindas condizente com a nova marca.
- [ ] **Recuperação de Senha**: Páginas de "Esqueci a senha" e "Redefinir" premium.
- [ ] **Tutorial**: Onboarding guiado com micro-animações.

---

## 🧩 Componentes Padrão (Design System)

Para manter a consistência, todos os novos desenvolvimentos devem utilizar:

- **Avatar / Membros**: [MemberAvatars](file:///c:/Projetos/caixinhas-finance-app/src/components/ui/member-avatars.tsx) (sempre com Tooltip).
- **Botões**: `h-14`, Rounded `20px` ou `Full`, tipografia `uppercase tracking-widest`.
- **Modais**: Background `#fdfcf7`, Rounded `40px`, títulos em `Alegreya`.
- **Cards**: Sombras `shadow-[0_20px_50px_rgba(45,36,30,0.08)]`, bordas sutilíssimas.

---

---

## 📈 Melhorias de Arquitetura & Saúde Técnica

- [ ] **Clean Architecture**:
  - Separar lógica de negócio (`services`) de componentes de UI.
  - Tipagem rigorosa em todos os novos componentes.
- [ ] **Performance**:
  - Monitoramento de Core Web Vitals (LCP, CLS).
  - Redução de renders desnecessários usando `React.memo` e `useMemo` onde aplicável.
- [ ] **Usabilidade**:
  - Tooltips em todos os ícones interativos.
  - Feedback visual claro para todas as ações (Skeletons, Spinners Premium).
- [ ] **Acessibilidade**:
  - Suporte total a navegação por teclado e leitores de tela (Aria-labels).
