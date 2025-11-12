# Migração da Página de Goals para Prisma

## 📋 Resumo

Migração completa da funcionalidade de **Goals (Caixinhas)** de mock data para Prisma ORM, seguindo o padrão de arquitetura estabelecido com Service Layer e Server Components.

## ✅ O Que Foi Feito

### 1. **Server Actions** (`src/app/goals/actions.ts`)

Criadas 8 Server Actions para gerenciar todas as operações de goals:

- `getUserAllGoals(userId)` - Busca todas as metas do usuário (pessoais + vaults)
- `getGoalDetails(goalId)` - Busca detalhes de uma meta específica com transações
- `createGoalAction(prevState, formData)` - Cria nova meta (form handler)
- `updateGoalAction(goalId, data)` - Atualiza meta existente
- `deleteGoalAction(goalId)` - Deleta meta
- `toggleFeaturedGoalAction(goalId)` - Alterna status de destaque
- `depositToGoalAction(goalId, amount, description)` - Adiciona valor à meta
- `withdrawFromGoalAction(goalId, amount, description)` - Remove valor da meta

**Funcionalidades:**
- ✅ Validação com Zod
- ✅ Revalidação automática de páginas (`revalidatePath`)
- ✅ Tratamento de erros
- ✅ Integração com GoalService e TransactionService
- ✅ Suporte a workspace (pessoal vs vault)

---

### 2. **Página Principal** (`src/app/goals/page.tsx`)

**Antes:** Client Component usando `getMockDataForUser`

**Depois:** Server Component que:
- Valida autenticação via cookies
- Busca dados via `getUserAllGoals`
- Renderiza `GoalsPageClient` com dados reais

**Client Component** (`src/components/goals/goals-page-client.tsx`):
- Exibe lista de todas as metas
- Permite alternar status de destaque (otimistic update)
- Navegação para vaults
- Link para criar nova meta

---

### 3. **Página de Criação** (`src/app/goals/new/page.tsx`)

**Antes:** Usava `addGoal` de `@/app/actions`

**Depois:** Usa `createGoalAction` de `@/app/goals/actions`

**Funcionalidades mantidas:**
- Grid de emojis comuns + input customizado
- Validação de campos (nome, emoji, valor, visibilidade)
- RadioGroup para visibilidade (compartilhada/privada)
- Feedback com toast
- Redirecionamento após sucesso

---

### 4. **Página de Detalhes** (`src/app/goals/[id]/page.tsx`)

**Antes:** Client Component com dados de mock arrays

**Depois:** Server Component que:
- Valida autenticação
- Busca dados via `getGoalDetails`
- Renderiza `GoalDetailClient`

**Client Component** (`src/components/goals/goal-detail-client.tsx`):
- Exibe progresso da meta (barra + percentual)
- Mostra valor atual vs valor alvo
- Histórico de atividades (depósitos/retiradas)
- Avatares dos participantes
- Botões de depósito e retirada

---

### 5. **Componente de Transação** (`src/components/goals/goal-transaction-dialog.tsx`)

**Antes:** Usava `goalTransaction` action com `useActionState`

**Depois:** 
- Usa `depositToGoalAction` e `withdrawFromGoalAction`
- Mudou de form com `useActionState` para form com `onSubmit`
- Adicionado campo de descrição opcional
- Callback `onComplete` para recarregar dados
- Melhor controle de estado de loading

---

## 🏗️ Arquitetura

```
📁 src/app/goals/
├── page.tsx                    → Server Component (busca dados)
├── actions.ts                  → Server Actions (CRUD + transações)
├── new/
│   └── page.tsx               → Client Component (form de criação)
└── [id]/
    ├── page.tsx               → Server Component (busca detalhes)
    └── manage/
        └── page.tsx           → (não migrado ainda)

📁 src/components/goals/
├── goals-page-client.tsx       → Client Component (lista de metas)
├── goal-detail-client.tsx      → Client Component (detalhes + histórico)
├── goal-transaction-dialog.tsx → Client Component (depósito/retirada)
├── goal-list.tsx              → (já existia, compatível)
├── goal-card.tsx              → (já existia, compatível)
└── ...outros componentes
```

---

## 🔄 Fluxo de Dados

### Listagem de Goals
```
User → /goals → page.tsx (Server)
                    ↓
              getUserAllGoals(userId)
                    ↓
              GoalService.getUserGoals()
              GoalService.getVaultGoals()
              VaultService.getUserVaults()
                    ↓
              Prisma queries
                    ↓
              GoalsPageClient (Client)
                    ↓
              GoalList component
```

