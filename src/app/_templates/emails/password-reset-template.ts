
import { emailHeader } from './email-header';
import { emailFooter } from './email-footer';

export const passwordResetEmail = (userName: string, resetLink: string) => {
  return `
    ${emailHeader(userName)}
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Recebemos uma solicitação para redefinir a senha da sua conta Caixinhas App.
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Para redefinir sua senha, clique no link abaixo:
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 20px; text-align: center;">
      <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; background-color: #F4D89C; color: #6B4E3D; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: #777; margin-bottom: 10px;">
      Se você não solicitou uma redefinição de senha, por favor, ignore este e-mail.
      Sua senha atual permanecerá inalterada.
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Atenciosamente,<br>
      Equipe Caixinhas App
    </p>
    ${emailFooter()}
  `;
};
