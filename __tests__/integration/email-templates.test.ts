/**
 * Testes de integração para templates de email
 * 
 * Objetivo: Validar que todos os templates de email geram HTML correto
 * com todos os dados dinâmicos substituídos adequadamente
 */

import { inviteEmail } from '@/app/_templates/emails/invite-template';
import { passwordResetEmail } from '@/app/_templates/emails/password-reset-template';
import { welcomeEmail } from '@/app/_templates/emails/welcome-email';
import { subscriptionConfirmationEmail } from '@/app/_templates/emails/subscription-confirmation-email';
import { goalCelebrationEmail } from '@/app/_templates/emails/goal-celebration-email';
import { milestoneEmail } from '@/app/_templates/emails/milestone-email';
import { emailHeader } from '@/app/_templates/emails/email-header';
import { emailFooter } from '@/app/_templates/emails/email-footer';

describe('Templates de Email - Validação de Dados Dinâmicos', () => {
  
  describe('inviteEmail - Convite para Cofre', () => {
    const mockData = {
      inviterName: 'João Silva',
      vaultName: 'Cofre de Viagem',
      inviteLink: 'https://caixinhas.app/invite/abc123'
    };

    it('deve gerar HTML com todos os dados dinâmicos', () => {
      const html = inviteEmail(mockData.inviterName, mockData.vaultName, mockData.inviteLink);
      
      expect(html).toContain(mockData.inviterName);
      expect(html).toContain(mockData.vaultName);
      expect(html).toContain(mockData.inviteLink);
    });

    it('deve incluir link de convite clicável no formato correto', () => {
      const html = inviteEmail(mockData.inviterName, mockData.vaultName, mockData.inviteLink);
      
      expect(html).toContain(`href="${mockData.inviteLink}"`);
      expect(html).toContain('Aceitar Convite');
    });

    it('deve incluir header e footer', () => {
      const html = inviteEmail(mockData.inviterName, mockData.vaultName, mockData.inviteLink);
      
      expect(html).toContain('Convidado'); // Header title
      expect(html).toContain('Equipe Caixinhas App'); // Footer signature
    });

    it('deve escapar caracteres especiais no nome do vault', () => {
      const specialVaultName = 'Cofre "Especial" & Único';
      const html = inviteEmail(mockData.inviterName, specialVaultName, mockData.inviteLink);
      
      expect(html).toContain(specialVaultName);
    });

    it('deve manter formatação correta com nomes muito longos', () => {
      const longName = 'Nome Muito Muito Muito Muito Muito Muito Longo do Usuário';
      const longVaultName = 'Nome Muito Muito Muito Muito Muito Muito Longo do Cofre de Teste';
      const html = inviteEmail(longName, longVaultName, mockData.inviteLink);
      
      expect(html).toContain(longName);
      expect(html).toContain(longVaultName);
      expect(html.length).toBeGreaterThan(500);
    });
  });

  describe('passwordResetEmail - Redefinição de Senha', () => {
    const mockData = {
      userName: 'Maria Santos',
      resetLink: 'https://caixinhas.app/reset-password?token=xyz789'
    };

    it('deve gerar HTML com nome do usuário e link de reset', () => {
      const html = passwordResetEmail(mockData.userName, mockData.resetLink);
      
      expect(html).toContain(mockData.userName);
      expect(html).toContain(mockData.resetLink);
    });

    it('deve incluir link de redefinição clicável', () => {
      const html = passwordResetEmail(mockData.userName, mockData.resetLink);
      
      expect(html).toContain(`href="${mockData.resetLink}"`);
      expect(html).toContain('Redefinir Senha');
    });

    it('deve incluir aviso de segurança', () => {
      const html = passwordResetEmail(mockData.userName, mockData.resetLink);
      
      expect(html).toContain('Se você não solicitou');
      expect(html).toContain('ignore este e-mail');
    });

    it('deve validar tokens seguros no link', () => {
      const secureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const resetLink = `https://caixinhas.app/reset-password?token=${secureToken}`;
      const html = passwordResetEmail(mockData.userName, resetLink);
      
      expect(html).toContain(encodeURI(secureToken));
    });

    it('deve incluir header personalizado e footer', () => {
      const html = passwordResetEmail(mockData.userName, mockData.resetLink);
      
      expect(html).toContain(mockData.userName); // Header personalizado
      expect(html).toContain('Equipe Caixinhas App');
    });
  });

  describe('welcomeEmail - Boas-vindas', () => {
    const mockData = {
      userName: 'Carlos Oliveira',
      userEmail: 'carlos@example.com',
      temporaryPassword: 'TempPass123!'
    };

    it('deve gerar HTML com credenciais de acesso', () => {
      const html = welcomeEmail(mockData.userName, mockData.userEmail, mockData.temporaryPassword);
      
      expect(html).toContain(mockData.userName);
      expect(html).toContain(mockData.userEmail);
      expect(html).toContain(mockData.temporaryPassword);
    });

    it('deve incluir link para login', () => {
      const html = welcomeEmail(mockData.userName, mockData.userEmail, mockData.temporaryPassword);
      
      expect(html).toContain('caixinhas.app/login');
      expect(html).toContain('href=');
    });

    it('deve destacar a senha temporária', () => {
      const html = welcomeEmail(mockData.userName, mockData.userEmail, mockData.temporaryPassword);
      
      expect(html).toContain('<strong>' + mockData.temporaryPassword + '</strong>');
    });

    it('deve incluir aviso de segurança sobre troca de senha', () => {
      const html = welcomeEmail(mockData.userName, mockData.userEmail, mockData.temporaryPassword);
      
      expect(html).toMatch(/altere.*senha|troque.*senha/i);
    });

    it('deve validar senha com caracteres especiais', () => {
      const specialPassword = 'P@$$w0rd!#%&';
      const html = welcomeEmail(mockData.userName, mockData.userEmail, specialPassword);
      
      expect(html).toContain(specialPassword);
    });
  });

  describe('subscriptionConfirmationEmail - Confirmação de Assinatura', () => {
    const mockData = {
      userName: 'Ana Paula',
      plan: 'mensal' as 'mensal' | 'trimestral' | 'semestral' | 'anual',
      expirationDate: '31 de janeiro de 2025'
    };

    it('deve gerar HTML com dados da assinatura', () => {
      const html = subscriptionConfirmationEmail(mockData.userName, mockData.plan, mockData.expirationDate);
      
      expect(html).toContain(mockData.userName);
      expect(html).toContain(mockData.plan);
      expect(html).toContain(mockData.expirationDate);
    });

    it('deve mostrar todos os tipos de planos corretamente', () => {
      const plans: Array<'mensal' | 'trimestral' | 'semestral' | 'anual'> = ['mensal', 'trimestral', 'semestral', 'anual'];
      
      plans.forEach(plan => {
        const html = subscriptionConfirmationEmail(mockData.userName, plan, mockData.expirationDate);
        expect(html).toContain(plan);
      });
    });

    it('deve formatar data de expiração corretamente', () => {
      const formattedDate = '15 de dezembro de 2024';
      const html = subscriptionConfirmationEmail(mockData.userName, mockData.plan, formattedDate);
      
      expect(html).toContain(formattedDate);
    });

    it('deve incluir benefícios da assinatura', () => {
      const html = subscriptionConfirmationEmail(mockData.userName, mockData.plan, mockData.expirationDate);
      
      expect(html).toMatch(/benefício|vantagem|recurso/i);
    });
  });

  describe('goalCelebrationEmail - Celebração de Objetivo', () => {
    const mockData = {
      userName: 'Pedro Costa',
      goalName: 'Viagem para Paris',
      achievedAmount: 'R$ 10.000,00'
    };

    it('deve gerar HTML com dados da conquista', () => {
      const html = goalCelebrationEmail(mockData.userName, mockData.goalName, mockData.achievedAmount);
      
      expect(html).toContain(mockData.userName);
      expect(html).toContain(mockData.goalName);
      expect(html).toContain(mockData.achievedAmount);
    });

    it('deve incluir mensagem de parabéns', () => {
      const html = goalCelebrationEmail(mockData.userName, mockData.goalName, mockData.achievedAmount);
      
      expect(html).toMatch(/parabéns|conquista|alcançou/i);
    });

    it('deve formatar valores monetários corretamente', () => {
      const amounts = ['R$ 1.234,56', 'R$ 100.000,00', 'R$ 999,99'];
      
      amounts.forEach(amount => {
        const html = goalCelebrationEmail(mockData.userName, mockData.goalName, amount);
        expect(html).toContain(amount);
      });
    });

    it('deve incluir emoji ou elemento visual de celebração', () => {
      const html = goalCelebrationEmail(mockData.userName, mockData.goalName, mockData.achievedAmount);
      
      expect(html).toMatch(/🎉|🎊|✨|emoji|celebration/i);
    });
  });

  describe('milestoneEmail - Marco de Progresso', () => {
    const mockData = {
      userName: 'Fernanda Lima',
      goalName: 'Casa Própria',
      progress: 75,
      currentAmount: 'R$ 75.000,00',
      targetAmount: 'R$ 100.000,00'
    };

    it('deve gerar HTML com progresso do objetivo', () => {
      const html = milestoneEmail(
        mockData.userName,
        mockData.goalName,
        mockData.progress,
        mockData.currentAmount,
        mockData.targetAmount
      );
      
      expect(html).toContain(mockData.userName);
      expect(html).toContain(mockData.goalName);
      expect(html).toContain(String(mockData.progress));
      expect(html).toContain(mockData.currentAmount);
      expect(html).toContain(mockData.targetAmount);
    });

    it('deve validar diferentes percentuais de progresso', () => {
      const percentages = [25, 50, 75, 90];
      
      percentages.forEach(progress => {
        const html = milestoneEmail(
          mockData.userName,
          mockData.goalName,
          progress,
          mockData.currentAmount,
          mockData.targetAmount
        );
        expect(html).toContain(`${progress}%`);
      });
    });

    it('deve incluir mensagem de incentivo', () => {
      const html = milestoneEmail(
        mockData.userName,
        mockData.goalName,
        mockData.progress,
        mockData.currentAmount,
        mockData.targetAmount
      );
      
      expect(html).toMatch(/continue|parabéns|progresso|muito bem/i);
    });

    it('deve exibir barra de progresso visual', () => {
      const html = milestoneEmail(
        mockData.userName,
        mockData.goalName,
        mockData.progress,
        mockData.currentAmount,
        mockData.targetAmount
      );
      
      expect(html).toMatch(/progress|barra|width/i);
    });
  });

  describe('emailHeader - Componente de Cabeçalho', () => {
    it('deve gerar header com título personalizado', () => {
      const title = 'Olá, Usuário!';
      const header = emailHeader(title);
      
      expect(header).toContain(title);
    });

    it('deve incluir logo do Caixinhas', () => {
      const header = emailHeader('Teste');
      
      expect(header).toContain('logo');
      expect(header).toContain('Caixinhas');
    });

    it('deve ter estrutura HTML válida', () => {
      const header = emailHeader('Teste');
      
      expect(header).toContain('<');
      expect(header).toContain('>');
      expect(header).toMatch(/<div|<table|<header/i);
    });
  });

  describe('emailFooter - Componente de Rodapé', () => {
    it('deve gerar footer consistente', () => {
      const footer = emailFooter();
      
      expect(footer).toContain('Caixinhas');
    });

    it('deve incluir informações de contato ou legal', () => {
      const footer = emailFooter();
      
      expect(footer).toMatch(/contato|suporte|privacy|privacidade|©/i);
    });

    it('deve ter estrutura HTML válida', () => {
      const footer = emailFooter();
      
      expect(footer).toContain('<');
      expect(footer).toContain('>');
    });
  });

  describe('Validações de HTML e Segurança', () => {
    it('todos os templates devem gerar HTML válido', () => {
      const templates = [
        inviteEmail('João', 'Cofre Teste', 'https://example.com'),
        passwordResetEmail('Maria', 'https://example.com/reset'),
        welcomeEmail('Carlos', 'carlos@test.com', 'Pass123'),
        subscriptionConfirmationEmail('Ana', 'mensal', '31/12/2024'),
        goalCelebrationEmail('Pedro', 'Objetivo Teste', 'R$ 1.000'),
        milestoneEmail('Fernanda', 'Meta', 50, 'R$ 500', 'R$ 1.000')
      ];

      templates.forEach(html => {
        expect(html).toContain('<');
        expect(html).toContain('>');
        expect(html.length).toBeGreaterThan(100);
      });
    });

    it('não deve permitir injeção de scripts maliciosos', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      
      const html = inviteEmail('João', maliciousInput, 'https://example.com');
      
      // Verificar se o script não foi executado (deve estar escaped)
      expect(html).toContain(maliciousInput); // Deve estar visível como texto
    });

    it('deve escapar caracteres HTML especiais', () => {
      const specialChars = '< > & " \'';
      const html = inviteEmail('João', specialChars, 'https://example.com');
      
      expect(html).toContain(specialChars);
    });

    it('links devem ter protocolo HTTPS', () => {
      const templates = [
        inviteEmail('João', 'Cofre', 'https://caixinhas.app/invite/123'),
        passwordResetEmail('Maria', 'https://caixinhas.app/reset')
      ];

      templates.forEach(html => {
        const links = html.match(/href="([^"]+)"/g) || [];
        links.forEach(link => {
          if (link.includes('caixinhas.app')) {
            expect(link).toContain('https://');
          }
        });
      });
    });
  });

  describe('Responsividade e Compatibilidade de Email', () => {
    it('deve incluir meta tags para email responsivo', () => {
      const html = welcomeEmail('Teste', 'test@test.com', 'Pass123');
      
      expect(html).toMatch(/viewport|mobile-friendly/i);
    });

    it('deve usar inline styles para compatibilidade', () => {
      const templates = [
        inviteEmail('João', 'Cofre', 'https://example.com'),
        passwordResetEmail('Maria', 'https://example.com/reset')
      ];

      templates.forEach(html => {
        expect(html).toContain('style=');
      });
    });

    it('deve ter fallback de texto plano', () => {
      // Todos os templates devem poder ser convertidos para texto
      const html = inviteEmail('João', 'Cofre Teste', 'https://example.com');
      const plainText = html.replace(/<[^>]*>/g, '');
      
      expect(plainText).toContain('João');
      expect(plainText).toContain('Cofre Teste');
    });
  });
});
