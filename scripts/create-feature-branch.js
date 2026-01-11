#!/usr/bin/env node

/**
 * Script para criar uma nova branch de feature
 * Uso: npm run feature "nome-da-feature"
 */

const { execSync } = require('child_process');

const featureName = process.argv[2];

if (!featureName) {
  console.error('❌ Por favor, forneça o nome da feature:');
  console.log('   npm run feature "nome-da-feature"');
  process.exit(1);
}

// Sanitizar nome da feature (remover espaços, caracteres especiais)
const sanitizedName = featureName
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const branchName = `feature/${sanitizedName}`;

try {
  console.log('🌳 Criando branch de feature...\n');
  
  // Verificar se está em development
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  
  if (currentBranch !== 'development') {
    console.log(`📍 Mudando de ${currentBranch} para development...`);
    execSync('git checkout development', { stdio: 'inherit' });
  }
  
  // Atualizar development
  console.log('📥 Atualizando development...');
  execSync('git pull origin development', { stdio: 'inherit' });
  
  // Criar nova branch
  console.log(`\n✨ Criando branch: ${branchName}`);
  execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
  
  console.log('\n✅ Branch criada com sucesso!');
  console.log(`\n📝 Próximos passos:`);
  console.log(`   1. Desenvolver sua feature`);
  console.log(`   2. git add .`);
  console.log(`   3. git commit -m "feat: descrição da feature"`);
  console.log(`   4. git push origin ${branchName}`);
  console.log(`   5. Abrir Pull Request no GitHub: ${branchName} → development`);
  
} catch (error) {
  console.error('❌ Erro ao criar branch:', error.message);
  process.exit(1);
}
