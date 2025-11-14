#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dbType = args[0];

if (!dbType || !['sqlite', 'postgres'].includes(dbType)) {
  console.error('❌ Uso: node scripts/switch-db.js [sqlite|postgres]');
  process.exit(1);
}

const sourceFile = path.join('prisma', `${dbType}.prisma`);
const targetFile = path.join('prisma', 'schema.prisma');

try {
  // Fazer backup do schema atual
  const backupFile = path.join('prisma', `schema.prisma.backup-${Date.now()}`);
  if (fs.existsSync(targetFile)) {
    fs.copyFileSync(targetFile, backupFile);
    console.log(`📦 Backup criado: ${backupFile}`);
  }

  // Copiar o novo schema
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Schema alterado para: ${dbType.toUpperCase()}`);
  console.log(`📄 Usando: ${sourceFile} → ${targetFile}`);
  
  console.log('\n🔄 Próximos passos:');
  console.log('1. npm run prisma:generate');
  console.log('2. npm run prisma:migrate (se necessário)');
  
} catch (error) {
  console.error('❌ Erro ao trocar schema:', error.message);
  process.exit(1);
}