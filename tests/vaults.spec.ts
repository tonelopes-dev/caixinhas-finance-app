import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Cofres', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill('clara@caixinhas.app');
    await page.getByLabel('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Aguardar redirecionamento
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Bem-vindo(a), Clara!' })).toBeVisible();
  });

  test('Deve exibir lista de cofres', async ({ page }) => {
    await expect(page).toHaveURL(/.*vaults/);
    await expect(page.getByRole('heading', { name: 'Seus Cofres' })).toBeVisible();
    // Verifica o card de criar cofre
    await expect(page.getByText('Criar Novo Cofre')).toBeVisible();
  });

  test('Deve abrir modal de criar cofre', async ({ page }) => {
    await page.getByText('Criar Novo Cofre').click();
    await expect(page.getByRole('heading', { name: 'Criar Novo Cofre' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Nome do Cofre')).toBeVisible();
  });

  test('Deve acessar perfil do usuário', async ({ page }) => {
    await page.getByRole('button', { name: 'Meu Perfil' }).click();
    await page.waitForURL(/.*profile/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*profile/);
  });

  test('Deve exibir botão de perfil', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Meu Perfil' })).toBeVisible();
  });

  test('Deve ter botão de logout', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible();
  });
});
