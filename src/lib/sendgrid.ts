import sgMail from '@sendgrid/mail';

export interface EmailAttachment {
  content: string; // base64 encoded content
  filename: string;
  type: string;
  disposition: 'attachment' | 'inline';
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text, replyTo, attachments } = options;

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
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''), // Remove HTML tags para versão texto
    };

    if (replyTo) {
      msg.replyTo = replyTo;
    }

    if (attachments && attachments.length > 0) {
      msg.attachments = attachments;
    }

    console.log('📧 Configurações de email:');
    console.log('   📨 Para:', to);
    console.log('   📝 Assunto:', subject);
    console.log('   👤 De:', fromName, '<' + fromEmail + '>');
    if (replyTo) {
      console.log('   ↩️ Responder Para:', replyTo);
    }
    if (attachments && attachments.length > 0) {
      console.log('   📎 Anexos:', attachments.length);
      attachments.forEach((att, index) => {
        console.log(`     ${index + 1}. ${att.filename} (${att.type})`);
      });
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
    
    // Throw error para que possa ser capturado pelo código que chama
    throw new Error(`Falha ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export default sendEmail;