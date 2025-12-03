import { emailHeader } from './email-header';
import { emailFooter } from './email-footer';

export const goalCelebrationEmail = (userName: string, goalName: string, goalAmount: string, achievedDate: string) => {
  return `
    ${emailHeader(userName)}
    <div style="text-align: center; background: linear-gradient(135deg, #B8E6B8, #A8D8A8); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="font-family: 'Alegreya', serif; color: #2E5A2E; font-size: 24px; margin: 0; text-shadow: 0 1px 2px rgba(255,255,255,0.3);">
        🎉 Parabéns! Meta Alcançada! 🎉
      </h2>
    </div>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Que momento incrível! Você acabou de conquistar sua meta <strong>"${goalName}"</strong> no valor de <strong>${goalAmount}</strong>!
    </p>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Esta conquista é resultado da sua dedicação e disciplina financeira. Cada depósito que você fez foi um passo mais próximo deste sonho, e agora ele se tornou realidade em <strong>${achievedDate}</strong>.
    </p>
    
    <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B8E6B8;">
      <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin: 0; font-style: italic; color: #666;">
        💡 <strong>Dica:</strong> Que tal definir uma nova meta ainda maior? Continue construindo seu futuro financeiro!
      </p>
    </div>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 20px; text-align: center;">
      <a href="https://caixinhas.app/goals" style="display: inline-block; padding: 12px 25px; background-color: #B8E6B8; color: #2E5A2E; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver Minhas Metas</a>
    </p>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Continue assim! Seu futuro financeiro está sendo construído com cada conquista.
    </p>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px;">
      Com muito orgulho,<br>
      Equipe Caixinhas
    </p>
    ${emailFooter()}
  `;
};