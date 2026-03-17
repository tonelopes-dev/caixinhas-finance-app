import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { sendEmail } from '@/lib/email.service';
import bcrypt from 'bcryptjs';

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
  name?: string; // Campo alternativo para nome do produto
}

interface WebhookData {
  order_id?: string;
  order_status?: string;
  webhook_event_type?: string;
  type?: string; // Campo alternativo para tipo de evento
  Customer: Customer;
  Product?: Product;
  subscription_id?: string;
  subscription_status?: string;
  payment_method?: string;
  created_at?: string;
}

// Função para validar os dados do webhook
function isValidWebhookData(data: unknown): data is WebhookData {
  if (!data || typeof data !== 'object') return false;
  
  const webhook = data as Record<string, unknown>;
  
  // Validação mais flexível - suporte para diferentes formatos de webhook
  const hasValidEventType = typeof webhook.webhook_event_type === 'string' || typeof webhook.type === 'string';
  const hasValidCustomer = webhook.Customer && typeof webhook.Customer === 'object';
  
  if (!hasValidEventType || !hasValidCustomer) {
    console.log('❌ Validação falhou - campos obrigatórios ausentes');
    console.log('   - Event Type:', hasValidEventType ? '✅' : '❌');
    console.log('   - Customer:', hasValidCustomer ? '✅' : '❌');
    return false;
  }
  
  const customer = webhook.Customer as Record<string, unknown>;
  const hasValidEmail = typeof customer.email === 'string';
  // Suporte para diferentes formatos de nome do Kiwify
  const hasValidName = typeof customer.full_name === 'string' || 
                       typeof customer.first_name === 'string' || 
                       typeof customer.name === 'string';
  
  if (!hasValidEmail || !hasValidName) {
    console.log('❌ Validação falhou - dados do cliente inválidos');
    console.log('   - Email:', hasValidEmail ? '✅' : '❌');
    console.log('   - Name:', hasValidName ? '✅' : '❌');
    return false;
  }
  
  console.log('✅ Dados do webhook válidos');
  return true;
}

// Função principal para processar o webhook
async function processWebhook(data: WebhookData) {
  const eventType = data.webhook_event_type || data.type;
  
  console.log('🎯 Webhook Kiwify recebido:', eventType);
  console.log('📧 Cliente:', data.Customer.email);
  console.log('📦 Produto:', data.Product?.product_name || data.Product?.name);
  console.log('💳 Status do pedido:', data.order_status || 'N/A');

  const { Customer: customer, Product: product } = data;

  switch (eventType) {
    case 'order_approved':
      await handleOrderApproved(data);
      break;
      
    case 'order_rejected':
      await handleOrderRejected(data);
      break;
      
    case 'order_refunded':
      await handleOrderRefunded(data);
      break;
      
    case 'chargeback':
      await handleChargeback(data);
      break;
      
    case 'subscription_canceled':
      await handleSubscriptionCanceled(data);
      break;
      
    case 'subscription_renewed':
      await handleSubscriptionRenewed(data);
      break;
      
    case 'subscription_late':
      await handleSubscriptionLate(data);
      break;
      
    case 'payment_failed':
      await handlePaymentFailed(data);
      break;
      
    case 'pix_created':
      console.log('📋 PIX criado - aguardando pagamento');
      // Não fazemos nada aqui, só logamos
      break;
      
    default:
      console.warn('⚠️ Evento não tratado:', eventType);
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

    const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';

    if (!user) {
      // Criar novo usuário
      console.log('👤 Criando novo usuário:', customer.email);
      
      // Gerar senha temporária
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      
      user = await prisma.user.create({
        data: {
          email: customer.email,
          name: customerName,
          password: hashedPassword, // Usar a senha com hash
          subscriptionStatus: 'active',
          trialExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
          avatarUrl: null,
          workspaceImageUrl: null,
        }
      });

      // Enviar email de boas-vindas com credenciais
      await sendWelcomeEmail(customer.email, customerName, tempPassword);
      
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
      await sendRenewalEmail(customer.email, customerName);
      
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
    const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
    // Enviar email sobre pagamento rejeitado
    await sendRejectionEmail(customer.email, customerName);
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

      const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
      // Enviar email de cancelamento
      await sendCancellationEmail(customer.email, customerName);
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

      const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
      await sendRenewalEmail(customer.email, customerName);
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
    const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
    await sendPaymentFailedEmail(customer.email, customerName);
    console.log('📧 Email de falha no pagamento enviado para:', customer.email);
  } catch (error) {
    console.error('❌ Erro ao processar falha no pagamento:', error);
  }
}

// Lidar com reembolso
async function handleOrderRefunded(data: WebhookData) {
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

      const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
      await sendRefundEmail(customer.email, customerName);
      console.log('💰 Reembolso processado para:', customer.email);
    }
  } catch (error) {
    console.error('❌ Erro ao processar reembolso:', error);
  }
}

