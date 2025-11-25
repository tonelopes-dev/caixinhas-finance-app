# Sistema de Controle de Acesso - Implementação

## Visão Geral

Sistema completo de controle de acesso baseado em status de assinatura implementado em toda a aplicação Caixinhas Finance App, seguindo as especificações do documento `docs/user-access-control.md`.

## Arquitetura

### 1. Core Module: `src/lib/access-control.ts`

**Módulo centralizado** que implementa toda a lógica de verificação de acesso.

#### Principais Funções:

- `getEffectiveStatus(user)`: Calcula o status real considerando trial expirado
- `hasFullAccess(user)`: Verifica se usuário tem acesso completo (trial válido ou active)
- `canCreateVaults(user)`: Verifica permissão para criar cofres
- `canAccessPersonalWorkspace(user)`: Verifica acesso ao workspace pessoal
- `canAcceptInvitations(user)`: Sempre true (colaboração permitida)
- `canAccessVault(user, vaultOwnerId, isUserMember)`: Verifica acesso a cofre específico
- `getAccessInfo(user)`: Retorna objeto completo com todas as informações de acesso

#### Constantes Importantes:

- `PROTECTED_ROUTES`: Rotas que requerem acesso completo
- `PUBLIC_ROUTES`: Rotas sempre acessíveis
- `RESTRICTED_ACCESS_ROUTES`: Rotas acessíveis mesmo com trial expirado

### 2. Server Actions Helper: `src/lib/action-helpers.ts`

**Helpers para proteger server actions** com verificações de acesso.

#### Principais Funções:

- `getAuthenticatedUser()`: Obtém usuário autenticado
- `requireFullAccess()`: Valida acesso completo antes de executar ação
- `requireVaultCreationAccess()`: Valida criação de cofres
- `requireOwnResourceCreation()`: Valida criação de recursos próprios
- `requirePersonalWorkspaceAccess()`: Valida acesso ao workspace pessoal
- `withFullAccess(action)`: Wrapper genérico para proteger qualquer action

### 3. Middleware: `middleware.ts`

**Proteção em nível de rota** aplicada automaticamente.

#### Comportamento:

1. Verifica autenticação (NextAuth)
2. Busca dados atualizados do usuário
3. Verifica se rota requer acesso completo
4. Redireciona para `/vaults?access=expired` se acesso negado
5. Permite rotas com acesso restrito (ex: aceitar convites)

### 4. UI Components: `src/components/ui/access-banner.tsx`

**Componentes visuais** para feedback ao usuário.

#### Componentes:

- `AccessBanner`: Exibe alertas baseados no status
  - Trial ativo (últimos 7 dias): Alerta amarelo
  - Trial expirado: Alerta vermelho
  - Active: Sem alerta (ou mensagem customizada)
  
- `SubscriptionBadge`: Badge discreto mostrando status

## Server Actions Protegidas

### ✅ Actions com Verificação de Acesso:

1. **Cofres** (`src/app/vaults/actions.ts`):
   - `createVaultAction`: Requer `requireVaultCreationAccess()`

2. **Contas** (`src/app/accounts/actions.ts`):
   - `createAccount`: Requer `requireFullAccess()`
   - `updateAccount`: Requer `requireFullAccess()`

3. **Metas** (`src/app/(private)/goals/actions.ts`):
   - `createGoalAction`: Requer `requireFullAccess()`
   - `updateGoalAction`: Requer `requireFullAccess()`

4. **Transações** (`src/app/transactions/actions.ts`):
   - `addTransaction`: Requer `requireFullAccess()`

## Páginas Protegidas

### Página de Seleção de Cofres (`src/app/vaults/page.tsx`)

- Exibe `AccessBanner` baseado no status
- Passa props de controle para `VaultsPageClient`:
  - `canCreateVaults`
  - `canAccessPersonal`

### Componente Client (`src/components/vaults/vaults-page-client.tsx`)

**Restrições Aplicadas:**

1. **Workspace Pessoal**:
   - Se `!canAccessPersonal`: Card bloqueado com blur e cadeado
   - Mensagem: "🔒 Acesso Restrito - Assine para acessar"

2. **Criar Novo Cofre**:
   - Se `!canCreateVaults`: Botão desabilitado
   - Toast de erro ao clicar
   - Mensagem: "🔒 Requer assinatura"

3. **Cofres Compartilhados**:
   - Sempre acessíveis se for membro (colaboração permitida)

## Regras de Negócio Implementadas

### ✅ Status "trial" (Período de Teste)

