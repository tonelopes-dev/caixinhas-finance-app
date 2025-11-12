# 🏗️ Services Layer - Arquitetura

Esta pasta contém a camada de serviços da aplicação, responsável por toda a lógica de negócio e interação com o banco de dados através do Prisma.

## 📁 Estrutura

```
src/services/
├── prisma.ts              # Cliente Prisma singleton
├── auth.service.ts        # Serviço de autenticação
├── vault.service.ts       # Serviço de cofres (TODO)
├── account.service.ts     # Serviço de contas (TODO)
├── goal.service.ts        # Serviço de metas (TODO)
├── transaction.service.ts # Serviço de transações (TODO)
└── index.ts              # Exportações centralizadas
```

## 🎯 Princípios

### 1. **Separation of Concerns**
Cada serviço é responsável por um domínio específico da aplicação:
- `AuthService` → Autenticação e usuários
- `VaultService` → Cofres e membros
- `AccountService` → Contas bancárias
- `GoalService` → Metas/Caixinhas
- `TransactionService` → Transações financeiras

### 2. **Single Responsibility**
Cada método do serviço tem uma responsabilidade única e bem definida.

### 3. **Type Safety**
Todos os métodos são fortemente tipados com TypeScript.

### 4. **Error Handling**
Erros são capturados e tratados adequadamente, com logs para debugging.

### 5. **Reusabilidade**
Serviços podem ser usados em qualquer parte da aplicação (Server Actions, API Routes, etc).

## 🔧 Como Usar

### Em Server Actions

```typescript
// src/app/login/actions.ts
import { AuthService } from '@/services';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const user = await AuthService.getUserByEmail(email);
  // ...
}
```

### Em API Routes

```typescript
// src/app/api/users/[id]/route.ts
import { AuthService } from '@/services';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await AuthService.getUserById(params.id);
  return Response.json(user);
}
```

### Em Componentes Server

```typescript
// src/app/profile/page.tsx
import { AuthService } from '@/services';
import { cookies } from 'next/headers';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('CAIXINHAS_USER_ID')?.value;
  
  if (!userId) redirect('/login');
  
  const user = await AuthService.getUserById(userId);
  
  return <div>Olá, {user?.name}</div>;
}
```

## 📝 Padrões de Código

### Nomenclatura de Métodos

- **get**: Buscar um único registro → `getUserById(id)`
- **getAll/list**: Buscar múltiplos registros → `getAllVaultsByUserId(userId)`
- **create**: Criar novo registro → `createVault(data)`
- **update**: Atualizar registro → `updateProfile(userId, data)`
- **delete**: Deletar registro → `deleteGoal(goalId)`

### Estrutura de um Serviço

```typescript
import prisma from './prisma';

export type EntityInput = {
  // Tipos de entrada
};

export type EntityOutput = {
  // Tipos de saída
};

export class EntityService {
  /**
   * Descrição do método
   * @param param - Descrição do parâmetro
   * @returns Descrição do retorno
   */
  static async methodName(param: string): Promise<EntityOutput | null> {
    try {
      const result = await prisma.entity.findUnique({
        where: { id: param },
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao executar operação:', error);
      throw new Error('Mensagem de erro amigável');
    }
  }
}
```

## ⚠️ Importante

1. **Sempre use try/catch** para capturar erros
2. **Nunca exponha erros do Prisma diretamente** ao cliente
3. **Valide dados de entrada** antes de passar ao Prisma
4. **Use select** para retornar apenas campos necessários
5. **Documente** todos os métodos públicos com JSDoc

## 🔐 Segurança

- Nunca retorne senhas nos objetos de usuário
- Use `select` para excluir campos sensíveis
- Valide permissões antes de executar operações
- Sanitize inputs antes de queries

## 🚀 Próximos Passos

- [ ] Implementar VaultService
- [ ] Implementar AccountService  
- [ ] Implementar GoalService
- [ ] Implementar TransactionService
- [ ] Implementar NotificationService
- [ ] Implementar InvitationService
