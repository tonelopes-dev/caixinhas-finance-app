'use client';

export default function GlobalErrorPage() {

  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '32rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '4rem', 
                height: '4rem', 
                borderRadius: '50%', 
                backgroundColor: '#fed7aa', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                ⚠️
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ops! Erro Crítico</h1>
              <p style={{ color: '#64748b' }}>
                Algo deu muito errado. Vamos resolver isso juntos!
              </p>
            </div>
            <div>
              {/* Instruções específicas para PWA/Mobile */}
              <div style={{ 
                backgroundColor: '#f8fafc', 
                borderRadius: '0.5rem', 
                padding: '1rem', 
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📱</span>
                  <div>
                    <p style={{ fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                      Soluções recomendadas:
                    </p>
                    <ol style={{ color: '#64748b', fontSize: '0.75rem', paddingLeft: '1rem' }}>
                      <li>Limpe o cache e recarregue a página</li>
                      <li>Se estiver usando o app, remova e adicione novamente</li>
                      <li>Verifique sua conexão com a internet</li>
                      <li>Tente acessar pelo navegador diretamente</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then((registrations) => {
                        registrations.forEach((registration) => {
                          registration.unregister();
                        });
                      });
                    }
                    try {
                      localStorage.clear();
                      sessionStorage.clear();
                    } catch(e) {}
                    window.location.reload();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  🔄 Limpar Cache e Recarregar
                </button>

                <a href="/dashboard" style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    fontWeight: '500',
                    cursor: 'pointer',
                    color: '#374151'
                  }}>
                    🏠 Voltar ao Início
                  </div>
                </a>

                <a href="/login" style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    fontWeight: '500',
                    cursor: 'pointer',
                    color: '#374151'
                  }}>
                    🔑 Fazer Login Novamente
                  </div>
                </a>
              </div>

              <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Se o problema persistir, entre em contato conosco em{' '}
                  <a 
                    href="mailto:suporte@caixinhas.app" 
                    style={{ color: '#3b82f6', textDecoration: 'underline' }}
                  >
                    suporte@caixinhas.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}