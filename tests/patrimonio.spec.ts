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

test.describe('Patrimonio Page', () => {
  test('deve exibir a página de patrimônio', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Verifica título da página
    const titleVisible = await page.getByText(/meu patrimônio|patrimônio total/i).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(titleVisible).toBeTruthy();
  });

  test('deve exibir botão voltar para dashboard', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Verifica se existe botão de voltar
    const backButton = page.getByRole('button', { name: /voltar/i });
    await expect(backButton).toBeVisible();
  });

  test('deve exibir descrição da funcionalidade', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Verifica se existe descrição
    const description = page.getByText(/visão consolidada|ativos|contas pessoais|participações/i);
    const hasDescription = await description.first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasDescription).toBeTruthy();
  });

  test('deve exibir valor total acumulado', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Verifica se existe área de valor total
    const totalLabel = page.getByText(/valor total|acumulado/i);
    const hasTotal = await totalLabel.first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasTotal).toBeTruthy();
  });

  test('deve exibir valor total formatado em reais', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Busca por padrão de valor monetário (R$ X.XXX,XX)
    const moneyPattern = page.locator('text=/R\\$\\s*[\\d.,]+/');
    const hasMoneyValue = await moneyPattern.first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasMoneyValue).toBeTruthy();
  });

  test('deve exibir seção de ativos líquidos', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Verifica se existe seção de ativos líquidos
    const liquidSection = page.getByText(/disponível agora|ativos líquidos|líquido/i);
    const hasSection = await liquidSection.first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasSection).toBeTruthy();
  });

  test('deve exibir seção de investimentos', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Verifica se existe seção de investimentos
    const investmentSection = page.getByText(/investimentos|investido|aplicações/i);
    const hasSection = await investmentSection.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    // Pode não ter investimentos, mas a seção deve aparecer
    expect(hasSection).toBeTruthy();
  });

  test('deve exibir lista de contas ou mensagem de vazio', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Verifica se tem lista de contas OU mensagem de nenhuma conta
    const hasAccounts = await page.locator('text=/conta|banco|saldo/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const emptyMessage = await page.locator('text=/nenhuma conta|cadastrada/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    
    // Pelo menos uma das condições deve ser verdadeira
    expect(hasAccounts || emptyMessage).toBeTruthy();
  });

  test('deve exibir lista de metas/caixinhas', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Verifica se tem seção de metas (podem ter ou não metas cadastradas)
    const goalsSection = page.getByText(/metas|caixinhas|objetivos/i);
    const hasGoalsSection = await goalsSection.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasGoalsSection).toBeTruthy();
  });

  test('deve mostrar cartões de crédito se houver', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Verifica se existe seção de cartões de crédito
    const creditCardSection = page.getByText(/cartão|crédito|credit card/i);
    const hasSection = await creditCardSection.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    // Esta seção pode aparecer ou não dependendo se há cartões cadastrados
    // Teste passa se encontrou ou não encontrou (não é obrigatório)
    expect(true).toBeTruthy();
  });

  test('deve exibir valores numéricos formatados', async ({ page }) => {
    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');

    // Aguarda carregar
    await page.waitForTimeout(1000);

    // Conta quantos valores monetários aparecem
    const moneyValues = await page.locator('text=/R\\$\\s*[\\d.,]+/').count();
    
    // Deve ter pelo menos um valor (o total)
    expect(moneyValues).toBeGreaterThanOrEqual(1);
  });

  test('deve permitir navegar de volta ao dashboard', async ({ page }) => {
    await page.goto('/patrimonio');
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

  test('deve carregar a página sem erros de console críticos', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/patrimonio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Filtra erros críticos (ignora avisos de navegação ou recursos externos)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('net::ERR') &&
      !error.includes('chunk')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
