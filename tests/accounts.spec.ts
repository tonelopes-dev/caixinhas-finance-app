import { test, expect } from '@playwright/test';

test.describe('Gestão de Contas e Cartões - CRUD', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    
    // Acessar Contas diretamente
    await page.goto('/accounts');
    await page.waitForURL(/.*accounts/, { timeout: 15000 });
  });

  test('Deve criar, editar e excluir uma conta corrente', async ({ page }) => {
    const accountName = `Banco Teste ${Date.now()}`;

    // 1. Criar Conta
    await page.getByRole('button', { name: /Adicionar/i }).first().click();
    
    // Selecionar o primeiro tipo (Conta Corrente)
    await page.getByLabel(/Tipo de Conta/i).click();
    await page.getByRole('option', { name: /Conta Corrente/i }).click();
    
    await page.getByLabel(/Nome de Exibição/i).fill(accountName);
    await page.getByLabel(/Nome do Banco/i).fill('Banco Teste');
    await page.getByLabel(/Saldo Atual \(R\$\)/i).fill('1000');
    await page.getByRole('button', { name: /Salvar Conta/i }).click();
    
    await expect(page.getByText(accountName)).toBeVisible();
    console.log('✅ Conta criada');

    // 2. Editar Saldo
    const accountItem = page.locator('div, button').filter({ hasText: accountName }).last();
    await accountItem.locator('button').filter({ has: page.locator('svg.lucide-pencil, svg.lucide-edit') }).first().click();
    await page.getByLabel(/Saldo Atual/i).fill('1500');
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();
    
    // Valor formatado
    await expect(page.getByText('R$ 1.500,00')).toBeVisible();
    console.log('✅ Saldo editado');

    // 3. Excluir Conta
    const updatedItem = page.locator('div, button').filter({ hasText: accountName }).last();
    await updatedItem.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first().click();
    
    // Confirmar no AlertDialog
    await page.getByRole('button', { name: /Sim, excluir/i }).click();
    
    await expect(page.getByText(accountName)).not.toBeVisible();
    console.log('✅ Conta excluída');
  });

  test('Deve criar e editar um cartão de crédito', async ({ page }) => {
    const cardName = `Cartão Teste ${Date.now()}`;

    // 1. Criar Cartão
    await page.getByRole('button', { name: /Adicionar/i }).first().click();
    
    // Selecionar o tipo Cartão de Crédito
    await page.getByLabel(/Tipo de Conta/i).click();
    await page.getByRole('option', { name: /Cartão de Crédito/i }).click();
    
    await page.getByLabel(/Nome de Exibição/i).fill(cardName);
    await page.getByLabel(/Nome do Banco/i).fill('Visa Platinum');
    await page.getByLabel(/Limite do Cartão/i).fill('5000');
    await page.getByRole('button', { name: /Salvar Conta/i }).click();
    
    await expect(page.getByText(cardName)).toBeVisible();
    console.log('✅ Cartão criado');

    // 2. Editar Limite
    const cardItem = page.locator('div, button').filter({ hasText: cardName }).last();
    await cardItem.locator('button').filter({ has: page.locator('svg.lucide-pencil, svg.lucide-edit') }).first().click();
    await page.getByLabel(/Limite do Cartão/i).fill('7000');
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();
    
    await expect(page.getByText(/7\.000,00/)).toBeVisible();
    console.log('✅ Limite de cartão editado');
  });

});
