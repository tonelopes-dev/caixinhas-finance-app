# Exemplos Práticos de Integração Gemini + Genkit

## 🎯 Casos de Uso Reais

### 1. **Gerador de Relatórios Financeiros**

**Cenário**: Analisar transações bancárias e gerar insights.

```typescript
// src/ai/flows/financial-analysis-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  type: z.enum(['income', 'expense', 'transfer']),
});

const FinancialAnalysisInputSchema = z.object({
  transactions: z.array(TransactionSchema),
  month: z.string(),
  userId: z.string(),
});

const FinancialAnalysisOutputSchema = z.object({
  healthScore: z.number().min(0).max(100),
  summary: z.string(),
  recommendations: z.array(z.string()),
  categoryBreakdown: z.record(z.number()),
  htmlReport: z.string(),
});

export async function analyzeFinances(
  input: z.infer<typeof FinancialAnalysisInputSchema>
): Promise<z.infer<typeof FinancialAnalysisOutputSchema>> {
  return financialAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'financialAnalysisPrompt',
  input: { schema: FinancialAnalysisInputSchema },
  output: { schema: FinancialAnalysisOutputSchema },
  config: {
    temperature: 0.3, // Baixa para análises mais consistentes
    maxOutputTokens: 4096,
  },
  prompt: `Você é um consultor financeiro expert. Analise as transações de {{month}}:

{{#each transactions}}
- {{date}}: {{description}} - R$ {{amount}} ({{category}})
{{/each}}

Forneça:
1. healthScore: Pontuação de 0-100 baseada em:
   - Relação receita/despesa
   - Diversificação de gastos
   - Tendências de poupança
   
2. summary: Resumo executivo em português (máx 200 palavras)

3. recommendations: 3-5 recomendações específicas

4. categoryBreakdown: Percentual por categoria

5. htmlReport: Relatório completo em HTML com Tailwind CSS`,
});

const financialAnalysisFlow = ai.defineFlow(
  {
    name: 'financialAnalysisFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    return output!;
  }
);
```

### 2. **Assistente de Chat Inteligente**

**Cenário**: Chat contextual com histórico de conversas.

```typescript
// src/ai/flows/chat-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
});

const ChatInputSchema = z.object({
  message: z.string(),
  userId: z.string(),
  conversationHistory: z.array(MessageSchema).optional(),
  context: z.object({
    userProfile: z.string().optional(),
    currentPage: z.string().optional(),
    userPreferences: z.record(z.string()).optional(),
  }).optional(),
});

const ChatOutputSchema = z.object({
  response: z.string(),
  actions: z.array(z.object({
    type: z.string(),
    data: z.record(z.unknown()),
  })).optional(),
  confidence: z.number().min(0).max(1),
});

export async function chatWithAssistant(
  input: z.infer<typeof ChatInputSchema>
): Promise<z.infer<typeof ChatOutputSchema>> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  config: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  },
  prompt: `Você é um assistente financeiro especializado no app Caixinhas.

Contexto do usuário:
{{#if context.userProfile}}Perfil: {{context.userProfile}}{{/if}}
{{#if context.currentPage}}Página atual: {{context.currentPage}}{{/if}}

{{#if conversationHistory}}
Histórico da conversa:
{{#each conversationHistory}}
{{role}}: {{content}}
{{/each}}
{{/if}}

Mensagem atual: {{message}}

Responda de forma:
- Amigável e profissional
- Específica ao contexto financeiro
- Com ações práticas quando apropriado
- Em português brasileiro

Se puder sugerir ações específicas no app, inclua no campo 'actions'.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);
```

### 3. **Gerador de Emails Personalizados**

**Cenário**: Emails automáticos baseados em eventos do usuário.

```typescript
// src/ai/flows/email-generation-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EmailContextSchema = z.object({
  eventType: z.enum(['welcome', 'report_ready', 'goal_achieved', 'budget_alert']),
  userName: z.string(),
  userEmail: z.string(),
  data: z.record(z.unknown()),
  preferences: z.object({
    language: z.string().default('pt-BR'),
    tone: z.enum(['formal', 'casual', 'friendly']).default('friendly'),
  }).optional(),
});

const EmailOutputSchema = z.object({
  subject: z.string(),
  htmlBody: z.string(),
  textBody: z.string(),
  priority: z.enum(['low', 'normal', 'high']),
});

export async function generatePersonalizedEmail(
  input: z.infer<typeof EmailContextSchema>
): Promise<z.infer<typeof EmailOutputSchema>> {
  return emailGenerationFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'emailGenerationPrompt',
  input: { schema: EmailContextSchema },
  output: { schema: EmailOutputSchema },
  config: {
    temperature: 0.4,
    maxOutputTokens: 2048,
  },
  prompt: `Gere um email personalizado para {{userName}} ({{userEmail}}).

Tipo de evento: {{eventType}}
Tom: {{preferences.tone}}
Dados do contexto: {{data}}

{{#if eventType == 'welcome'}}
Email de boas-vindas caloroso, explicando os próximos passos.
{{/if}}

{{#if eventType == 'report_ready'}}
Notificação de que o relatório financeiro está pronto para visualização.
{{/if}}

{{#if eventType == 'goal_achieved'}}
Parabenização pela conquista da meta financeira.
{{/if}}

{{#if eventType == 'budget_alert'}}
Alerta amigável sobre gastos próximos ao limite.
{{/if}}

Requisitos:
- Subject: Atrativo e específico (máx 60 caracteres)
- htmlBody: HTML responsivo com CSS inline
- textBody: Versão em texto puro
- priority: Baseada na urgência do evento
- Tom brasileiro e profissional`,
});

const emailGenerationFlow = ai.defineFlow(
  {
    name: 'emailGenerationFlow',
    inputSchema: EmailContextSchema,
    outputSchema: EmailOutputSchema,
  },
  async (input) => {
    const { output } = await emailPrompt(input);
    return output!;
  }
);
```

### 4. **Analisador de Categorização Automática**

**Cenário**: Categorizar transações automaticamente.

```typescript
// src/ai/flows/transaction-categorization-flow.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionCategorizationInputSchema = z.object({
  description: z.string(),
  amount: z.number(),
  merchant: z.string().optional(),
  date: z.string(),
  userId: z.string(),
  previousTransactions: z.array(z.object({
    description: z.string(),
    category: z.string(),
  })).optional(),
});

const TransactionCategorizationOutputSchema = z.object({
  category: z.string(),
  subcategory: z.string().optional(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  suggestedTags: z.array(z.string()).optional(),
});

export async function categorizeTransaction(
  input: z.infer<typeof TransactionCategorizationInputSchema>
): Promise<z.infer<typeof TransactionCategorizationOutputSchema>> {
  return categorizationFlow(input);
}

const categorizationPrompt = ai.definePrompt({
  name: 'transactionCategorizationPrompt',
  input: { schema: TransactionCategorizationInputSchema },
  output: { schema: TransactionCategorizationOutputSchema },
  config: {
    temperature: 0.1, // Muito baixa para consistência
    maxOutputTokens: 512,
  },
  prompt: `Categorize esta transação financeira:

Descrição: {{description}}
Valor: R$ {{amount}}
{{#if merchant}}Estabelecimento: {{merchant}}{{/if}}
Data: {{date}}

{{#if previousTransactions}}
Transações similares do usuário:
{{#each previousTransactions}}
- "{{description}}" → {{category}}
{{/each}}
{{/if}}

Categorias disponíveis:
- Moradia (aluguel, condomínio, IPTU)
- Alimentação (mercado, restaurantes, delivery)
- Transporte (combustível, transporte público, uber)
- Saúde (médicos, farmácias, planos)
- Educação (cursos, livros, escolas)
- Lazer (cinema, viagens, hobbies)
- Vestuário (roupas, calçados)
- Tecnologia (eletrônicos, software, internet)
- Investimentos (aplicações, ações)
- Renda (salário, freelances, vendas)
- Transferências (PIX, TED, família)
- Outros

Seja consistente com o histórico do usuário quando disponível.`,
});

const categorizationFlow = ai.defineFlow(
  {
    name: 'categorizationFlow',
    inputSchema: TransactionCategorizationInputSchema,
    outputSchema: TransactionCategorizationOutputSchema,
  },
  async (input) => {
    const { output } = await categorizationPrompt(input);
    return output!;
  }
);
```

## 🔧 Configurações de Produção

### **Rate Limiting Inteligente**

```typescript
// src/lib/rate-limiter.ts
import { Redis } from 'ioredis';

class AIRateLimiter {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  async checkLimit(userId: string, operation: string): Promise<boolean> {
    const key = `ai_limit:${userId}:${operation}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, 3600); // 1 hora
    }
    
    // Diferentes limites por operação
    const limits = {
      chat: 50,
      report: 10,
      categorization: 100,
      email: 5,
    };
    
    return current <= (limits[operation] || 10);
  }
}

export const rateLimiter = new AIRateLimiter();
```

### **Cache Inteligente com TTL**

```typescript
// src/lib/ai-cache.ts
import { Redis } from 'ioredis';
import crypto from 'crypto';

class AICache {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  private generateKey(operation: string, input: any): string {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(input))
      .digest('hex');
    return `ai_cache:${operation}:${hash}`;
  }
  
  async get<T>(operation: string, input: any): Promise<T | null> {
    const key = this.generateKey(operation, input);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set<T>(operation: string, input: any, result: T, ttlSeconds = 3600): Promise<void> {
    const key = this.generateKey(operation, input);
    await this.redis.setex(key, ttlSeconds, JSON.stringify(result));
  }
}

export const aiCache = new AICache();
```

### **Uso do Cache nos Flows**

```typescript
// Exemplo de uso do cache
const financialAnalysisFlow = ai.defineFlow(
  {
    name: 'financialAnalysisFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async (input) => {
    // Verificar cache primeiro
    const cached = await aiCache.get('financial_analysis', input);
    if (cached) {
      return cached;
    }
    
    // Rate limiting
    if (!(await rateLimiter.checkLimit(input.userId, 'report'))) {
      throw new Error('Rate limit exceeded');
    }
    
    // Executar prompt
    const { output } = await analysisPrompt(input);
    
    // Salvar no cache (TTL de 1 hora para relatórios)
    await aiCache.set('financial_analysis', input, output, 3600);
    
    return output!;
  }
);
```

## 📊 Monitoramento e Analytics

### **Logger Estruturado**

```typescript
// src/lib/ai-logger.ts
interface AILogEvent {
  operation: string;
  userId: string;
  inputTokens: number;
  outputTokens: number;
  duration: number;
  cost: number;
  success: boolean;
  error?: string;
}

export class AILogger {
  static async log(event: AILogEvent) {
    // Log estruturado para análise
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: event.success ? 'info' : 'error',
      service: 'ai',
      ...event,
    }));
    
    // Enviar para sistema de monitoramento (DataDog, New Relic, etc.)
    if (process.env.NODE_ENV === 'production') {
      // await sendToMonitoring(event);
    }
  }
}
```

### **Wrapper com Métricas**

```typescript
// src/lib/ai-wrapper.ts
export function withMetrics<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    const userId = extractUserId(args);
    
    try {
      const result = await fn(...args);
      
      await AILogger.log({
        operation,
        userId,
        inputTokens: estimateTokens(args),
        outputTokens: estimateTokens([result]),
        duration: Date.now() - startTime,
        cost: calculateCost(operation, args, result),
        success: true,
      });
      
      return result;
    } catch (error) {
      await AILogger.log({
        operation,
        userId,
        inputTokens: estimateTokens(args),
        outputTokens: 0,
        duration: Date.now() - startTime,
        cost: 0,
        success: false,
        error: error.message,
      });
      
      throw error;
    }
  };
}

// Uso
export const analyzeFinances = withMetrics(
  'financial_analysis',
  analyzeFinancesRaw
);
```

## 🚀 Deploy e Escalabilidade

### **Docker Configuration**

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Environment
ENV NODE_ENV=production
ENV GEMINI_API_KEY=""

EXPOSE 3000

CMD ["npm", "start"]
```

### **Kubernetes Deployment**

```yaml
# k8s/ai-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-service
  template:
    metadata:
      labels:
        app: ai-service
    spec:
      containers:
      - name: ai-service
        image: your-registry/ai-service:latest
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: gemini-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

---

**Esta documentação fornece exemplos práticos e prontos para uso em qualquer projeto que precise integrar com a API do Google Gemini usando o framework Genkit.**