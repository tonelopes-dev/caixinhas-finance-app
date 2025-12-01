# Sistema de Convites de Cofres (Vaults)

## 1. Visão Geral

O sistema de convites de cofres é um recurso fundamental deste projeto, projetado para facilitar a colaboração e o compartilhamento de informações financeiras. Ele permite que um usuário ("proprietário do cofre") convide outros usuários para acessar e interagir com um "cofre" específico. O principal objetivo é transformar cofres individuais em espaços colaborativos, onde múltiplos usuários podem ter uma visão compartilhada das finanças, sem a necessidade de compartilhar credenciais bancárias reais, priorizando a segurança e o controle de acesso.

## 2. Por Que Existe? (Objetivos e Benefícios)

*   **Colaboração Financeira:** Possibilitar que casais, famílias, pequenos grupos ou equipes gerenciem finanças em conjunto de forma transparente.
*   **Compartilhamento Controlado:** Oferecer um mecanismo seguro para compartilhar dados financeiros específicos sem expor todas as informações da conta de um usuário.
*   **Flexibilidade:** Adaptar a funcionalidade dos cofres de um uso estritamente individual para um modelo colaborativo.
*   **Controle de Acesso:** O proprietário do cofre mantém controle total sobre quem pode acessar e o nível de acesso ao cofre.
*   **Auditoria e Rastreabilidade:** Registrar o ciclo de vida dos convites e as interações dos membros.

## 3. Como Funciona? (Fluxo de Processo Detalhado)

O ciclo de vida de um convite a um cofre segue estas etapas principais:

### 3.1. Iniciação do Convite

1.  **Ação do Proprietário:** O proprietário de um cofre acessa a interface de gerenciamento do cofre (por exemplo, `EditVaultDialog`) e insere o endereço de e-mail do usuário que deseja convidar.
2.  **Server Action:** A `inviteToVaultAction` é invocada com o `vaultId` e o `email` do convidado.
3.  **Autorização:** A `inviteToVaultAction` verifica a sessão do usuário (`getServerSession`) para garantir que o remetente esteja autenticado e seja o proprietário do cofre, tendo permissão para convidar.
4.  **Serviço de Cofre:** O `VaultService.inviteToVault(vaultId, email, userId)` é chamado.
5.  **Persistência:** O `VaultService` cria um novo registro na tabela `Invitation` no banco de dados. Este registro inclui `senderId` (proprietário), `recipientEmail` (e-mail do convidado), `targetId` (o `vaultId`), `targetName` (nome do cofre), e o `status` inicial `pending`.
6.  **Envio de E-mail:** Um e-mail transacional é enviado ao `recipientEmail` usando o serviço de e-mail configurado (e.g., SendGrid). Este e-mail contém uma notificação do convite, o nome do cofre, o nome do remetente e um link (ou instruções) para aceitar ou recusar o convite. O template de e-mail `invite-template.ts` em `src/app/_templates/emails/` é utilizado para formatar esta mensagem.
7.  **Revalidação de Cache:** `revalidatePath(`/vaults/${vaultId}/manage`)` é chamada para atualizar a UI do proprietário, mostrando o convite pendente.

### 3.2. Resposta ao Convite (Aceitação/Recusa)

1.  **Notificação do Convidado:** O usuário convidado recebe o e-mail ou visualiza o convite pendente na sua página `/vaults` (carregado via `getUserVaultsData`).
2.  **Ação do Convidado:** O convidado clica no botão "Aceitar" ou "Recusar" associado ao convite.
3.  **Server Action (Aceitação):** Se "Aceitar" for clicado, a `acceptInvitationAction(invitationId, userId)` é invocada.
    *   Verifica a autenticação do `userId` (o destinatário).
    *   Chama `VaultService.acceptInvitation(invitationId, userId)`.
    *   O `VaultService` atualiza o `status` do registro `Invitation` para `accepted`.
    *   Um novo registro é criado na tabela `VaultMember`, associando o `userId` do convidado ao `vaultId` do cofre, estabelecendo-o como membro.
    *   `revalidatePath('/vaults')` e `revalidatePath('/dashboard')` são chamadas para que o cofre agora seja exibido na lista de cofres do usuário convidado.
