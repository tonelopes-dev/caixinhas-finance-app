// Configurações do aplicativo
export const config = {
  // URLs
  checkoutUrl: process.env.KIWIFY_URL_CHECKOUT || 'https://pay.kiwify.com.br/6Qro6fV',
  
  // Outras configurações podem ser adicionadas aqui
  app: {
    name: 'Caixinhas',
    description: 'Sonhar juntos é o primeiro passo para conquistar.',
  }
} as const

export type Config = typeof config