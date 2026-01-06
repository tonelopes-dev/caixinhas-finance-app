import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Cofres', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill('clara@caixinhas.app');
    await page.getByLabel('Senha').fill('password123');
    
    await Promise.all([
      page.waitForURL(/.*vaults/, { timeout: 15000 }),
      page.getByRole('button', { name: 'Entrar' }).click()
    ]);
    
    await expect(page.getByRole('heading', { name: 'Bem-vindo(a), Clara!' })).toBeVisible();
  });

  test('Deve exibir lista de cofres', async ({ page }) => {
    await expect(page).toHaveURL(/.*vaults/);
    await expect(page.getByRole('heading', { name: 'Seus Cofres' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar Novo Cofre' })).toBeVisible();
  });

  test('Deve abrir modal de criar cofre', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar Novo Cofre' }).click();
    await expect(page.getByRole('heading', { name: 'Criar Novo Cofre' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Nome do Cofre')).toBeVisible();
    await expect(page.getByLabel('Descrição')).toBeVisible();
  });

  test('Deve acessar workspace pessoal', async ({ page }) => {
    await page.getByRole('button', { name: /Workspace Pessoal|Meu Workspace/i }).click();
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Deve exibir botão de perfil', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Meu Perfil' })).toBeVisible();
  });

  test('Deve ter botão de logout', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();
  });
});
