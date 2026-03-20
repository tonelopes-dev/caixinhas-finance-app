import { test, expect } from '@playwright/test';

test.describe('Gestão de Contas e Cartões - CRUD', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('input[name="email"]');
    // Aguardar um pouco para garantir que a hidratação do React completou
    await page.waitForTimeout(1000);
    await page.getByLabel(/E-mail/i).first().fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).first().fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*(dashboard|vaults)/, { timeout: 15000 });
    
    // Acessar Contas diretamente
    await page.goto('/accounts');
    await page.waitForURL(/.*accounts/, { timeout: 15000 });
  });

  test('Deve criar, editar e excluir uma conta corrente', async ({ page }) => {
    const accountName = `Banco Teste ${Date.now()}`;

    // 1. Criar Conta
    await page.getByRole('button', { name: /Adicionar/i }).first().click();
    
    // Selecionar o primeiro tipo (Conta Corrente)
    await page.locator('#account-type').click();
    await page.getByRole('option', { name: 'Conta Corrente' }).click();
    
    await page.getByLabel(/Nome de Exibição/i).fill(accountName);
    await page.getByLabel(/Nome do Banco/i).fill('Banco Teste');
    await page.getByLabel(/Saldo Atual \(R\$\)/i).fill('1000');
    await page.getByRole('button', { name: /Salvar Conta/i }).click({ force: true });
    
    // Aguardar o diálogo fechar
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    await expect(page.getByText(accountName)).toBeVisible();
    console.log('✅ Conta criada');

    // 2. Editar Saldo
    const accountItem = page.locator('.group').filter({ hasText: accountName }).first();
    await accountItem.getByRole('button', { name: /Editar/i }).click();
    await page.getByLabel(/Saldo Atual/i).fill('1500');
    await page.getByRole('button', { name: /Salvar Alterações/i }).click({ force: true });
    
    // Aguardar o diálogo fechar
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Valor formatado (combinar apenas a parte numérica para evitar problemas com espaços no R$)
    await expect(accountItem.getByText(/1\.500,00/)).toBeVisible();
    console.log('✅ Saldo editado');

    // 3. Excluir Conta
    const updatedItem = page.locator('.group').filter({ hasText: accountName }).first();
    await updatedItem.getByRole('button', { name: /Remover/i }).click();
    
    // Confirmar no AlertDialog
    await page.getByRole('button', { name: 'Excluir' }).click();
    
    // Aguardar o diálogo de confirmação sumir
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
    
    await expect(page.locator('.group').filter({ hasText: accountName })).not.toBeVisible();
    console.log('✅ Conta excluída');
  });

  test('Deve criar e editar um cartão de crédito', async ({ page }) => {
    const cardName = `Cartão Teste ${Date.now()}`;

    // 1. Criar Cartão
    await page.getByRole('button', { name: /Adicionar/i }).first().click();
    
    // Selecionar o tipo Cartão de Crédito
    await page.locator('#account-type').click();
    await page.getByRole('option', { name: 'Cartão de Crédito' }).click();
    
    await page.getByLabel(/Nome de Exibição/i).fill(cardName);
    await page.getByLabel(/Nome do Banco/i).fill('Visa Platinum');
    await page.getByLabel(/Limite do Cartão/i).fill('5000');
    await page.getByRole('button', { name: /Salvar Conta/i }).click({ force: true });
    
    // Aguardar o diálogo fechar
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    await expect(page.getByText(cardName)).toBeVisible();
    console.log('✅ Cartão criado');

    // 2. Editar Limite
    const cardItem = page.locator('.group').filter({ hasText: cardName }).first();
    await cardItem.getByRole('button', { name: /Editar/i }).click();
    await page.getByLabel(/Limite do Cartão/i).fill('7000');
    await page.getByRole('button', { name: /Salvar Alterações/i }).click({ force: true });
    
    // Aguardar o diálogo fechar
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Valor formatado (combinar apenas a parte numérica para evitar problemas com espaços no R$)
    await expect(cardItem.getByText(/7\.000,00/)).toBeVisible();
    console.log('✅ Limite de cartão editado');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = `failure-${testInfo.title.replace(/\s+/g, '_')}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`📸 Screenshot de falha salvo em: ${screenshotPath}`);
    }
  });

});
