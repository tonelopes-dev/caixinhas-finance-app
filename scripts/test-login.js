const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('\n=== Testando Login ===\n');
    
    // Listar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        subscriptionStatus: true,
      }
    });
    
    console.log('📋 Usuários encontrados:', users.length);
    
    for (const user of users) {
      console.log('\n---');
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
      console.log('Status:', user.subscriptionStatus);
      console.log('Tem senha:', user.password ? 'Sim' : 'Não');
      console.log('Hash da senha:', user.password ? user.password.substring(0, 20) + '...' : 'N/A');
      
      // Tentar comparar com uma senha de teste
      if (user.password) {
        const testPasswords = ['senha123', 'password', '123456', 'admin'];
        for (const testPass of testPasswords) {
          const isValid = await bcrypt.compare(testPass, user.password);
          if (isValid) {
            console.log(`✅ Senha correta encontrada: "${testPass}"`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
