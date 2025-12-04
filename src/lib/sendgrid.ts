import sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string; // Adicionado para suportar a funcionalidade de resposta
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text, replyTo } = options;

  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY não configurada. Email não será enviado.');
      return false;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'suporte@caixinhas.app';
    const fromName = process.env.SENDGRID_FROM_NAME || 'Caixinhas Finance';

    const msg: sgMail.MailDataRequired = {
      to,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Remove HTML tags para versão texto
    };

    if (replyTo) {
      msg.replyTo = replyTo;
    }

    console.log('📧 Configurações de email:');
    console.log('   📨 Para:', to);
    console.log('   📝 Assunto:', subject);
    console.log('   👤 De:', fromName, '<' + fromEmail + '>');
    if (replyTo) {
      console.log('   ↩️ Responder Para:', replyTo);
    }
    console.log('   🔑 API Key:', process.env.SENDGRID_API_KEY ? 'Configurada ✅' : 'Ausente ❌');

    const result = await sgMail.send(msg);
    console.log('✅ Email enviado com sucesso!');
    console.log('📊 Status:', result[0].statusCode);
    return true;

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as any;
      console.error('📧 SendGrid Error Details:');
      console.error('   Status:', sgError.code || 'N/A');
      console.error('   Body:', JSON.stringify(sgError.response?.body, null, 2));
    }
    
    return false;
  }
}

export default sendEmail;