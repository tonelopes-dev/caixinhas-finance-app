# 🏦 Guia de Processamento de Logos dos Bancos

## 🚀 Processamento Automático

### 1. Instalar Dependências
```bash
cd scripts
npm install sharp
```

### 2. Executar Processamento
```bash
# Na raiz do projeto
npm run process-logos
# ou
node scripts/process-bank-logos.js
```

## ✨ O que o Script Faz

### 📏 Padronização
- **Tamanho**: Redimensiona para 128x128px
- **Formato**: Converte para PNG
- **Fundo**: Remove/adiciona transparência
- **Proporção**: Mantém proporção original (fit: contain)
- **Qualidade**: Otimiza para web (compressão inteligente)

### 🔧 Processamento
1. **Lê** todas as imagens em `public/images/banks/`
2. **Processa** cada imagem individualmente
3. **Salva** versões padronizadas em `public/images/banks/processed/`
4. **Relatório** de economia de espaço e estatísticas

### 📊 Formatos Suportados
- JPG/JPEG
- PNG  
- GIF
- BMP
- WebP
- SVG

## 🔍 Visualização

### Acessar Prévia
```
http://localhost:3000/dev/bank-logos
```

### Funcionalidades da Prévia
- ✅ **Busca** por nome ou ID do banco
- ✅ **Tamanhos** diferentes (SM/MD/LG)  
- ✅ **Detecção** de imagens em falta
- ✅ **Estatísticas** de logos carregados
- ✅ **Grid responsivo** para comparação

## 📝 Workflow Recomendado

### 1. Coloque as Imagens
```bash
# Adicione todas as imagens (qualquer formato/tamanho)
public/images/banks/
├── nubank.jpg          # ← Suas imagens originais
├── itau_logo.png       # ← Qualquer nome
├── bradesco-bank.gif   # ← Qualquer formato
└── ...
```

### 2. Execute o Processamento  
```bash
npm run process-logos
```

### 3. Revise os Resultados
```bash
# Verifique as imagens processadas
public/images/banks/processed/
├── nubank.png          # ← 128x128px, otimizado
├── itau_logo.png       # ← Transparente, comprimido  
├── bradesco-bank.png   # ← Padronizado
└── ...
```

### 4. Substitua as Originais
```bash
# Copie as aprovadas de volta
cp public/images/banks/processed/*.png public/images/banks/
rm -rf public/images/banks/processed/
```

### 5. Teste no App
- Acesse `/dev/bank-logos` para visualizar
- Use o `BankSelector` nos formulários
- Verifique se todos os logos carregam corretamente

## 🎯 Resultados Esperados

### ✅ Imagens Padronizadas
- **128x128px** (tamanho consistente)
- **PNG** com transparência
- **Otimizadas** para web (< 10KB cada)
- **Proporção** mantida com padding transparente

### ✅ Performance
- **Carregamento rápido** 
- **Compatibilidade** com Next.js Image
- **Fallback** automático para logo genérico
- **Lazy loading** nativo

### ✅ Manutenibilidade  
- **Nomes consistentes** (sem espaços/caracteres especiais)
- **Estrutura organizada**
- **Fácil adição** de novos bancos
- **Versionamento** simples

## 🚨 Troubleshooting

### Erro: "Sharp not found"
```bash
cd scripts && npm install sharp
```

### Erro: "Permission denied"  
```bash
# Linux/Mac
chmod +x scripts/process-bank-logos.js

# Windows: Execute como Administrador
```

### Imagens Muito Grandes
- O script comprime automaticamente
- Use qualidade 90% para balanço tamanho/qualidade
- PNGs com muitas cores → considere JPG para originais

### SVGs Não Processam
- SVGs são vetoriais, considere manter originais
- Ou converta manualmente para PNG primeiro