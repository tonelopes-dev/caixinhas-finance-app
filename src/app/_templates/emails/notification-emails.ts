import { emailHeader, emailFooter, primaryButton, infoBox } from './email-header';

/**
 * Assinatura Renovada
 */
export const renewalEmail = (userName: string, nextExpirationDate?: string) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    Boas notícias! Sua assinatura do <strong>Caixinhas</strong> foi renovada com sucesso. ✅
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Você continua com acesso total e ilimitado para gerenciar seus planos e conquistar seus objetivos.
  </p>

  ${infoBox(`
    <p style="margin:0 0 8px 0;"><strong style="color:#7a6a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Status da Assinatura</strong></p>
    <p style="margin:0 0 16px 0;font-size:16px;color:#16a34a;font-weight:700;">ATIVA</p>
    ${nextExpirationDate ? `
    <p style="margin:0 0 8px 0;"><strong style="color:#7a6a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Próxima Renovação</strong></p>
    <p style="margin:0;font-size:16px;">${nextExpirationDate}</p>
    ` : ''}
  `, '#16a34a')}

  ${primaryButton('https://www.caixinhas.app/dashboard', 'Acessar Meu Painel →')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Obrigado por continuar conosco!<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;

/**
 * Falha no Pagamento / Pagamento Rejeitado
 */
export const paymentFailedEmail = (userName: string, isLate: boolean = false) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    ${isLate ? 'Ops! Parece que houve um atraso no pagamento da sua assinatura.' : 'Notamos um problema no processamento do seu último pagamento.'} ⚠️
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Para não perder o acesso às suas funcionalidades premium e continuar economizando para seus sonhos, pedimos que verifique seus dados de pagamento.
  </p>

  ${infoBox(`
    <p style="margin:0 0 8px 0;"><strong style="color:#7a6a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">O que aconteceu?</strong></p>
    <p style="margin:0;font-size:15px;color:#dc2626;">A operadora do cartão recusou a transação. Verifique o limite ou se os dados estão corretos.</p>
  `, '#dc2626')}

  ${primaryButton('https://www.caixinhas.app/dashboard', 'Atualizar Cartão Agora →')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Qualquer dúvida, estamos à disposição.<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;

/**
 * Assinatura Cancelada
 */
export const cancellationEmail = (userName: string) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    Sua assinatura foi cancelada conforme solicitado. 😔
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Sentiremos sua falta! Seus dados e planos continuarão salvos, mas você não poderá realizar novas movimentações premium até reativar seu plano.
  </p>

  ${infoBox(`
    <p style="margin:0 0 8px 0;"><strong style="color:#7a6a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Status Final</strong></p>
    <p style="margin:0;font-size:16px;color:#7a6a5f;">CANCELADA / INATIVA</p>
  `, '#7a6a5f')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#2D241E;line-height:1.7;margin:24px 0 0 0;">
    Se você mudou de ideia, pode reativar sua conta a qualquer momento direto pelo painel.
  </p>

  ${primaryButton('https://www.caixinhas.app/dashboard', 'Reativar Minha Conta →')}

  ${emailFooter()}
`;

/**
 * Reembolso Processado / Chargeback
 */
export const refundEmail = (userName: string, isChargeback: boolean = false) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    ${isChargeback ? 'Recebemos uma notificação de contestação de pagamento (chargeback).' : 'Seu reembolso foi processado com sucesso.'} 💰
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    ${isChargeback ? 'Devido à contestação, sua conta foi temporariamente desativada. Se isso foi um erro, entre em contato conosco.' : 'O valor será estornado no seu método de pagamento original em até 7 dias úteis. Sua conta foi desativada.'}
  </p>

  ${infoBox(`
    <p style="margin:0 0 8px 0;"><strong style="color:#7a6a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Status da Transação</strong></p>
    <p style="margin:0;font-size:16px;color:#d97706;">${isChargeback ? 'CONTESTADO' : 'REEMBOLSADO'}</p>
  `, '#d97706')}

  ${emailFooter()}
`;