- Acesso completo a todas funcionalidades por 30 dias
- Aviso exibido nos últimos 7 dias
- Após expiração, tratado como "inactive"

### ✅ Status "active" (Assinante Ativo)

- Acesso total ilimitado
- Sem restrições

### ✅ Status "inactive" (Acesso Expirado)

**PODE:**
- ✅ Fazer login
- ✅ Ver página de seleção de cofres
- ✅ Aceitar convites para cofres de outros
- ✅ Colaborar em cofres compartilhados
- ✅ Criar/editar recursos dentro de cofres de outros

**NÃO PODE:**
- ❌ Acessar workspace pessoal
- ❌ Criar novos cofres
- ❌ Criar contas pessoais
- ❌ Criar transações pessoais
- ❌ Criar metas pessoais
- ❌ Acessar relatórios pessoais

## Fluxo de Verificação

```
Usuário acessa rota
    ↓
Middleware verifica autenticação
    ↓
Middleware busca dados do usuário
    ↓
getEffectiveStatus() calcula status real
    ↓
routeRequiresFullAccess() verifica rota
    ↓
hasFullAccess() valida permissão
    ↓
Se negado: Redirect /vaults?access=expired
Se permitido: Next()
```

## Exemplos de Uso

### Em Server Actions:

```typescript
export async function createSomething(formData: FormData) {
  const { requireFullAccess } = await import('@/lib/action-helpers');
  const accessCheck = await requireFullAccess();

  if (!accessCheck.success || !accessCheck.data) {
    return { error: accessCheck.error };
  }

  const userId = accessCheck.data.id;
  // ... resto da lógica
}
```

### Em Páginas:

```typescript
const user = await AuthService.getUserById(userId);
const accessInfo = getAccessInfo(user);

return (
  <>
    <AccessBanner
      status={accessInfo.status}
      daysRemaining={accessInfo.daysRemaining}
      message={accessInfo.message}
    />
    <MyComponent canCreate={accessInfo.fullAccess} />
  </>
);
```

### Em Componentes:

```typescript
{canAccess ? (
  <FeatureComponent />
) : (
  <LockedCard message="🔒 Acesso Restrito" />
)}
```

## Escalabilidade e Manutenção

### ✅ Vantagens da Arquitetura:

1. **Centralizado**: Toda lógica em um único módulo
2. **Reutilizável**: Helpers genéricos para qualquer action
3. **Consistente**: Mesmas verificações em toda aplicação
4. **Testável**: Funções puras, fácil de testar
5. **Escalável**: Fácil adicionar novas regras ou status
6. **Manutenível**: Mudanças em um lugar afetam toda aplicação

### 🔄 Para Adicionar Nova Rota Protegida:

1. Adicione o path em `PROTECTED_ROUTES` (access-control.ts)
2. Use `requireFullAccess()` nas actions da rota
3. Exiba `AccessBanner` na página
4. Desabilite botões/features baseado em `accessInfo`

### 🔄 Para Adicionar Novo Tipo de Permissão:

1. Crie função `canDoX(user)` em access-control.ts
2. Adicione ao objeto retornado por `getAccessInfo()`
3. Crie helper `requireXAccess()` em action-helpers.ts
4. Use nas actions e componentes relevantes

## Testing Checklist

- [ ] Usuário trial ativo: Acesso completo
- [ ] Usuário trial nos últimos 7 dias: Banner de aviso
- [ ] Usuário trial expirado: Redirecionado de rotas protegidas
- [ ] Usuário inactive: Não acessa workspace pessoal
- [ ] Usuário inactive: Pode aceitar convites
- [ ] Usuário inactive: Pode colaborar em cofres de outros
- [ ] Usuário active: Acesso total sem restrições
- [ ] Criar cofre sem acesso: Bloqueado com toast
- [ ] Criar conta sem acesso: Action retorna erro
- [ ] Criar transação sem acesso: Action retorna erro

## Próximos Passos

1. ✅ Sistema core implementado
2. ✅ Middleware configurado
3. ✅ Server actions protegidas
4. ✅ UI com feedback visual
5. ⏳ Testes manuais completos
6. ⏳ Implementar webhooks de pagamento
7. ⏳ Página de pricing/planos
8. ⏳ Integração com gateway de pagamento

## Observações Importantes

- ⚠️ O middleware faz query ao banco (AuthService.getUserById) em cada request de rota protegida
- 💡 Considerar cache de sessão para otimização em produção
- 🔒 Status "inactive" nunca é setado no banco, apenas verificado em runtime
- 📊 Trial de 30 dias definido em `AuthService.register()`
