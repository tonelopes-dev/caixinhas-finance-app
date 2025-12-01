# Sistema de Gerenciamento de Usuários

## 1. Visão Geral: Quem é o Usuário?

No contexto deste projeto (Caixinhas), o "usuário" é a entidade central que interage com o aplicativo para gerenciar suas finanças, sejam elas individuais ou colaborativas. O sistema é projetado para ser um parceiro financeiro, especialmente para casais, focado em construir confiança e facilitar o planejamento conjunto, conforme detalhado em `about-project.md`.

Cada usuário possui uma identidade única e um conjunto de atributos que definem suas permissões, status e interações dentro da plataforma.

## 2. Ciclo de Vida do Usuário

O ciclo de vida de um usuário abrange desde o seu primeiro contato com o aplicativo até a gestão contínua de sua conta.

### 2.1. Cadastro

*   **Processo:** Um novo usuário se registra no aplicativo, fornecendo informações essenciais como nome, e-mail e senha.
*   **Estado Inicial:** Ao se registrar, o usuário recebe o status inicial de `trial` (teste), concedendo acesso total às funcionalidades por um período determinado (e.g., 30 dias).
*   **Componentes Envolvidos:**
    *   **Frontend:** `src/app/register/page.tsx` (interface de registro).
    *   **Backend:** `src/app/api/auth/register/route.ts` (API de registro que interage com o `AuthService`).
    *   **Serviço:** `AuthService.registerUser(...)` (lógica de criação de usuário no banco de dados).
    *   **E-mail:** Um e-mail de boas-vindas é enviado (`welcome-template.ts`).

### 2.2. Autenticação e Login

*   **Processo:** Usuários existentes fazem login para acessar suas contas.
*   **Método:** O projeto utiliza `next-auth` para gerenciar a autenticação, suportando credenciais (e-mail/senha) e possivelmente outros provedores de autenticação (não explicitamente detalhados nos snippets, mas comum em `next-auth`).
*   **Componentes Envolvidos:**
    *   **Frontend:** `src/app/login/page.tsx` (interface de login).
    *   **Backend:** `src/app/api/auth/[...nextauth]/route.ts` (rotas API do NextAuth).
    *   **Serviço:** `AuthService.loginUser(...)` (autenticação de credenciais).
    *   **Lib:** `src/lib/auth.ts` (configuração do `next-auth`).

### 2.3. Status de Acesso e Permissões (Referência: `docs/user-access-control.md`)

O controle de acesso é um aspecto crítico do gerenciamento de usuários. O sistema define três "crachás" principais para cada usuário:

*   **`trial` (Visitante VIP):** Concedido a novos usuários. Permite acesso total por um período de teste. Após a expiração, o acesso é restrito.
*   **`active` (Morador Premium):** Para usuários que assinaram. Concede acesso total e contínuo a todas as funcionalidades.
*   **`inactive` (Acesso Expirado):** Para usuários cujo período de teste ou assinatura terminou. Funcionalidades são restritas, mas a colaboração em cofres (se for membro de um cofre de um usuário `active`) ainda é possível.

As verificações de status de acesso ocorrem principalmente no lado do servidor, em páginas como `src/app/vaults/page.tsx`, para determinar quais funcionalidades exibir ou bloquear.

### 2.4. Gerenciamento de Perfil

*   **Processo:** Usuários podem visualizar e atualizar suas informações de perfil.
*   **Componentes Envolvidos:**
    *   **Frontend:** `src/app/profile/page.tsx`, `src/components/profile/profile-form.tsx` (interfaces para edição de perfil).
    *   **Server Actions:** `src/app/profile/actions.ts` (manipulação de dados do perfil).
    *   **Serviço:** `AuthService.updateUser(...)` (lógica para persistir as alterações no banco de dados).

## 3. Dados do Usuário

As informações do usuário são armazenadas no banco de dados, geralmente representadas pelo modelo `User` no `prisma/schema.prisma`.

Atributos Comuns do Modelo `User`:

