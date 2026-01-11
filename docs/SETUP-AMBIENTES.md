# 🚀 Setup Rápido de Ambientes

## 1️⃣ Criar Branches Git

```bash
# Criar branch development
git checkout -b development
git push -u origin development

# Criar branch staging
git checkout -b staging
git push -u origin staging

# Voltar para development
git checkout development
```

## 2️⃣ Configurar Neon Database

1. Acesse [Neon Console](https://console.neon.tech)
2. Abra seu projeto: `caixinhas-finance-app`
3. Clique em **"Branches"** no menu lateral
4. Crie 2 novas branches:

### Branch Development
- Nome: `development`
- Parent: `main`
- ✅ Copie a connection string

### Branch Staging
- Nome: `staging`
- Parent: `main`
- ✅ Copie a connection string

## 3️⃣ Configurar Variáveis de Ambiente

### Local (.env.development)

```bash
# Copie o template
cp .env.development.example .env.development

# Edite com suas credenciais
nano .env.development
```

Preencha:
- `DATABASE_URL` (connection string do Neon development)
- Outras variáveis conforme necessário

### Staging (Vercel)

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Seu projeto → **Settings → Environment Variables**
3. Adicione as variáveis de `.env.staging.example`
4. Marque: ✅ **Preview** (para branch staging)

## 4️⃣ Instalar Dependências

```bash
# Instalar dotenv-cli para usar múltiplos .env
npm install -D dotenv-cli
```

## 5️⃣ Testar Configuração

```bash
# Testar conexão com database development
npm run db:migrate:dev

# Abrir Prisma Studio (development)
npm run db:studio:dev

# Popular database development com dados de teste
npm run db:seed:dev
```

## 6️⃣ Proteger Branches (GitHub)

1. GitHub → Seu Repo → **Settings → Branches**
2. **Add rule** para `main`:
   - ✅ Require pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass
3. Repetir para `staging`

## 7️⃣ Configurar Vercel Deploy

### Opção A: 1 Projeto Vercel (Recomendado)

```
Projeto: caixinhas-app
├── Production Branch: main
└── Preview Branches: staging, development
```

**Configuração:**
- Production Branch: `main`
- Git Branch Pattern: `staging|development|feature/*`
- Build Command: `npm run build`
- Output Directory: `.next`

### Opção B: 2 Projetos Vercel

```
Projeto 1: caixinhas-app (Produção)
└── Production Branch: main

Projeto 2: caixinhas-staging
└── Production Branch: staging
```

## 8️⃣ Fluxo de Trabalho Diário

### Criar nova feature

```bash
npm run feature "minha-nova-feature"
# Isso vai:
# 1. Ir para development
# 2. Fazer pull da development
# 3. Criar branch feature/minha-nova-feature
```

### Desenvolver

```bash
# Trabalhar normalmente
git add .
git commit -m "feat: adiciona funcionalidade X"
git push origin feature/minha-nova-feature
```

### Pull Request

1. GitHub → **Pull Request**
2. `feature/minha-nova-feature` → `development`
3. Aguardar review/aprovação
4. Merge

### Testar em Staging

```bash
git checkout staging
git merge development
git push origin staging

# Vercel vai fazer deploy automático
# Testar em: https://caixinhas-staging.vercel.app
```

### Deploy Produção

```bash
# Apenas quando tudo testado em staging!
git checkout main
git merge staging
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# Vercel vai fazer deploy automático
```

## 9️⃣ Scripts Úteis

```bash
# Desenvolvimento
npm run dev                 # Rodar app local
npm run db:studio:dev      # Abrir Prisma Studio (dev)
npm run db:migrate:dev     # Rodar migrations (dev)

# Criar feature
npm run feature "nome"     # Criar nova branch de feature

# Staging
npm run db:migrate:staging # Rodar migrations (staging)
npm run db:studio:staging  # Abrir Prisma Studio (staging)

# Produção
npm run db:migrate:prod    # Rodar migrations (produção)
```

## 🔐 Checklist de Segurança

- [ ] `.env*` está no `.gitignore`
- [ ] Secrets diferentes para cada ambiente
- [ ] Branches protegidas no GitHub
- [ ] Backups automáticos do database produção
- [ ] NEXTAUTH_SECRET tem 32+ caracteres
- [ ] Google OAuth configurado para cada domínio

## 📞 Ajuda

Ver documentação completa: [workflow-desenvolvimento.md](./workflow-desenvolvimento.md)
