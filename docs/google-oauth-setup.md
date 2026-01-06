# Configuração do Google OAuth - Google Cloud Console

## Status Atual - Problemas Identificados pelo Google

### ❌ Problemas a Corrigir (E-mail 11/12/2025):
1. **Homepage URL incorreta**: Está configurado `https://www.caixinhas.app/landing` (com www)
   - ✅ **Correção**: Use `https://caixinhas.app` (sem www, sem /landing)
2. **Link da Política de Privacidade na Landing**: 
   - ✅ **JÁ CORRIGIDO**: Footer com link foi adicionado
3. **Política de Privacidade incompleta**: Google verificou `/terms` em vez de `/privacy`
   - ⚠️ **Ação necessária**: Atualizar URL no Google Console para `https://caixinhas.app/privacy`

### ❌ Problemas Adicionais (E-mail 02/01/2026):
4. **Homepage não explica o propósito do app**
   - ⚠️ **Ação necessária**: Adicionar seção explicativa na landing page
5. **Nome do app não corresponde entre OAuth e Homepage**
   - ⚠️ **Ação necessária**: Padronizar nome como "Caixinhas"

### ✅ O que já está pronto:
- [x] Página de Política de Privacidade criada em `/privacy`
- [x] Link para Política de Privacidade no footer da landing page
- [x] Link para Política de Privacidade nas páginas de login e registro
- [x] Conteúdo em conformidade com LGPD
- [x] Seções sobre coleta e uso de dados Google

## URLs Importantes do Aplicativo

### Produção
- **URL Principal (Homepage)**: `https://caixinhas.app` ⚠️ **SEM www, SEM /landing**
- **Política de Privacidade**: `https://caixinhas.app/privacy` ⚠️ **NÃO /terms**
- **Termos de Serviço**: `https://caixinhas.app/terms`

### Desenvolvimento (Local)
- **URL Principal**: `http://localhost:9002`
- **Política de Privacidade**: `http://localhost:9002/privacy`
- **Termos de Serviço**: `http://localhost:9002/terms`

## Passos para Configurar no Google Cloud Console

### 1. Acessar o Console
1. Vá para https://console.cloud.google.com/
2. Selecione o projeto do Caixinhas
3. Navegue até "APIs e Serviços" > "Credenciais"

### 2. Editar as Credenciais OAuth 2.0

**⚠️ IMPORTANTE - Separar Ambientes:**

O Google **não permite** URLs de localhost em clientes de produção. Você precisa de **2 clientes OAuth separados**:

#### **Cliente de PRODUÇÃO** (atual)
Client ID: `[Configurado na Vercel - Ver variáveis de ambiente]`

**Origens JavaScript Autorizadas:**
```
https://caixinhas.app
```

**URIs de Redirecionamento Autorizados:**
```
https://caixinhas.app/api/auth/callback/google
```

#### **Cliente de DESENVOLVIMENTO** (criar novo)
1. Vá em "APIs e Serviços" > "Credenciais"
2. Clique em "+ CRIAR CREDENCIAIS" > "ID do cliente OAuth 2.0"
3. Tipo de aplicativo: "Aplicativo da Web"
4. Nome: "Caixinhas - Development"

**Origens JavaScript Autorizadas:**
```
http://localhost:9002
```

**URIs de Redirecionamento Autorizados:**
```
http://localhost:9002/api/auth/callback/google
```

### 3. Configurar a Tela de Consentimento OAuth

1. Vá em "APIs e Serviços" > "Tela de consentimento OAuth"
2. Preencha as seguintes informações:

#### **Informações do Aplicativo**
- **Nome do Aplicativo**: `Caixinhas` ⚠️ **EXATAMENTE este nome, sem variações**
- **E-mail de Suporte**: `suporte@caixinhas.app`
- **Logo do Aplicativo**: (Upload do logo se disponível)

#### **Domínio do Aplicativo** ⚠️ **CRÍTICO - URLs CORRETAS**
- **Página Inicial do Aplicativo**: `https://caixinhas.app` **(SEM www, SEM /landing)**
- **Política de Privacidade**: `https://caixinhas.app/privacy` **(NÃO /terms)**
- **Termos de Serviço**: `https://caixinhas.app/terms`

