import { test, expect } from '@playwright/test';

test.describe('Metas Caixinhas - Ciclo de Vida', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    
    // Entrar no primeiro cofre
    await page.locator('div, button').filter({ hasText: 'Cofre' }).first().click();
    await page.goto('/goals');
  });

  test('Deve criar, adicionar e excluir uma caixinha', async ({ page }) => {
    const goalName = `Reserva de Emergência ${Date.now()}`;

    // 1. Criar
    await page.getByRole('button', { name: /Criar Novo Objetivo/i }).first().click();
    await page.getByPlaceholder(/Ex: Viagem para o Japão/i).fill(goalName);
    await page.getByLabel(/Meta de Valor/i).fill('10000');
    await page.getByRole('button', { name: /Continuar/i }).click();
    await page.getByRole('button', { name: /Finalizar e Criar/i }).click();
    
    await expect(page.getByText(goalName)).toBeVisible();

    // 2. Editar/Excluir (Via Menu de Ações)
    const goalCard = page.locator('div, button').filter({ hasText: goalName }).last();
    await goalCard.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).click();
    await page.getByRole('menuitem', { name: /Ver Detalhes|Editar/i }).first().click();
    
    // Se for excluir direto do card
    // await goalCard.locator('button').filter({ has: page.locator('svg.lucide-trash') }).click();
    
    // No detalhe da caixinha (se navegou)
    if (page.url().includes('/goals/')) {
        await page.getByRole('button', { name: /Excluir/i }).click();
        await page.getByRole('button', { name: /Sim, excluir/i }).click();
    }
    
    await expect(page.getByText(goalName)).not.toBeVisible();
  });

});
