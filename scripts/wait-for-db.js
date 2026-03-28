/**
 * Script de Verificação de Host de Banco de Dados
 * Responsável por "acordar" bancos de dados (como Neon) antes de iniciar migrações.
 */

const net = require('net');
const { URL } = require('url');

// Configurações de retentativa
const MAX_ATTEMPTS = 10;
const RETRY_INTERVAL_MS = 3000; // 3 segundos

async function checkDatabaseConnection() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn('⚠️ Nenhuma variável DATABASE_URL ou DIRECT_URL encontrada. Pulando verificação...');
    process.exit(0);
  }

  try {
    const parsedUrl = new URL(dbUrl);
    const host = parsedUrl.hostname;
    const port = parseInt(parsedUrl.port) || 5432;

    console.log(`🔌 Tentando verificar conexão com ${host}:${port}...`);

    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
        try {
            await new Promise((resolve, reject) => {
                const socket = net.createConnection(port, host);
                socket.setTimeout(5000);
                
                socket.on('connect', () => {
                    socket.destroy();
                    resolve();
                });

                socket.on('timeout', () => {
                    socket.destroy();
                    reject(new Error('Timeout'));
                });

                socket.on('error', (err) => {
                    socket.destroy();
                    reject(err);
                });
            });

            console.log('✅ Banco de Dados está online e respondendo.');
            process.exit(0);
        } catch (err) {
            console.warn(`⏳ Tentativa ${i}/${MAX_ATTEMPTS} falhou: ${err.message}. Retentando em ${RETRY_INTERVAL_MS/1000}s...`);
            if (i < MAX_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_MS));
            } else {
                console.error('❌ Falha ao conectar ao Banco de Dados após várias tentativas.');
                process.exit(1);
            }
        }
    }
  } catch (error) {
    console.error(`❌ Erro ao processar URL do Banco de Dados: ${error.message}`);
    process.exit(1);
  }
}

checkDatabaseConnection();
