import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email destinatário é obrigatório' },
        { status: 400 }
      );
    }

    const subject = 'Teste de Email - Caixinhas Finance';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Teste de Email! ✅</h2>
        
        <p>Este é um email de teste do sistema Caixinhas Finance.</p>
        
        <p>Se você recebeu este email, significa que:</p>
        <ul>
          <li>✅ SendGrid está configurado corretamente</li>
          <li>✅ API Key está funcionando</li>
          <li>✅ Sistema de emails está operacional</li>
        </ul>
        
        <p>Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    const success = await sendEmail({ to, subject, html });
    
    if (success) {
      return NextResponse.json({ 
        message: 'Email de teste enviado com sucesso!',
        to 
      });
    } else {
      return NextResponse.json(
        { error: 'Falha ao enviar email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro no endpoint de teste:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de teste de email ativo',
    usage: 'POST com { "to": "email@example.com" }'
  });
}