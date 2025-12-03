
import { config } from "dotenv";
config(); // Carrega as variáveis de ambiente do arquivo .env

import { sendEmail } from "../src/lib/sendgrid";
import { welcomeEmail } from "../src/app/_templates/emails/welcome-email";
import { passwordResetEmail } from "../src/app/_templates/emails/password-reset-template";
import { inviteEmail } from "../src/app/_templates/emails/invite-template";
import { subscriptionConfirmationEmail } from "../src/app/_templates/emails/subscription-confirmation-email";
import { goalCelebrationEmail } from "../src/app/_templates/emails/goal-celebration-email";
import { milestoneEmail } from "../src/app/_templates/emails/milestone-email";

const DEV_EMAIL = "tonelopes.dev@gmail.com";

// Função para calcular data de expiração da assinatura
function calculateSubscriptionEndDate(plan: 'mensal' | 'trimestral' | 'semestral' | 'anual'): string {
  const now = new Date();
  let endDate = new Date(now);
  
  switch (plan) {
    case 'mensal':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'trimestral':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'semestral':
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case 'anual':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }
  
  // Formatar em português brasileiro
  return endDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

async function sendTestEmails() {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY não está configurado. Por favor, defina a variável de ambiente.");
    process.exit(1);
  }

  console.log(`Enviando e-mails de teste para: ${DEV_EMAIL}`);

  // --- 1. E-mail de Boas-Vindas ---
  try {
    const userName = "Maria Teste";
    const userEmail = "maria.teste@example.com";
    const temporaryPassword = "SenhaSecreta123!";
    const htmlContent = welcomeEmail(userName, userEmail, temporaryPassword).replace("[LINK_PARA_LOGIN]", "https://caixinhas.app/login");
    const textContent = `Olá, ${userName}!

Seja muito bem-vindo(a) à família Caixinhas App! Estamos super felizes em ter você conosco.

Seu acesso foi criado com sucesso. Aqui estão seus dados para fazer login:

E-mail: ${userEmail}
Senha Temporária: ${temporaryPassword}

Acessar Minha Conta: https://caixinhas.app/login

Recomendamos que você altere sua senha assim que fizer o primeiro login para garantir a segurança da sua conta.

Qualquer dúvida, é só nos chamar!

Atenciosamente,
Equipe Caixinhas App`;

    await sendEmail(DEV_EMAIL, "Bem-vindo(a) ao Caixinhas App! (Teste)", htmlContent, textContent);
    console.log("E-mail de Boas-Vindas enviado com sucesso.");
  } catch (error) {
    console.error("Falha ao enviar e-mail de Boas-Vindas:", error);
  }

  // --- 2. E-mail de Redefinição de Senha ---
  try {
    const userName = "Carlos Teste";
    const resetLink = "https://caixinhas.app/reset-password?token=faketoken123";
    const htmlContent = passwordResetEmail(userName, resetLink);
    const textContent = `Olá, ${userName}!

Recebemos uma solicitação para redefinir a senha da sua conta Caixinhas App.

Para redefinir sua senha, clique no link abaixo:
${resetLink}

Se você não solicitou uma redefinição de senha, por favor, ignore este e-mail. Sua senha atual permanecerá inalterada.

Atenciosamente,
Equipe Caixinhas App`;

    await sendEmail(DEV_EMAIL, "Redefinição de Senha do Caixinhas App (Teste)", htmlContent, textContent);
    console.log("E-mail de Redefinição de Senha enviado com sucesso.");
  } catch (error) {
    console.error("Falha ao enviar e-mail de Redefinição de Senha:", error);
  }

  // --- 3. E-mail de Convite para Vault ---
  try {
    const inviterName = "Ana Convidante";
    const vaultName = "Minha Família Financeira";
    const inviteLink = "https://caixinhas.app/invite?code=fakeinvitecode456";
    const htmlContent = inviteEmail(inviterName, vaultName, inviteLink);
    const textContent = `Olá, Convidado!

Você foi convidado(a) por ${inviterName} para participar da vault "${vaultName}" no Caixinhas App!

Para aceitar o convite e começar a colaborar, clique no link abaixo:
${inviteLink}

Se você não reconhece este convite, por favor, ignore este e-mail.

Esperamos vê-lo(a) em breve na vault!

Atenciosamente,
Equipe Caixinhas App`;

    await sendEmail(DEV_EMAIL, "Você foi convidado(a) para uma Vault no Caixinhas App! (Teste)", htmlContent, textContent);
    console.log("E-mail de Convite para Vault enviado com sucesso.");
  } catch (error) {
    console.error("Falha ao enviar e-mail de Convite para Vault:", error);
  }

  // --- 4. E-mails de Assinatura (Testando todos os tipos) ---
  const subscriptionTypes: Array<{plan: 'mensal' | 'trimestral' | 'semestral' | 'anual', name: string, userName: string}> = [
    { plan: 'mensal', name: 'Plano Premium Mensal', userName: 'João Mensal' },
    { plan: 'trimestral', name: 'Plano Premium Trimestral', userName: 'Maria Trimestral' },
    { plan: 'semestral', name: 'Plano Premium Semestral', userName: 'Carlos Semestral' },
    { plan: 'anual', name: 'Plano Premium Anual', userName: 'Ana Anual' }
  ];

  for (const subscription of subscriptionTypes) {
    try {
      const { userName, plan, name: subscriptionPlan } = subscription;
      const endDate = calculateSubscriptionEndDate(plan);
      
      const htmlContent = subscriptionConfirmationEmail(userName, subscriptionPlan, endDate).replace("[LINK_PARA_GERENCIAR_ASSINATURA]", "https://caixinhas.app/profile/subscription");
      const textContent = `Olá, ${userName}!

Temos ótimas notícias!

Sua assinatura ${subscriptionPlan} no Caixinhas App foi ativada/renovada com sucesso!

Agora você pode continuar aproveitando todos os benefícios e recursos premium para gerenciar suas finanças com ainda mais controle e inteligência.

Sua assinatura é válida até: ${endDate}.

Gerenciar Assinatura: https://dashboard.kiwify.com/courses

Agradecemos por fazer parte da comunidade Caixinhas App!

Atenciosamente,
Equipe Caixinhas App`;

      await sendEmail(DEV_EMAIL, `Assinatura ${subscriptionPlan} Ativada! (Teste)`, htmlContent, textContent);
      console.log(`E-mail de ${subscriptionPlan} enviado com sucesso. Válido até: ${endDate}`);
      
      // Pequena pausa entre os emails
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Falha ao enviar e-mail de ${subscription.name}:`, error);
    }
  }

  // --- 5. E-mail de Celebração de Meta Alcançada ---
  try {
    const userName = "Sofia Conquistadora";
    const goalName = "Viagem para Europa";
    const goalAmount = "R$ 15.000,00";
    const achievedDate = new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const htmlContent = goalCelebrationEmail(userName, goalName, goalAmount, achievedDate);
    const textContent = `Parabéns, ${userName}!

🎉 Meta Alcançada! 🎉

Que momento incrível! Você acabou de conquistar sua meta "${goalName}" no valor de ${goalAmount}!

Esta conquista é resultado da sua dedicação e disciplina financeira. Cada depósito que você fez foi um passo mais próximo deste sonho, e agora ele se tornou realidade em ${achievedDate}.

💡 Dica: Que tal definir uma nova meta ainda maior? Continue construindo seu futuro financeiro!

Ver Minhas Metas: https://caixinhas.app/goals

Continue assim! Seu futuro financeiro está sendo construído com cada conquista.

Com muito orgulho,
Equipe Caixinhas`;

    await sendEmail(DEV_EMAIL, "🎉 Parabéns! Meta Alcançada - Caixinhas (Teste)", htmlContent, textContent);
    console.log("E-mail de Celebração de Meta enviado com sucesso.");
    
    // Pequena pausa
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error("Falha ao enviar e-mail de Celebração de Meta:", error);
  }

  // --- 6. E-mail de Marco Especial (Milestone) ---
  try {
    const userName = "Roberto Persistente";
    const milestoneType = "100º Depósito Realizado";
    const milestoneDescription = "Você completou 100 depósitos em suas metas!";
    const achievementData = "Em apenas 8 meses, você mostrou uma consistência impressionante, realizando depósitos regulares que totalizaram mais de R$ 25.000 investidos em seus sonhos.";
    
    const htmlContent = milestoneEmail(userName, milestoneType, milestoneDescription, achievementData);
    const textContent = `Marco Especial, ${userName}!

✨ Marco Especial Alcançado! ✨

Temos motivos para comemorar! Você acabou de atingir um marco importante em sua jornada financeira:

🏆 ${milestoneType}
${milestoneDescription}

${achievementData}

Cada marco é uma prova de que você está no caminho certo. Sua disciplina e consistência estão transformando seus sonhos em realidade!

🌟 Continue assim! Pequenos passos consistentes levam a grandes conquistas.

Ver Meu Progresso: https://caixinhas.app/dashboard

Celebrando sua conquista,
Equipe Caixinhas`;

    await sendEmail(DEV_EMAIL, "✨ Marco Especial Alcançado - Caixinhas (Teste)", htmlContent, textContent);
    console.log("E-mail de Marco Especial enviado com sucesso.");
    
  } catch (error) {
    console.error("Falha ao enviar e-mail de Marco Especial:", error);
  }

  console.log("🎉 Envio de todos os e-mails de teste concluído - Produção Ready!");
}

sendTestEmails();
