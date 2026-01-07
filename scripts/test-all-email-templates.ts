/**
 * Script para testar e visualizar todos os templates de email
 * 
 * Uso: npx tsx scripts/test-all-email-templates.ts
 * 
 * Este script:
 * 1. Gera todos os templates de email com dados de teste
 * 2. Valida que todos os campos dinâmicos foram preenchidos
 * 3. Salva arquivos HTML para inspeção visual
 * 4. Opcionalmente envia emails de teste reais
 */

import { config } from 'dotenv';
config();

import fs from 'fs';
import path from 'path';
import { sendEmail } from '../src/lib/sendgrid';
import { inviteEmail } from '../src/app/_templates/emails/invite-template';
import { passwordResetEmail } from '../src/app/_templates/emails/password-reset-template';
import { welcomeEmail } from '../src/app/_templates/emails/welcome-email';
import { subscriptionConfirmationEmail } from '../src/app/_templates/emails/subscription-confirmation-email';
import { goalCelebrationEmail } from '../src/app/_templates/emails/goal-celebration-email';
import { milestoneEmail } from '../src/app/_templates/emails/milestone-email';

// ========================================
// CONFIGURAÇÃO
// ========================================
const OUTPUT_DIR = path.join(__dirname, '../__email-previews__');
const SEND_TEST_EMAILS = process.argv.includes('--send'); // Usar --send para enviar emails reais
const TEST_EMAIL = process.env.TEST_EMAIL || 'tonelopes.dev@gmail.com';

// ========================================
// DADOS DE TESTE
// ========================================
const testData = {
  invite: {
    inviterName: 'João Silva',
    vaultName: 'Cofre de Viagem para Europa 2025',
    inviteLink: 'https://caixinhas.app/invite/abc123xyz789',
    receiverEmail: 'maria.santos@example.com'
  },
  passwordReset: {
    userName: 'Maria Santos',
    resetLink: 'https://caixinhas.app/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    userEmail: 'maria.santos@example.com'
  },
  welcome: {
    userName: 'Carlos Oliveira',
    userEmail: 'carlos.oliveira@example.com',
    temporaryPassword: 'TempP@ss123!'
  },
  subscription: {
    userName: 'Ana Paula Costa',
    plan: 'mensal' as 'mensal' | 'trimestral' | 'semestral' | 'anual',
    expirationDate: '31 de janeiro de 2025',
    userEmail: 'ana.paula@example.com'
  },
  goalCelebration: {
    userName: 'Pedro Almeida',
    goalName: 'Viagem para Paris',
    achievedAmount: 'R$ 10.000,00',
    userEmail: 'pedro.almeida@example.com'
  },
  milestone: {
    userName: 'Fernanda Lima',
    goalName: 'Casa Própria',
    progress: 75,
    currentAmount: 'R$ 75.000,00',
    targetAmount: 'R$ 100.000,00',
    userEmail: 'fernanda.lima@example.com'
  }
};

// ========================================
// VALIDAÇÃO DE TEMPLATES
// ========================================
interface ValidationResult {
  templateName: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  html: string;
}

function validateTemplate(templateName: string, html: string, requiredFields: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar campos obrigatórios
  requiredFields.forEach(field => {
    if (!html.includes(field)) {
      errors.push(`Campo obrigatório não encontrado: "${field}"`);
    }
  });

  // Validar estrutura HTML básica
  if (!html.includes('<') || !html.includes('>')) {
    errors.push('HTML inválido: sem tags HTML');
  }

  // Validar links
  const links = html.match(/href="([^"]+)"/g) || [];
  links.forEach(link => {
    if (link.includes('http://') && link.includes('caixinhas.app')) {
      warnings.push('Link HTTP encontrado (deveria ser HTTPS): ' + link);
    }
    if (link.includes('undefined') || link.includes('null')) {
      errors.push('Link inválido encontrado: ' + link);
    }
  });

  // Validar imagens
  const images = html.match(/src="([^"]+)"/g) || [];
  images.forEach(img => {
    if (img.includes('undefined') || img.includes('null')) {
      errors.push('Imagem inválida encontrada: ' + img);
    }
  });

  // Validar tamanho
  if (html.length < 100) {
    errors.push('HTML muito pequeno: ' + html.length + ' caracteres');
  }
  if (html.length > 500000) {
    warnings.push('HTML muito grande: ' + html.length + ' caracteres');
  }

  return {
    templateName,
    isValid: errors.length === 0,
    errors,
    warnings,
    html
  };
}

