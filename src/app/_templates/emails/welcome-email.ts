import { emailHeader, emailFooter } from './email-header';

/* ─── Helpers ──────────────────────────────────────────────────── */

const primaryButton = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0 auto;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#d4af37 0%,#b8961e 100%);border-radius:12px;box-shadow:0 4px 16px rgba(212,175,55,0.35);">
        <a href="${href}" style="display:inline-block;padding:14px 36px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:#3d2c00;text-decoration:none;border-radius:12px;letter-spacing:0.02em;">${label}</a>
      </td>
    </tr>
  </table>
`;

const infoBox = (content: string, borderColor = '#d4af37') => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
    <tr>
      <td style="background-color:#f9f6f0;border-radius:12px;border-left:4px solid ${borderColor};padding:18px 20px;font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.6;">
        ${content}
      </td>
    </tr>
  </table>
`;

/* ─── Welcome Email (from admin with temp password) ─────────────── */

export const welcomeEmail = (userName: string, userEmail: string, temporaryPassword: string) => `
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

  ${primaryButton('https://www.caixinhas.app/login', 'Acessar Minha Conta →')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Qualquer dúvida, é só nos chamar!<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;
