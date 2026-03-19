import { emailHeader, emailFooter } from './email-header';

const primaryButton = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0 auto;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#d4af37 0%,#b8961e 100%);border-radius:12px;box-shadow:0 4px 16px rgba(212,175,55,0.35);">
        <a href="${href}" style="display:inline-block;padding:14px 36px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:#3d2c00;text-decoration:none;border-radius:12px;letter-spacing:0.02em;">${label}</a>
      </td>
    </tr>
  </table>
`;

export const subscriptionConfirmationEmail = (
  userName: string,
  subscriptionPlan: string,
  endDate: string,
) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    Temos uma ótima notícia para você! ✨
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Sua assinatura <strong style="color:#d4af37;">${subscriptionPlan}</strong> no Caixinhas foi ativada com sucesso!
  </p>

  <!-- Plan info card -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
    <tr>
      <td style="background:linear-gradient(135deg,#d4af37 0%,#c49a2a 100%);border-radius:14px;padding:24px;text-align:center;">
        <p style="font-size:28px;margin:0 0 8px 0;line-height:1;">💎</p>
        <p style="font-family:Georgia,'Times New Roman',serif;color:#3d2c00;font-size:18px;font-weight:bold;margin:0 0 6px 0;">${subscriptionPlan}</p>
        <p style="font-family:'Inter',Arial,sans-serif;color:rgba(61,44,0,0.75);font-size:13px;margin:0;">Ativo até <strong>${endDate}</strong></p>
      </td>
    </tr>
  </table>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Agora você pode aproveitar todos os recursos premium para gerenciar suas finanças com ainda mais controle e inteligência.
  </p>

  ${primaryButton('https://dashboard.kiwify.com/courses', 'Gerenciar Assinatura →')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Obrigado por fazer parte da comunidade Caixinhas!<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;
