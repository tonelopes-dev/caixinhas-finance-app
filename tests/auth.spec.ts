import { test, expect } from '@playwright/test';

test.describe('Autenticação - Caixinhas', () => {

  test('Login com sucesso', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('E-mail').fill('clara@caixinhas.app');
    await page.getByLabel('Senha').fill('password123');
    
    await Promise.all([
      page.waitForURL(/.*vaults/, { timeout: 15000 }),
      page.getByRole('button', { name: 'Entrar' }).click()
    ]);
    
    await expect(page).toHaveURL(/.*vaults/);
    await expect(page.getByRole('heading', { name: 'Bem-vindo(a), Clara!' })).toBeVisible();
  });

  test('Navegação para página de registro', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: 'Cadastre-se' }).click();
    
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByLabel('Seu Nome')).toBeVisible();
  });

  test('Navegação para esqueci senha', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('a[href="/forgot-password"]').click();
    
    await expect(page).toHaveURL(/.*forgot-password/);
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('Página de registro exibe formulário completo', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByLabel('Seu Nome')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Crie uma Senha')).toBeVisible();
    await expect(page.getByLabel('Confirmar Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar conta gratuitamente' })).toBeVisible();
  });

  test('Página de recuperação de senha exibe formulário', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar Email de Recuperação' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Voltar para o login/i })).toBeVisible();
  });
});
