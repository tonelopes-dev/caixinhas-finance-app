import { emailHeader } from './email-header';
import { emailFooter } from './email-footer';

export const milestoneEmail = (userName: string, milestoneType: string, milestoneDescription: string, achievementData: string) => {
  return `
    ${emailHeader(userName)}
    <div style="text-align: center; background: linear-gradient(135deg, #E1BEE7, #D4A8DB); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="font-family: 'Alegreya', serif; color: #5A2D5E; font-size: 24px; margin: 0; text-shadow: 0 1px 2px rgba(255,255,255,0.3);">
        ✨ Marco Especial Alcançado! ✨
      </h2>
    </div>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Temos motivos para comemorar! Você acabou de atingir um marco importante em sua jornada financeira:
    </p>
    
    <div style="background: linear-gradient(135deg, #F4D89C, #F0C678); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="font-family: 'Alegreya', serif; color: #6B4E3D; font-size: 20px; margin: 0 0 10px 0; text-shadow: 0 1px 2px rgba(255,255,255,0.3);">
        🏆 ${milestoneType}
      </h3>
      <p style="font-family: 'Inter', sans-serif; color: #8B6914; font-size: 16px; margin: 0; font-weight: 500;">
        ${milestoneDescription}
      </p>
    </div>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      <strong>${achievementData}</strong>
    </p>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 15px;">
      Cada marco é uma prova de que você está no caminho certo. Sua disciplina e consistência estão transformando seus sonhos em realidade!
    </p>
    
    <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E1BEE7;">
      <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin: 0; font-style: italic; color: #666;">
        🌟 <strong>Continue assim!</strong> Pequenos passos consistentes levam a grandes conquistas.
      </p>
    </div>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px; margin-bottom: 20px; text-align: center;">
      <a href="https://caixinhas.app/dashboard" style="display: inline-block; padding: 12px 25px; background-color: #E1BEE7; color: #5A2D5E; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver Meu Progresso</a>
    </p>
    
    <p style="font-family: 'Inter', sans-serif; font-size: 16px;">
      Celebrando sua conquista,<br>
      Equipe Caixinhas
    </p>
    ${emailFooter()}
  `;
};