
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
  var prismaConnected: boolean | undefined;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Conectar explicitamente e manter conexão aquecida
if (!globalThis.prismaConnected) {
  prisma.$connect()
    .then(() => {
      console.log('✅ Prisma conectado ao banco de dados');
      globalThis.prismaConnected = true;
      
      // Keepalive: query a cada 5 min para evitar cold start
      if (process.env.NODE_ENV === 'development') {
        setInterval(async () => {
          try {
            await prisma.$queryRaw`SELECT 1`;
          } catch (error) {
            console.log('⚠️ Keepalive falhou');
          }
        }, 5 * 60 * 1000);
      }
    })
    .catch((error) => {
      console.error('❌ Erro ao conectar Prisma:', error);
    });
}

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
