import { prisma } from './src/services/prisma';
import bcrypt from 'bcryptjs';

async function testLogin() {
  console.log('🔍 Testando login...');
  
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'conta01@email.com' }
    });
    
    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não');
    if (user) {
      console.log('📧 Email:', user.email);
      console.log('👤 Nome:', user.name);
      console.log('🔐 Tem senha:', user.password ? 'Sim' : 'Não');
      
      if (user.password) {
        // Testar senha
        const isValid = await bcrypt.compare('conta@123', user.password);
        console.log('🔑 Senha válida:', isValid ? 'Sim' : 'Não');
        
        // Mostrar início do hash para debug
        console.log('🔐 Hash começa com:', user.password.substring(0, 10));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();