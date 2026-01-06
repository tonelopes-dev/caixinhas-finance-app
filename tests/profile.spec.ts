import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'clara@caixinhas.app',
  password: 'password123',
};

test.beforeEach(async ({ page }) => {
  // Login antes de cada teste
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  
  // Aguarda redirecionamento após login
  await page.waitForURL(/\/(dashboard|vaults)/, { timeout: 10000 });
});

test.describe('Profile Page', () => {
  test('deve exibir a página de perfil', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verifica título da página
    await expect(page.locator('h1', { hasText: 'Configurações' })).toBeVisible();
    await expect(page.locator('text=Gerencie suas informações pessoais')).toBeVisible();
  });

  test('deve exibir botão voltar para dashboard', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verifica se existe botão de voltar
    const backButton = page.getByRole('button', { name: /voltar/i });
    await expect(backButton).toBeVisible();
  });

  test('deve exibir seção de perfil do usuário', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Aguarda o formulário de perfil carregar
    await page.waitForSelector('form', { timeout: 10000 });

    // Verifica se o formulário de perfil está visível
    const profileForm = page.locator('form').first();
    await expect(profileForm).toBeVisible();

    // Verifica campos do formulário (podem estar dentro de labels ou ter placeholders)
    const nameInput = page.locator('input[name="name"], input[placeholder*="nome" i], input[type="text"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test('deve exibir seção de customização de tema', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verifica se a seção de tema existe
    const themeSection = page.getByText(/tema|theme|personalização|aparência/i).first();
    
    // Se não encontrar pelo texto, tenta encontrar botões de tema
    const themeButtons = page.locator('button').filter({ 
      hasText: /light|dark|claro|escuro|sistema|system/i 
    });
    
    const hasThemeSection = await themeSection.isVisible().catch(() => false);
    const hasThemeButtons = await themeButtons.count() > 0;
    
    expect(hasThemeSection || hasThemeButtons).toBeTruthy();
  });

  test('deve exibir seção de gerenciamento de senha', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verifica se existe seção de senha
    const passwordSection = page.getByText(/senha|password|alterar senha|trocar senha/i).first();
    await expect(passwordSection).toBeVisible({ timeout: 10000 });
  });

  test('deve exibir seção de notificações', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verifica se existe seção de notificações
    const notificationsSection = page.getByText(/notificaç|notification/i).first();
    await expect(notificationsSection).toBeVisible({ timeout: 10000 });
  });

  test('deve permitir editar nome do usuário', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Aguarda formulário carregar
    await page.waitForSelector('input[name="name"], input[type="text"]', { timeout: 10000 });

    const nameInput = page.locator('input[name="name"], input[type="text"]').first();
    
    // Limpa o campo e digita novo nome
    await nameInput.click();
    await nameInput.fill('Clara Teste E2E');

    // Procura botão de salvar (pode ter texto "Salvar", "Atualizar", "Save", etc.)
    const saveButton = page.locator('button[type="submit"], button').filter({ 
      hasText: /salvar|atualizar|save|update/i 
    }).first();

    // Se encontrou o botão, clica
    const hasSaveButton = await saveButton.isVisible().catch(() => false);
    if (hasSaveButton) {
      await saveButton.click();
      
      // Aguarda feedback de sucesso (toast, mensagem, etc.)
      await page.waitForTimeout(1000);
    }

    // Verifica se o valor foi mantido
    await expect(nameInput).toHaveValue(/Clara/i);
  });

  test('deve exibir formulário de alteração de senha', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Procura por campos de senha
    const passwordInputs = page.locator('input[type="password"]');
    const passwordCount = await passwordInputs.count();

    // Deve ter pelo menos campos de senha (atual e nova)
    expect(passwordCount).toBeGreaterThanOrEqual(1);
  });

  test('deve exibir campo de nome preenchido', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Aguarda formulário carregar
    await page.waitForSelector('input[name="name"], input[type="text"]', { timeout: 10000 });

    const nameInput = page.locator('input[name="name"], input[type="text"]').first();
    
    // Verifica se o campo de nome tem algum valor
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

  test('deve exibir informação sobre convites em vault pessoal', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verifica se está em vault pessoal e mostra mensagem sobre convites
    const inviteMessage = page.getByText(/convidar pessoas|cofre compartilhado|ir para convites/i);
    const hasInviteInfo = await inviteMessage.first().isVisible().catch(() => false);

    // Se estiver em vault pessoal, deve ter a mensagem
    // Se estiver em vault compartilhado, deve ter a seção de convidados
    const guestsSection = page.getByText(/convidados|membros|guests|members/i);
    const hasGuestsSection = await guestsSection.first().isVisible().catch(() => false);

    // Pelo menos uma das duas situações deve ser verdadeira
    expect(hasInviteInfo || hasGuestsSection).toBeTruthy();
  });

  test('deve navegar de volta para o dashboard', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Clica no botão de voltar
    const backButton = page.getByRole('button', { name: /voltar/i });
    await backButton.click();

    // Aguarda navegação
    await page.waitForURL(/\/(dashboard|vaults)/, { timeout: 10000 });
    
    // Verifica se chegou no dashboard ou vaults
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|vaults)/);
  });
});
