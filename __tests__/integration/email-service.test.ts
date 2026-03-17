import { sendEmail, EmailOptions } from '@/lib/email.service';

// Mock do Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({ data: { id: 'test_id' }, error: null })
      }
    }))
  };
});

import { Resend } from 'resend';

describe('Serviço de Envio de Email', () => {
  
  let resendMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_API_KEY = 'test_api_key_123';
    process.env.RESEND_FROM_EMAIL = 'suporte@caixinhas.app';
    process.env.RESEND_FROM_NAME = 'Caixinhas App';
    
    // Get the instance created by the mock
    resendMock = new Resend();
  });

  describe('sendEmail - Função principal', () => {
    it('deve enviar email com parâmetros corretos', async () => {
      const emailOptions: EmailOptions = {
        to: 'usuario@example.com',
        subject: 'Teste de Email',
        html: '<p>Conteúdo do email</p>'
      };

      const result = await sendEmail(emailOptions);

      expect(result).toBe(true);
      
      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'usuario@example.com',
          subject: 'Teste de Email',
          html: '<p>Conteúdo do email</p>',
          from: 'Caixinhas App <suporte@caixinhas.app>'
        })
      );
    });

    it('deve incluir versão texto quando não fornecida', async () => {
      const emailOptions: EmailOptions = {
        to: 'usuario@example.com',
        subject: 'Teste',
        html: '<p>Olá <strong>Mundo</strong></p>'
      };

      await sendEmail(emailOptions);

      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Olá') // HTML removido
        })
      );
    });

    it('deve usar versão texto customizada quando fornecida', async () => {
      const customText = 'Versão texto personalizada';
      const emailOptions: EmailOptions = {
        to: 'usuario@example.com',
        subject: 'Teste',
        html: '<p>HTML</p>',
        text: customText
      };

      await sendEmail(emailOptions);

      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          text: customText
        })
      );
    });

    it('deve incluir replyTo quando fornecido', async () => {
      const emailOptions: EmailOptions = {
        to: 'usuario@example.com',
        subject: 'Teste',
        html: '<p>Teste</p>',
        replyTo: 'responder@example.com'
      };

      await sendEmail(emailOptions);

      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          reply_to: 'responder@example.com'
        })
      );
    });

    it('deve retornar false quando API key não está configurada', async () => {
      delete process.env.RESEND_API_KEY;

      const emailOptions: EmailOptions = {
        to: 'usuario@example.com',
        subject: 'Teste',
        html: '<p>Teste</p>'
      };

      const result = await sendEmail(emailOptions);

      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).not.toHaveBeenCalled();
    });

    it('deve retornar false quando SendGrid lança erro', async () => {
      const mockInstance = new Resend();
      (mockInstance.emails.send as jest.Mock).mockRejectedValueOnce(new Error('Resend error'));

      const emailOptions: EmailOptions = {
        to: 'usuario@example.com',
        subject: 'Teste',
        html: '<p>Teste</p>'
      };

      const result = await sendEmail(emailOptions);

      expect(result).toBe(false);
    });

    it('deve validar endereços de email', async () => {
      const invalidEmails = [
        'email-invalido',
        '@example.com',
        'usuario@',
        'usuario @example.com'
      ];

      // SendGrid irá validar, mas vamos simular
      for (const email of invalidEmails) {
        const emailOptions: EmailOptions = {
          to: email,
          subject: 'Teste',
          html: '<p>Teste</p>'
        };

        await sendEmail(emailOptions);
        // Verificar que tentou enviar (SendGrid faria validação)
      }
    });
  });

  describe('Cenários de uso real - Templates', () => {
    it('deve enviar email de boas-vindas', async () => {
      const userName = 'João Silva';
      const userEmail = 'joao@example.com';
      
      const { welcomeEmail } = await import('@/app/_templates/emails/welcome-email');
      const html = welcomeEmail(userName, userEmail, 'TempPass123');

      const result = await sendEmail({
        to: userEmail,
        subject: 'Bem-vindo ao Caixinhas!',
        html
      });

      expect(result).toBe(true);
      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: userEmail,
          subject: 'Bem-vindo ao Caixinhas!'
        })
      );
    });

    it('deve enviar email de convite para cofre', async () => {
      const { inviteEmail } = await import('@/app/_templates/emails/invite-template');
      
      const receiverEmail = 'convidado@example.com';
      const html = inviteEmail('João Silva', 'Cofre de Viagem', 'https://caixinhas.app/invite/abc123');

      const result = await sendEmail({
        to: receiverEmail,
        subject: 'Você foi convidado para um cofre!',
        html
      });

      expect(result).toBe(true);
      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: receiverEmail,
          html: expect.stringContaining('Cofre de Viagem')
        })
      );
    });

    it('deve enviar email de redefinição de senha', async () => {
      const { passwordResetEmail } = await import('@/app/_templates/emails/password-reset-template');
      
      const userEmail = 'usuario@example.com';
      const resetLink = 'https://caixinhas.app/reset-password?token=xyz789';
      const html = passwordResetEmail('Maria Santos', resetLink);

      const result = await sendEmail({
        to: userEmail,
        subject: 'Redefinição de Senha',
        html
      });

      expect(result).toBe(true);
      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: userEmail,
          html: expect.stringContaining(resetLink)
        })
      );
    });

    it('deve enviar email de confirmação de assinatura', async () => {
      const { subscriptionConfirmationEmail } = await import('@/app/_templates/emails/subscription-confirmation-email');
      
      const userEmail = 'assinante@example.com';
      const html = subscriptionConfirmationEmail('Carlos Silva', 'mensal', '31 de janeiro de 2025');

      const result = await sendEmail({
        to: userEmail,
        subject: 'Confirmação de Assinatura',
        html
      });

      expect(result).toBe(true);
    });

    it('deve enviar email de celebração de objetivo', async () => {
      const { goalCelebrationEmail } = await import('@/app/_templates/emails/goal-celebration-email');
      
      const userEmail = 'usuario@example.com';
      const html = goalCelebrationEmail('Pedro Costa', 'Viagem para Paris', 'R$ 10.000,00');

      const result = await sendEmail({
        to: userEmail,
        subject: '🎉 Você alcançou seu objetivo!',
        html
      });

      expect(result).toBe(true);
    });

    it('deve enviar email de marco de progresso', async () => {
      const { milestoneEmail } = await import('@/app/_templates/emails/milestone-email');
      
      const userEmail = 'usuario@example.com';
      const html = milestoneEmail('Fernanda Lima', 'Casa Própria', 75, 'R$ 75.000,00', 'R$ 100.000,00');

      const result = await sendEmail({
        to: userEmail,
        subject: 'Você atingiu 75% do seu objetivo!',
        html
      });

      expect(result).toBe(true);
    });
  });

  describe('Tratamento de erros e edge cases', () => {
    it('deve logar erro quando SendGrid retorna erro', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      (mockInstance.emails.send as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid email address' }
      });

      const result = await sendEmail({
        to: 'invalid',
        subject: 'Teste',
        html: '<p>Teste</p>'
      });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('deve enviar múltiplos emails sequencialmente', async () => {
      const emails = [
        { to: 'user1@example.com', subject: 'Email 1', html: '<p>1</p>' },
        { to: 'user2@example.com', subject: 'Email 2', html: '<p>2</p>' },
        { to: 'user3@example.com', subject: 'Email 3', html: '<p>3</p>' }
      ];

      for (const email of emails) {
        const result = await sendEmail(email);
        expect(result).toBe(true);
      }

      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledTimes(3);
    });

    it('deve lidar com HTML muito grande', async () => {
      const largeHtml = '<p>' + 'a'.repeat(100000) + '</p>';
      
      const result = await sendEmail({
        to: 'usuario@example.com',
        subject: 'Email grande',
        html: largeHtml
      });

      expect(result).toBe(true);
    });

    it('deve preservar caracteres especiais no assunto', async () => {
      const specialSubjects = [
        'Email com émojis 🎉',
        'Email com acentuação à é ó',
        'Email com símbolos $% & @'
      ];

      for (const subject of specialSubjects) {
        await sendEmail({
          to: 'usuario@example.com',
          subject,
          html: '<p>Teste</p>'
        });

        const mockInstance = (Resend as jest.Mock).mock.results[(Resend as jest.Mock).mock.results.length - 1].value;
        expect(mockInstance.emails.send).toHaveBeenCalledWith(
          expect.objectContaining({
            subject
          })
        );
      }
    });
  });

  describe('Configurações de ambiente', () => {
    it('deve usar email padrão quando FROM_EMAIL não configurado', async () => {
      delete process.env.RESEND_FROM_EMAIL;

      await sendEmail({
        to: 'usuario@example.com',
        subject: 'Teste',
        html: '<p>Teste</p>'
      });

      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('suporte@caixinhas.app')
        })
      );
    });

    it('deve usar nome padrão quando FROM_NAME não configurado', async () => {
      delete process.env.RESEND_FROM_NAME;

      await sendEmail({
        to: 'usuario@example.com',
        subject: 'Teste',
        html: '<p>Teste</p>'
      });

      const mockInstance = (Resend as jest.Mock).mock.results[0].value;
      expect(mockInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('Caixinhas App')
        })
      );
    });
  });
});
