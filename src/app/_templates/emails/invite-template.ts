import { emailHeader, emailFooter, primaryButton } from './email-header';

export const inviteEmail = (
  inviterName: string,
  vaultName: string,
  inviteLink: string,
  goalName?: string,
) => {
  const goalLine = goalName
    ? `<p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
        Este convite está vinculado à caixinha <strong style="color:#d4af37;">"${goalName}"</strong>.
       </p>`
    : '';

  return `
    ${emailHeader('Convidado')}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
      <strong style="color:#d4af37;">${inviterName}</strong> te convidou para participar do cofre
      <strong>"${vaultName}"</strong> no Caixinhas!
    </p>

    ${goalLine}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
      Um cofre é um espaço colaborativo onde vocês gerenciam finanças e objetivos juntos, de forma transparente e motivadora.
    </p>

    ${primaryButton(inviteLink, 'Aceitar Convite →')}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#9a8e84;line-height:1.6;margin:28px 0 0 0;text-align:center;">
      Se você não reconhece este convite, basta ignorar este e-mail.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:24px 0 0 0;">
      Até breve no cofre!<br>
      <strong>Equipe Caixinhas</strong>
    </p>

    ${emailFooter()}
  `;
};
