
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Helper function to add pgbouncer=true if it's not already in the URL
const getPatchedDatabaseUrl = (): string | undefined => {
    const url = process.env.DATABASE_URL;
    if (!url) {
        return undefined;
    }
    const urlParts = url.split('?');
    if (urlParts.length === 1) {
        // No query parameters exist, so add pgbouncer
        return `${url}?pgbouncer=true`;
    }
    const [baseUrl, queryParams] = urlParts;
    if (!queryParams.includes('pgbouncer=true')) {
        // Query parameters exist, but pgbouncer is not one of them
        return `${baseUrl}?${queryParams}&pgbouncer=true`;
    }
    // pgbouncer is already set
    return url;
};

const patchedDatabaseUrl = getPatchedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: patchedDatabaseUrl,
        }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