#### **Domínios Autorizados**
Adicione:
```
caixinhas.app
```
⚠️ **NÃO adicione www.caixinhas.app**

#### **Informações de Contato do Desenvolvedor**
- **E-mail**: `suporte@caixinhas.app`

### 4. Escopos do OAuth

Certifique-se de que os seguintes escopos estão configurados:
- `userinfo.email` - Ver o endereço de e-mail principal
- `userinfo.profile` - Ver suas informações pessoais, incluindo nome e foto
 ⚠️ **OBRIGATÓRIO**

Para liberar o app em produção (sem tela de aviso), você **DEVE** verificar a propriedade do domínio:

1. Acesse: https://search.google.com/search-console
2. Adicione a propriedade: `https://caixinhas.app` **(SEM www)**
3. Escolha o método de verificação:
   
   **Opção 1: Registro TXT no DNS (Recomendado)**
   - O Google fornecerá um código TXT
   - Adicione no DNS do seu domínio
   - Aguarde propagação (até 48h)
   
   **Opção 2: Arquivo HTML**
   - Baixe o arquivo fornecido pelo Google
   - Faça upload para `https://caixinhas.app/[nome-do-arquivo].html`
   
   **Opção 3: Tag HTML**
   - Adicione a meta tag no `<head>` da página principal

4. Após verificar, volte ao Google Cloud Console
5. Em "APIs e Serviços" > "Tela de consentimento OAuth"
6. O domínio verificado aparecerá automaticamenteou
   - Google Tag Manager

### 6. Solicitar Verificação do Google

Após configurar tudo:

1. Vá em "Tela de consentimento OAuth"
2. Clique em "Publicar Aplicativo" (se ainda estiver em teste)
3. Clique em "Preparar para verificação"
4. Siga o processo de verificação do Google

**Documentos que podem ser solicitados:**
- Comprovante de propriedade do domínio
- Política de Privacidade e Termos de Serviço
- Descrição de como o aplicativo usa os dados do Google
- Vídeo demonstrando o fluxo de autenticação

## Checklist de Verificação

### Requisitos da Política de Privacidade ✅
- [x] Página de Política de Privacidade criada
- [x] Link na página inicial (landing page)
- [x] Link na página de login
- [x] Link na página de registro
- [x] Conteúdo em conformidade com LGPD
- [x] Descrição clara de como os dados são usados
- [x] Informações sobre compartilhamento de dados
- [x] Direitos do usuário documentados

### Requisitos da Página Inicial ✅
- [x] URL registrada no Google Console: `https://caixinhas.app`
- [x] Link para Política de Privacidade no rodapé
- [x] Link para Termos de Serviço no rodapé

### Diretrizes da Construção da Marca 🔄
- [ ] Logo do aplicativo aprovado
- [ ] Nome do aplicativo aprovado
- [ ] Descrição do aplicativo adequada
- [ ] Screenshots do aplicativo (se necessário)

## Configurações do .env

### Desenvolvimento (.env.local)
```bash
# Google OAuth - DESENVOLVIMENTO
GOOGLE_CLIENT_ID="SEU-CLIENT-ID-DE-DEV.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="SEU-CLIENT-SECRET-DE-DEV"

# NextAuth - Desenvolvimento
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=sua-chave-secreta-desenvolvimento
```

### Produção (Variáveis de Ambiente do Hosting)
```bash
# Google OAuth - PRODUÇÃO
# ⚠️ Configurar direto na Vercel - NUNCA commitar no git
GOOGLE_CLIENT_ID="[SEU-CLIENT-ID]"
GOOGLE_CLIENT_SECRET="[SEU-SECRET]"
 - AÇÃO IMEDIATA

### 🚨 URGENTE - Corrigir Problema de Segurança

1. ✅ Aplicação atualizada com Política de Privacidade
2. **⚠️ REMOVER localhost do cliente de PRODUÇÃO AGORA:**
   - Acesse: https://console.cloud.google.com/apis/credentials
   - Edite o cliente OAuth de produção
   - **REMOVA** todas as URLs de `localhost` e `127.0.0.1`
   - Mantenha apenas `https://caixinhas.app`
