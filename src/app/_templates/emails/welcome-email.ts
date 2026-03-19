import { emailHeader, emailFooter, primaryButton, infoBox } from './email-header';

/* ─── Welcome Email (from admin with temp password) ─────────────── */

export const welcomeEmail = (userName: string, userEmail: string, temporaryPassword: string, magicLink?: string) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    Seja muito bem-vindo(a) à família <strong>Caixinhas</strong>! Estamos muito felizes em ter você conosco.
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Seu acesso foi criado com sucesso. Aqui estão seus dados de login:
  </p>

  ${infoBox(`
    <p style="margin:0 0 8px 0;"><strong style="color:#7a6a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">E-mail</strong></p>
    <p style="margin:0 0 16px 0;font-size:16px;">${userEmail}</p>
    <p style="margin:0 0 8px 0;"><strong style="color:#7a6a5f;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Senha Temporária</strong></p>
    <p style="margin:0;font-size:18px;font-weight:700;color:#d4af37;font-family:monospace;">${temporaryPassword}</p>
  `)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#9a8e84;line-height:1.6;margin:16px 0 24px 0;">
    ⚠️ Recomendamos que você altere sua senha assim que fizer o primeiro login para garantir a segurança da sua conta.
  </p>

  ${primaryButton(magicLink || 'https://www.caixinhas.app/login', magicLink ? 'Entrar Agora (Sem Senha) →' : 'Acessar Minha Conta →')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Qualquer dúvida, é só nos chamar!<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;