*   `id`: Identificador único do usuário.
*   `name`: Nome de exibição do usuário.
*   `email`: Endereço de e-mail (usado para login e notificações).
*   `password`: Senha (hash).
*   `avatarUrl`: URL da imagem de perfil do usuário (se aplicável).
*   `emailVerified`: Data de verificação do e-mail.
*   `image`: URL da imagem do usuário (possivelmente duplicado ou usado de forma diferente que `avatarUrl`).
*   `subscriptionStatus`: O status da assinatura do usuário (`trial`, `active`, `inactive`).
*   `trialExpiresAt`: Data de expiração do período de teste.
*   `createdAt`: Data de criação do registro do usuário.
*   `updatedAt`: Data da última atualização do registro do usuário.

## 4. Interação com Outros Sistemas

### 4.1. Cofres (Vaults)

*   **Proprietário:** Cada cofre é criado e pertence a um usuário (`ownerId` no modelo `Vault`). O proprietário tem controle total sobre o cofre, incluindo convidar e remover membros.
*   **Membro:** Usuários podem ser membros de cofres que não são de sua propriedade, concedendo-lhes acesso colaborativo (leitura e/ou escrita, dependendo das permissões implementadas).
*   **Convites:** Os usuários recebem e respondem a convites para cofres, como detalhado em `docs/vault-invitation-system.md`.
*   **Server Actions Envolvidas:** `src/app/vaults/actions.ts` (para `getUserVaultsData`, `createVaultAction`, `updateVaultAction`, `deleteVaultAction`, `acceptInvitationAction`, `declineInvitationAction`, `removeMemberAction`, `inviteToVaultAction`, `cancelInvitationAction`).

### 4.2. Relatórios com IA

*   **Geração:** Usuários podem gerar relatórios financeiros detalhados e personalizados usando a funcionalidade de IA do aplicativo (`about-project.md`, Linhas 38-40).
*   **Serviços Envolvidos:** `src/ai/` (para a lógica de IA) e `src/services/ReportService.ts`.

### 4.3. Notificações

*   **Recebimento:** Usuários recebem notificações sobre convites, atividades em cofres compartilhados, e outras interações relevantes.
*   **Gerenciamento:** O usuário pode gerenciar suas preferências de notificação através de seu perfil.
*   **Serviços Envolvidos:** `src/services/notification.service.ts`.

## 5. Autenticação e Autorização

### 5.1. Autenticação

*   **Next-Auth:** O sistema de autenticação é construído sobre o Next-Auth, que lida com a sessão do usuário (`getServerSession`).
*   **`AuthService`:** Fornece métodos para criar, autenticar e gerenciar usuários no nível de serviço.

### 5.2. Autorização

*   **Middleware:** `middleware.ts` e `src/middleware.ts` são usados para proteger rotas e garantir que apenas usuários autenticados possam acessar certas partes do aplicativo.
*   **Server Actions:** A maioria das Server Actions (`src/app/**/actions.ts`) começa com uma verificação de sessão (`if (!session?.user) return { message: 'Não autorizado' };`) para garantir que apenas usuários logados possam executar a ação.
*   **Verificação de Propriedade/Membro:** Para ações sensíveis (ex: editar/deletar cofre, remover membro), verificações adicionais são realizadas para garantir que o usuário tenha a permissão correta (e.g., ser o proprietário do cofre ou um membro autorizado).
*   **`src/lib/access-control.ts` e `src/lib/action-helpers.ts`:** Contêm funções e helpers para auxiliar nas verificações de permissão e controle de acesso.

## 6. Componentes e Serviços Essenciais

*   **`AuthService` (`src/services/auth.service.ts`):** Gerencia todas as operações de usuário, incluindo registro, login, atualização de perfil e recuperação de conta.
*   **`VaultService` (`src/services/vault.service.ts`):** Lida com as interações do usuário com os cofres e convites.
*   **`next-auth`:** Framework de autenticação.
*   **Prisma:** ORM para interação com o banco de dados (modelos `User`, `Account`, `Session`, `VerificationToken`).
*   **E-mail Service:** Para envio de e-mails de boas-vindas, convites e redefinição de senha.
*   **`FirebaseErrorListener.tsx`:** Componente para lidar com erros do Firebase, indicando integração com serviços Firebase.

Esta documentação oferece uma visão abrangente do gerenciamento de usuários, seu papel fundamental no aplicativo e sua interação com os diversos sistemas e serviços.