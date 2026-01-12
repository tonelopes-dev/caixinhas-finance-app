# Sistema de Notificações

## 1. Visão Geral

O sistema de notificações do projeto "Caixinhas" é responsável por manter os usuários informados sobre eventos importantes que ocorrem na plataforma. Ele atua como um hub centralizado para alertar os usuários sobre convites, atividades em cofres, progresso de metas e outras interações relevantes, garantindo que eles nunca percam uma atualização crítica.

O sistema foi projetado para ser flexível, permitindo a criação de diferentes tipos de notificações com links associados para direcionar o usuário à ação ou informação relevante.

## 2. Tipos de Notificação (`NotificationType`)

As notificações são categorizadas por tipo para permitir um tratamento e exibição diferenciados na interface do usuário. Os tipos de notificação definidos são:

*   `vault_invite`: Notificação enviada quando um usuário é convidado para um cofre.
*   `vault_invite`: Notificação enviada quando um usuário é convidado para um cofre.
*   `transaction_added`: Notificação que pode ser usada para informar sobre novas transações (especialmente em cofres compartilhados).
*   `goal_progress`: Notificação para alertar sobre o progresso ou mudanças em metas.
*   `vault_member_added`: Notificação enviada quando um usuário é adicionado como membro a um cofre.
*   `system`: Notificações gerais do sistema, como alertas ou anúncios.

## 3. Estrutura de Dados da Notificação (`NotificationData`)

Cada notificação é representada por um objeto com os seguintes campos:

*   `id`: `string` - Identificador único da notificação.
*   `userId`: `string` - ID do usuário para o qual a notificação se destina.
*   `type`: `NotificationType` - O tipo da notificação (conforme listado acima).
*   `message`: `string` - O texto principal da notificação, exibido ao usuário.
*   `isRead`: `boolean` - Indica se a notificação foi lida pelo usuário (`true` para lida, `false` para não lida).
*   `link?`: `string | null` - Um link opcional para onde o usuário será direcionado ao clicar na notificação (ex: `/vaults`, `/goals/123`).
*   `relatedId?`: `string | null` - Um ID opcional relacionado a um recurso específico (ex: `invitationId` para um convite, `vaultId` para um cofre).
*   `createdAt`: `Date` - Data e hora em que a notificação foi criada.

## 4. Serviço de Notificação (`NotificationService`)

O `src/services/notification.service.ts` é o serviço principal para gerenciar todas as operações relacionadas a notificações. Ele interage diretamente com o banco de dados (via Prisma).

### Métodos Principais:

*   **`static async createNotification(data: { userId: string; type: NotificationType; message: string; link?: string; relatedId?: string; }): Promise<NotificationData>`**
    *   **Função:** Cria uma nova notificação no banco de dados.
    *   **Parâmetros:**
        *   `userId`: ID do usuário destinatário.
        *   `type`: Tipo da notificação.
        *   `message`: Conteúdo da notificação.
        *   `link` (opcional): URL de redirecionamento.
        *   `relatedId` (opcional): ID de um recurso relacionado.
    *   **Retorno:** O objeto `NotificationData` da notificação criada.
    *   **Uso Comum:** Chamado por outros serviços (e.g., `VaultService`) ou Server Actions quando um evento que requer notificação ocorre.

*   **`static async getUserNotifications(userId: string): Promise<NotificationData[]>`**
    *   **Função:** Busca todas as notificações de um usuário específico, ordenadas pela data de criação (mais recentes primeiro).
    *   **Parâmetros:** `userId`: ID do usuário.
    *   **Retorno:** Um array de objetos `NotificationData`.
    *   **Uso Comum:** Para exibir a lista completa de notificações na UI do usuário.

*   **`static async getUnreadNotifications(userId: string): Promise<NotificationData[]>`**
    *   **Função:** Busca apenas as notificações não lidas de um usuário específico.
    *   **Parâmetros:** `userId`: ID do usuário.
    *   **Retorno:** Um array de objetos `NotificationData`.
    *   **Uso Comum:** Para exibir um feed de "novas" notificações ou para componentes que mostram apenas itens não lidos.

*   **`static async getUnreadCount(userId: string): Promise<number>`**
    *   **Função:** Retorna a contagem de notificações não lidas para um usuário.
    *   **Parâmetros:** `userId`: ID do usuário.
    *   **Retorno:** Um número inteiro.
    *   **Uso Comum:** Para exibir um badge de contador de notificações não lidas na interface do usuário (ex: no ícone de sino).

*   **`static async markAsRead(notificationId: string): Promise<void>`**
    *   **Função:** Marca uma notificação específica como lida.
    *   **Parâmetros:** `notificationId`: ID da notificação a ser marcada.
    *   **Uso Comum:** Quando o usuário clica em uma notificação individual.

*   **`static async markAllAsRead(userId: string): Promise<void>`**
    *   **Função:** Marca todas as notificações não lidas de um usuário como lidas.
    *   **Parâmetros:** `userId`: ID do usuário.
    *   **Uso Comum:** Quando o usuário clica em um botão "Marcar todas como lidas" ou acessa a página de notificações completa.

*   **`static async deleteNotification(notificationId: string): Promise<void>`**
    *   **Função:** Exclui uma notificação específica do banco de dados.
    *   **Parâmetros:** `notificationId`: ID da notificação a ser excluída.
    *   **Uso Comum:** Quando o usuário decide remover uma notificação de sua lista.

