import {
    cancellationEmail,
    paymentFailedEmail,
    refundEmail,
    renewalEmail
} from '@/app/_templates/emails/notification-emails';
import { welcomeEmail } from '@/app/_templates/emails/welcome-email';
import { sendEmail } from '@/lib/email.service';
import { AuthService } from '@/services/auth.service';
import { prisma } from '@/services/prisma';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Secret do webhook da Kiwify (deve ser configurado no .env)
const KIWIFY_SECRET = process.env.KIWIFY_WEBHOOK_SECRET;

// Tipos para o webhook da Kiwify
interface Customer {
  email: string;
  full_name?: string;
  first_name?: string;
  name?: string;
  mobile?: string;
  CPF?: string;
}

interface Product {
  product_id?: string;
  product_name?: string;
  name?: string;
}

interface WebhookData {
  order_id?: string;
  order_status?: string;
  webhook_event_type?: string;
  type?: string;
  Customer: Customer;
  Product?: Product;
  subscription_id?: string;
  subscription_status?: string;
  payment_method?: string;
  created_at?: string;
}

// Função para validar a assinatura do webhook
function verifySignature(payload: string, signature: string | null): boolean {
  if (!KIWIFY_SECRET) {
    console.warn('⚠️ KIWIFY_WEBHOOK_SECRET não configurado. Ignorando validação de assinatura (NÃO RECOMENDADO EM PRODUÇÃO)');
    return true; 
  }

  if (!signature) return false;

  const hmac = crypto.createHmac('sha1', KIWIFY_SECRET);
  const expectedSignature = hmac.update(payload).digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    console.error('❌ Assinatura do webhook inválida!');
    console.log('   Recebida:', signature);
    console.log('   Esperada:', expectedSignature);
  }

  return isValid;
}

// Função para validar os dados do webhook
function isValidWebhookData(data: any): data is WebhookData {
  if (!data || typeof data !== 'object') return false;
  
  const eventType = data.webhook_event_type || data.type;
  const hasValidEventType = typeof eventType === 'string';
  const hasValidCustomer = data.Customer && typeof data.Customer === 'object';
  
  if (!hasValidEventType || !hasValidCustomer) return false;
  
  const customer = data.Customer;
  return typeof customer.email === 'string';
}

// Lidar com compra aprovada
async function handleOrderApproved(data: WebhookData) {
  const { Customer: customer } = data;
  
  try {
    let user = await prisma.user.findUnique({
      where: { email: customer.email }
    });

    const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';

    if (!user) {
      console.log('👤 Registrando novo usuário via checkout:', customer.email);
      
      const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      
      // Criar o usuário via AuthService para garantir categorias e cofre padrão
      const newUser = await AuthService.register({
        name: customerName,
        email: customer.email,
        password: tempPassword
      });

      // Atualizar para status Premium
      user = (await prisma.user.update({
        where: { id: newUser.id },
        data: {
          subscriptionStatus: 'active',
          trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano de premium
        }
      })) as any;

      // Gerar Magic Link via AuthService (evita erro de tipo do Prisma se o client estiver desatualizado)
      const magicToken = await AuthService.generateMagicLinkToken(customer.email);

      const appUrl = process.env.NEXTAUTH_URL || 'https://caixinhas.app';
      const magicLink = `${appUrl}/login?token=${magicToken}`;
      const emailHtml = welcomeEmail(customerName, customer.email, tempPassword, magicLink);
      
      await sendEmail({ 
        to: customer.email, 
        subject: 'Bem-vindo ao Caixinhas App! 🎉', 
        html: emailHtml 
      });
      
      const activeUserId = user?.id || newUser.id;
      console.log('✅ Usuário e boas-vindas processados:', activeUserId);
    } else {
      if (!user) {
        console.error('❌ Usuário não encontrado para renovação');
        return;
      }

      console.log('🔄 Renovando assinatura de usuário existente:', user.email);
      const expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'active',
          trialExpiresAt: expirationDate,
        }
      });

      const formattedDate = expirationDate.toLocaleDateString('pt-BR');
      const emailHtml = renewalEmail(customerName, formattedDate);
      
      await sendEmail({ 
        to: customer.email, 
        subject: 'Assinatura Renovada - Caixinhas App ✅', 
        html: emailHtml 
      });
      
      console.log('✅ Renovação processada com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro handleOrderApproved:', error);
    throw error;
  }
}

// Lidar com eventos de cancelamento/reembolso
async function handleAccessRevoked(data: WebhookData, type: 'canceled' | 'refunded' | 'chargeback') {
  const { Customer: customer } = data;
  
  try {
    const user = await prisma.user.findUnique({ where: { email: customer.email } });
    if (!user) return;

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'inactive' }
    });

    const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
    let emailHtml = '';
    let subject = '';

    if (type === 'canceled') {
      emailHtml = cancellationEmail(customerName);
      subject = 'Assinatura Cancelada - Caixinhas App 😔';
    } else {
      emailHtml = refundEmail(customerName, type === 'chargeback');
      subject = type === 'chargeback' ? 'Contestação de Pagamento ⚠️' : 'Reembolso Processado 💰';
    }

    await sendEmail({ to: customer.email, subject, html: emailHtml });
    console.log(`✅ Acesso revogado (${type}) para:`, customer.email);
  } catch (error) {
    console.error(`❌ Erro handleAccessRevoked (${type}):`, error);
  }
}

// Lidar com falhas de pagamento
async function handlePaymentIssue(data: WebhookData, isLate: boolean = false) {
  const { Customer: customer } = data;
  
  try {
    const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
    const emailHtml = paymentFailedEmail(customerName, isLate);
    const subject = isLate ? 'Pagamento em Atraso ⏰' : 'Problema com seu Pagamento ⚠️';

    await sendEmail({ to: customer.email, subject, html: emailHtml });
    console.log(`📧 Alerta de pagamento (${isLate ? 'atraso' : 'falha'}) enviado para:`, customer.email);
  } catch (error) {
    console.error('❌ Erro handlePaymentIssue:', error);
  }
}

// Handler principal
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-kiwify-signature');
    
    // 1. Validar assinatura
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    
    // 2. Validar dados
    if (!isValidWebhookData(data)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const eventType = data.webhook_event_type || data.type;
    console.log('🎯 Evento Kiwify:', eventType, '| Cliente:', data.Customer.email);

    // 3. Processar eventos
    switch (eventType) {
      case 'order_approved':
      case 'subscription_renewed':
        await handleOrderApproved(data);
        break;
        
      case 'order_refunded':
        await handleAccessRevoked(data, 'refunded');
        break;
        
      case 'chargeback':
        await handleAccessRevoked(data, 'chargeback');
        break;
        
      case 'subscription_canceled':
        await handleAccessRevoked(data, 'canceled');
        break;
        
      case 'subscription_late':
        await handlePaymentIssue(data, true);
        break;
        
      case 'order_rejected':
      case 'payment_failed':
        await handlePaymentIssue(data, false);
        break;
        
      case 'pix_created':
        console.log('📋 PIX criado - aguardando...');
        break;
        
      default:
        console.warn('⚠️ Evento não tratado:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro fatal no webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}



// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Kiwify está funcionando!',
    timestamp: new Date().toISOString()
  });
}