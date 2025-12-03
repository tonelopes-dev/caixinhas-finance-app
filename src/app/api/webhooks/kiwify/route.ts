import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { sendEmail } from '@/lib/sendgrid';
import bcrypt from 'bcryptjs';

// Tipos para o webhook da Kiwify
interface Customer {
  email: string;
  name: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
}

interface WebhookData {
  order_id: string;
  order_status: string;
  webhook_event_type: string;
  Customer: Customer;
  Product: Product;
  subscription_id?: string;
  subscription_status?: string;
}

// Função para validar os dados do webhook
function isValidWebhookData(data: unknown): data is WebhookData {
  if (!data || typeof data !== 'object') return false;
  
  const webhook = data as Record<string, unknown>;
  
  // Verificar se todos os campos obrigatórios existem e são do tipo correto
  const hasValidOrderId = typeof webhook.order_id === 'string';
  const hasValidOrderStatus = typeof webhook.order_status === 'string';
  const hasValidEventType = typeof webhook.webhook_event_type === 'string';
  const hasValidCustomer = webhook.Customer && typeof webhook.Customer === 'object';
  
  if (!hasValidOrderId || !hasValidOrderStatus || !hasValidEventType || !hasValidCustomer) {
    return false;
  }
  
  const customer = webhook.Customer as Record<string, unknown>;
  const hasValidEmail = typeof customer.email === 'string';
  const hasValidName = typeof customer.name === 'string';
  
  return hasValidEmail && hasValidName;
}

// Função principal para processar o webhook
async function processWebhook(data: WebhookData) {
  console.log('🎯 Webhook Kiwify recebido:', data.webhook_event_type);
  console.log('📧 Cliente:', data.Customer.email);
  console.log('📦 Produto:', data.Product?.name);

  const { Customer: customer, Product: product } = data;

  switch (data.webhook_event_type) {
    case 'order_approved':
      await handleOrderApproved(data);
      break;
      
    case 'order_rejected':
      await handleOrderRejected(data);
      break;
      
    case 'subscription_canceled':
      await handleSubscriptionCanceled(data);
      break;
      
    case 'subscription_renewed':
      await handleSubscriptionRenewed(data);
      break;
      
    case 'payment_failed':
      await handlePaymentFailed(data);
      break;
      
    default:
      console.log('⚠️ Evento não tratado:', data.webhook_event_type);
  }
}

// Lidar com compra aprovada
async function handleOrderApproved(data: WebhookData) {
  const { Customer: customer, Product: product } = data;
  
  try {
    // Verificar se o usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: customer.email }
    });

    if (!user) {
      // Criar novo usuário
      console.log('👤 Criando novo usuário:', customer.email);
      
      // Gerar senha temporária
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      
      user = await prisma.user.create({
        data: {
          email: customer.email,
          name: customer.name,
          password: hashedPassword, // Usar a senha com hash
          subscriptionStatus: 'active',
          trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
          avatarUrl: null,
          workspaceImageUrl: null,
        }
      });

      // Enviar email de boas-vindas com credenciais
      await sendWelcomeEmail(customer.email, customer.name, tempPassword);
      
      console.log('✅ Usuário criado com sucesso:', user.id);
    } else {
      // Atualizar usuário existente
      console.log('🔄 Atualizando usuário existente:', customer.email);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'active',
          trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
        }
      });

      // Enviar email de renovação
      await sendRenewalEmail(customer.email, customer.name);
      
      console.log('✅ Usuário atualizado com sucesso');
    }

  } catch (error) {
    console.error('❌ Erro ao processar compra aprovada:', error);
    throw error;
  }
}

// Lidar com compra rejeitada
async function handleOrderRejected(data: WebhookData) {
  const { Customer: customer } = data;
  
  try {
    // Enviar email sobre pagamento rejeitado
    await sendRejectionEmail(customer.email, customer.name);
    console.log('📧 Email de pagamento rejeitado enviado para:', customer.email);
  } catch (error) {
    console.error('❌ Erro ao processar compra rejeitada:', error);
  }
}

