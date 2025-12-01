# Sistema de Cofres (Vaults) e Caixinhas (Metas Financeiras)

## 1. Visão Geral: O Coração da Organização Financeira

No projeto "Caixinhas", os **Cofres (Vaults)** e **Caixinhas (Metas Financeiras)** são os conceitos centrais para a organização e gestão das finanças dos usuários. Eles são a materialização da proposta de valor do aplicativo: proporcionar clareza, controle e colaboração no planejamento financeiro, seja ele individual ou compartilhado entre casais ou grupos.

Um **Cofre** atua como um container lógico, um "espaço" onde o dinheiro é visualmente alocado e onde as "Caixinhas" podem ser criadas. Ele pode ser um espaço pessoal ou um ambiente colaborativo. Já as **Caixinhas** são as metas financeiras em si, representações visuais de objetivos específicos de poupança ou despesa. Juntos, eles permitem que o usuário visualize para onde seu dinheiro está indo, o quanto falta para alcançar um objetivo e, em cenários colaborativos, trabalhar em conjunto para atingir metas maiores.

A filosofia por trás de Cofres e Caixinhas é simplificar a complexidade financeira, transformando números abstratos em objetivos tangíveis e gerenciáveis, promovendo a confiança e o planejamento conjunto, conforme a essência do projeto descrita em `about-project.md`.

## 2. Cofres (Vaults): Espaços de Organização e Colaboração

### 2.1. O Que São os Cofres?

Cofres são contêineres virtuais que os usuários criam para organizar suas finanças. Eles podem ser vistos como carteiras digitais ou categorias de alto nível para agrupar metas financeiras (Caixinhas) e transações. A grande inovação dos cofres é a sua capacidade de serem **compartilhados**, permitindo que múltiplos usuários colaborem na gestão de um conjunto de recursos financeiros ou metas.

É crucial entender que um cofre compartilhado *não* une contas bancárias reais. Ele é um *espelho*, uma ferramenta de visualização e planejamento colaborativo. As transações e os valores dentro de um cofre são registros lógicos dentro do aplicativo, não movimentos diretos em contas bancárias externas.

### 2.2. Tipos de Cofres

Os cofres podem ter diferentes características que afetam sua funcionalidade:

*   **Cofre Pessoal/Privado (`isPrivate = true`):** Um cofre pertencente a um único usuário e não destinado ao compartilhamento. Normalmente, o primeiro cofre de um usuário é pessoal. Embora o `isPrivate` no `VaultService` possa ser configurado, o comportamento padrão ou mais comum é que os cofres pessoais não sejam visíveis para outros.
*   **Cofre Colaborativo/Compartilhado (`isPrivate = false`):** Um cofre que um proprietário cria com a intenção de convidar outros usuários. Este tipo de cofre permite que múltiplos membros acessem, visualizem e, dependendo das permissões, gerenciem as caixinhas e transações associadas.

### 2.3. Estrutura de Dados do Cofre (Modelo `Vault` no Prisma)

O modelo `Vault` no `prisma/schema.prisma` define a estrutura de um cofre:

*   `id`: `String` - Identificador único do cofre.
*   `name`: `String` - Nome dado ao cofre (ex: "Despesas Domésticas", "Viagem para Europa").
*   `imageUrl`: `String?` - URL de uma imagem para representar visualmente o cofre (opcional). Usado para personalização na UI.
*   `isPrivate`: `Boolean` - Indica se o cofre é privado (`true`) ou colaborativo (`false`).
*   `ownerId`: `String` - ID do usuário que criou e é o proprietário principal do cofre.
*   `createdAt`: `DateTime` - Data e hora de criação do cofre.
*   `updatedAt`: `DateTime` - Data e hora da última atualização do cofre.
*   `members`: `VaultMember[]` - Relação com a tabela `VaultMember`, indicando todos os usuários que têm acesso a este cofre.
*   `goals`: `Goal[]` - Relação com a tabela `Goal`, representando as caixinhas que pertencem a este cofre.

