/**
 * Template de e-mail para o PIN de verificação do Telegram Bot.
 * Segue o design system premium do Caixinhas (gold/warm tones).
 */

import { emailHeader, emailFooter, infoBox } from './email-header';

export const telegramPinEmail = (userName: string, pin: string) => {
  return `
    ${emailHeader(userName)}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
      Recebemos uma solicitação para vincular sua conta do <strong>Caixinhas</strong> ao <strong>Telegram</strong>.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
      Use o código abaixo no bot do Telegram para confirmar a vinculação:
    </p>

    <!-- PIN Code Display -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#d4af37 0%,#c49a2a 100%);border-radius:16px;box-shadow:0 6px 24px rgba(212,175,55,0.35);">
            <tr>
              <td style="padding:20px 48px;">
                <p style="font-family:'Courier New',monospace;font-size:36px;font-weight:bold;color:#ffffff;margin:0;letter-spacing:12px;text-shadow:0 2px 4px rgba(0,0,0,0.15);">
                  ${pin}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${infoBox(`
      <strong>⏱️ Validade:</strong> Este código expira em <strong>15 minutos</strong>.<br>
      <strong>🔒 Segurança:</strong> Não compartilhe este código com ninguém.
    `)}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#9a8e84;line-height:1.6;margin:28px 0 0 0;text-align:center;">
      Se você não solicitou essa vinculação, ignore este e-mail. Nenhuma alteração será feita na sua conta.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:24px 0 0 0;">
      Abraços,<br>
      <strong>Equipe Caixinhas</strong>
    </p>

    ${emailFooter()}
  `;
};
