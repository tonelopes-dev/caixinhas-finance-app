# 📧 Guia de Testes de Email - Caixinhas App

## Visão Geral

Este guia documenta a estratégia completa de testes para o sistema de emails do Caixinhas App, garantindo que todos os tipos de emails sejam enviados corretamente com dados dinâmicos validados.

## 📋 Templates de Email Disponíveis

### 1. Email de Boas-vindas (`welcome-email.ts`)
**Gatilho:** Novo usuário cria conta  
**Dados Dinâmicos:**
- `userName` - Nome do usuário
- `userEmail` - Email do usuário
- `temporaryPassword` - Senha temporária gerada

**Link Principal:** Login no app

### 2. Email de Convite (`invite-template.ts`)
**Gatilho:** Usuário convida alguém para um cofre  
**Dados Dinâmicos:**
- `inviterName` - Nome de quem está convidando
- `vaultName` - Nome do cofre
- `inviteLink` - Link único para aceitar convite

**Link Principal:** Aceitar convite

### 3. Email de Redefinição de Senha (`password-reset-template.ts`)
**Gatilho:** Usuário solicita recuperação de senha  
**Dados Dinâmicos:**
- `userName` - Nome do usuário
- `resetLink` - Link com token de reset (expira em 24h)

**Link Principal:** Redefinir senha

### 4. Email de Confirmação de Assinatura (`subscription-confirmation-email.ts`)
**Gatilho:** Webhook da Kiwify confirma pagamento  
**Dados Dinâmicos:**
- `userName` - Nome do assinante
- `plan` - Tipo de plano (mensal, trimestral, semestral, anual)
- `expirationDate` - Data de expiração da assinatura

**Link Principal:** Acessar conta

### 5. Email de Celebração de Objetivo (`goal-celebration-email.ts`)
**Gatilho:** Usuário atinge 100% de um objetivo  
**Dados Dinâmicos:**
- `userName` - Nome do usuário
- `goalName` - Nome do objetivo alcançado
- `achievedAmount` - Valor total alcançado (formatado)

**Link Principal:** Ver objetivos

### 6. Email de Marco de Progresso (`milestone-email.ts`)
**Gatilho:** Usuário atinge 25%, 50%, 75%, ou 90% de um objetivo  
**Dados Dinâmicos:**
- `userName` - Nome do usuário
- `goalName` - Nome do objetivo
- `progress` - Percentual alcançado (número)
- `currentAmount` - Valor atual (formatado)
- `targetAmount` - Valor meta (formatado)

**Link Principal:** Ver objetivo

## 🧪 Estratégia de Testes

### Nível 1: Testes de Integração (Jest)

#### 1.1 Validação de Templates (`__tests__/integration/email-templates.test.ts`)
```bash
npm run test:integration
```

**O que testa:**
- ✅ Todos os dados dinâmicos são substituídos corretamente
- ✅ Links estão no formato correto (HTTPS)
- ✅ HTML gerado é válido
- ✅ Segurança contra XSS (injeção de scripts)
- ✅ Caracteres especiais são tratados
- ✅ Headers e footers estão presentes
- ✅ Formatação de valores monetários
- ✅ Percentuais de progresso corretos

**Cobertura:** 50+ assertions em 6 templates

#### 1.2 Validação de Serviço de Email (`__tests__/integration/email-service.test.ts`)
```bash
npm run test:integration
```

**O que testa:**
- ✅ SendGrid é chamado com parâmetros corretos
- ✅ Versão texto é gerada automaticamente
- ✅ ReplyTo é incluído quando fornecido
- ✅ Retorna false quando API key não configurada
- ✅ Tratamento de erros do SendGrid
- ✅ Validação de endereços de email
- ✅ Configurações de ambiente (FROM_EMAIL, FROM_NAME)

**Cobertura:** 30+ test cases

### Nível 2: Testes E2E (Playwright)

#### 2.1 Fluxos de Envio (`tests/emails.spec.ts`)
```bash
npm run test:e2e:emails
```

**O que testa:**
- ✅ Email disparado ao criar conta
- ✅ Email disparado ao enviar convite
- ✅ Email disparado ao solicitar reset de senha
- ✅ Convites duplicados são bloqueados
- ✅ Links de reset expiram corretamente
- ✅ Validação de formato de email
- ✅ Segurança contra injeção de HTML
- ✅ Links sempre usam HTTPS

**Cobertura:** 17 test cases E2E

### Nível 3: Validação Visual e Manual

#### 3.1 Preview de Templates (`scripts/test-all-email-templates.ts`)
```bash
# Gerar HTML para inspeção visual
npm run test:email:templates

# Enviar emails de teste reais
npm run test:email:send
```

**O que faz:**
1. ✅ Gera todos os 6 templates com dados realistas
2. ✅ Valida que todos os campos dinâmicos foram preenchidos
3. ✅ Salva arquivos HTML em `__email-previews__/`
4. ✅ Cria index.html para navegação fácil
5. ✅ Opcionalmente envia emails reais via SendGrid

**Output:**
```
__email-previews__/
├── index.html               # Índice clicável
├── invite.html              # Preview de convite
├── password-reset.html      # Preview de reset
├── welcome.html             # Preview de boas-vindas
├── subscription-confirmation.html
├── goal-celebration.html
└── milestone.html
```

