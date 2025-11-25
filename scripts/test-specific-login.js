const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSpecificLogin() {
  try {
    const email = 'conta01@email.com';
    const password = 'conta@123';
    
    console.log(`\n🔐 Testando login: ${email} / ${password}\n`);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    console.log('Hash armazenado:', user.password);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('\n🔍 Resultado da comparação:', isValid ? '✅ SENHA CORRETA' : '❌ SENHA INCORRETA');
    
    // Testar também com o hash direto
    const newHash = await bcrypt.hash(password, 12);
    console.log('\nNovo hash gerado:', newHash);
    const isValidNew = await bcrypt.compare(password, newHash);
    console.log('Novo hash funciona:', isValidNew ? '✅ SIM' : '❌ NÃO');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSpecificLogin();
