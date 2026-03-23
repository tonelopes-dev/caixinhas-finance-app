import { Resend } from 'resend';

export interface EmailAttachment {
  content: string; // base64 encoded content
  filename: string;
  type: string;
  disposition: 'attachment' | 'inline';
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  fromName?: string; // Nome personalizado do remetente
  attachments?: EmailAttachment[];
}

/**
 * Envia um e-mail usando o provedor configurado (Resend como prioritário)
 */
export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text, replyTo, fromName, attachments } = options;
  
  // 🛡️ SEGURANÇA FINAL: Validar formato do destinatário antes de chamar qualquer API
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Nota: O Resend também aceita "Name <email@example.com>", mas aqui validamos o e-mail puro 
  // que é o que o sistema passa na maioria das vezes. 
  // Se contiver "<", extraímos o e-mail entre os parênteses angulares.
  const emailToValidate = to.includes('<') ? to.split('<')[1].split('>')[0] : to;
  
  if (!emailRegex.test(emailToValidate)) {
    console.error(`❌ Tentativa de envio para e-mail inválido: ${to}`);
    throw new Error(`Endereço de e-mail inválido: ${to}`);
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ Nenhuma API Key de e-mail configurada (RESEND_API_KEY ou SENDGRID_API_KEY).');
    return;
  }

  try {
    const resend = new Resend(apiKey);

    let fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'suporte@caixinhas.app';
    const defaultFromName = process.env.RESEND_FROM_NAME || process.env.SENDGRID_FROM_NAME || 'Caixinhas App';

    // 🛡️ SEGURANÇA RESEND: Validar se o domínio do remetente é público (Gmail, etc.)
    // O Resend rejeita envios de domínios públicos não verificados (Erro 403)
    const publicDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    const emailDomain = fromEmail.split('@')[1]?.toLowerCase();
    
    let finalReplyTo = replyTo;

    if (publicDomains.includes(emailDomain)) {
      console.warn(`⚠️ Domínio público detectado no remetente (${fromEmail}). Forçando fallback para suporte@caixinhas.app.`);
      // Se o remetente original era um Gmail, usamos ele como replyTo para que o destinatário possa responder diretamente ao usuário
      if (!finalReplyTo) {
        finalReplyTo = fromEmail;
      }
      fromEmail = 'suporte@caixinhas.app';
    }

    // Usar o nome personalizado se fornecido, senão o padrão
    const displayName = fromName || defaultFromName;
    const from = `${displayName} <${fromEmail}>`;

    console.log('📧 Configurações de email (Resend):');
    console.log('   📨 Para:', to);
    console.log('   📝 Assunto:', subject);
    console.log('   👤 De:', from);
    
    if (finalReplyTo) {
      console.log('   ↩️ Responder Para:', finalReplyTo);
    }

    const resendPayload: any = {
      from,
      to: [to],
      subject,
      html,
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    };

    if (finalReplyTo) {
      resendPayload.reply_to = finalReplyTo;
    }

    if (attachments && attachments.length > 0) {
      console.log('   📎 Anexos:', attachments.length);
      resendPayload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content, // O Resend aceita base64 string no campo content
        contentType: att.type,
      }));
      
      attachments.forEach((att, index) => {
        console.log(`     ${index + 1}. ${att.filename} (${att.type})`);
      });
    }

    const { data, error } = await resend.emails.send(resendPayload);

    if (error) {
      console.error('❌ Erro da API do Resend:', error);
      throw new Error(`Falha ao enviar email via Resend: ${error.message}`);
    }

    console.log('✅ Email enviado com sucesso via Resend!');
    console.log('📊 ID do Email:', data?.id);
    return true;

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw new Error(`Falha ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export default sendEmail;
