import { test, expect } from '@playwright/test';

test.describe('Categorias de Despesas', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    
    // Acessar Gerenciar Bancos (onde ficam as categorias)
    await page.goto('/accounts');
  });

  test('Deve criar, editar e excluir uma categoria personalizada', async ({ page }) => {
    const categoryName = `Viagem ${Date.now()}`;
    const updatedName = `${categoryName} (Editada)`;

    // 1. Criar Categoria
    await page.getByRole('button', { name: /Salvar Categoria/i }).first().click(); // O botão "Adicionar" abre o Dialog de conta, usamos o de categoria
    // Se não houver botão direto, procuramos o ícone de plus na seção de categorias
    const addCatBtn = page.getByRole('button', { name: /Adicionar/i }).last();
    await addCatBtn.click();
    
    await page.getByPlaceholder(/Ex: Viagens, Pets.../i).fill(categoryName);
    await page.getByRole('button', { name: /Salvar Categoria/i }).click();
    
    await expect(page.getByText(categoryName)).toBeVisible();
    console.log('✅ Categoria criada');

    // 2. Editar Categoria
    const categoryItem = page.locator('div, button').filter({ hasText: categoryName }).last();
    await categoryItem.locator('button').filter({ has: page.locator('svg.lucide-pencil, svg.lucide-edit') }).first().click();
    await page.getByPlaceholder(/Ex: Viagens, Pets.../i).fill(updatedName);
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();
    
    await expect(page.getByText(updatedName)).toBeVisible();
    console.log('✅ Categoria editada');

    // 3. Excluir Categoria
    const updatedItem = page.locator('div, button').filter({ hasText: updatedName }).last();
    await updatedItem.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first().click();
    
    // Confirmar exclusão
    await page.getByRole('button', { name: /^Excluir$/ }).click();
    
    await expect(page.getByText(updatedName)).not.toBeVisible();
    console.log('✅ Categoria excluída');
  });

});