3. **🔧 Criar cliente OAuth separado para desenvolvimento:**
   - Crie um novo cliente OAuth 2.0
   - Configure apenas com URLs localhost
   - Use este no arquivo `.env.local`
4. ⏳ Verificar domínio `caixinhas.app`
5. ⏳ Submeter para verificação do Google
6*⚠️ IMPORTANTE**: 
1. **NUNCA** use credenciais de produção em desenvolvimento
2. **NUNCA** configure localhost no cliente OAuth de produção
3. Gere um `NEXTAUTH_SECRET` forte usando: `openssl rand -base64 32`
4. Configure as variáveis de produção no seu serviço de hosting (Firebase/Vercel/etc.)

## Próximos Passos - CHECKLIST COMPLETO

### 🚨 Fase 1: CORREÇÕES IMEDIATAS (Fazer AGORA)

- [ ] **1. Verificar o domínio no Google Search Console**
  - Acesse: https://search.google.com/search-console
  - Adicione: `https://caixinhas.app`
  - Complete a verificação (DNS, HTML ou Meta Tag)

- [ ] **2. Atualizar OAuth Consent Screen**
  - Acesse: https://console.cloud.google.com/apis/credentials/consent
  - **Nome do App**: Certifique-se que está `Caixinhas` (exatamente)
  - **Homepage**: `https://caixinhas.app` (SEM www, SEM /landing)
  - **Política de Privacidade**: `https://caixinhas.app/privacy` (NÃO /terms)
  - **Termos de Serviço**: `https://caixinhas.app/terms`
  - **Domínios Autorizados**: apenas `caixinhas.app` (sem www)

- [ ] **3. Verificar Landing Page**
  - Acesse: https://caixinhas.app
  - Confirme que redireciona para /landing ou exibe conteúdo
  - Confirme que o nome "Caixinhas" aparece claramente
  - Confirme que há seção explicando o propósito do app
  - Confirme que o footer tem link para `/privacy`

- [ ] **4. Remover localhost do OAuth de Produção**
  - Edite o cliente: `200162689567-t4ioro7gc1ev1j3qjd8ffhq4fc50kc6c`
  - REMOVA todas URLs com `localhost` ou `127.0.0.1`
  - Mantenha apenas `https://caixinhas.app`

- [ ] **5. Criar Cliente OAuth de Desenvolvimento**
  - Crie novo cliente para desenvolvimento
  - Configure apenas URLs localhost
  - Atualize `.env.local` com as novas credenciais

### 📧 Fase 2: RESPONDER AO GOOGLE

Após completar todos os itens acima, **responda ao e-mail** do Google confirmando:

```
Assunto: Re: OAuth Verification - Project 200162689567

Prezado Time de Verificação OAuth,

Realizei todas as correções solicitadas:

1. ✅ Homepage corrigida: https://caixinhas.app
2. ✅ Link para Política de Privacidade adicionado no footer
3. ✅ Política de Privacidade atualizada: https://caixinhas.app/privacy
   - Inclui seções sobre acesso a dados do Google
   - Inclui seções sobre uso e armazenamento de dados
4. ✅ Homepage atualizada com descrição do propósito da aplicação
5. ✅ Nome do aplicativo padronizado como "Caixinhas"
6. ✅ Domínio verificado no Google Search Console

O aplicativo está pronto para nova revisão.

Atenciosamente,
[Seu Nome]
```

### ⏳ Fase 3: AGUARDAR APROVAÇÃO

- [ ] Aguardar resposta do Google (3-7 dias úteis)
- [ ] Verificar e-mail diariamente
- [ ] Responder prontamente se houver novas solicitações

## Comandos Úteis

```bash
# Testar localmente
npm run dev

# Build para produção
npm run build

# Verificar se não há erros
npm run lint
```

## Suporte

Se tiver problemas durante o processo:
- Documentação do Google: https://developers.google.com/identity/protocols/oauth2
- Tela de consentimento: https://support.google.com/cloud/answer/10311615
- Processo de verificação: https://support.google.com/cloud/answer/9110914

---

**Data da Configuração**: 2 de Janeiro de 2025
**Status**: Pendente configuração no Google Console