// ========================================
// GERAÇÃO DE TEMPLATES
// ========================================
async function generateAllTemplates(): Promise<ValidationResult[]> {
  console.log('\n📧 Gerando todos os templates de email...\n');

  const results: ValidationResult[] = [];

  // 1. Email de Convite
  console.log('1️⃣ Gerando template de CONVITE...');
  const inviteHtml = inviteEmail(
    testData.invite.inviterName,
    testData.invite.vaultName,
    testData.invite.inviteLink
  );
  results.push(validateTemplate(
    'invite',
    inviteHtml,
    [testData.invite.inviterName, testData.invite.vaultName, testData.invite.inviteLink, 'Aceitar Convite']
  ));

  // 2. Email de Redefinição de Senha
  console.log('2️⃣ Gerando template de REDEFINIÇÃO DE SENHA...');
  const resetHtml = passwordResetEmail(
    testData.passwordReset.userName,
    testData.passwordReset.resetLink
  );
  results.push(validateTemplate(
    'password-reset',
    resetHtml,
    [testData.passwordReset.userName, testData.passwordReset.resetLink, 'Redefinir Senha']
  ));

  // 3. Email de Boas-vindas
  console.log('3️⃣ Gerando template de BOAS-VINDAS...');
  const welcomeHtml = welcomeEmail(
    testData.welcome.userName,
    testData.welcome.userEmail,
    testData.welcome.temporaryPassword
  );
  results.push(validateTemplate(
    'welcome',
    welcomeHtml,
    [testData.welcome.userName, testData.welcome.userEmail, testData.welcome.temporaryPassword]
  ));

  // 4. Email de Confirmação de Assinatura
  console.log('4️⃣ Gerando template de CONFIRMAÇÃO DE ASSINATURA...');
  const subscriptionHtml = subscriptionConfirmationEmail(
    testData.subscription.userName,
    testData.subscription.plan,
    testData.subscription.expirationDate
  );
  results.push(validateTemplate(
    'subscription-confirmation',
    subscriptionHtml,
    [testData.subscription.userName, testData.subscription.plan, testData.subscription.expirationDate]
  ));

  // 5. Email de Celebração de Objetivo
  console.log('5️⃣ Gerando template de CELEBRAÇÃO DE OBJETIVO...');
  const celebrationHtml = goalCelebrationEmail(
    testData.goalCelebration.userName,
    testData.goalCelebration.goalName,
    testData.goalCelebration.achievedAmount
  );
  results.push(validateTemplate(
    'goal-celebration',
    celebrationHtml,
    [testData.goalCelebration.userName, testData.goalCelebration.goalName, testData.goalCelebration.achievedAmount]
  ));

  // 6. Email de Marco de Progresso
  console.log('6️⃣ Gerando template de MARCO DE PROGRESSO...');
  const milestoneHtml = milestoneEmail(
    testData.milestone.userName,
    testData.milestone.goalName,
    testData.milestone.progress,
    testData.milestone.currentAmount,
    testData.milestone.targetAmount
  );
  results.push(validateTemplate(
    'milestone',
    milestoneHtml,
    [testData.milestone.userName, testData.milestone.goalName, String(testData.milestone.progress)]
  ));

  return results;
}

