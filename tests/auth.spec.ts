import { test, expect } from '@playwright/test';

test.describe('Autenticação - Design e Fluxo', () => {

  test('Login e Logout com sucesso', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar elementos premium da Login Page
    await expect(page.getByText(/Bem-vindo\(a\)/i)).toBeVisible();
    await expect(page.locator('form')).toBeVisible();

    // Tentar login inválido
    await page.getByLabel(/E-mail/i).fill('errado@teste.com');
    await page.getByLabel(/Senha/i).fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    await expect(page.getByText(/Email ou senha incorretos/i)).toBeVisible();

    // Login correto
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*vaults/);

    // Logout
    // Abrir menu do usuário no header
    await page.getByRole('button', { name: /Olá/i }).click();
    await page.getByRole('menuitem', { name: /Sair/i }).click();
    
    await page.waitForURL(/.*login/);
    await expect(page).toHaveURL(/.*login/);
  });

  test('Registro - Elementos Premium', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByText(/Crie sua conta/i)).toBeVisible();
    await expect(page.getByLabel(/Nome Completo/i)).toBeVisible();
    await expect(page.getByLabel(/E-mail/i)).toBeVisible();
    
    // Voltar para login
    await page.getByText(/Já tem uma conta\? Entrar/i).click();
    await expect(page).toHaveURL(/.*login/);
  });

});