### Criação de Goal
```
User → /goals/new → form submit
                        ↓
                createGoalAction(formData)
                        ↓
                Validação com Zod
                        ↓
                GoalService.createGoal()
                        ↓
                Prisma insert
                        ↓
                revalidatePath('/goals')
                        ↓
                redirect('/goals')
```

### Depósito/Retirada
```
User → GoalTransactionDialog → submit
                                    ↓
                            depositToGoalAction()
                            ou withdrawFromGoalAction()
                                    ↓
                            GoalService.addToGoal()
                            ou GoalService.removeFromGoal()
                                    ↓
                            TransactionService.createTransaction()
                                    ↓
                            Prisma update + insert
                                    ↓
                            revalidatePath()
                                    ↓
                            onComplete() → reload page
```

---

## 🧪 Como Testar

### 1. **Listar Goals**
```bash
# Acesse http://localhost:9002/goals
# Deve mostrar todas as metas do usuário logado
```

### 2. **Criar Nova Meta**
```bash
# Acesse http://localhost:9002/goals/new
# Preencha: Nome, Emoji, Valor, Visibilidade
# Clique em "Criar Caixinha"
# Deve redirecionar para /goals
```

### 3. **Ver Detalhes**
```bash
# Clique em qualquer meta da lista
# Deve mostrar: progresso, valor atual, histórico
```

### 4. **Depositar/Retirar**
```bash
# Na página de detalhes, clique em "Guardar Dinheiro"
# Digite um valor e descrição
# Confirme
# Deve atualizar o progresso e histórico
```

### 5. **Alternar Destaque**
```bash
# Na lista de metas, clique no ícone de estrela
# Deve atualizar instantaneamente (optimistic update)
```

---

## 📊 Dados de Teste Disponíveis

No banco seedado, há 6 goals:

```typescript
// Goals do User 1 (email01@conta.com)
- "Viagem em Família" (compartilhada, €5000)
- "Reserva de Emergência" (privada, €3000)

// Goals do Vault 1 (Família Silva)
- "Férias 2025" (compartilhada, €10000)

// Goals do User 2 (email02@conta.com)
- "Comprar Carro" (compartilhada, €20000)

// Goals do Vault 2 (Casal Oliveira)
- "Casa Própria" (compartilhada, €50000)

// Goals do User 3 (email03@conta.com)
- "Intercâmbio" (compartilhada, €15000)
```

---

## ✨ Melhorias Implementadas

### 1. **Atualização Otimista (Optimistic Update)**
- Alternar destaque da meta atualiza UI imediatamente
- Reverte se houver erro no servidor

### 2. **Melhor UX em Transações**
- Campo de descrição opcional
- Feedback visual com toast
- Reload automático após transação

### 3. **Validação Robusta**
- Zod schema para validação de formulários
- Mensagens de erro específicas
- Validação server-side

### 4. **Type Safety**
- Tipos explícitos para Goal, Transaction, Vault
- Casting `as any` apenas quando necessário para compatibilidade

### 5. **Separação Server/Client**
- Busca de dados no servidor (SSR)
- Interatividade no cliente
- Melhor performance e SEO

---

## 🚧 Pendências

### Próximas Páginas a Migrar:
- [ ] `/goals/[id]/manage` - Página de gerenciamento (editar, deletar, gerenciar participantes)
- [ ] Outros componentes auxiliares se necessário

### Melhorias Futuras:
- [ ] Real-time updates com WebSockets ou Polling
- [ ] Gráficos de progresso ao longo do tempo
- [ ] Notificações quando meta é atingida
- [ ] Histórico de alterações de meta (audit log)

---

## 📝 Notas Técnicas

### Por que `as any` em alguns lugares?

Os tipos do Prisma incluem relações completas (ex: `participants` com todos os campos do `User`), mas nossos componentes esperam apenas subconjuntos desses dados. Para evitar refatorar todos os tipos existentes, usamos `as any` temporariamente.

**Solução futura:** Criar tipos intermediários específicos para cada view.

### Por que reload em vez de revalidate?

A função `revalidatePath()` funciona bem para Server Components, mas o GoalDetailClient é Client Component e precisa de novos dados após transações. Usar `window.location.reload()` garante que os dados sejam atualizados.

**Solução futura:** Implementar React Query ou SWR para cache e revalidação automática.

---

## 🎯 Conclusão

✅ **Todas as funcionalidades principais de Goals foram migradas com sucesso para Prisma!**

- ✅ Listagem de metas
- ✅ Criação de metas
- ✅ Visualização de detalhes
- ✅ Depósitos e retiradas
- ✅ Alternar destaque
- ✅ Histórico de atividades

**Status:** Pronto para testes e uso! 🚀
