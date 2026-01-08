
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// ⚡ OTIMIZAÇÃO: Configuração para Neon com Connection Pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        // Usa pooled connection do Neon para evitar cold starts
        url: process.env.DATABASE_URL, // já contém -pooler na string
      },
    },
    // ⚡ PERFORMANCE: Configurações otimizadas para serverless
    transactionOptions: {
      timeout: 10000, // 10s timeout
      isolationLevel: 'ReadCommitted', // Melhor performance
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
  var prismaConnected: boolean | undefined;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// ⚡ PERFORMANCE: Cache simples em memória para reduzir queries
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCached<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  memoryCache.delete(key);
  return null;
}

export function setCache(key: string, data: any, ttlMs = 60000): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

// Conectar explicitamente e manter conexão aquecida
if (!globalThis.prismaConnected) {
  prisma.$connect()
    .then(async () => {
      console.log('✅ Prisma conectado ao banco de dados (pooled)');
      globalThis.prismaConnected = true;
      
      // ⚡ CONNECTION WARMING: Evita cold start do Neon (CRÍTICO!)
      try {
        await prisma.$queryRaw`SELECT 1 as health_check`;
        console.log('🔥 Conexão aquecida com sucesso');
      } catch (error) {
        console.log('⚠️ Warming query falhou:', error);
      }
      
      // KEEPALIVE AGRESSIVO: query a cada 2 min para evitar suspend do Neon
      setInterval(async () => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          console.log('💓 Keepalive - conexão mantida ativa');
        } catch (error) {
          console.log('⚠️ Keepalive falhou:', error);
        }
      }, 2 * 60 * 1000); // 2 minutos (mais agressivo)
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
