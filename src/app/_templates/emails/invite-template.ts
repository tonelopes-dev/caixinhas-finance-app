
import { emailHeader } from './email-header';
import { emailFooter } from './email-footer';

export const inviteEmail = (inviterName: string, vaultName: string, inviteLink: string) => {
  return `
    ${emailHeader('Convidado')}
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Você foi convidado(a) por <strong>${inviterName}</strong> para participar do cofre <strong>"${vaultName}"</strong> no Caixinhas App!
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Um cofre é um espaço colaborativo onde você pode gerenciar suas finanças e objetivos em conjunto. Para aceitar o convite e começar a colaborar, clique no link abaixo:
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 20px; text-align: center;">
      <a href="${inviteLink}" style="display: inline-block; padding: 12px 25px; background-color: #B8E6B8; color: #2E5A2E; text-decoration: none; border-radius: 5px; font-weight: bold;">Aceitar Convite</a>
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: #777; margin-bottom: 10px;">
      Se você não reconhece este convite, por favor, ignore este e-mail.
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Esperamos vê-lo(a) em breve no cofre!
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px;">
      Atenciosamente,<br>
      Equipe Caixinhas App
    </p>
    ${emailFooter()}
  `;
};
