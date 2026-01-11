# Workflow de Desenvolvimento - Caixinhas Finance App

## 📋 Índice
1. [Estrutura de Branches](#estrutura-de-branches)
2. [Ambientes de Banco de Dados](#ambientes-de-banco-de-dados)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Fluxo de Trabalho](#fluxo-de-trabalho)
5. [Deploy](#deploy)

---

## 🌳 Estrutura de Branches

### Branches Principais

```
main (production)
  ↑
staging
  ↑
development
  ↑
feature/* (features individuais)
```

### Descrição das Branches

- **`main`**: Produção - código estável em produção
- **`staging`**: Homologação - testes finais antes de produção
- **`development`**: Desenvolvimento - código em desenvolvimento ativo
- **`feature/*`**: Features individuais - trabalho em progresso

### Comandos para Criar as Branches

```bash
# Certifique-se de estar na main atualizada
git checkout main
git pull origin main

# Criar branch development
git checkout -b development
git push -u origin development

# Criar branch staging
git checkout -b staging
git push -u origin staging

# Voltar para development
git checkout development
```

---

## 🗄️ Ambientes de Banco de Dados

### Neon DB - Criar 3 Bancos

Acesse [Neon Console](https://console.neon.tech) e crie:

1. **Production Database** (já existe - main branch)
   - Nome: `caixinhas-prod`
   - Branch: `main`
   - URL: `postgresql://user:pass@...neon.tech/caixinhas-prod`

2. **Staging Database** (criar novo)
   - Nome: `caixinhas-staging`
   - Branch: `staging` (ou clone de main)
   - URL: `postgresql://user:pass@...neon.tech/caixinhas-staging`

3. **Development Database** (criar novo)
   - Nome: `caixinhas-dev`
   - Branch: `development` (ou clone de main)
   - URL: `postgresql://user:pass@...neon.tech/caixinhas-dev`

### Estrutura de Branches no Neon

O Neon permite criar branches do banco de dados:

```
Neon Project: caixinhas-finance-app
│
├── main (production) ← Database principal
├── staging ← Clone de main para testes
└── development ← Clone de main para dev
```

**Como criar branches no Neon:**
1. Acesse o projeto no Neon Console
2. Clique em "Branches" no menu lateral
3. Clique em "Create Branch"
4. Nome: `staging` ou `development`
5. Parent Branch: `main`
6. Copie a connection string gerada

---

## 🔐 Variáveis de Ambiente

### Estrutura de Arquivos .env

Crie 3 arquivos de ambiente:

```
.env.development    # Desenvolvimento local
.env.staging        # Homologação
.env.production     # Produção (já existe como .env)
```

### .env.development (LOCAL)

```bash
# Database - Neon Development Branch
DATABASE_URL="postgresql://user:pass@...neon.tech/caixinhas-dev?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production-12345"

# Google OAuth (criar credenciais separadas para dev)
GOOGLE_CLIENT_ID="dev-client-id"
GOOGLE_CLIENT_SECRET="dev-client-secret"

# Firebase (projeto separado para dev)
NEXT_PUBLIC_FIREBASE_API_KEY="dev-firebase-key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="caixinhas-dev"
# ... outras configs do Firebase

# AWS S3 (bucket separado para dev)
AWS_S3_BUCKET_NAME="caixinhas-dev-uploads"
AWS_S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID="dev-access-key"
AWS_SECRET_ACCESS_KEY="dev-secret-key"

# Kiwify Webhook
KIWIFY_WEBHOOK_SECRET="dev-kiwify-secret"

# Ambiente
NODE_ENV="development"
NEXT_PUBLIC_APP_ENV="development"
```

### .env.staging (VERCEL - Preview)

```bash
# Database - Neon Staging Branch
DATABASE_URL="postgresql://user:pass@...neon.tech/caixinhas-staging?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://caixinhas-staging.vercel.app"
NEXTAUTH_SECRET="staging-secret-different-from-prod"

# Google OAuth (mesmas credenciais de dev ou separadas)
GOOGLE_CLIENT_ID="staging-client-id"
GOOGLE_CLIENT_SECRET="staging-client-secret"

# Firebase (projeto staging)
NEXT_PUBLIC_FIREBASE_API_KEY="staging-firebase-key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="caixinhas-staging"

# AWS S3 (bucket staging)
AWS_S3_BUCKET_NAME="caixinhas-staging-uploads"

# Ambiente
NODE_ENV="production"
NEXT_PUBLIC_APP_ENV="staging"
```

### .env.production (VERCEL - Production)

```bash
# Database - Neon Main Branch
DATABASE_URL="postgresql://user:pass@...neon.tech/caixinhas-prod?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://caixinhas.app" # seu domínio real
NEXTAUTH_SECRET="super-secure-production-secret-32chars+"

# Google OAuth (credenciais de produção)
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-client-secret"

# Firebase (projeto produção)
NEXT_PUBLIC_FIREBASE_API_KEY="prod-firebase-key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="caixinhas-prod"

# AWS S3 (bucket produção)
AWS_S3_BUCKET_NAME="caixinhas-prod-uploads"

# Kiwify Webhook (produção)
KIWIFY_WEBHOOK_SECRET="prod-kiwify-secret"

# Ambiente
NODE_ENV="production"
NEXT_PUBLIC_APP_ENV="production"
```

### Adicionar ao .gitignore

```bash
# Adicione ao .gitignore
.env.development
.env.staging
.env.production
.env.local
.env*.local
```

---

## 🔄 Fluxo de Trabalho

### 1. Desenvolvimento de Nova Feature

```bash
# 1. Atualizar development
git checkout development
git pull origin development

# 2. Criar branch de feature
git checkout -b feature/nome-da-feature

# 3. Desenvolver
# ... código ...

# 4. Commit
git add .
git commit -m "feat: descrição da feature"

# 5. Push da feature
git push origin feature/nome-da-feature

# 6. Abrir Pull Request
# GitHub: feature/nome-da-feature → development
```

### 2. Testar em Staging

```bash
# 1. Merge de development para staging
git checkout staging
git pull origin staging
git merge development

# 2. Push para staging
git push origin staging

# 3. Vercel vai fazer deploy automático de staging
# Testar em: https://caixinhas-staging.vercel.app
```

### 3. Deploy para Produção

```bash
# 1. Merge de staging para main (apenas quando tudo testado)
git checkout main
git pull origin main
git merge staging

# 2. Tag de versão
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# 3. Vercel vai fazer deploy automático de produção
# Live em: https://caixinhas.app
```

### Comandos Rápidos

```bash
# Criar nova feature
npm run feature "nome-da-feature"

# Commit com conventional commits
npm run commit

# Sincronizar development com staging/main
git checkout development
git pull origin main  # pega mudanças de main
git push origin development
```

---

## 🚀 Deploy - Configuração Vercel

### Projetos Vercel

Recomendo criar **2 projetos separados** no Vercel:

1. **caixinhas-app** (Produção + Staging)
   - Production Branch: `main`
   - Preview Branch: `staging`
   - Environment Variables: usar .env.production e .env.staging

2. **caixinhas-dev** (opcional - para testar deploys de dev)
   - Production Branch: `development`

### Configuração de Environment Variables no Vercel

Para cada projeto, vá em **Settings → Environment Variables**:

**Production (main branch):**
- Adicionar todas as variáveis de `.env.production`
- Marcar: ✅ Production

**Preview (staging branch):**
- Adicionar todas as variáveis de `.env.staging`
- Marcar: ✅ Preview

**Development (opcional):**
- Adicionar todas as variáveis de `.env.development`
- Marcar: ✅ Development

### Auto Deploy

Vercel vai fazer deploy automático quando:
- Push para `main` → Deploy de produção
- Push para `staging` → Deploy de preview (staging)
- Pull Request para `main` → Deploy de preview
- Pull Request para `staging` → Deploy de preview

---

## 📦 Package.json Scripts

Adicione scripts úteis ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    
    "db:migrate:dev": "dotenv -e .env.development -- prisma migrate dev",
    "db:migrate:staging": "dotenv -e .env.staging -- prisma migrate deploy",
    "db:migrate:prod": "dotenv -e .env.production -- prisma migrate deploy",
    
    "db:studio:dev": "dotenv -e .env.development -- prisma studio",
    "db:studio:staging": "dotenv -e .env.staging -- prisma studio",
    
    "db:seed:dev": "dotenv -e .env.development -- tsx prisma/seed.ts",
    
    "git:feature": "git checkout -b feature/",
    "git:sync": "git fetch origin && git merge origin/main"
  }
}
```

Instale o dotenv-cli:
```bash
npm install -D dotenv-cli
```

---

## 🔍 Checklist de Setup

### Configuração Inicial

- [ ] Criar branches: `development`, `staging`
- [ ] Criar databases no Neon: dev, staging, prod
- [ ] Criar arquivos: `.env.development`, `.env.staging`
- [ ] Configurar variáveis no Vercel
- [ ] Testar conexão com cada database
- [ ] Rodar migrations em cada ambiente
- [ ] Documentar URLs de cada ambiente

### Projetos Externos

- [ ] **Firebase**: Criar 3 projetos (dev, staging, prod)
- [ ] **Google OAuth**: Criar 3 apps ou configurar authorized URLs
- [ ] **AWS S3**: Criar 3 buckets (dev, staging, prod)
- [ ] **Kiwify**: Configurar webhooks para staging e prod

### Proteções de Branch (GitHub)

1. Ir em **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. ✅ Require pull request before merging
4. ✅ Require status checks to pass
5. ✅ Do not allow bypassing the above settings

Repetir para `staging`.

---

## 🎯 Boas Práticas

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova feature
fix: corrige bug
docs: atualiza documentação
refactor: refatora código
test: adiciona testes
chore: atualiza dependências
```

### Features

- Sempre trabalhar em branches `feature/*`
- Nunca commitar direto em `main`, `staging` ou `development`
- Fazer Pull Requests para code review
- Deletar branches de feature após merge

### Databases

- **NUNCA** rodar comandos destrutivos em produção sem backup
- Sempre testar migrations em dev/staging primeiro
- Usar `prisma migrate deploy` em staging/prod
- Usar `prisma migrate dev` apenas em development

### Segurança

- Nunca commitar arquivos `.env*`
- Rotacionar secrets regularmente
- Usar secrets diferentes para cada ambiente
- Fazer backup do database de produção regularmente

---

## 📞 Comandos Úteis Diários

```bash
# Começar novo dia
git checkout development
git pull origin development

# Criar nova feature
git checkout -b feature/minha-feature

# Após trabalhar
git add .
git commit -m "feat: descrição"
git push origin feature/minha-feature

# Após aprovação do PR
git checkout development
git pull origin development

# Quando quiser testar em staging
git checkout staging
git merge development
git push origin staging

# Quando estiver tudo OK para produção
git checkout main
git merge staging
git tag -a v1.x.x -m "Release notes"
git push origin main --tags
```

---

## 🆘 Troubleshooting

### Database Connection Error

```bash
# Testar conexão
npx prisma db pull --schema=./prisma/schema.prisma

# Ver variáveis
echo $DATABASE_URL
```

### Vercel Build Failing

1. Verificar environment variables estão todas configuradas
2. Verificar DATABASE_URL está correto
3. Ver logs no Vercel Dashboard
4. Testar build local: `npm run build`

### Migration Issues

```bash
# Reset database development (CUIDADO!)
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status

# Aplicar migrations pendentes
npx prisma migrate deploy
```

---

## 📚 Recursos

- [Neon Branching Docs](https://neon.tech/docs/guides/branching)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)

