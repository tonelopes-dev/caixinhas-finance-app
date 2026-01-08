/**
 * Script de Benchmark de Navegação
 * 
 * Testa a velocidade de navegação entre páginas com usuário autenticado
 * Identifica se a lentidão está no frontend, backend ou banco de dados
 * 
 * IMPORTANTE: Execute 'npm run dev' antes de rodar este script!
 * 
 * Uso: tsx scripts/benchmark-navigation.ts
 */

import { chromium, Browser, Page } from 'playwright';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:9002';
const TEST_EMAIL = 'clara@caixinhas.app';
const TEST_PASSWORD = 'password123';
const NUM_ITERATIONS = 5; // Número de vezes para repetir o fluxo

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

// Verifica se o servidor está rodando
async function checkServerHealth(): Promise<boolean> {
  try {
    console.log(`${colors.gray}🔍 Verificando se servidor está rodando em ${BASE_URL}...${colors.reset}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/providers`, {
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

interface NavigationMetrics {
  page: string;
  loadTime: number;
  domContentLoaded: number;
  networkIdle: number;
  totalRequests: number;
  failedRequests: number;
  totalSize: number;
  dbQueries: number;
  slowQueries: string[];
}

interface FlowMetrics {
  iteration: number;
  steps: NavigationMetrics[];
  totalTime: number;
}

async function login(page: Page): Promise<void> {
  console.log(`${colors.gray}🔐 Fazendo login...${colors.reset}`);
  
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  
  await Promise.all([
    page.waitForURL(`${BASE_URL}/vaults`, { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  
  console.log(`${colors.green}✅ Login realizado${colors.reset}\n`);
}

async function measureNavigation(
  page: Page,
  targetUrl: string,
  pageName: string
): Promise<NavigationMetrics> {
  const startTime = performance.now();
  
  // Métricas de rede
  let totalRequests = 0;
  let failedRequests = 0;
  let totalSize = 0;
  const dbQueries: string[] = [];
  const slowQueries: string[] = [];

  // Captura requests
  page.on('request', (request) => {
    totalRequests++;
  });

  page.on('response', async (response) => {
    const size = parseInt(response.headers()['content-length'] || '0', 10);
    totalSize += size;

    if (!response.ok()) {
      failedRequests++;
    }
  });

  // Captura logs do console para detectar queries do Prisma
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('prisma:query') || text.includes('Query:')) {
      dbQueries.push(text);
    }
    if (text.includes('slow query') || text.includes('Query took')) {
      slowQueries.push(text);
    }
  });

  // Navega para a página
  const response = await page.goto(targetUrl, {
    waitUntil: 'domcontentloaded',
  });

  const loadTime = performance.now() - startTime;

  // Aguarda DOM content loaded
  await page.waitForLoadState('domcontentloaded');
  const domContentLoaded = performance.now() - startTime;

  // Aguarda network idle
  await page.waitForLoadState('networkidle');
  const networkIdle = performance.now() - startTime;

  return {
    page: pageName,
    loadTime,
    domContentLoaded,
    networkIdle,
    totalRequests,
    failedRequests,
    totalSize,
    dbQueries: dbQueries.length,
    slowQueries,
  };
}

function formatTime(ms: number): string {
  if (ms < 500) return `${colors.green}${ms.toFixed(0)}ms${colors.reset}`;
  if (ms < 1500) return `${colors.yellow}${ms.toFixed(0)}ms${colors.reset}`;
  return `${colors.red}${ms.toFixed(0)}ms${colors.reset}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

async function runNavigationFlow(browser: Browser, iteration: number): Promise<FlowMetrics> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log(`${colors.bright}${colors.cyan}🔄 Iteração ${iteration}/${NUM_ITERATIONS}${colors.reset}`);
  
  const steps: NavigationMetrics[] = [];
  const flowStartTime = performance.now();

  try {
    // Login
    await login(page);

    // Fluxo de navegação real do usuário
    const navigationFlow = [
      { url: `${BASE_URL}/vaults`, name: 'Dashboard (inicial)' },
      { url: `${BASE_URL}/goals`, name: 'Caixinhas' },
      { url: `${BASE_URL}/vaults`, name: 'Dashboard (retorno 1)' },
      { url: `${BASE_URL}/transactions`, name: 'Transações' },
      { url: `${BASE_URL}/vaults`, name: 'Dashboard (retorno 2)' },
      { url: `${BASE_URL}/reports`, name: 'Relatórios' },
      { url: `${BASE_URL}/vaults`, name: 'Dashboard (retorno 3)' },
      { url: `${BASE_URL}/tutorial`, name: 'Tutorial' },
      { url: `${BASE_URL}/vaults`, name: 'Dashboard (retorno 4)' },
    ];

    for (const step of navigationFlow) {
      console.log(`${colors.gray}  → Navegando para ${step.name}...${colors.reset}`);
      const metrics = await measureNavigation(page, step.url, step.name);
      steps.push(metrics);
      
      // Pequeno delay para simular comportamento humano
      await page.waitForTimeout(500);
    }

  } catch (error) {
    console.error(`${colors.red}Erro na iteração ${iteration}:${colors.reset}`, error);
  } finally {
    await context.close();
  }

  const totalTime = performance.now() - flowStartTime;

  return {
    iteration,
    steps,
    totalTime,
  };
}

function printDetailedResults(flows: FlowMetrics[]) {
  console.log(`\n${colors.bright}${colors.cyan}📊 Resultados Detalhados por Página${colors.reset}`);
  console.log(`${colors.gray}${'='.repeat(100)}${colors.reset}\n`);

  // Agrupa métricas por página
  const pageMetrics = new Map<string, NavigationMetrics[]>();
  
  flows.forEach(flow => {
    flow.steps.forEach(step => {
      if (!pageMetrics.has(step.page)) {
        pageMetrics.set(step.page, []);
      }
      pageMetrics.get(step.page)!.push(step);
    });
  });

  // Calcula médias por página
  pageMetrics.forEach((metrics, pageName) => {
    const avgLoad = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
    const avgDom = metrics.reduce((sum, m) => sum + m.domContentLoaded, 0) / metrics.length;
    const avgNetwork = metrics.reduce((sum, m) => sum + m.networkIdle, 0) / metrics.length;
    const avgRequests = metrics.reduce((sum, m) => sum + m.totalRequests, 0) / metrics.length;
    const avgSize = metrics.reduce((sum, m) => sum + m.totalSize, 0) / metrics.length;
    const totalFailed = metrics.reduce((sum, m) => sum + m.failedRequests, 0);
    const avgDbQueries = metrics.reduce((sum, m) => sum + m.dbQueries, 0) / metrics.length;

    console.log(`${colors.bright}${pageName}${colors.reset}`);
    console.log(`  Tempo inicial:        ${formatTime(avgLoad)}`);
    console.log(`  DOM carregado:        ${formatTime(avgDom)}`);
    console.log(`  Rede estável:         ${formatTime(avgNetwork)}`);
    console.log(`  Requests (média):     ${avgRequests.toFixed(0)}`);
    console.log(`  Tamanho transferido:  ${formatSize(avgSize)}`);
    console.log(`  Queries DB (média):   ${avgDbQueries.toFixed(1)}`);
    
    if (totalFailed > 0) {
      console.log(`  ${colors.red}Falhas:               ${totalFailed}${colors.reset}`);
    }
    
    console.log();
  });
}

function printAnalysis(flows: FlowMetrics[]) {
  console.log(`${colors.gray}${'='.repeat(100)}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}🔍 Análise de Performance${colors.reset}\n`);

  // Identifica páginas mais lentas
  const allSteps = flows.flatMap(f => f.steps);
  const slowPages = allSteps
    .filter(s => s.networkIdle > 2000)
    .sort((a, b) => b.networkIdle - a.networkIdle)
    .slice(0, 5);

  if (slowPages.length > 0) {
    console.log(`${colors.red}⚠️  Páginas Mais Lentas (>2s):${colors.reset}`);
    slowPages.forEach(page => {
      console.log(`   ${page.page}: ${formatTime(page.networkIdle)}`);
    });
    console.log();
  }

  // Analisa tempo de retorno ao Dashboard
  const dashboardReturns = allSteps.filter(s => s.page.includes('retorno'));
  if (dashboardReturns.length > 0) {
    const avgReturnTime = dashboardReturns.reduce((sum, s) => sum + s.networkIdle, 0) / dashboardReturns.length;
    console.log(`${colors.cyan}🏠 Tempo Médio de Retorno ao Dashboard:${colors.reset}`);
    console.log(`   ${formatTime(avgReturnTime)}`);
    
    if (avgReturnTime > 1500) {
      console.log(`   ${colors.red}❌ PROBLEMA: Dashboard está demorando para recarregar${colors.reset}`);
      console.log(`   ${colors.yellow}💡 Possíveis causas:${colors.reset}`);
      console.log(`      - Queries do banco muito lentas`);
      console.log(`      - Muitos dados sendo carregados`);
      console.log(`      - Cache não está funcionando`);
      console.log(`      - Server Components refazendo todo o trabalho`);
    } else {
      console.log(`   ${colors.green}✅ Dashboard carrega rapidamente${colors.reset}`);
    }
    console.log();
  }

  // Analisa queries do banco
  const totalDbQueries = allSteps.reduce((sum, s) => sum + s.dbQueries, 0);
  const avgQueriesPerPage = totalDbQueries / allSteps.length;
  
  console.log(`${colors.cyan}💾 Análise do Banco de Dados:${colors.reset}`);
  console.log(`   Queries totais: ${totalDbQueries}`);
  console.log(`   Média por página: ${avgQueriesPerPage.toFixed(1)}`);
  
  if (avgQueriesPerPage > 5) {
    console.log(`   ${colors.yellow}⚠️  Muitas queries por página (>${avgQueriesPerPage.toFixed(1)})${colors.reset}`);
    console.log(`   ${colors.yellow}💡 Considere usar:${colors.reset}`);
    console.log(`      - Prisma includes para reduzir N+1 queries`);
    console.log(`      - Cache de dados`);
    console.log(`      - Aggregate queries`);
  } else {
    console.log(`   ${colors.green}✅ Número de queries está bom${colors.reset}`);
  }
  console.log();

  // Análise de transferência de dados
  const avgDataTransfer = allSteps.reduce((sum, s) => sum + s.totalSize, 0) / allSteps.length;
  console.log(`${colors.cyan}📦 Transferência de Dados:${colors.reset}`);
  console.log(`   Tamanho médio por página: ${formatSize(avgDataTransfer)}`);
  
  if (avgDataTransfer > 1024 * 500) { // >500KB
    console.log(`   ${colors.yellow}⚠️  Páginas pesadas (>${formatSize(avgDataTransfer)})${colors.reset}`);
    console.log(`   ${colors.yellow}💡 Considere:${colors.reset}`);
    console.log(`      - Otimizar imagens`);
    console.log(`      - Code splitting`);
    console.log(`      - Lazy loading de componentes`);
  } else {
    console.log(`   ${colors.green}✅ Tamanho das páginas está otimizado${colors.reset}`);
  }
  console.log();

  // Tempo total de fluxo
  const avgFlowTime = flows.reduce((sum, f) => sum + f.totalTime, 0) / flows.length;
  console.log(`${colors.cyan}⏱️  Tempo Total do Fluxo Completo:${colors.reset}`);
  console.log(`   Média: ${formatTime(avgFlowTime)}`);
  
  if (avgFlowTime > 15000) {
    console.log(`   ${colors.red}❌ PROBLEMA: Fluxo completo muito demorado${colors.reset}`);
  } else if (avgFlowTime > 10000) {
    console.log(`   ${colors.yellow}⚠️  Fluxo pode ser otimizado${colors.reset}`);
  } else {
    console.log(`   ${colors.green}✅ Fluxo está rápido${colors.reset}`);
  }
  console.log();
}

function printRecommendations(flows: FlowMetrics[]) {
  console.log(`${colors.gray}${'='.repeat(100)}${colors.reset}`);
  console.log(`${colors.bright}${colors.green}💡 Recomendações${colors.reset}\n`);

  const allSteps = flows.flatMap(f => f.steps);
  const avgNetworkTime = allSteps.reduce((sum, s) => sum + s.networkIdle, 0) / allSteps.length;

  console.log(`${colors.cyan}Para melhorar a performance:${colors.reset}\n`);

  if (avgNetworkTime > 1500) {
    console.log(`${colors.yellow}1. FRONTEND/BACKEND:${colors.reset}`);
    console.log(`   - Implementar Server Actions para mutations`);
    console.log(`   - Usar React.cache() para deduplicate requests`);
    console.log(`   - Implementar loading states melhores`);
    console.log(`   - Usar Suspense boundaries estrategicamente\n`);
  }

  console.log(`${colors.yellow}2. BANCO DE DADOS:${colors.reset}`);
  console.log(`   - Verificar índices nas tabelas mais usadas:`);
  console.log(`     → Vault.ownerId, VaultMember.userId, VaultMember.vaultId`);
  console.log(`     → Goal.userId, Goal.vaultId`);
  console.log(`     → Transaction.userId, Transaction.vaultId`);
  console.log(`   - Usar Prisma.include() ao invés de queries separadas`);
  console.log(`   - Considerar cache com Redis para dados frequentes\n`);

  console.log(`${colors.yellow}3. OTIMIZAÇÕES GERAIS:${colors.reset}`);
  console.log(`   - Implementar ISR (Incremental Static Regeneration)`);
  console.log(`   - Usar Next.js Image para otimização de imagens`);
  console.log(`   - Implementar prefetch nas navegações principais`);
  console.log(`   - Considerar usar tRPC para type-safe APIs\n`);
}

async function runBenchmark() {
  console.log(`${colors.bright}${colors.cyan}🚀 Benchmark de Navegação entre Páginas${colors.reset}`);
  console.log(`${colors.gray}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.gray}Iterações: ${NUM_ITERATIONS}${colors.reset}`);
  console.log(`${colors.gray}${'='.repeat(100)}${colors.reset}\n`);

  // Verifica se o servidor está funcionando
  const serverIsUp = await checkServerHealth();
  if (!serverIsUp) {
    console.log(`${colors.red}🚫 Abortando benchmark - servidor não está acessível${colors.reset}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ 
    headless: true,
  });

  const flows: FlowMetrics[] = [];

  try {
    for (let i = 1; i <= NUM_ITERATIONS; i++) {
      const flow = await runNavigationFlow(browser, i);
      flows.push(flow);
      
      console.log(`${colors.green}✅ Iteração ${i} concluída em ${formatTime(flow.totalTime)}${colors.reset}\n`);
    }

    // Imprime resultados
    printDetailedResults(flows);
    printAnalysis(flows);
    printRecommendations(flows);

  } catch (error) {
    console.error(`${colors.red}Erro ao executar benchmark:${colors.reset}`, error);
  } finally {
    await browser.close();
  }
}

// Executa
runBenchmark().catch(console.error);
