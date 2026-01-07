# 🧪 Guia de Testes - Caixinhas Finance App

Este documento descreve a estratégia de testes da aplicação e como executar os diferentes tipos de testes.

## 📊 Cobertura de Testes

### Suite Completa: **94 testes E2E**

| Módulo | Testes | Descrição |
|--------|--------|-----------|
| Autenticação | 5 | Login, logout, sessão |
| Cofres (Vaults) | 5 | Criação, listagem, navegação |
| Convites | 7 | Sistema de convites para cofres compartilhados |
| Metas (Goals) | 11 | CRUD de metas/caixinhas, progresso |
| Transações | 12 | Listagem, filtros, busca, categorias |
| **Recurring** | **19** | **Transações parceladas e recorrentes** ⭐ |
| Perfil | 11 | Configurações, tema, senha, notificações |
| Relatórios | 11 | Geração de relatórios com IA |
| Patrimônio | 13 | Visão consolidada de ativos |

## 🎯 Tipos de Testes

### 1. **Testes E2E (End-to-End)** - Playwright

Testam a aplicação completa, do ponto de vista do usuário.

**Execução:**
```bash
# Todos os testes E2E
npm run test:e2e

# Com interface visual
npm run test:e2e:ui

# Com navegador visível
npm run test:e2e:headed

# Teste específico de /recurring (bugs corrigidos)
npm run test:e2e:recurring
```

**Localização:** `tests/*.spec.ts`

### 2. **Testes de Integração** - Jest

Testam a lógica de negócio das Server Actions sem interface.

**Execução:**
```bash
npm run test:integration
```

**Localização:** `__tests__/integration/*.test.ts`

## 🐛 Testes de Regressão - Bugs Corrigidos

### Problema 1: Transações Parceladas não Apareciam

**Bug:** Apenas a última transação parcelada era exibida na página /recurring

**Causa:** Agrupamento incorreto por descrição em `recurring-page-client.tsx`

**Fix:**
```typescript
// ❌ ANTES (bug)
const grouped = Object.values(installmentExpenses.reduce((acc, t) => {
  const key = t.description.trim().toLowerCase();
  if (!acc[key]) acc[key] = [];
  acc[key].push(t);
  return acc;
}, {})).map(group => group[0]); // Pegava apenas a primeira!

// ✅ DEPOIS (corrigido)
const grouped = installmentExpenses; // Todas as transações
```

**Testes Criados:**
- `[BUG FIX] deve exibir TODAS as entradas parceladas`
- `[BUG FIX] deve exibir TODAS as despesas parceladas`  
- `[REGRESSÃO] não deve agrupar transações`

### Problema 2: Filtro Limitava Resultados

**Bug:** Filtro em `recurring/actions.ts` excluía transações válidas

**Causa:** Filtro desnecessário por `installmentNumber`

**Fix:**
```typescript
// ❌ ANTES (bug)
const installmentExpenses = allTransactions.filter(
  (t) => t.isInstallment && (t.installmentNumber === 1 || t.installmentNumber === null)
);

// ✅ DEPOIS (corrigido)
const installmentExpenses = allTransactions.filter(
  (t) => t.isInstallment
);
```

**Testes Criados:**
- `[BUG FIX] NÃO deve filtrar por installmentNumber`
- Testes de integração validando lógica de filtros

### Problema 3: Loading de Navegação Desaparecia Rápido

**Bug:** Loading visual sumia antes da navegação completar

**Causa:** Timeout de 300ms muito curto em `QuickNavButton`

**Fix:**
```typescript
// ❌ ANTES
setTimeout(() => {
  hideLoading();
}, 300); // Muito rápido!

// ✅ DEPOIS
setTimeout(() => {
  hideLoading();
}, 800); // Tempo adequado para UX
```

## 🚀 Comandos de Teste

```bash
# E2E
npm run test:e2e              # Todos os testes E2E
npm run test:e2e:ui           # Com interface visual
npm run test:e2e:recurring    # Apenas /recurring (bugs corrigidos)

# Integração
npm run test:integration      # Testes de lógica de negócio

# Todos
npm run test:all              # Integração + E2E
```

## 📝 Como Adicionar Novos Testes

### Teste E2E para Nova Página

```typescript
// tests/minha-pagina.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'user@app.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|vaults)/);
});

test.describe('Minha Página', () => {
  test('deve exibir conteúdo', async ({ page }) => {
    await page.goto('/minha-rota');
    await expect(page.getByText('Título')).toBeVisible();
  });
});
```

### Teste de Regressão para Bug

```typescript
test('[BUG FIX] deve prevenir bug específico', async ({ page }) => {
  // Reproduz cenário do bug
  await page.goto('/rota-com-bug');
  
  // Valida que bug NÃO acontece
  const elementoQueNaoDeveAgrupar = await page.locator('.item').count();
  expect(elementoQueNaoDeveAgrupar).toBeGreaterThan(1);
});
```

## ✅ Checklist Antes de Commit

- [ ] `npm run test:e2e` - Todos os E2E passando
- [ ] `npm run typecheck` - Sem erros TypeScript
- [ ] `npm run lint` - Sem warnings
- [ ] Adicionou testes para nova feature
- [ ] Adicionou teste de regressão se corrigiu bug

## 📈 Métricas Atuais

- **Total Testes:** 94 E2E
- **Taxa Sucesso:** 100%
- **Tempo Execução:** ~12 minutos
- **Cobertura:** 9 páginas principais

---

**Mantido por:** Equipe Caixinhas  
**Última atualização:** Janeiro 2026
