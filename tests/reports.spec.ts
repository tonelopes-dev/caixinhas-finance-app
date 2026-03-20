import { test, expect } from '@playwright/test';

test.describe('Relatórios Financeiros - IA', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    
    // Acessar Relatórios
    await page.goto('/reports');
    await page.waitForURL(/.*reports/, { timeout: 15000 });
  });

  test('Deve visualizar e gerar um relatório financeiro', async ({ page }) => {
    // Verificar se a página carregou
    await expect(page.getByText('Relatórios')).toBeVisible();
    
    // Verificar se existe o botão de gerar (ou atualizar)
    const generateBtn = page.getByRole('button', { name: /Gerar Relatório|Atualizar Relatório/i });
    
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      
      // Aguardar progresso da IA (pode demorar)
      await expect(page.getByText(/Analisando seus dados|Gerando insights/i)).toBeVisible();
      
      // Verificar se o relatório (HTML) apareceu
      await expect(page.locator('.prose')).toBeVisible({ timeout: 60000 });
      console.log('✅ Relatório gerado com sucesso via IA');
    } else {
      // Caso não tenha transações (estado vazio)
      await expect(page.getByText(/Comece registrando transações/i)).toBeVisible();
      console.log('✅ Estado vazio de relatórios validado');
    }
  });

});