### 2.4. `VaultService`: O Gerenciador de Cofres (`src/services/vault.service.ts`)

O `VaultService` é a camada de serviço responsável por todas as operações de lógica de negócios relacionadas aos cofres. Ele interage diretamente com o banco de dados via Prisma e é invocado por Server Actions.

**Métodos Chave:**

*   **`static async getUserVaults(userId: string): Promise<VaultWithMembers[]>`:**
    *   **Função:** Retorna todos os cofres dos quais um determinado `userId` é membro (incluindo os que ele é proprietário). Inclui detalhes sobre os membros de cada cofre.
    *   **Relevância:** Essencial para popular a página `/vaults` do usuário.

*   **`static async getVaultById(vaultId: string): Promise<VaultWithMembers | null>`:**
    *   **Função:** Busca um cofre específico pelo seu ID, retornando também os detalhes de seus membros.
    *   **Relevância:** Usado para exibir informações detalhadas de um cofre na UI e para verificações de permissão.

*   **`static async createVault(data: CreateVaultInput): Promise<VaultWithMembers>`:**
    *   **Função:** Cria um novo cofre. Automaticamente adiciona o `ownerId` como o primeiro membro com o papel de `owner`.
    *   **Relevância:** Ponto de entrada para a criação de novos espaços financeiros.

*   **`static async updateVault(vaultId: string, data: UpdateVaultInput): Promise<VaultWithMembers>`:**
    *   **Função:** Atualiza as informações de um cofre existente (nome, URL da imagem, status de privacidade).
    *   **Relevância:** Usado para edição de cofres, como na `EditVaultDialog`.

*   **`static async deleteVault(vaultId: string): Promise<void>`:**
    *   **Função:** Exclui um cofre. Esta operação geralmente deve ser restrita ao proprietário e pode ter implicações em cascata (ex: exclusão de caixinhas e convites associados).
    *   **Relevância:** Funcionalidade de administração de cofres.

*   **`static async addMember(vaultId: string, userId: string, role: 'member' | 'admin' = 'member'): Promise<void>`:**
    *   **Função:** Adiciona um usuário como membro a um cofre específico com um determinado `role`.
    *   **Relevância:** Parte do processo de aceitação de convite ou adição manual de membros.

*   **`static async removeMember(vaultId: string, userId: string): Promise<void>`:**
    *   **Função:** Remove um usuário de um cofre.
    *   **Relevância:** Usado para gerenciar a colaboração e a remoção de acesso.

*   **`static async isMember(vaultId: string, userId: string): Promise<boolean>`:**
    *   **Função:** Verifica se um dado `userId` é membro de um `vaultId`.
    *   **Relevância:** Crucial para verificações de autorização e controle de acesso.

*   **Sistema de Convites (`createInvitation`, `getPendingInvitations`, `acceptInvitation`, `declineInvitation`, `cancelInvitation`, etc.):**
    *   **Função:** Gerencia todo o ciclo de vida de convites para cofres, conforme detalhado em `docs/vault-invitation-system.md`.
    *   **Relevância:** Permite a funcionalidade colaborativa dos cofres.

### 2.5. Membros do Cofre (`VaultMember`)

O modelo `VaultMember` (também no `prisma/schema.prisma`) é uma tabela de junção que modela a relação muitos-para-muitos entre `User` e `Vault`. Ele define quem tem acesso a qual cofre.

*   `id`: `String` - Identificador único.
*   `vaultId`: `String` - ID do cofre.
*   `userId`: `String` - ID do usuário membro.
*   `role`: `String` - O papel do usuário dentro do cofre (ex: `owner`, `member`, `admin`). Isso é fundamental para um controle de acesso mais granular (embora apenas `owner` e `member` pareçam ser usados atualmente).

### 2.6. UI/UX dos Cofres