*   **`static async createVaultInviteNotification(data: { receiverId: string; senderName: string; vaultName: string; invitationId: string; }): Promise<NotificationData>`**
    *   **Função:** Método auxiliar específico para criar notificações de convite de cofre.
    *   **Uso Comum:** Chamado pelo `VaultService.inviteToVault` quando um convite de cofre é enviado.

*   **`static async createMemberAddedNotification(data: { userId: string; vaultName: string; addedByName: string; }): Promise<NotificationData>`**
    *   **Função:** Método auxiliar específico para criar notificações de membro adicionado a um cofre.
    *   **Uso Comum:** Chamado pelo `VaultService.acceptInvitation` (ou similar) quando um usuário é adicionado a um cofre.

*   **`static async markAsReadByRelatedId(relatedId: string, userId: string): Promise<void>`**
    *   **Função:** Marca notificações como lidas usando um `relatedId` (ex: `invitationId`). Isso é útil para garantir que, após uma ação (como aceitar um convite), a notificação correspondente seja marcada como lida.
    *   **Parâmetros:** `relatedId`: ID relacionado à notificação; `userId`: ID do usuário.
    *   **Consideração:** Este método não lança um erro para evitar interrupções no fluxo principal.

## 5. Fluxo de Notificações

As notificações são geradas por eventos específicos no sistema e consumidas pela interface do usuário:

### 5.1. Criação de Notificações

1.  **Convite de Cofre:** Quando `VaultService.inviteToVault` é chamado, ele dispara `NotificationService.createVaultInviteNotification`.
2.  **Membro Adicionado ao Cofre:** Após a aceitação de um convite de cofre (via `VaultService.acceptInvitation`), `NotificationService.createMemberAddedNotification` é chamada para notificar o novo membro.
3.  **Outros Eventos:** Novas implementações de funcionalidades (ex: adição de transação em cofre compartilhado, atualização de meta) podem chamar `NotificationService.createNotification` diretamente ou através de métodos auxiliares dedicados.

### 5.2. Consumo de Notificações

1.  **Página de Notificações:** Em `src/app/notifications/page.tsx` (ou similar), as Server Actions (ex: `src/app/notifications/actions.ts`) utilizam `NotificationService.getUserNotifications` para exibir a lista completa de notificações.
2.  **Dropdown/Badge de Notificações:** Em componentes de layout (`src/components/dashboard/notifications-dropdown.tsx`), `NotificationService.getUnreadCount` e `NotificationService.getUnreadNotifications` são usadas para exibir contadores e um resumo de notificações não lidas.
3.  **Marcação como Lida:** O usuário interage com a UI (clicando em uma notificação, em um botão "Marcar todas como lidas"), o que aciona as Server Actions (`src/app/notifications/actions.ts`) para chamar `NotificationService.markAsRead` ou `NotificationService.markAllAsRead`.
4.  **Exclusão:** O usuário pode excluir notificações através da UI, que aciona `NotificationService.deleteNotification` via Server Actions.

## 6. Componentes da Interface do Usuário (UI)

*   **`src/app/notifications/page.tsx`:** A página dedicada onde o usuário pode visualizar, gerenciar e interagir com todas as suas notificações.
*   **`src/components/dashboard/notifications-dropdown.tsx`:** Um componente de dropdown no dashboard que exibe um resumo das notificações não lidas e permite acesso rápido à página de notificações completa.
*   **`src/components/notifications/notifications-client.tsx`:** Componente cliente que lida com a lógica de exibição e interação com as notificações (marcação como lida, exclusão).
*   **`src/components/notifications/delete-notification-dialog.tsx`:** Um diálogo de confirmação para exclusão de notificações.
*   **`src/components/notifications/notifications-manager.tsx`:** Pode ser um componente que orquestra a busca e o gerenciamento de notificações na UI.

## 7. Integração com o Banco de Dados (Prisma)

O `prisma/schema.prisma` provavelmente define o modelo `Notification`:

```prisma
model Notification {
  id          String         @id @default(cuid())
  userId      String
  type        NotificationType
  message     String
  isRead      Boolean        @default(false)
  link        String? // Opcional
  relatedId   String? // Opcional: para associar a outros recursos (convite, vault, etc.)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Enum para os tipos de notificação
  enum NotificationType {
    vault_invite
    goal_invite
    transaction_added
    goal_progress
    vault_member_added
    system
  }
}
```

*   A relação `user` garante que cada notificação esteja associada a um usuário.
*   O `onDelete: Cascade` na relação `user` indica que, se um usuário for excluído, todas as suas notificações também serão removidas.

## 8. Considerações

*   **Tempo Real:** Para uma experiência de usuário aprimorada, o sistema poderia ser estendido com WebSockets ou Server-Sent Events (SSE) para notificações em tempo real, em vez de depender apenas de revalidação de cache.
*   **Personalização:** Futuramente, permitir que os usuários configurem quais tipos de notificações desejam receber (e por qual canal: e-mail, in-app) aumentaria a satisfação do usuário.
*   **Tratamento de Erros:** O `NotificationService` inclui blocos `try-catch` para lidar com erros de banco de dados, registrando-os e relançando exceções para que as camadas superiores possam tratá-las de forma adequada.
*   **Revalidação de Cache:** A integração com `revalidatePath` é crucial para garantir que as listas e contadores de notificações na UI sejam atualizados após as ações do usuário (marcar como lida, excluir).

Esta documentação oferece uma visão abrangente do sistema de notificações, seu funcionamento interno e sua interação com outras partes do aplicativo, sendo um recurso valioso para desenvolvedores que precisam entender ou estender essa funcionalidade.