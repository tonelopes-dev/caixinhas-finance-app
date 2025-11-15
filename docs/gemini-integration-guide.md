# Guia Completo: Integração com API do Google Gemini usando Genkit

## 📋 Visão Geral

Este documento explica como integrar a API do Google Gemini em qualquer projeto Node.js/Next.js usando o framework Genkit da Google. A implementação foi feita no projeto Caixinhas Finance App e pode ser replicada em qualquer aplicação.

## 🎯 O que é o Genkit?

O **Genkit** é um framework da Google para desenvolvimento de aplicações com IA generativa. Principais vantagens:

- ✅ **Simplicidade**: Interface unificada para diferentes modelos de IA
- ✅ **Type Safety**: Tipagem forte com Zod schemas
- ✅ **Observabilidade**: Monitoring e debugging integrados
- ✅ **Flows**: Orquestração de workflows complexos
- ✅ **Prompts**: Sistema estruturado de prompts com templates

## 🛠️ Implementação Passo a Passo

### 1. **Instalação das Dependências**

```bash
# Dependências principais
npm install genkit @genkit-ai/google-genai @genkit-ai/next

# Dependências de desenvolvimento  
npm install -D genkit-cli tsx
```

### 2. **Configuração das Variáveis de Ambiente**

Crie ou edite o arquivo `.env`:

```env
# AI - Google Gemini
GEMINI_API_KEY=sua-chave-da-api-gemini-aqui
```

**Como obter a chave da API:**
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 3. **Configuração Base do Genkit**

Crie o arquivo `src/ai/genkit.ts`:

```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash', // ou gemini-1.5-pro para maior capacidade
});
```

### 4. **Arquivo de Inicialização**

Crie o arquivo `src/ai/dev.ts`:

```typescript
'use server';

import { config } from 'dotenv';
config();

// Importa todos os flows que você criar
import '@/ai/flows/financial-report-flow.ts';
import '@/ai/flows/send-email-flow.ts';
```

### 5. **Scripts no Package.json**

Adicione os scripts para desenvolvimento:

```json
{
  "scripts": {
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts"
  }
}
```

### 6. **Criando um Flow de IA**

Exemplo prático - `src/ai/flows/financial-report-flow.ts`:

```typescript
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Definir schemas de entrada e saída
const FinancialReportInputSchema = z.object({
  month: z.string().describe('O mês do relatório (ex: "Julho de 2024")'),
  transactions: z.string().describe('Lista de transações em JSON'),
});

const FinancialReportOutputSchema = z.object({
  analysisHtml: z.string().describe('Análise financeira em HTML'),
});

// 2. Função pública para usar nos componentes
export async function generateFinancialReport(
  input: z.infer<typeof FinancialReportInputSchema>
): Promise<z.infer<typeof FinancialReportOutputSchema>> {
  return generateReportFlow(input);
}

// 3. Definir o prompt estruturado
const reportPrompt = ai.definePrompt({
  name: 'financialReportPrompt',
  input: { schema: FinancialReportInputSchema },
  output: { schema: FinancialReportOutputSchema },
  prompt: `Você é um analista financeiro especializado.
  
Análise o mês de {{month}} com base nestas transações:
{{{transactions}}}

Gere um relatório completo em HTML com:
- Resumo executivo
- Análise de receitas e despesas  
- Recomendações personalizadas
- Use classes Tailwind CSS para estilização
`,
});

// 4. Definir o flow completo
const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: FinancialReportInputSchema,
    outputSchema: FinancialReportOutputSchema,
  },
  async (input) => {
    const { output } = await reportPrompt(input);
    return output!;
  }
);
```

### 7. **Usando nos Componentes React/Next.js**

```typescript
// Em um Server Action - src/app/reports/actions.ts
'use server';

import { generateFinancialReport } from '@/ai/flows/financial-report-flow';

export async function generateNewFinancialReport(
  prevState: any, 
  formData: FormData
) {
  try {
    const result = await generateFinancialReport({
      month: formData.get('month') as string,
      transactions: JSON.stringify(transactionData, null, 2),
    });

    return {
      reportHtml: result.analysisHtml,
      isNewReport: true,
    };
  } catch (error) {
    return { error: 'Erro ao gerar relatório' };
  }
}
```

```typescript
// Em um componente React
'use client';

import { useActionState } from 'react';
import { generateNewFinancialReport } from './actions';

export function ReportPage() {
  const [reportState, generateReportAction] = useActionState(
    generateNewFinancialReport, 
    { reportHtml: null }
  );

  return (
    <form action={generateReportAction}>
      <button type="submit">Gerar Relatório</button>
      {reportState.reportHtml && (
        <div dangerouslySetInnerHTML={{ __html: reportState.reportHtml }} />
      )}
    </form>
  );
}
```

## 🚀 Executando e Testando

### 1. **Iniciar o Genkit Dev Server**

```bash
npm run genkit:dev
```

Acesse: `http://localhost:4000` para o painel do Genkit

### 2. **Testar Flows**

No painel do Genkit você pode:
- ✅ Visualizar todos os flows criados
- ✅ Testar inputs e outputs
- ✅ Ver logs de execução
- ✅ Monitorar performance
- ✅ Debug de prompts

### 3. **Executar seu App**

```bash
npm run dev
```

## 🔧 Configurações Avançadas

### **Diferentes Modelos do Gemini**

```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',  // Rápido e econômico
  // model: 'googleai/gemini-1.5-pro',  // Mais capacidade
});
```

### **Configuração de Rate Limiting**

