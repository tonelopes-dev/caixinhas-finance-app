
import { AuthService } from './src/services/auth.service.js';

async function testLogin() {
  console.log('🔍 Testando login...');
  
  const email = 'conta01@email.com';
  const password = 'conta@123';

  try {
    const user = await AuthService.login({ email, password });
    
    if (user) {
        console.log('✅ Login bem-sucedido!');
        console.log('👤 Usuário:', user.name);
        console.log('📧 Email:', user.email);
    } else {
        console.log('❌ Falha no login. Verifique as credenciais ou o AuthService.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste de login:', error);
  }
}

testLogin();