## 🚀 Como Executar os Testes

### Setup Inicial
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (.env)
SENDGRID_API_KEY=sua_api_key_aqui
SENDGRID_FROM_EMAIL=suporte@caixinhas.app
SENDGRID_FROM_NAME=Caixinhas Finance
TEST_EMAIL=seu-email@example.com  # Para testes reais
```

### Execução

#### 1. Testes Rápidos (Integração)
```bash
# Rodar todos os testes de integração (incluindo emails)
npm run test:integration

# Apenas templates de email
npx jest __tests__/integration/email-templates.test.ts

# Apenas serviço de email
npx jest __tests__/integration/email-service.test.ts
```

#### 2. Testes E2E (Completos)
```bash
# Todos os testes E2E de email
npm run test:e2e:emails

# Com interface visual
npx playwright test tests/emails.spec.ts --ui

# Com navegador visível
npx playwright test tests/emails.spec.ts --headed
```

#### 3. Validação Visual
```bash
# Gerar previews HTML (não envia emails)
npm run test:email:templates

# Abrir o index.html gerado
# Localize: __email-previews__/index.html no navegador

# Enviar emails de teste reais
npm run test:email:send

# Especificar email de destino
TEST_EMAIL=seu-email@example.com npm run test:email:send
```

#### 4. Suite Completa
```bash
# Rodar TODOS os testes (unit + integration + E2E)
npm run test:all

# Adicionar validação visual
npm run test:email:templates
```

## 📊 Relatório de Cobertura

### Templates Cobertos: 6/6 (100%)
- ✅ welcome-email.ts
- ✅ invite-template.ts
- ✅ password-reset-template.ts
- ✅ subscription-confirmation-email.ts
- ✅ goal-celebration-email.ts
- ✅ milestone-email.ts

### Componentes Compartilhados: 2/2 (100%)
- ✅ email-header.ts
- ✅ email-footer.ts

### Fluxos de Envio: 6/6 (100%)
- ✅ Cadastro → Boas-vindas
- ✅ Convite → Notificação de convite
- ✅ Esqueceu senha → Reset de senha
- ✅ Pagamento → Confirmação de assinatura
- ✅ Objetivo 100% → Celebração
- ✅ Marco atingido → Milestone

## 🔒 Validações de Segurança

Todos os templates são testados para:

1. **XSS Protection** - Scripts maliciosos não são executados
2. **HTTPS Only** - Todos os links usam protocolo seguro
3. **Token Security** - Tokens de reset/convite são únicos e expiram
4. **Email Validation** - Formato de email é validado antes de envio
5. **HTML Escaping** - Caracteres especiais são tratados corretamente

## 🎯 Checklist de Teste

Antes de deploy, execute:

```bash
# 1. Testes automatizados
npm run test:integration        # ✅ Testes unitários de templates
npm run test:e2e:emails         # ✅ Testes E2E de fluxos

# 2. Validação visual
npm run test:email:templates    # ✅ Gerar previews HTML
# → Abrir __email-previews__/index.html
# → Inspecionar cada template visualmente

# 3. Teste real (staging)
TEST_EMAIL=seu-email@example.com npm run test:email:send
# → Verificar recebimento em caixa de entrada
# → Clicar em todos os links
# → Validar formatação em diferentes clients (Gmail, Outlook, etc.)

# 4. Validação final
npm run test:all                # ✅ Suite completa
```

## 🐛 Debugging

### Email não enviado?
```bash
# Verificar logs do SendGrid
# Os logs mostram:
# - Status code (202 = sucesso)
# - Detalhes do email (to, subject, from)
# - Erros do SendGrid (se houver)
```

### Template não renderizando corretamente?
```bash
# Gerar preview local
npm run test:email:templates

# Abrir em navegador
open __email-previews__/[template-name].html
```

### Link quebrado?
```bash
# Rodar teste específico
npx jest -t "deve incluir link de convite clicável"

# Validar URLs no preview
npm run test:email:templates
# → Inspecionar links no HTML gerado
```

## 📝 Adicionando Novo Template

1. **Criar template** em `src/app/_templates/emails/novo-template.ts`
2. **Adicionar testes** em `__tests__/integration/email-templates.test.ts`
3. **Adicionar ao preview** em `scripts/test-all-email-templates.ts`
4. **Criar teste E2E** em `tests/emails.spec.ts` (se tiver gatilho)
5. **Rodar validação:**
   ```bash
   npm run test:integration
   npm run test:email:templates
   ```

## 🔗 Recursos

- **SendGrid Docs:** https://docs.sendgrid.com/
- **Playwright Docs:** https://playwright.dev/
- **Jest Docs:** https://jestjs.io/
- **Email Templates:** `src/app/_templates/emails/`
- **Email Service:** `src/lib/sendgrid.ts`

## ✅ Status dos Testes

| Categoria | Testes | Status | Cobertura |
|-----------|--------|--------|-----------|
| Templates (Integração) | 50+ | ✅ Passando | 100% |
| Serviço (Integração) | 30+ | ✅ Passando | 100% |
| Fluxos (E2E) | 17 | ✅ Passando | 100% |
| Preview/Visual | 6 templates | ✅ Implementado | 100% |

**Total:** ~100 test cases cobrindo todos os aspectos do sistema de emails.
