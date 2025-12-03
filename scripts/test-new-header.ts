import { config } from "dotenv";
config(); // Carrega as variáveis de ambiente do arquivo .env

import { sendEmail } from "../src/lib/sendgrid";
import { welcomeEmail } from "../src/app/_templates/emails/welcome-email";

const DEV_EMAIL = "tonelopes.dev@gmail.com";

async function testNewHeader() {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY não está configurado.");
    process.exit(1);
  }

  console.log(`📧 Testando novo cabeçalho criativo para: ${DEV_EMAIL}`);

  try {
    const userName = "Maria Silva";
    const userEmail = "maria.silva@example.com";
    const temporaryPassword = "MinhaSenh@123!";
    
    const htmlContent = welcomeEmail(userName, userEmail, temporaryPassword)
      .replace("[LINK_PARA_LOGIN]", "https://caixinhas.app/login");
    
    const textContent = `Olá, ${userName}!

Seja muito bem-vindo(a) à família Caixinhas! 🎉

Seu acesso foi criado com sucesso. Aqui estão seus dados para fazer login:

E-mail: ${userEmail}
Senha Temporária: ${temporaryPassword}

Acessar Minha Conta: https://caixinhas.app/login

Recomendamos que você altere sua senha assim que fizer o primeiro login para garantir a segurança da sua conta.

Qualquer dúvida, é só nos chamar!

Atenciosamente,
Equipe Caixinhas`;

    await sendEmail(DEV_EMAIL, "🎨 Novo Cabeçalho - Bem-vindo(a) ao Caixinhas! (Teste)", htmlContent, textContent);
    console.log("✅ E-mail com novo cabeçalho enviado com sucesso!");
    console.log("📱 Verifique seu email para ver o design atualizado!");
    
  } catch (error) {
    console.error("❌ Falha ao enviar e-mail:", error);
  }
}

testNewHeader();