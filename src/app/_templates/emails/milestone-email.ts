import { emailHeader, emailFooter } from './email-header';

const primaryButton = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0 auto;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#d4af37 0%,#b8961e 100%);border-radius:12px;box-shadow:0 4px 16px rgba(212,175,55,0.35);">
        <a href="${href}" style="display:inline-block;padding:14px 36px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:#3d2c00;text-decoration:none;border-radius:12px;letter-spacing:0.02em;">${label}</a>
      </td>
    </tr>
  </table>
`;

export const milestoneEmail = (
  userName: string,
  milestoneType: string,
  milestoneDescription: string,
  achievementData: string,
) => `
  ${emailHeader(userName)}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Você atingiu um marco especial na sua jornada financeira! 🌟
  </p>

  <!-- Milestone highlight -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
    <tr>
      <td style="background:linear-gradient(135deg,#d4af37 0%,#c49a2a 100%);border-radius:14px;padding:24px;text-align:center;">
        <p style="font-size:28px;margin:0 0 8px 0;line-height:1;">🏆</p>
        <p style="font-family:Georgia,'Times New Roman',serif;color:#3d2c00;font-size:20px;font-weight:bold;margin:0 0 8px 0;line-height:1.3;">${milestoneType}</p>
        <p style="font-family:'Inter',Arial,sans-serif;color:rgba(61,44,0,0.80);font-size:14px;margin:0;line-height:1.5;">${milestoneDescription}</p>
      </td>
    </tr>
  </table>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    <strong>${achievementData}</strong>
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Cada marco é uma prova de que você está no caminho certo. Sua disciplina e consistência estão transformando seus sonhos em realidade!
  </p>

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px 0;">
    <tr>
      <td style="background-color:#f9f6f0;border-radius:12px;border-left:4px solid #d4af37;padding:16px 20px;font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.6;">
        🌟 <strong>Continue assim!</strong> Pequenos passos consistentes levam a grandes conquistas.
      </td>
    </tr>
  </table>

  ${primaryButton('https://caixinhas.app/dashboard', 'Ver Meu Progresso →')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Celebrando sua conquista,<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;