```typescript
const reportPrompt = ai.definePrompt({
  name: 'financialReportPrompt',
  config: {
    temperature: 0.7,        // Criatividade (0-1)
    maxOutputTokens: 8192,   // Limite de tokens
    topP: 0.8,              // Diversidade
  },
  // ... resto da configuração
});
```

### **Tratamento de Erros**

```typescript
const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: FinancialReportInputSchema,
    outputSchema: FinancialReportOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await reportPrompt(input);
      
      if (!output) {
        throw new Error('Gemini não retornou resposta válida');
      }
      
      return output;
    } catch (error) {
      console.error('Erro no flow:', error);
      throw new Error('Falha na geração do relatório');
    }
  }
);
```

## 📊 Estrutura de Arquivos Recomendada

```
src/
├── ai/
│   ├── genkit.ts           # Configuração base
│   ├── dev.ts             # Arquivo de inicialização
│   └── flows/
│       ├── financial-report-flow.ts
│       ├── email-flow.ts
│       └── chat-flow.ts
├── app/
│   └── reports/
│       ├── page.tsx       # Componente React
│       └── actions.ts     # Server Actions
└── services/
    └── ReportService.ts   # Lógica de negócio
```

## 🔒 Segurança e Boas Práticas

### **1. Proteção da API Key**

```bash
# ✅ CORRETO - No .env
GEMINI_API_KEY=your-api-key-here

# ❌ ERRADO - Nunca no código
const apiKey = "AIza..."; // NUNCA FAÇA ISSO!
```

### **2. Validação de Inputs**

```typescript
const InputSchema = z.object({
  data: z.string().min(1).max(10000), // Limite de tamanho
  userId: z.string().uuid(),          // Validação de formato
});
```

### **3. Rate Limiting**

```typescript
// Implementar throttling em production
const rateLimiter = new Map();

async function checkRateLimit(userId: string) {
  const userLimit = rateLimiter.get(userId) || 0;
  if (userLimit > 10) { // 10 requests por hora
    throw new Error('Rate limit exceeded');
  }
  rateLimiter.set(userId, userLimit + 1);
}
```

## 💰 Considerações de Custo

### **Preços do Gemini (Nov 2024)**

| Modelo | Input (por 1M tokens) | Output (por 1M tokens) |
|--------|----------------------|------------------------|
| Gemini 2.5 Flash | $0.15 | $0.60 |
| Gemini 1.5 Pro | $3.50 | $10.50 |

### **Otimizações de Custo**

```typescript
// 1. Cache de resultados
const cachedResults = new Map();

// 2. Compressão de inputs
const compressedInput = JSON.stringify(data, null, 0);

// 3. Limite de tokens
config: {
  maxOutputTokens: 2048, // Ajuste conforme necessário
}
```

## 🐛 Troubleshooting Comum

### **Erro: "API Key not found"**

```bash
# Verificar se a variável está sendo lida
console.log(process.env.GEMINI_API_KEY); // Deve mostrar sua chave
```

### **Erro: "Model not found"**

```typescript
// Verificar nome do modelo
model: 'googleai/gemini-2.5-flash', // ✅ Correto
model: 'gemini-2.5-flash',          // ❌ Errado
```

### **Timeout nos Requests**

```typescript
// Aumentar timeout se necessário
const result = await Promise.race([
  generateReportFlow(input),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 30000)
  )
]);
```

## 🚀 Deploy em Produção

### **1. Variáveis de Ambiente**

```bash
# No seu provedor (Vercel, Railway, etc.)
GEMINI_API_KEY=sua-chave-de-producao
```

### **2. Monitoring**

```typescript
// Adicionar logs estruturados
console.log('AI Request:', {
  userId,
  model: 'gemini-2.5-flash',
  inputTokens: input.length,
  timestamp: new Date().toISOString(),
});
```

### **3. Caching**

```typescript
// Redis ou similar para cache em produção
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getCachedResult(key: string) {
  return await redis.get(key);
}
```

## 🎯 Casos de Uso Avançados

### **1. Streaming de Responses**

```typescript
const streamingFlow = ai.defineStreamingFlow(
  {
    name: 'chatFlow',
    inputSchema: z.object({ message: z.string() }),
    outputSchema: z.object({ response: z.string() }),
  },
  async function* (input) {
    const stream = await ai.generateStream({
      prompt: input.message,
      model: 'googleai/gemini-2.5-flash',
    });
    
    for await (const chunk of stream) {
      yield { response: chunk.text };
    }
  }
);
```

### **2. Multi-step Workflows**

```typescript
const complexAnalysisFlow = ai.defineFlow(
  {
    name: 'complexAnalysisFlow',
    inputSchema: ComplexInputSchema,
    outputSchema: ComplexOutputSchema,
  },
  async (input) => {
    // Step 1: Análise inicial
    const initialAnalysis = await step1Prompt({ data: input.rawData });
    
    // Step 2: Processamento dos resultados
    const processedData = await processResults(initialAnalysis.output);
    
    // Step 3: Geração do relatório final
    const finalReport = await finalReportPrompt({ 
      analysis: processedData 
    });
    
    return finalReport.output;
  }
);
```

## 📝 Conclusão

Esta integração com o Google Gemini via Genkit oferece:

- ✅ **Facilidade de implementação**
- ✅ **Type safety completo**
- ✅ **Debugging e monitoring**
- ✅ **Escalabilidade**
- ✅ **Flexibilidade para diferentes casos de uso**

O framework Genkit abstrai a complexidade da integração direta com APIs de IA, fornecendo uma interface unificada e ferramentas de desenvolvimento robustas.

---

**Criado por**: GitHub Copilot  
**Data**: 15 de novembro de 2025  
**Projeto**: Caixinhas Finance App  
**Versão**: 1.0