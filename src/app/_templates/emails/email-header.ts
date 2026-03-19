/**
 * Shared email header — Caixinhas Premium Design
 *
 * Color palette (from redesign_master_plan.md):
 *   Background  : #fdfcf7  (warm off-white)
 *   Header bg   : linear-gradient(135deg, #d4af37 → #c49a2a)  (Gold)
 *   Text main   : #2D241E
 *   Text muted  : #7a6a5f
 *   Border      : #ede8df
 *   Primary btn : #d4af37
 */

export const primaryButton = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0 auto;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#d4af37 0%,#c49a2a 100%);border-radius:12px;box-shadow:0 4px 16px rgba(212,175,55,0.35);">
        <a href="${href}" style="display:inline-block;padding:14px 36px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:#3d2c00;text-decoration:none;border-radius:12px;letter-spacing:0.02em;">${label}</a>
      </td>
    </tr>
  </table>
`;

export const infoBox = (content: string, borderColor = '#d4af37') => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
    <tr>
      <td style="background-color:#f9f6f0;border-radius:12px;border-left:4px solid ${borderColor};padding:18px 20px;font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.6;">
        ${content}
      </td>
    </tr>
  </table>
`;


export const emailHeader = (userName: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background-color:#f5f1ea;font-family:'Inter',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f1ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#fdfcf7;border-radius:20px;overflow:hidden;border:1px solid #ede8df;box-shadow:0 8px 40px rgba(45,36,30,0.10);">

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║         HEADER BRAND         ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <tr>
            <td style="background:linear-gradient(135deg,#d4af37 0%,#c49a2a 100%);padding:32px 30px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="padding-right:14px;vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:12px;width:52px;height:52px;">
                      <tr>
                        <td align="center" valign="middle">
                          <img src="https://caixinhas-finance-app.s3.us-east-1.amazonaws.com/logo-caixinhas.png"
                               alt="Caixinhas" width="38" style="display:block;border:0;">
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align:middle;text-align:left;">
                    <p style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:30px;font-weight:bold;margin:0;letter-spacing:-0.5px;line-height:1;text-shadow:0 2px 6px rgba(0,0,0,0.20);">Caixinhas</p>
                    <p style="font-family:'Inter',Arial,sans-serif;color:rgba(255,255,220,0.85);font-size:12px;margin:4px 0 0 0;font-weight:500;letter-spacing:0.04em;">Sonhar é o primeiro passo</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║          GREETING            ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <tr>
            <td style="padding:36px 36px 8px 36px;background-color:#fdfcf7;border-bottom:1px solid #ede8df;">
              <p style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#2D241E;font-weight:600;margin:0 0 8px 0;text-align:center;">
                Olá, <span style="color:#d4af37;">${userName}</span>! 👋
              </p>
            </td>
          </tr>

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║        BODY CONTENT          ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <tr>
            <td style="padding:28px 36px;background-color:#fdfcf7;">
`;

export const emailFooter = () => `
            </td>
          </tr>

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║           FOOTER             ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <tr>
            <td style="background-color:#f0ece4;padding:24px 36px;border-top:1px solid #ede8df;border-bottom-left-radius:20px;border-bottom-right-radius:20px;">
              <p style="font-family:'Inter',Arial,sans-serif;text-align:center;font-size:11px;color:#9a8e84;margin:0 0 6px 0;line-height:1.5;">
                Este e-mail foi enviado automaticamente pelo Caixinhas. Por favor, não responda.
              </p>
              <p style="font-family:'Inter',Arial,sans-serif;text-align:center;font-size:11px;color:#9a8e84;margin:0;">
                &copy; ${new Date().getFullYear()} Caixinhas &mdash; Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;