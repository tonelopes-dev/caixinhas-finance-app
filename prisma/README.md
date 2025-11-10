# 🗃️ Banco de Dados - Caixinhas

Este projeto utiliza **Prisma ORM** com **PostgreSQL**.

## 📋 Pré-requisitos

1. PostgreSQL instalado e rodando
2. Variável de ambiente `DATABASE_URL` configurada

## 🚀 Comandos Principais

### Primeira Configuração

```bash
# 1. Instalar dependências (se ainda não fez)
npm install

# 2. Gerar o Prisma Client
npm run prisma:generate

# 3. Criar o banco de dados e aplicar as migrations
npm run prisma:migrate

# 4. Popular o banco com dados iniciais
npm run db:seed
```

### Comandos de Desenvolvimento

```bash
# Gerar o Prisma Client após mudanças no schema
npm run prisma:generate

# Criar uma nova migration
npm run prisma:migrate

# Abrir o Prisma Studio (interface visual do banco)
npm run prisma:studio

# Popular o banco com dados de teste
npm run db:seed

# Resetar o banco (CUIDADO: apaga todos os dados!)
npm run prisma:reset

# Push do schema sem criar migration (útil em dev)
npm run db:push
```

## 🏗️ Estrutura do Schema

### Principais Tabelas

- **users** - Usuários do sistema
- **vaults** - Cofres (espaços de trabalho)
- **vault_members** - Membros dos cofres
- **accounts** - Contas bancárias e cartões
- **goals** - Metas/Caixinhas
- **goal_participants** - Participantes das metas
- **transactions** - Transações financeiras
- **invitations** - Convites para cofres/metas
- **notifications** - Notificações do usuário
- **saved_reports** - Relatórios financeiros salvos

## 📊 Dados de Seed

O arquivo `seed.ts` popula o banco com:

- ✅ 5 usuários de exemplo (Dev, Anna, Carlos, Daniela, Eduardo)
- ✅ 4 cofres (Família DevAnna, Agência, Consultório, Viagem)
- ✅ 9 contas bancárias/cartões
- ✅ 6 metas (Caixinhas)
- ✅ 7 transações principais
- ✅ 3 notificações
- ✅ 1 convite

### Usuários de Teste

```typescript
// Dev
email: 'email01@conta.com'
id: 'user1'

// Anna
email: 'email02@conta.com'
id: 'user2'
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/caixinhas?schema=public"

# Opcional: Database URL para shadow database (usado em migrations)
# SHADOW_DATABASE_URL="postgresql://usuario:senha@localhost:5432/caixinhas_shadow?schema=public"
```

## 📝 Modificando o Schema

1. Edite o arquivo `schema.prisma`
2. Execute `npm run prisma:migrate` para criar a migration
3. Execute `npm run prisma:generate` para atualizar o client

## 🔍 Prisma Studio

Para visualizar e editar dados visualmente:

```bash
npm run prisma:studio
```

Isso abrirá uma interface web em `http://localhost:5555`

## ⚠️ Importante

- **Nunca** commite o arquivo `.env` com credenciais reais
- Use `prisma migrate` em vez de `db push` em produção
- Sempre faça backup antes de executar `prisma:reset`

## 📚 Documentação

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
