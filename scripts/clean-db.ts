import { execSync } from 'child_process';

async function cleanDatabase() {
  console.log('Iniciando limpeza do banco de dados...');
  try {
    // Usa o comando prisma migrate reset para limpar e aplicar migrations
    // --force é necessário para pular a confirmação interativa
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    console.log('Banco de dados limpo e migrações aplicadas com sucesso.');
  } catch (error) {
    console.error('Erro ao limpar o banco de dados:', error);
    process.exit(1);
  }
}

cleanDatabase();
