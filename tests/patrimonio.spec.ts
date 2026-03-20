import { test, expect } from '@playwright/test';

test.describe('Página de Patrimônio - Visualização', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    
    // Acessar Patrimônio
    await page.goto('/patrimonio');
    await page.waitForURL(/.*patrimonio/, { timeout: 15000 });
  });

  test('Deve exibir resumo de ativos e passivos', async ({ page }) => {
    await expect(page.getByText(/Seu Patrimônio/i)).toBeVisible();
    await expect(page.getByText(/Ativos Líquidos/i)).toBeVisible();
    await expect(page.getByText(/Dívidas de Cartão/i)).toBeVisible();
    
    // Verificar se o gráfico ou os cards de resumo aparecem
    await expect(page.locator('.bg-white, .backdrop-blur-xl').first()).toBeVisible();
  });

});