// Lidar com chargeback  
async function handleChargeback(data: WebhookData) {
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

      const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
      await sendChargebackEmail(customer.email, customerName);
      console.log('⚠️ Chargeback processado para:', customer.email);
    }
  } catch (error) {
    console.error('❌ Erro ao processar chargeback:', error);
  }
}

// Lidar com atraso na assinatura
async function handleSubscriptionLate(data: WebhookData) {
  const { Customer: customer } = data;
  
  try {
    const customerName = customer.full_name || customer.first_name || customer.name || 'Cliente';
    await sendSubscriptionLateEmail(customer.email, customerName);
    console.log('⏰ Email de atraso na assinatura enviado para:', customer.email);
  } catch (error) {
    console.error('❌ Erro ao processar atraso na assinatura:', error);
  }
}

// Funções de envio de email
async function sendWelcomeEmail(email: string, name: string, tempPassword: string) {
  const subject = 'Bem-vindo ao Caixinhas App! 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Bem-vindo ao Caixinhas App! 🎉</h2>
      
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
      
      <p>Obrigado por escolher o Caixinhas App!</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

async function sendRenewalEmail(email: string, name: string) {
  const subject = 'Assinatura Renovada - Caixinhas App ✅';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Assinatura Renovada! ✅</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Sua assinatura do Caixinhas App foi renovada com sucesso!</p>
      
      <p>Você pode continuar aproveitando todas as funcionalidades da plataforma.</p>
      
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/dashboard" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Acessar Dashboard
      </a>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

async function sendRejectionEmail(email: string, name: string) {
  const subject = 'Problema com o pagamento - Caixinhas App ⚠️';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Problema com o pagamento ⚠️</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Infelizmente houve um problema com seu pagamento.</p>
      
      <p>Entre em contato conosco para resolver esta questão.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

async function sendCancellationEmail(email: string, name: string) {
  const subject = 'Assinatura Cancelada - Caixinhas App 😔';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Assinatura Cancelada 😔</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Sua assinatura foi cancelada conforme solicitado.</p>
      
      <p>Sentiremos sua falta! Se mudar de ideia, estaremos aqui.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

async function sendPaymentFailedEmail(email: string, name: string) {
  const subject = 'Falha no pagamento - Caixinhas App ⚠️';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Falha no pagamento ⚠️</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Houve uma falha no processamento do seu pagamento.</p>
      
      <p>Por favor, verifique seus dados de pagamento e tente novamente.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

async function sendRefundEmail(email: string, name: string) {
  const subject = 'Reembolso Processado - Caixinhas App 💰';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Reembolso Processado 💰</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Seu reembolso foi processado com sucesso.</p>
      
      <p>O valor será estornado no seu método de pagamento original em até 7 dias úteis.</p>
      
      <p>Sua conta foi desativada conforme solicitado.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

async function sendChargebackEmail(email: string, name: string) {
  const subject = 'Contestação de Pagamento - Caixinhas App ⚠️';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Contestação de Pagamento ⚠️</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Detectamos uma contestação (chargeback) em seu pagamento.</p>
      
      <p>Sua conta foi temporariamente desativada até a resolução da contestação.</p>
      
      <p>Se você não solicitou esta contestação, entre em contato conosco imediatamente.</p>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
}

async function sendSubscriptionLateEmail(email: string, name: string) {
  const subject = 'Pagamento em Atraso - Caixinhas App ⏰';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Pagamento em Atraso ⏰</h2>
      
      <p>Olá <strong>${name}</strong>!</p>
      
      <p>Detectamos um atraso no pagamento da sua assinatura.</p>
      
      <p>Por favor, regularize sua situação para continuar aproveitando todos os recursos da plataforma.</p>
      
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/dashboard" 
         style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
        Atualizar Pagamento
      </a>
    </div>
  `;
  
  await sendEmail({ to: email, subject, html });
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