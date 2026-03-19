import { emailHeader, emailFooter, primaryButton, infoBox } from './email-header';

export const passwordResetEmail = (userName: string, resetLink: string) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    Recebemos uma solicitação para redefinir a senha da sua conta Caixinhas.
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>.
  </p>

  ${primaryButton(resetLink, 'Redefinir Minha Senha →')}

  ${infoBox('🔒 Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha atual permanece inalterada.', '#e8a598')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Atenciosamente,<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;
