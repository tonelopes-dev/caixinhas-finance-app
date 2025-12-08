// Configurações do aplicativo
export const config = {
  // URLs
  checkoutUrl: process.env.KIWIFY_URL_CHECKOUT || 'https://kiwify.app/JUDe4nb',
  
  // Outras configurações podem ser adicionadas aqui
  app: {
    name: 'Caixinhas',
    description: 'Sonhar juntos é o primeiro passo para conquistar.',
  }
} as const

export type Config = typeof config