// ========================================
// SALVAR HTML PARA VISUALIZAÇÃO
// ========================================
function saveHtmlFiles(results: ValidationResult[]) {
  console.log('\n💾 Salvando arquivos HTML...\n');

  // Criar diretório se não existir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Salvar cada template
  results.forEach(result => {
    const filename = `${result.templateName}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, result.html, 'utf-8');
    console.log(`   ✅ ${filename} salvo em: ${filepath}`);
  });

  // Criar index.html para visualizar todos
  const indexHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prévia de Emails - Caixinhas App</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .template-list { list-style: none; padding: 0; }
    .template-list li { margin: 10px 0; }
    .template-list a { 
      display: inline-block; 
      padding: 10px 20px; 
      background: #E7A42F; 
      color: white; 
      text-decoration: none; 
      border-radius: 5px; 
    }
    .template-list a:hover { background: #D4941F; }
  </style>
</head>
<body>
  <h1>📧 Prévia de Templates de Email</h1>
  <p>Clique em um template abaixo para visualizá-lo:</p>
  <ul class="template-list">
    ${results.map(r => `<li><a href="${r.templateName}.html" target="_blank">${r.templateName}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>
  `;

  const indexPath = path.join(OUTPUT_DIR, 'index.html');
  fs.writeFileSync(indexPath, indexHtml, 'utf-8');
  console.log(`\n   🌐 Index criado em: ${indexPath}`);
  console.log(`   👉 Abra no navegador para visualizar todos os templates\n`);
}

// ========================================
// ENVIAR EMAILS DE TESTE
// ========================================
async function sendTestEmails(results: ValidationResult[]) {
  if (!SEND_TEST_EMAILS) {
    console.log('\n⚠️  Para enviar emails de teste reais, execute: npm run test:emails -- --send\n');
    return;
  }

  console.log(`\n📨 Enviando emails de teste para: ${TEST_EMAIL}\n`);

  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY não configurado. Configure no .env para enviar emails.\n');
    return;
  }

  for (const result of results) {
    if (!result.isValid) {
      console.log(`   ⏭️  Pulando ${result.templateName} (tem erros de validação)`);
      continue;
    }

    try {
      const subject = `[TESTE] ${result.templateName}`;
      const success = await sendEmail({
        to: TEST_EMAIL,
        subject,
        html: result.html
      });

      if (success) {
        console.log(`   ✅ ${result.templateName} enviado`);
      } else {
        console.log(`   ❌ Falha ao enviar ${result.templateName}`);
      }
    } catch (error) {
      console.error(`   ❌ Erro ao enviar ${result.templateName}:`, error);
    }
  }

  console.log('\n');
}

// ========================================
// RELATÓRIO DE VALIDAÇÃO
// ========================================
function printValidationReport(results: ValidationResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE VALIDAÇÃO DE TEMPLATES');
  console.log('='.repeat(60) + '\n');

  let totalValid = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  results.forEach(result => {
    if (result.isValid) {
      console.log(`✅ ${result.templateName.toUpperCase()}: VÁLIDO`);
      totalValid++;
    } else {
      console.log(`❌ ${result.templateName.toUpperCase()}: INVÁLIDO`);
    }

    if (result.errors.length > 0) {
      console.log(`   Erros (${result.errors.length}):`);
      result.errors.forEach(err => console.log(`      - ${err}`));
      totalErrors += result.errors.length;
    }

    if (result.warnings.length > 0) {
      console.log(`   ⚠️  Avisos (${result.warnings.length}):`);
      result.warnings.forEach(warn => console.log(`      - ${warn}`));
      totalWarnings += result.warnings.length;
    }

    console.log('');
  });

  console.log('='.repeat(60));
  console.log(`📈 RESUMO:`);
  console.log(`   ✅ Templates válidos: ${totalValid}/${results.length}`);
  console.log(`   ❌ Total de erros: ${totalErrors}`);
  console.log(`   ⚠️  Total de avisos: ${totalWarnings}`);
  console.log('='.repeat(60) + '\n');

  if (totalValid === results.length && totalErrors === 0) {
    console.log('🎉 TODOS OS TEMPLATES PASSARAM NA VALIDAÇÃO! 🎉\n');
  } else {
    console.log('⚠️  Alguns templates têm problemas. Revise os erros acima.\n');
  }
}

// ========================================
// EXECUÇÃO PRINCIPAL
// ========================================
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTE COMPLETO DE TEMPLATES DE EMAIL');
  console.log('='.repeat(60));

  try {
    // 1. Gerar todos os templates
    const results = await generateAllTemplates();

    // 2. Salvar arquivos HTML
    saveHtmlFiles(results);

    // 3. Imprimir relatório de validação
    printValidationReport(results);

    // 4. Enviar emails de teste (se solicitado)
    await sendTestEmails(results);

    console.log('✅ Processo concluído com sucesso!\n');
  } catch (error) {
    console.error('\n❌ Erro durante execução:', error);
    process.exit(1);
  }
}

// Executar
main();
