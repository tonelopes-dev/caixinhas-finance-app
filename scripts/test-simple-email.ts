import { config } from "dotenv";
config(); // Carrega as variáveis de ambiente do arquivo .env

import sgMail from '@sendgrid/mail';

console.log('🔍 Testando API Key do SendGrid...');
console.log('API Key:', process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 15) + '...' : 'NÃO ENCONTRADA');
console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);

if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY não configurada!');
  process.exit(1);
}

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testSimpleEmail() {
  try {
    const msg = {
      to: 'tonelopes.dev@gmail.com',
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'suporte@caixinhas.app',
        name: process.env.SENDGRID_FROM_NAME || 'Caixinhas Finance'
      },
      subject: 'Teste Simples - SendGrid API',
      html: '<h1>Teste de Email</h1><p>Se você recebeu este email, a API Key está funcionando!</p>',
      text: 'Teste de Email - Se você recebeu este email, a API Key está funcionando!'
    };

    console.log('📧 Enviando email de teste...');
    const result = await sgMail.send(msg);
    console.log('✅ Email enviado com sucesso!');
    console.log('📊 Status:', result[0].statusCode);
    
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error.message);
    
    if (error.response) {
      console.error('📧 Detalhes do erro:');
      console.error('   Status:', error.code);
      console.error('   Body:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

testSimpleEmail();