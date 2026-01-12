#!/usr/bin/env node

/**
 * Script para padronizar logos de bancos
 * Converte todas as imagens para PNG 128x128px com fundo transparente
 * 
 * Uso: node scripts/process-bank-logos.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const BANKS_DIR = path.join(__dirname, '../public/images/banks');
const PROCESSED_DIR = path.join(BANKS_DIR, 'processed');
const TARGET_SIZE = 128;

// Configurações de processamento
const PROCESS_CONFIG = {
  width: TARGET_SIZE,
  height: TARGET_SIZE,
  fit: 'contain', // Mantém proporção dentro do quadrado
  background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fundo transparente
};

async function ensureDirectories() {
  try {
    await fs.access(BANKS_DIR);
  } catch {
    console.log('📁 Criando diretório de bancos...');
    await fs.mkdir(BANKS_DIR, { recursive: true });
  }

  try {
    await fs.access(PROCESSED_DIR);
  } catch {
    console.log('📁 Criando diretório de processados...');
    await fs.mkdir(PROCESSED_DIR, { recursive: true });
  }
}

async function processImage(filePath, outputPath) {
  try {
    const stats = await fs.stat(filePath);
    console.log(`📸 Processando: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(1)}KB)`);

    await sharp(filePath)
      .resize(PROCESS_CONFIG.width, PROCESS_CONFIG.height, {
        fit: PROCESS_CONFIG.fit,
        background: PROCESS_CONFIG.background
      })
      .png({ 
        quality: 90,
        compressionLevel: 9,
        palette: true // Reduz tamanho para logos simples
      })
      .toFile(outputPath);

    const processedStats = await fs.stat(outputPath);
    console.log(`✅ Processado: ${path.basename(outputPath)} (${(processedStats.size / 1024).toFixed(1)}KB)`);
    
    return {
      original: stats.size,
      processed: processedStats.size,
      saved: stats.size - processedStats.size
    };
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return null;
  }
}

async function processAllImages() {
  console.log('🚀 Iniciando processamento de logos dos bancos...\n');
  
  await ensureDirectories();
  
  // Ler todos os arquivos do diretório
  const files = await fs.readdir(BANKS_DIR);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file) && 
    !file.startsWith('.') &&
    file !== 'processed'
  );

  if (imageFiles.length === 0) {
    console.log('⚠️ Nenhuma imagem encontrada em public/images/banks/');
    console.log('📋 Coloque as imagens dos bancos nesta pasta e execute novamente.');
    return;
  }

  console.log(`📊 Encontradas ${imageFiles.length} imagens para processar:\n`);

  let totalOriginal = 0;
  let totalProcessed = 0;
  let successCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(BANKS_DIR, file);
    const outputFileName = path.basename(file, path.extname(file)) + '.png';
    const outputPath = path.join(PROCESSED_DIR, outputFileName);

    const result = await processImage(inputPath, outputPath);
    
    if (result) {
      totalOriginal += result.original;
      totalProcessed += result.processed;
      successCount++;
    }

    console.log(''); // Linha em branco
  }

  // Resumo final
  console.log('📈 RESUMO DO PROCESSAMENTO:');
  console.log(`✅ Imagens processadas: ${successCount}/${imageFiles.length}`);
  console.log(`📦 Tamanho original: ${(totalOriginal / 1024).toFixed(1)}KB`);
  console.log(`📦 Tamanho final: ${(totalProcessed / 1024).toFixed(1)}KB`);
  console.log(`💾 Economia: ${((totalOriginal - totalProcessed) / 1024).toFixed(1)}KB (${(((totalOriginal - totalProcessed) / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`\n📁 Imagens processadas salvas em: ${PROCESSED_DIR}`);
  console.log('\n🔄 Próximos passos:');
  console.log('1. Revise as imagens processadas');
  console.log('2. Copie as aprovadas de volta para public/images/banks/');
  console.log('3. Delete a pasta processed/ quando terminar');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  processAllImages().catch(console.error);
}

module.exports = { processAllImages };