4.  **Server Action (Recusa):** Se "Recusar" for clicado, a `declineInvitationAction(invitationId, userId)` é invocada.
    *   Verifica a autenticação do `userId` (o destinatário).
    *   Chama `VaultService.declineInvitation(invitationId, userId)`.
    *   O `VaultService` atualiza o `status` do registro `Invitation` para `declined` ou, dependendo da regra de negócio, pode até remover o registro.
    *   `revalidatePath('/vaults')` é chamada para remover o convite da lista de convites pendentes do usuário.

### 3.3. Gerenciamento Pós-Convite

1.  **Visualização de Convites Pendentes:** O proprietário do cofre pode usar a `getVaultPendingInvitationsAction(vaultId)` para listar todos os convites que ainda não foram respondidos para um cofre específico.
2.  **Cancelamento de Convites:** O proprietário pode usar a `cancelInvitationAction(invitationId, vaultId)` para cancelar um convite pendente.
    *   Verifica a autorização do proprietário para cancelar.
    *   Chama `VaultService.cancelInvitation(invitationId)`.
    *   O `VaultService` atualiza o status do convite ou o remove.
    *   `revalidatePath(`/vaults/${vaultId}/manage`)` é chamada.
3.  **Remoção de Membros:** O proprietário pode usar a `removeMemberAction(vaultId, memberId)` para remover um membro de um cofre.
    *   Verifica a autorização do proprietário para remover membros.
    *   Chama `VaultService.removeMember(vaultId, memberId)`.
    *   O `VaultService` remove o registro `VaultMember` correspondente no banco de dados.
    *   `revalidatePath('/vaults')` e `revalidatePath(`/vaults/${vaultId}/manage`)` são chamadas para atualizar a UI do proprietário e do membro removido.

## 4. Componentes e Sistemas Envolvidos

### 4.1. Frontend (Interface do Usuário)

*   **`src/app/vaults/page.tsx`:** A página principal onde os usuários visualizam seus cofres e convites.
*   **`src/components/vaults/edit-vault-dialog.tsx`:** Um componente modal ou de diálogo usado pelo proprietário do cofre para:
    *   Enviar novos convites (interage com `inviteToVaultAction`).
    *   Visualizar convites pendentes (obtém dados de `getVaultPendingInvitationsAction`).
    *   Cancelar convites pendentes (interage com `cancelInvitationAction`).
    *   Remover membros (interage com `removeMemberAction`).
*   **Outros componentes de UI:** Podem exibir a lista de membros de um cofre, o status de convites, etc.

### 4.2. Backend (Next.js Server Actions)

Localizados em `src/app/vaults/actions.ts`:

*   **`getUserVaultsData(userId: string)`:** Busca dados do usuário, seus cofres e convites pendentes.
*   **`createVaultAction(...)`:** Cria um novo cofre.
*   **`updateVaultAction(...)`:** Atualiza um cofre existente.
*   **`deleteVaultAction(vaultId: string)`:** Exclui um cofre.
*   **`acceptInvitationAction(invitationId: string, userId: string)`:** Ação para aceitar um convite.
*   **`declineInvitationAction(invitationId: string, userId: string)`:** Ação para recusar um convite.
*   **`removeMemberAction(vaultId: string, memberId: string)`:** Ação para remover um membro de um cofre.
*   **`inviteToVaultAction(vaultId: string, email: string)`:** Ação para enviar um novo convite.
*   **`getVaultPendingInvitationsAction(vaultId: string)`:** Busca convites pendentes para um cofre específico.
*   **`cancelInvitationAction(invitationId: string, vaultId: string)`:** Ação para cancelar um convite pendente.

