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

export const goalCelebrationEmail = (
  userName: string,
  goalName: string,
  goalAmount: string,
  achievedDate: string,
) => `
  ${emailHeader(userName)}

  <!-- Celebration banner -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
    <tr>
      <td style="background:linear-gradient(135deg,#d4af37 0%,#e8c84a 50%,#b8961e 100%);border-radius:14px;padding:24px;text-align:center;">
        <p style="font-size:36px;margin:0 0 8px 0;line-height:1;">🎉</p>
        <p style="font-family:Georgia,'Times New Roman',serif;color:#3d2c00;font-size:22px;font-weight:bold;margin:0;line-height:1.3;">Meta Alcançada!</p>
        <p style="font-family:'Inter',Arial,sans-serif;color:rgba(61,44,0,0.75);font-size:13px;margin:6px 0 0 0;">${achievedDate}</p>
      </td>
    </tr>
  </table>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 16px 0;">
    Que conquista incrível! Você alcançou sua meta <strong style="color:#d4af37;">"${goalName}"</strong> no valor de <strong>${goalAmount}</strong>!
  </p>

  <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#2D241E;line-height:1.7;margin:0 0 20px 0;">
    Cada depósito foi um passo a mais em direção ao seu sonho. Sua disciplina e dedicação financeira são admiráveis!
  </p>

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px 0;">
    <tr>
      <td style="background-color:#f9f6f0;border-radius:12px;border-left:4px solid #d4af37;padding:16px 20px;font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.6;">
        💡 <strong>Próximo passo:</strong> Que tal definir uma nova meta ainda mais ousada? Continue construindo seu futuro financeiro!
      </td>
    </tr>
  </table>

  ${primaryButton('https://caixinhas.app/goals', 'Ver Minhas Metas →')}

  <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#2D241E;line-height:1.7;margin:32px 0 0 0;">
    Com muito orgulho da sua conquista,<br>
    <strong>Equipe Caixinhas</strong>
  </p>

  ${emailFooter()}
`;