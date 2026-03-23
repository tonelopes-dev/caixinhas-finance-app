import { test, expect } from '@playwright/test';

test.describe('Transactions Pagination', () => {
  const testEmail = 'clara@caixinhas.app';
  
  test('should display 10 transactions per page and navigate to second page', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill(testEmail);
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/vaults/);

    // 2. Ir para Transações
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // 3. Mudar filtros para Janeiro 2026 (onde os dados de seed estão)
    // Selecionar Mês
    await page.getByRole('button', { name: /Mês/i }).click();
    await page.waitForSelector('[role="option"]');
    await page.getByRole('option', { name: /Janeiro/i }).click();
    
    // Selecionar Ano
    await page.getByRole('button', { name: /Ano/i }).click();
    await page.waitForSelector('[role="option"]');
    await page.getByRole('option', { name: '2026' }).click();

    // Esperar a navegação/refresh da página
    await page.waitForLoadState('networkidle');

    // Verificar se "Página 1 de 2" (ou mais) aparece
    await expect(page.getByText(/Página 1 de/)).toBeVisible();

    // Contar transações na lista (desktop table)
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(10);

    // 4. Navegar para a próxima página
    await page.getByRole('button', { name: /Próximo/i }).click();

    // 5. Verificar se mudou para a página 2
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(/Página 2 de/)).toBeVisible();

    // Verificar se o número de itens na página 2 é o restante (pelo menos 5 se o seed for de 15)
    await expect(rows).toHaveCount(5);
  });
});