Estas Server Actions são a ponte entre o frontend e a lógica de negócios no `VaultService`.

### 4.3. Camada de Serviços

*   **`src/services/vault.service.ts`:** Este é o coração da lógica de negócios para cofres e convites. Ele encapsula as operações de banco de dados e as regras de negócio. Métodos chave incluem:
    *   `createVault`, `getVaultById`, `updateVault`, `deleteVault`
    *   `getUserVaults`, `getPendingInvitations`
    *   `acceptInvitation`, `declineInvitation`, `inviteToVault`, `removeMember`, `cancelInvitation`
    *   `getVaultPendingInvitations`, `getInvitationById`
*   **`src/services/auth.service.ts`:** Usado indiretamente para obter informações do usuário (`getUserById`) e para autenticação e autorização através de `next-auth` (`getServerSession`).

### 4.4. Banco de Dados (Prisma ORM)

O `prisma/schema.prisma` define os modelos de dados cruciais:

*   **`User`:** Contém informações dos usuários, incluindo `id`, `name`, `email`, `avatarUrl`, etc.
*   **`Vault`:** Representa um cofre, com `id`, `name`, `imageUrl`, `isPrivate`, `ownerId`.
*   **`Invitation`:** Armazena os detalhes dos convites:
    *   `id` (ID único do convite)
    *   `senderId` (ID do usuário que enviou o convite)
    *   `recipientEmail` (E-mail do usuário convidado)
    *   `targetId` (ID do cofre para o qual o convite foi enviado)
    *   `targetName` (Nome do cofre)
    *   `status` (`pending`, `accepted`, `declined`)
    *   `createdAt`, `updatedAt`
*   **`VaultMember`:** Uma tabela de junção (ou modelo explícito) que associa usuários a cofres dos quais são membros. Contém `userId` e `vaultId`.

### 4.5. Serviço de E-mail

*   **Integração:** Conforme documentado em `docs/send-emails.md`, o projeto utiliza um provedor de e-mail (e.g., SendGrid).
*   **Templates:** `src/app/_templates/emails/invite-template.ts` é o template utilizado para gerar o conteúdo HTML dos e-mails de convite, garantindo uma experiência consistente e informativa para o convidado.

## 5. Possibilidades e Casos de Uso

*   **Cofres Familiares:** Gerenciar orçamentos domésticos, despesas compartilhadas, metas de poupança em família.
*   **Cofres de Projeto/Equipe:** Pequenas equipes podem usar cofres para rastrear despesas de projeto, fundos operacionais ou investimentos colaborativos.
*   **Metas de Poupança Compartilhadas:** Amigos ou parceiros podem criar um cofre conjunto para economizar para uma viagem, compra grande ou evento.
*   **Planejamento Financeiro Conjunto:** Casais podem visualizar e planejar suas finanças em conjunto, acompanhando rendimentos e despesas em um único local.
*   **Acesso Temporário:** Em cenários futuros, a possibilidade de convites com validade ou com permissões restritas (somente leitura) poderia ser explorada.

## 6. Considerações de Segurança e Permissões

*   **Proprietário do Cofre:** Apenas o `ownerId` do cofre tem permissão para enviar convites, cancelar convites pendentes e remover membros.
*   **Verificação de Autenticação:** Todas as Server Actions relacionadas a convites exigem que o usuário esteja autenticado (`session?.user`).
*   **Verificação de Autorização:** Antes de realizar operações críticas (excluir cofre, remover membro, convidar), é feita uma verificação para garantir que o usuário tenha as permissões necessárias (por exemplo, ser o `ownerId` do cofre).
*   **Privacidade:** O sistema garante que os usuários só vejam os convites e cofres para os quais foram explicitamente convidados ou dos quais são membros.

Esta documentação serve como um guia abrangente para entender a arquitetura e o funcionamento do sistema de convites de cofres neste projeto.