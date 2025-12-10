/**
 * Utilitários para autenticação e limpeza de sessão
 */

import { signOut } from 'next-auth/react';

/**
 * Limpa completamente todos os dados de autenticação do usuário
 * Esta função deve ser chamada antes de fazer logout para garantir
 * que não haja loops de redirecionamento ou login automático
 */
export async function clearAuthSession(): Promise<void> {
  try {
    console.log('🧹 Iniciando limpeza completa da sessão...');
    
    if (typeof window !== 'undefined') {
      // Limpar todos os dados específicos do app
      localStorage.removeItem('CAIXINHAS_USER_ID');
      sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
      sessionStorage.removeItem('redirecting');
      
      // Limpar dados de privacy mode
      localStorage.removeItem('privacy-mode');
      
      // Limpar dados de tema se necessário manter limpo
      // localStorage.removeItem('theme');
      
      // Limpar outros dados específicos do app
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('CAIXINHAS_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Limpar sessionStorage completamente para evitar dados residuais
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('CAIXINHAS_') || key === 'redirecting')) {
          sessionKeysToRemove.push(key);
        }
      }
      
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      console.log('✅ Dados do localStorage e sessionStorage limpos');
    }
    
    // Fazer logout do NextAuth sem redirecionamento automático
    await signOut({ 
      redirect: false,
      callbackUrl: '/login'
    });
    
    console.log('✅ Sessão NextAuth encerrada');
    
  } catch (error) {
    console.error('❌ Erro durante limpeza da sessão:', error);
    // Em caso de erro, ainda tentar o básico
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  }
}

/**
 * Realiza logout completo e redireciona para login de forma segura
 * Esta função evita loops de redirecionamento e mostra loading por 3 segundos
 */
export async function performLogout(setLoadingCallback?: (show: boolean, message?: string) => void): Promise<void> {
  try {
      // Mostrar loading de logout
      if (setLoadingCallback) {
        setLoadingCallback(true, "Encerrando sua sessão com segurança...");
      }    // Adicionar um flag temporário para indicar logout em processo
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('logging-out', 'true');
    }
    
    // Aguardar pelo menos 3 segundos para que o usuário veja o loading
    const logoutPromise = (async () => {
      // Limpar toda a sessão
      await clearAuthSession();
      
      // Aguardar um pouco para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, 100));
    })();
    
    const minimumTimePromise = new Promise(resolve => setTimeout(resolve, 3000));
    
    // Aguardar tanto o logout quanto o tempo mínimo
    await Promise.all([logoutPromise, minimumTimePromise]);
    
    // Esconder loading
    if (setLoadingCallback) {
      setLoadingCallback(false);
    }
    
    // Redirecionamento manual com parâmetro que indica logout
    if (typeof window !== 'undefined') {
      // Limpar o flag de logout
      sessionStorage.removeItem('logging-out');
      
      // Usar replace para evitar volta no histórico e adicionar parâmetro de logout
      window.location.replace('/login?logout=true');
    }
    
  } catch (error) {
    console.error('❌ Erro durante logout:', error);
    
    // Esconder loading em caso de erro
    if (setLoadingCallback) {
      setLoadingCallback(false);
    }
    
    // Fallback - redirecionamento forçado
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('logging-out');
      window.location.href = '/login?logout=true';
    }
  }
}

/**
 * Verifica se um logout está em processo
 */
export function isLoggingOut(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('logging-out') === 'true';
}