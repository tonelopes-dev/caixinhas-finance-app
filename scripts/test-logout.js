#!/usr/bin/env node

/**
 * Script para testar o processo de logout e verificar se há loops de redirecionamento
 */

const { chromium } = require('playwright');

async function testLogoutProcess() {
  console.log('🧪 Iniciando teste de logout...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Habilitar logs do console
    page.on('console', (msg) => {
      console.log('🖥️ Browser Console:', msg.text());
    });

    // Detectar navegação
    page.on('framenavigated', (frame) => {
      console.log('🔄 Navegação:', frame.url());
    });

    // 1. Ir para a página de login
    console.log('📍 Acessando /login...');
    await page.goto('http://localhost:9002/login');
    await page.waitForTimeout(2000);

    // 2. Fazer login (simulado - você pode ajustar conforme necessário)
    console.log('📍 Fazendo login...');
    // Aqui você pode adicionar steps para fazer login real se necessário
    
    // 3. Simular logout direto
    console.log('📍 Simulando logout...');
    await page.goto('http://localhost:9002/api/auth/signout');
    await page.waitForTimeout(3000);

    // 4. Verificar se chegou na página de login sem loops
    const finalUrl = page.url();
    console.log('📍 URL final:', finalUrl);

    if (finalUrl.includes('/login')) {
      console.log('✅ Logout funcionando corretamente - redirecionado para /login');
    } else {
      console.log('❌ Possível problema - URL final inesperada:', finalUrl);
    }

    // 5. Monitorar por 10 segundos para detectar loops
    console.log('🔍 Monitorando por loops por 10 segundos...');
    let navigationCount = 0;
    
    page.on('framenavigated', () => {
      navigationCount++;
      if (navigationCount > 3) {
        console.log('❌ POSSÍVEL LOOP DETECTADO - Muitas navegações!');
      }
    });

    await page.waitForTimeout(10000);

    if (navigationCount <= 1) {
      console.log('✅ Nenhum loop detectado');
    } else {
      console.log(`⚠️ ${navigationCount} navegações detectadas`);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  testLogoutProcess().catch(console.error);
}

module.exports = { testLogoutProcess };