*   **`src/app/vaults/page.tsx`:** A principal página onde os usuários veem um resumo de todos os seus cofres (pessoais e compartilhados) e convites pendentes.
*   **`src/components/vaults/vaults-page-client.tsx`:** O componente cliente que renderiza a lista de cofres e lida com as interações do usuário.
*   **`src/components/vaults/create-vault-dialog.tsx`:** Um modal para a criação de novos cofres.
*   **`src/components/vaults/edit-vault-dialog.tsx`:** Um modal/diálogo para editar as informações de um cofre, gerenciar membros e convites.
*   **`src/app/dashboard/page.tsx`:** O dashboard pode exibir um resumo dos cofres mais importantes ou o saldo total consolidado.

## 3. Caixinhas (Metas Financeiras / Goals): Objetivos Tangíveis

### 3.1. O Que São as Caixinhas?

As Caixinhas, formalmente chamadas de "Goals" (Metas), são objetivos financeiros específicos que os usuários desejam alcançar. Elas representam um valor que o usuário planeja poupar ou gastar em algo particular. Cada Caixinha tem um propósito, um valor alvo, um progresso atual e pode ser personalizada com um emoji e uma imagem.

Elas podem existir de forma **pessoal** (vinculadas diretamente a um usuário) ou ser **associadas a um Cofre** (vinculadas a um `vaultId`), permitindo que a meta seja um esforço colaborativo dentro de um espaço compartilhado.

### 3.2. Estrutura de Dados da Caixinha (Modelo `Goal` no Prisma)

O modelo `Goal` no `prisma/schema.prisma` define a estrutura de uma Caixinha:

*   `id`: `String` - Identificador único da caixinha.
*   `name`: `String` - Nome da meta (ex: "Carro Novo", "Reserva de Emergência").
*   `targetAmount`: `Float` - O valor total que se deseja alcançar para esta meta.
*   `currentAmount`: `Float` - O valor atualmente economizado ou contribuído para a meta.
*   `emoji`: `String` - Um emoji para personalizar visualmente a caixinha.
*   `visibility`: `String` - A visibilidade da caixinha (ex: `shared`, `private`). Se `shared`, ela pode ser vista pelos membros do cofre. Se `private`, apenas o proprietário pode vê-la.
*   `isFeatured`: `Boolean` - Um flag para marcar a caixinha como "em destaque" na UI.
*   `userId`: `String?` - ID do usuário proprietário, se for uma caixinha pessoal (nullable se for de um cofre).
*   `vaultId`: `String?` - ID do cofre ao qual a caixinha pertence (nullable se for pessoal).
*   `createdAt`: `DateTime` - Data e hora de criação da caixinha.
*   `updatedAt`: `DateTime` - Data e hora da última atualização da caixinha.
*   `participants`: `GoalParticipant[]` - Relação com a tabela `GoalParticipant`, indicando quem está contribuindo ou envolvido nesta meta.

### 3.3. `GoalService`: O Gerenciador de Caixinhas (`src/services/goal.service.ts`)

O `GoalService` é o serviço dedicado a todas as operações relacionadas às Caixinhas. Ele lida com a criação, atualização, exclusão e gerenciamento do progresso das metas.

**Métodos Chave:**

*   **`static async getUserGoals(userId: string): Promise<any[]>`:**
    *   **Função:** Retorna todas as caixinhas pessoais de um usuário.
*   **`static async getVaultGoals(vaultId: string): Promise<any[]>`:**
    *   **Função:** Retorna todas as caixinhas associadas a um cofre específico.
*   **`static async getGoals(ownerId: string, ownerType: 'user' | 'vault'): Promise<any[]>`:**
    *   **Função:** Método genérico para buscar caixinhas, seja por `userId` ou `vaultId`.
*   **`static async getGoalById(goalId: string): Promise<any | null>`:**
    *   **Função:** Busca uma caixinha específica pelo seu ID.
*   **`static async createGoal(data: { name: string; targetAmount: number; emoji: string; ownerId: string; ownerType: 'user' | 'vault'; ... }): Promise<any>`:**
    *   **Função:** Cria uma nova caixinha, associando-a a um usuário ou a um cofre.
