
import { sendEmail } from "../src/lib/sendgrid";
import { welcomeEmail } from "../src/app/_templates/emails/welcome-email";
import { passwordResetEmail } from "../src/app/_templates/emails/password-reset-template";
import { inviteEmail } from "../src/app/_templates/emails/invite-template";
import { subscriptionConfirmationEmail } from "../src/app/_templates/emails/subscription-confirmation-email";

const DEV_EMAIL = "tonelopes.dev@gmail.com";

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
    const htmlContent = welcomeEmail(userName, userEmail, temporaryPassword).replace("[LINK_PARA_LOGIN]", "https://app.caixinhas.com/login");
    const textContent = `Olá, ${userName}!

Seja muito bem-vindo(a) à família Caixinhas App! Estamos super felizes em ter você conosco.

Seu acesso foi criado com sucesso. Aqui estão seus dados para fazer login:

E-mail: ${userEmail}
Senha Temporária: ${temporaryPassword}

Acessar Minha Conta: https://app.caixinhas.com/login

Recomendamos que você altere sua senha assim que fizer o primeiro login para garantir a segurança da sua conta.

Qualquer dúvida, é só nos chamar!

Atenciosamente,
Equipe Caixinhas App`;

    await sendEmail({
      to: DEV_EMAIL,
      subject: "Bem-vindo(a) ao Caixinhas App! (Teste)",
      html: htmlContent,
      text: textContent,
    });
    console.log("E-mail de Boas-Vindas enviado com sucesso.");
  } catch (error) {
    console.error("Falha ao enviar e-mail de Boas-Vindas:", error);
  }

  // --- 2. E-mail de Redefinição de Senha ---
  try {
    const userName = "Carlos Teste";
    const resetLink = "https://app.caixinhas.com/reset-password?token=faketoken123";
    const htmlContent = passwordResetEmail(userName, resetLink);
    const textContent = `Olá, ${userName}!

Recebemos uma solicitação para redefinir a senha da sua conta Caixinhas App.

Para redefinir sua senha, clique no link abaixo:
${resetLink}

Se você não solicitou uma redefinição de senha, por favor, ignore este e-mail. Sua senha atual permanecerá inalterada.

Atenciosamente,
Equipe Caixinhas App`;

    await sendEmail({
      to: DEV_EMAIL,
      subject: "Redefinição de Senha do Caixinhas App (Teste)",
      html: htmlContent,
      text: textContent,
    });
    console.log("E-mail de Redefinição de Senha enviado com sucesso.");
  } catch (error) {
    console.error("Falha ao enviar e-mail de Redefinição de Senha:", error);
  }

  // --- 3. E-mail de Convite para Vault ---
  try {
    const inviterName = "Ana Convidante";
    const vaultName = "Minha Família Financeira";
    const inviteLink = "https://app.caixinhas.com/invite?code=fakeinvitecode456";
    const htmlContent = inviteEmail(inviterName, vaultName, inviteLink);
    const textContent = `Olá, Convidado!

Você foi convidado(a) por ${inviterName} para participar da vault "${vaultName}" no Caixinhas App!

Para aceitar o convite e começar a colaborar, clique no link abaixo:
${inviteLink}

Se você não reconhece este convite, por favor, ignore este e-mail.

Esperamos vê-lo(a) em breve na vault!

Atenciosamente,
Equipe Caixinhas App`;

    await sendEmail({
      to: DEV_EMAIL,
      subject: "Você foi convidado(a) para uma Vault no Caixinhas App! (Teste)",
      html: htmlContent,
      text: textContent,
    });
    console.log("E-mail de Convite para Vault enviado com sucesso.");
  } catch (error) {
    console.error("Falha ao enviar e-mail de Convite para Vault:", error);
  }

  // --- 4. E-mail de Assinatura Ativada/Renovada ---
  try {
    const userName = "Pedro Assinante";
    const subscriptionPlan = "Plano Premium Anual";
    const endDate = "31 de Dezembro de 2024";
    const htmlContent = subscriptionConfirmationEmail(userName, subscriptionPlan, endDate).replace("[LINK_PARA_GERENCIAR_ASSINATURA]", "https://app.caixinhas.com/profile/subscription");
    const textContent = `Olá, ${userName}!

Temos ótimas notícias!

Sua assinatura ${subscriptionPlan} no Caixinhas App foi ativada/renovada com sucesso!

Agora você pode continuar aproveitando todos os benefícios e recursos premium para gerenciar suas finanças com ainda mais controle e inteligência.

Sua assinatura é válida até: ${endDate}.

Gerenciar Assinatura: https://app.caixinhas.com/profile/subscription

Agradecemos por fazer parte da comunidade Caixinhas App!

Atenciosamente,
Equipe Caixinhas App`;

    await sendEmail({
      to: DEV_EMAIL,
      subject: "Sua Assinatura Caixinhas App foi Ativada/Renovada! (Teste)",
      html: htmlContent,
      text: textContent,
    });
    console.log("E-mail de Confirmação de Assinatura enviado com sucesso.");
  } catch (error) {
    console.error("Falha ao enviar e-mail de Confirmação de Assinatura:", error);
  }

  console.log("Envio de todos os e-mails de teste concluído.");
}

sendTestEmails();
