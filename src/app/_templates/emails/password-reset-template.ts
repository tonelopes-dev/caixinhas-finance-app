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

export const passwordResetEmail = (userName: string, resetLink: string) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    Recebemos uma solicitação para redefinir a senha da sua conta Caixinhas.
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>.
  </p>

  ${primaryButton(resetLink, 'Redefinir Minha Senha →')}

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0 0 0;">
    <tr>
      <td style="background-color:#f9f6f0;border-radius:12px;border-left:4px solid #e8a598;padding:16px 20px;font-family:'Inter',Arial,sans-serif;font-size:14px;color:#7a6a5f;line-height:1.6;">
        🔒 Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha atual permanece inalterada.
      </td>
    </tr>
  </table>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Atenciosamente,<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;