*   **`static async updateGoal(goalId: string, data: Partial<...>): Promise<any>`:**
    *   **Função:** Atualiza as informações de uma caixinha (nome, valor alvo, emoji, visibilidade, etc.). Suporta a mudança de `owner` (de usuário para cofre, por exemplo).
*   **`static async deleteGoal(goalId: string): Promise<void>`:**
    *   **Função:** Exclui uma caixinha.
*   **`static async addToGoal(goalId: string, amount: number): Promise<any>`:**
    *   **Função:** Adiciona um valor ao `currentAmount` de uma caixinha (simula um depósito).
*   **`static async removeFromGoal(goalId: string, amount: number): Promise<any>`:**
    *   **Função:** Remove um valor do `currentAmount` de uma caixinha (simula uma retirada), garantindo que o valor não fique negativo.
*   **`static async addParticipant(goalId: string, userId: string, role: string = 'member'): Promise<any>`:**
    *   **Função:** Adiciona um usuário como participante a uma caixinha (útil para metas colaborativas dentro de cofres).
*   **`static async removeParticipant(goalId: string, userId: string): Promise<void>`:**
    *   **Função:** Remove um participante de uma caixinha.
*   **`static calculateProgress(currentAmount: number, targetAmount: number): number`:**
    *   **Função:** Calcula o progresso em porcentagem de uma caixinha.
*   **`static async calculateTotalSaved(ownerId: string, ownerType: 'user' | 'vault'): Promise<number>`:**
    *   **Função:** Soma o `currentAmount` de todas as caixinhas de um usuário ou cofre.
*   **`static async getFeaturedGoals(ownerId: string, ownerType: 'user' | 'vault'): Promise<any[]>`:**
    *   **Função:** Retorna caixinhas marcadas como `isFeatured`.
*   **`static async toggleFeatured(goalId: string): Promise<any>`:**
    *   **Função:** Alterna o status `isFeatured` de uma caixinha.

### 3.4. Participantes da Caixinha (`GoalParticipant`)

O modelo `GoalParticipant` (no `prisma/schema.prisma`) associa usuários a caixinhas, semelhante ao `VaultMember`.

*   `id`: `String` - Identificador único.
*   `goalId`: `String` - ID da caixinha.
*   `userId`: `String` - ID do usuário participante.
*   `role`: `String` - O papel do usuário na caixinha (ex: `member`).

### 3.5. UI/UX das Caixinhas

*   **`src/app/(private)/goals/page.tsx`:** A página principal para visualizar e gerenciar as caixinhas (metas).
*   **`src/app/(private)/goals/[id]/page.tsx`:** Página de detalhes de uma caixinha específica.
*   **`src/app/(private)/goals/new/page.tsx`:** Página para criação de novas caixinhas.
*   **`src/components/goals/goal-card.tsx`:** Componente de card que exibe um resumo de uma caixinha (nome, progresso, emoji).
*   **`src/components/dashboard/goal-buckets.tsx`:** Componente no dashboard que exibe as caixinhas, talvez as em destaque ou as mais próximas do objetivo.
*   **`src/components/goals/manage-goal-client.tsx`:** Componente para gerenciar os detalhes de uma caixinha, incluindo participantes.
*   **`src/components/goals/goal-transaction-dialog.tsx`:** Modal para adicionar/remover valores de uma caixinha.

## 4. Sinergia entre Cofres e Caixinhas

A verdadeira força do sistema reside na sinergia entre Cofres e Caixinhas. Eles não são entidades isoladas, mas sim partes de um ecossistema financeiro coeso:

*   **Organização Hierárquica:** Cofres fornecem uma camada de organização superior. Um usuário pode ter um cofre para "Despesas Mensais" e, dentro dele, Caixinhas para "Aluguel", "Contas de Consumo", "Mercado".
*   **Colaboração em Nível Múltiplo:** Um cofre compartilhado permite que todos os seus membros vejam e colaborem nas Caixinhas contidas nele. Por exemplo, um cofre "Família" pode ter uma caixinha "Férias" onde todos os membros contribuem.
*   **Contexto de Propriedade:** Uma caixinha pode ser "pessoal" (pertencente diretamente a um `userId`) ou "de cofre" (pertencente a um `vaultId`). Isso é gerenciado pelo campo `ownerType` no `createGoal` e `updateGoal` do `GoalService`, que define se `userId` ou `vaultId` será preenchido.
*   **Transações:** Embora não detalhadas aqui, as transações (adição/remoção de valores) em Caixinhas impactam diretamente o `currentAmount`, e essas transações podem ser visualizadas no contexto do Cofre ou da própria Caixinha.

**Exemplos de Uso Integrado:**

1.  **Cofre "Finanças Pessoais" (Privado):** Contém caixinhas como "Reserva de Emergência", "Aposentadoria", "Educação". Todas são gerenciadas apenas pelo proprietário.
2.  **Cofre "Despesas do Apartamento" (Compartilhado entre 2 usuários):** Contém caixinhas como "Aluguel", "Contas de Luz", "Supermercado". Ambos os usuários podem contribuir para essas caixinhas e ver o progresso.
3.  **Cofre "Viagem dos Sonhos" (Compartilhado entre 3 amigos):** Contém uma única caixinha "Fundo de Viagem". Todos os 3 amigos são membros do cofre e participantes da caixinha, contribuindo para a meta comum.

## 5. Tecnologias e Integrações Comuns

*   **Prisma ORM:** Fundamental para a definição dos modelos (`User`, `Vault`, `Goal`, `VaultMember`, `GoalParticipant`, `Invitation`) e para todas as interações de banco de dados, garantindo a integridade referencial entre cofres, caixinhas e usuários.
*   **Next.js Server Actions (`src/app/vaults/actions.ts`, `src/app/(private)/goals/actions.ts`):** Atuam como os orquestradores que recebem requisições do frontend, realizam validações e invocam os métodos apropriados do `VaultService` e `GoalService`.
*   **Autenticação e Autorização (`next-auth`, `AuthService`, `src/lib/auth.ts`, `middleware.ts`):** Garantem que apenas usuários autenticados e autorizados possam criar, modificar, visualizar ou interagir com cofres e caixinhas. Verificações de `ownerId` e `isMember` são constantes nos serviços.
*   **Notificações (`NotificationService`):** Eventos como a criação de um cofre, adição de um membro a um cofre, ou alterações importantes em uma caixinha podem disparar notificações relevantes para os usuários envolvidos (`docs/notification-system.md`).
*   **Revalidação de Cache (`next/cache`, `revalidatePath`):** Após qualquer alteração em cofres ou caixinhas (criação, atualização, exclusão, adição de valores), `revalidatePath` é utilizada para garantir que a interface do usuário seja atualizada com os dados mais recentes.

## 6. Considerações de Design e Arquitetura

*   **Encapsulamento de Lógica:** A lógica de negócios complexa é isolada dentro de `VaultService` e `GoalService`, promovendo a reutilização de código e facilitando a manutenção.
*   **Tratamento de Erros:** Os serviços incluem blocos `try-catch` robustos para lidar com falhas de banco de dados e outras exceções, fornecendo mensagens de erro claras para as camadas superiores.
*   **Flexibilidade:** A separação clara entre cofres e caixinhas, e a capacidade de vincular caixinhas a usuários ou cofres, oferece grande flexibilidade para futuras expansões e novos casos de uso.
*   **Segurança:** A implementação de papéis (`owner`, `member`) e as verificações de permissão em nível de serviço são cruciais para a segurança dos dados financeiros.

Este documento serve como um guia completo para entender a arquitetura, o funcionamento e a profunda interconexão dos sistemas de Cofres e Caixinhas, que são o cerne da proposta de valor do projeto.