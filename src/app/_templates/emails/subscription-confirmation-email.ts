
import { emailHeader } from './email-header';
import { emailFooter } from './email-footer';

export const subscriptionConfirmationEmail = (userName: string, subscriptionPlan: string, endDate: string) => {
  return `
    ${emailHeader(userName)}
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Temos ótimas notícias, ${userName}!
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Sua assinatura <strong>${subscriptionPlan}</strong> no Caixinhas App foi ativada/renovada com sucesso!
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Agora você pode continuar aproveitando todos os benefícios e recursos premium para gerenciar suas finanças com ainda mais controle e inteligência.
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 5px;">
      Sua assinatura é válida até: <strong>${endDate}</strong>.
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 20px; text-align: center;">
      <a href="[LINK_PARA_GERENCIAR_ASSINATURA]" style="display: inline-block; padding: 12px 25px; background-color: #E7A42F; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Gerenciar Assinatura</a>
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Agradecemos por fazer parte da comunidade Caixinhas App!
    </p>
    <p style="font-family: 'Inter', sans-serif; font-size: 16px;">
      Atenciosamente,<br>
      Equipe Caixinhas App
    </p>
    ${emailFooter()}
  `;
};
