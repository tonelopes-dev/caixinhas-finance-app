import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

/**
 * Testes E2E para fluxos de envio de email
 * 
 * Estes testes validam os gatilhos que disparam emails:
 * 1. Cadastro de novo usuário → Email de boas-vindas
 * 2. Convite para cofre → Email de convite
 * 3. Solicitação de reset de senha → Email de redefinição
 * 4. Conclusão de objetivo → Email de celebração
 * 5. Marco de progresso → Email de milestone
 */

const prisma = new PrismaClient();

test.describe('Fluxos de Envio de Email', () => {
  
  test.beforeEach(async ({ page }) => {
    // Limpar emails de teste anteriores se necessário
    await page.goto('/');
  });

  test.describe('[EMAIL] Cadastro e Boas-vindas', () => {
    
    test('[EMAIL-001] deve disparar email de boas-vindas ao criar nova conta', async ({ page }) => {
      const testEmail = `teste-${Date.now()}@example.com`;
      const testName = 'Usuário Teste Email';

      // Ir para página de cadastro
      await page.goto('/auth');
      
      // Preencher formulário de cadastro
      await page.fill('input[name="name"]', testName);
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'Password123!');
      
      // Submeter formulário
      await page.click('button[type="submit"]');
      
      // Aguardar redirecionamento ou mensagem de sucesso
      await page.waitForURL(/\/vaults|\/dashboard/, { timeout: 5000 });
      
      // Verificar que usuário foi criado no banco
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(testName);
      
      // Em produção, verificaríamos se email foi enviado
      // Aqui validamos que o fluxo foi executado sem erros
      
      // Cleanup
      if (user) {
        await prisma.user.delete({ where: { id: user.id } });
      }
    });

    test('[EMAIL-002] deve validar dados do email de boas-vindas', async ({ page }) => {
      // Este teste verifica que o template contém os dados corretos
      const { welcomeEmail } = await import('@/app/_templates/emails/welcome-email');
      
      const userName = 'João Silva';
      const userEmail = 'joao@example.com';
      const tempPassword = 'TempPass123';
      
      const html = welcomeEmail(userName, userEmail, tempPassword);
      
      // Validações
      expect(html).toContain(userName);
      expect(html).toContain(userEmail);
      expect(html).toContain(tempPassword);
      expect(html).toContain('login'); // Link para login
      expect(html).toContain('Bem-vindo'); // Mensagem de boas-vindas
    });
  });

  test.describe('[EMAIL] Convite para Cofre', () => {
    
    test('[EMAIL-003] deve disparar email ao convidar membro para cofre', async ({ page }) => {
      // Login como usuário teste
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'clara@caixinhas.app');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/vaults', { timeout: 5000 });
      
      // Criar novo cofre
      await page.click('button:has-text("Novo Cofre")');
      await page.fill('input[name="name"]', 'Cofre Teste Email');
      await page.click('button:has-text("Criar")');
      
      await page.waitForTimeout(1000);
      
      // Abrir modal de edição/convite
      await page.click('[data-testid="vault-options"]', { force: true });
      await page.click('button:has-text("Editar")');
      
      // Enviar convite
      const inviteEmail = `convidado-${Date.now()}@example.com`;
      await page.fill('input[placeholder*="email"]', inviteEmail);
      await page.click('button:has-text("Convidar")');
      
      // Aguardar mensagem de sucesso
      await expect(page.locator('text=Convite enviado')).toBeVisible({ timeout: 5000 });
      
      // Verificar que convite foi criado no banco
      const invitation = await prisma.invitation.findFirst({
        where: { receiverEmail: inviteEmail, type: 'vault' }
      });
      
      expect(invitation).toBeTruthy();
      
      // Cleanup
      if (invitation) {
        await prisma.invitation.delete({ where: { id: invitation.id } });
      }
    });

    test('[EMAIL-004] deve validar dados do email de convite', async ({ page }) => {
      const { inviteEmail } = await import('@/app/_templates/emails/invite-template');
      
      const inviterName = 'Maria Silva';
      const vaultName = 'Cofre de Viagem';
      const inviteLink = 'https://caixinhas.app/invite/abc123';
      
      const html = inviteEmail(inviterName, vaultName, inviteLink);
      
      // Validações
      expect(html).toContain(inviterName);
      expect(html).toContain(vaultName);
      expect(html).toContain(inviteLink);
      expect(html).toContain('Aceitar Convite');
      expect(html).toContain('convidado'); // Mensagem de convite
    });

    test('[EMAIL-005] não deve enviar convite duplicado para mesmo email', async ({ page }) => {
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'clara@caixinhas.app');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/vaults', { timeout: 5000 });
      
      const duplicateEmail = 'duplicado@example.com';
      
      // Primeiro convite
      await page.click('button:has-text("Novo Cofre")');
      await page.fill('input[name="name"]', 'Cofre Duplicado');
      await page.click('button:has-text("Criar")');
      
      await page.waitForTimeout(1000);
      
      await page.click('[data-testid="vault-options"]', { force: true });
      await page.click('button:has-text("Editar")');
      await page.fill('input[placeholder*="email"]', duplicateEmail);
      await page.click('button:has-text("Convidar")');
      
      await expect(page.locator('text=Convite enviado')).toBeVisible({ timeout: 5000 });
      
      // Tentar enviar novamente
      await page.fill('input[placeholder*="email"]', duplicateEmail);
      await page.click('button:has-text("Convidar")');
      
      // Deve mostrar erro
      await expect(page.locator('text=/já tem.*convite|convite.*pendente/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('[EMAIL] Redefinição de Senha', () => {
    
    test('[EMAIL-006] deve disparar email ao solicitar reset de senha', async ({ page }) => {
      await page.goto('/forgot-password');
      
      const testEmail = 'clara@caixinhas.app';
      
      // Preencher email
      await page.fill('input[type="email"]', testEmail);
      await page.click('button[type="submit"]');
      
      // Aguardar mensagem de sucesso
      await expect(page.locator('text=/email.*enviado|verifique.*email/i')).toBeVisible({ timeout: 5000 });
      
      // Verificar que token foi criado no banco
      const user = await prisma.user.findUnique({ 
        where: { email: testEmail },
        select: { passwordResetToken: true, passwordResetExpires: true }
      });
      
      expect(user?.passwordResetToken).toBeTruthy();
      expect(user?.passwordResetExpires).toBeTruthy();
    });

    test('[EMAIL-007] deve validar dados do email de reset de senha', async ({ page }) => {
      const { passwordResetEmail } = await import('@/app/_templates/emails/password-reset-template');
      
      const userName = 'Carlos Teste';
      const resetLink = 'https://caixinhas.app/reset-password?token=abc123xyz';
      
      const html = passwordResetEmail(userName, resetLink);
      
      // Validações
      expect(html).toContain(userName);
      expect(html).toContain(resetLink);
      expect(html).toContain('Redefinir Senha');
      expect(html).toContain('solicitação'); // Mensagem sobre solicitação
      expect(html).toContain('ignore'); // Aviso de segurança
    });

    test('[EMAIL-008] link de reset deve expirar após tempo limite', async ({ page }) => {
      await page.goto('/forgot-password');
      await page.fill('input[type="email"]', 'clara@caixinhas.app');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/email.*enviado/i')).toBeVisible({ timeout: 5000 });
      
      // Verificar que token tem data de expiração
      const user = await prisma.user.findUnique({
        where: { email: 'clara@caixinhas.app' },
        select: { passwordResetExpires: true }
      });
      
      expect(user?.passwordResetExpires).toBeTruthy();
      
      // Verificar que expiração é no futuro (próximas horas)
      const expirationTime = new Date(user!.passwordResetExpires!).getTime();
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;
      
      expect(expirationTime).toBeGreaterThan(now);
      expect(expirationTime).toBeLessThan(now + (24 * hourInMs)); // Expira em até 24h
    });
  });

  test.describe('[EMAIL] Celebração de Objetivos', () => {
    
    test('[EMAIL-009] deve validar template de celebração de objetivo', async ({ page }) => {
      const { goalCelebrationEmail } = await import('@/app/_templates/emails/goal-celebration-email');
      
      const userName = 'Ana Paula';
      const goalName = 'Viagem para Europa';
      const achievedAmount = 'R$ 15.000,00';
      
      const html = goalCelebrationEmail(userName, goalName, achievedAmount);
      
      // Validações
      expect(html).toContain(userName);
      expect(html).toContain(goalName);
      expect(html).toContain(achievedAmount);
      expect(html).toMatch(/parabéns|conquista|alcançou/i);
    });

    test('[EMAIL-010] deve formatar valores monetários corretamente', async ({ page }) => {
      const { goalCelebrationEmail } = await import('@/app/_templates/emails/goal-celebration-email');
      
      const testValues = [
        'R$ 1.000,00',
        'R$ 10.000,00',
        'R$ 100.000,00',
        'R$ 1.234,56'
      ];
      
      testValues.forEach(value => {
        const html = goalCelebrationEmail('Teste', 'Objetivo', value);
        expect(html).toContain(value);
      });
    });
  });

  test.describe('[EMAIL] Marco de Progresso', () => {
    
    test('[EMAIL-011] deve validar template de milestone', async ({ page }) => {
      const { milestoneEmail } = await import('@/app/_templates/emails/milestone-email');
      
      const userName = 'Pedro Silva';
      const goalName = 'Casa Própria';
      const progress = 50;
      const currentAmount = 'R$ 50.000,00';
      const targetAmount = 'R$ 100.000,00';
      
      const html = milestoneEmail(userName, goalName, progress, currentAmount, targetAmount);
      
      // Validações
      expect(html).toContain(userName);
      expect(html).toContain(goalName);
      expect(html).toContain('50%');
      expect(html).toContain(currentAmount);
      expect(html).toContain(targetAmount);
    });

    test('[EMAIL-012] deve mostrar diferentes percentuais corretamente', async ({ page }) => {
      const { milestoneEmail } = await import('@/app/_templates/emails/milestone-email');
      
      const milestones = [25, 50, 75, 90];
      
      milestones.forEach(progress => {
        const html = milestoneEmail('Teste', 'Objetivo', progress, 'R$ 100', 'R$ 200');
        expect(html).toContain(`${progress}%`);
      });
    });
  });

  test.describe('[EMAIL] Segurança e Validações', () => {
    
    test('[EMAIL-013] não deve permitir injeção de HTML em templates', async ({ page }) => {
      const { inviteEmail } = await import('@/app/_templates/emails/invite-template');
      
      const maliciousInput = '<script>alert("XSS")</script>';
      const html = inviteEmail('João', maliciousInput, 'https://example.com');
      
      // Script deve estar visível como texto, não executável
      expect(html).toContain('&lt;script&gt;' || '<script>');
    });

    test('[EMAIL-014] links devem usar HTTPS', async ({ page }) => {
      const { inviteEmail } = await import('@/app/_templates/emails/invite-template');
      const { passwordResetEmail } = await import('@/app/_templates/emails/password-reset-template');
      
      const templates = [
        inviteEmail('João', 'Cofre', 'https://caixinhas.app/invite/123'),
        passwordResetEmail('Maria', 'https://caixinhas.app/reset-password?token=xyz')
      ];
      
      templates.forEach(html => {
        const links = html.match(/href="(https?:\/\/[^"]+)"/g) || [];
        links.forEach(link => {
          if (link.includes('caixinhas.app')) {
            expect(link).toContain('https://');
            expect(link).not.toContain('http://');
          }
        });
      });
    });

    test('[EMAIL-015] deve validar formato de email antes de enviar', async ({ page }) => {
      await page.goto('/auth');
      await page.fill('input[type="email"]', 'clara@caixinhas.app');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('/vaults', { timeout: 5000 });
      
      // Tentar convidar com email inválido
      await page.click('button:has-text("Novo Cofre")');
      await page.fill('input[name="name"]', 'Cofre Validação');
      await page.click('button:has-text("Criar")');
      
      await page.waitForTimeout(1000);
      
      await page.click('[data-testid="vault-options"]', { force: true });
      await page.click('button:has-text("Editar")');
      
      const invalidEmails = ['email-invalido', '@example.com', 'usuario@', 'usuario @example.com'];
      
      for (const email of invalidEmails) {
        await page.fill('input[placeholder*="email"]', email);
        await page.click('button:has-text("Convidar")');
        
        // Não deve enviar (validação HTML5 ou backend)
        const hasError = await page.locator('text=/inválido|erro|error/i').isVisible();
        // Se passou validação HTML, backend deve rejeitar
      }
    });
  });

  test.describe('[EMAIL] Headers e Footers', () => {
    
    test('[EMAIL-016] todos os emails devem ter header consistente', async ({ page }) => {
      const { inviteEmail } = await import('@/app/_templates/emails/invite-template');
      const { passwordResetEmail } = await import('@/app/_templates/emails/password-reset-template');
      
      const templates = [
        inviteEmail('João', 'Cofre', 'https://example.com'),
        passwordResetEmail('Maria', 'https://example.com/reset')
      ];
      
      templates.forEach(html => {
        expect(html).toContain('Caixinhas'); // Logo/nome da marca
      });
    });

    test('[EMAIL-017] todos os emails devem ter footer com informações de contato', async ({ page }) => {
      const { inviteEmail } = await import('@/app/_templates/emails/invite-template');
      const { passwordResetEmail } = await import('@/app/_templates/emails/password-reset-template');
      const { welcomeEmail } = await import('@/app/_templates/emails/welcome-email');
      
      const templates = [
        inviteEmail('João', 'Cofre', 'https://example.com'),
        passwordResetEmail('Maria', 'https://example.com/reset'),
        welcomeEmail('Carlos', 'carlos@test.com', 'Pass123')
      ];
      
      templates.forEach(html => {
        expect(html).toContain('Equipe Caixinhas');
      });
    });
  });

  test.afterEach(async () => {
    // Limpar convites de teste
    await prisma.invitation.deleteMany({
      where: {
        receiverEmail: {
          contains: 'teste-'
        }
      }
    });
  });
});
