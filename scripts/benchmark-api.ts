/**
 * Script de Benchmark da API
 * 
 * Testa a velocidade de resposta de vários endpoints da API
 * Mostra tempo médio, mínimo e máximo de resposta
 * 
 * IMPORTANTE: Execute 'npm run dev' antes de rodar este script!
 * 
 * Uso: tsx scripts/benchmark-api.ts
 */

const API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:9002';
const NUM_REQUESTS = 10; // Número de requests por endpoint

// Verifica se o servidor está rodando
async function checkServerHealth(): Promise<boolean> {
  try {
    console.log(`${colors.gray}🔍 Verificando se servidor está rodando em ${API_BASE_URL}...${colors.reset}`);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/providers`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // Timeout de 5s
    });
    
    if (response.ok) {
      console.log(`${colors.green}✅ Servidor está respondendo!${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.red}❌ Servidor respondeu com status: ${response.status}${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Não foi possível conectar ao servidor${colors.reset}`);
    console.log(`${colors.yellow}💡 Certifique-se de que o servidor está rodando:${colors.reset}`);
    console.log(`${colors.cyan}   npm run dev${colors.reset}\n`);
    return false;
  }
}

interface BenchmarkResult {
  endpoint: string;
  method: string;
  times: number[];
  avg: number;
  min: number;
  max: number;
  success: number;
  errors: number;
}

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

async function benchmarkEndpoint(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<BenchmarkResult> {
  const times: number[] = [];
  let success = 0;
  let errors = 0;

  console.log(`${colors.gray}Testing ${method} ${endpoint}...${colors.reset}`);

  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = performance.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10000), // Timeout de 10s por request
      });

      const end = performance.now();
      const duration = end - start;
      
      if (response.ok) {
        times.push(duration);
        success++;
      } else {
        errors++;
        console.log(`  ${colors.red}✗ Request ${i + 1} failed: ${response.status} ${response.statusText}${colors.reset}`);
      }
    } catch (error: any) {
      errors++;
      const errorMsg = error.name === 'TimeoutError' ? 'Timeout (>10s)' : error.message;
      console.log(`  ${colors.red}✗ Request ${i + 1} error: ${errorMsg}${colors.reset}`);
    }

    // Pequeno delay entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const min = times.length > 0 ? Math.min(...times) : 0;
  const max = times.length > 0 ? Math.max(...times) : 0;

  return {
    endpoint,
    method,
    times,
    avg,
    min,
    max,
    success,
    errors,
  };
}

function formatTime(ms: number): string {
  if (ms < 100) return `${colors.green}${ms.toFixed(2)}ms${colors.reset}`;
  if (ms < 300) return `${colors.yellow}${ms.toFixed(2)}ms${colors.reset}`;
  return `${colors.red}${ms.toFixed(2)}ms${colors.reset}`;
}

function printResults(results: BenchmarkResult[]) {
  console.log(`\n${colors.bright}${colors.cyan}📊 Resultados do Benchmark${colors.reset}`);
  console.log(`${colors.gray}${'='.repeat(80)}${colors.reset}\n`);

  results.forEach((result) => {
    const successRate = ((result.success / NUM_REQUESTS) * 100).toFixed(1);
    const rateColor = result.success === NUM_REQUESTS ? colors.green : colors.yellow;

    console.log(`${colors.bright}${result.method} ${result.endpoint}${colors.reset}`);
    console.log(`  Média:    ${formatTime(result.avg)}`);
    console.log(`  Mínimo:   ${formatTime(result.min)}`);
    console.log(`  Máximo:   ${formatTime(result.max)}`);
    console.log(`  Sucesso:  ${rateColor}${result.success}/${NUM_REQUESTS} (${successRate}%)${colors.reset}`);
    if (result.errors > 0) {
      console.log(`  Erros:    ${colors.red}${result.errors}${colors.reset}`);
    }
    console.log();
  });

  // Resumo geral
  const totalAvg = results.reduce((sum, r) => sum + r.avg, 0) / results.length;
  const totalSuccess = results.reduce((sum, r) => sum + r.success, 0);
  const totalRequests = results.length * NUM_REQUESTS;
  const totalSuccessRate = ((totalSuccess / totalRequests) * 100).toFixed(1);

  console.log(`${colors.gray}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}Resumo Geral:${colors.reset}`);
  console.log(`  Tempo médio total: ${formatTime(totalAvg)}`);
  console.log(`  Taxa de sucesso:   ${totalSuccess}/${totalRequests} (${totalSuccessRate}%)`);
  console.log();
}

async function runBenchmark() {
  console.log(`${colors.bright}${colors.cyan}🚀 Iniciando Benchmark da API${colors.reset}`);
  console.log(`${colors.gray}Base URL: ${API_BASE_URL}${colors.reset}`);
  // Verifica se o servidor está funcionando
  const serverIsUp = await checkServerHealth();
  if (!serverIsUp) {
    console.log(`${colors.red}🚫 Abortando benchmark - servidor não está acessível${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.gray}Requests por endpoint: ${NUM_REQUESTS}${colors.reset}\n`);

  const results: BenchmarkResult[] = [];

  // Endpoints públicos (não precisam autenticação)
  const publicEndpoints = [
    { path: '/api/auth/csrf', method: 'GET' },
    { path: '/api/auth/providers', method: 'GET' },
    { path: '/api/auth/session', method: 'GET' },
  ];

  // Testa endpoints públicos
  for (const endpoint of publicEndpoints) {
    const result = await benchmarkEndpoint(endpoint.path, endpoint.method);
    results.push(result);
  }

  // Endpoints de páginas (Server Components)
  const pageEndpoints = [
    { path: '/', method: 'GET' },
    { path: '/login', method: 'GET' },
    { path: '/register', method: 'GET' },
    { path: '/tutorial', method: 'GET' },
  ];

  for (const endpoint of pageEndpoints) {
    const result = await benchmarkEndpoint(endpoint.path, endpoint.method);
    results.push(result);
  }

  // Mostra resultados
  printResults(results);

  // Análise de performance
  console.log(`${colors.bright}💡 Análise:${colors.reset}`);
  const slowEndpoints = results.filter(r => r.avg > 300);
  if (slowEndpoints.length > 0) {
    console.log(`${colors.yellow}⚠️  Endpoints lentos (>300ms):${colors.reset}`);
    slowEndpoints.forEach(r => {
      console.log(`   - ${r.method} ${r.endpoint}: ${r.avg.toFixed(2)}ms`);
    });
  } else {
    console.log(`${colors.green}✅ Todos os endpoints responderam em menos de 300ms${colors.reset}`);
  }

  const failedEndpoints = results.filter(r => r.errors > 0);
  if (failedEndpoints.length > 0) {
    console.log(`${colors.red}❌ Endpoints com erros:${colors.reset}`);
    failedEndpoints.forEach(r => {
      console.log(`   - ${r.method} ${r.endpoint}: ${r.errors} erros`);
    });
  }

  console.log();
}

// Executa benchmark
runBenchmark().catch((error) => {
  console.error(`${colors.red}Erro ao executar benchmark:${colors.reset}`, error);
  process.exit(1);
});