// Lidar com assinatura cancelada
async function handleSubscriptionCanceled(data: WebhookData) {
  const { Customer: customer } = data;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'inactive'
        }
      });

      // Enviar email de cancelamento
      await sendCancellationEmail(customer.email, customer.name);
      console.log('✅ Assinatura cancelada para:', customer.email);
    }
  } catch (error) {
    console.error('❌ Erro ao processar cancelamento:', error);
  }
}

// Lidar com assinatura renovada
async function handleSubscriptionRenewed(data: WebhookData) {
  const { Customer: customer } = data;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'active',
          trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });

      await sendRenewalEmail(customer.email, customer.name);
      console.log('✅ Assinatura renovada para:', customer.email);
    }
  } catch (error) {
    console.error('❌ Erro ao processar renovação:', error);
  }
}

// Lidar com falha no pagamento
async function handlePaymentFailed(data: WebhookData) {
  const { Customer: customer } = data;
  
  try {
    await sendPaymentFailedEmail(customer.email, customer.name);
    console.log('📧 Email de falha no pagamento enviado para:', customer.email);
  } catch (error) {
    console.error('❌ Erro ao processar falha no pagamento:', error);
  }
}

// Funções de envio de email
async function sendWelcomeEmail(email: string, name: string, tempPassword: string) {
  const subject = 'Bem-vindo ao Caixinhas Finance! 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bem-vindo ao Caixinhas Finance! 🎉</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Sua conta foi criada com sucesso! Aqui estão suas credenciais de acesso:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Senha temporária:</strong> ${tempPassword}</p>
      </div>
      
      <p><strong>⚠️ IMPORTANTE:</strong> Por favor, faça login e altere sua senha no primeiro acesso.</p>
      
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/login" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Acessar Plataforma
      </a>
      
      <p>Obrigado por escolher o Caixinhas Finance!</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

async function sendRenewalEmail(email: string, name: string) {
  const subject = 'Assinatura Renovada - Caixinhas Finance ✅';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Assinatura Renovada! ✅</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Sua assinatura do Caixinhas Finance foi renovada com sucesso!</p>
      
      <p>Você pode continuar aproveitando todas as funcionalidades da plataforma.</p>
      
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/dashboard" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Acessar Dashboard
      </a>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

async function sendRejectionEmail(email: string, name: string) {
  const subject = 'Problema com o pagamento - Caixinhas Finance ⚠️';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Problema com o pagamento ⚠️</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Infelizmente houve um problema com seu pagamento.</p>
      
      <p>Entre em contato conosco para resolver esta questão.</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

async function sendCancellationEmail(email: string, name: string) {
  const subject = 'Assinatura Cancelada - Caixinhas Finance 😔';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Assinatura Cancelada 😔</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Sua assinatura foi cancelada conforme solicitado.</p>
      
      <p>Sentiremos sua falta! Se mudar de ideia, estaremos aqui.</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

async function sendPaymentFailedEmail(email: string, name: string) {
  const subject = 'Falha no pagamento - Caixinhas Finance ⚠️';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Falha no pagamento ⚠️</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Houve uma falha no processamento do seu pagamento.</p>
      
      <p>Por favor, verifique seus dados de pagamento e tente novamente.</p>
    </div>
  `;
  
  await sendEmail(email, subject, html);
}

// Handler principal da API
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Webhook Kiwify recebido');
    
    // Parse do body
    const data = await request.json();
    
    // Validação dos dados
    if (!isValidWebhookData(data)) {
      console.error('❌ Dados inválidos recebidos:', data);
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Processar webhook
    await processWebhook(data);
    
    console.log('✅ Webhook processado com sucesso');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Kiwify está funcionando!',
    timestamp: new Date().toISOString()
  });
}