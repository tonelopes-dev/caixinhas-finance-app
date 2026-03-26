import { test, expect } from '@playwright/test';

test.describe('Perfil do Usuário - Edição', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/Digite seu e-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByPlaceholder(/Digite sua senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    
    // Acessar Perfil
    await page.goto('/profile');
    await page.waitForURL(/.*profile/, { timeout: 15000 });
  });

  test('Deve alterar o nome de exibição e a cor do avatar', async ({ page }) => {
    const newName = `Clara Silva ${Date.now()}`;
    
    // 1. Alterar Nome
    await page.locator('#name').fill(newName);
    
    // 2. Alterar Cor do Avatar (Rosa)
    // A cor rosa está no grid de cores customizadas
    await page.getByText('Rosa').click();
    
    // 3. Salvar
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();
    
    await expect(page.getByText('Sucesso!')).toBeVisible();
    await expect(page.locator('#name')).toHaveValue(newName);
    
    console.log('✅ Perfil atualizado com sucesso');
  });

});
