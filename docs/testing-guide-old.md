# Guia de Testes do Projeto Caixinhas

## 1. Introdução

Este documento detalha a estratégia e os procedimentos para a realização de testes no projeto "Caixinhas". O objetivo é garantir a qualidade, robustez e a correta funcionalidade de todas as features, desde a autenticação de usuários até a gestão de cofres e caixinhas colaborativas. Uma base de dados consistente e bem populada é essencial para simular cenários reais de uso.

## 2. Visão Geral da Estratégia de Testes

Nossa estratégia de testes foca em:

*   **Testes Unitários:** Verificar o funcionamento isolado de pequenas unidades de código (funções, métodos de serviço).
*   **Testes de Integração:** Assegurar que diferentes módulos e serviços (ex: Server Actions com Services e Banco de Dados) funcionem corretamente em conjunto.
*   **Testes E2E (End-to-End):** Simular o fluxo completo do usuário através da aplicação, garantindo que a experiência de ponta a ponta esteja conforme o esperado.
*   **Testes de Regressão:** Garantir que novas funcionalidades ou correções não introduzam novos bugs ou quebrem funcionalidades existentes.

## 3. Ambiente de Testes

Para garantir um ambiente de testes consistente, seguimos algumas diretrizes:

### 3.1. Configuração do Banco de Dados para Testes

É fundamental que os testes sejam executados em um banco de dados **separado** do ambiente de desenvolvimento ou produção para evitar perda de dados e garantir isolamento.

*   **Variável de Ambiente:** Utilize a variável de ambiente `DATABASE_URL` para apontar para um banco de dados de teste (ex: `file:./test.db` para SQLite).
*   **Limpeza Automática:** Antes de cada execução de testes ou antes de popular o banco com dados de seed, o banco de dados de teste deve ser limpo.

### 3.2. Scripts de Apoio

Dois scripts principais são fornecidos para gerenciar o ambiente de dados de teste:

*   **`scripts/clean-db.ts`:** Responsável por resetar o banco de dados, excluindo todas as tabelas e recriando-as a partir do schema Prisma. Isso garante um estado limpo para o seed.
*   **`prisma/seed.ts`:** Preenche o banco de dados com um conjunto de dados fake abrangente, simulando diversos cenários de uso.

## 4. População de Dados para Testes (`prisma/seed.ts`)

O arquivo `prisma/seed.ts` é o coração da nossa estratégia de dados de teste. Ele é projetado para criar um cenário de dados rico que permite testar todas as principais funcionalidades do projeto.

### 4.1. Ferramentas Utilizadas

*   **Prisma Client:** Para interagir com o banco de dados.
*   **`@faker-js/faker`:** Biblioteca para gerar dados fake realistas (nomes, e-mails, descrições, etc.).

### 4.2. Cenários de Dados Populados

O seed de dados abrange os seguintes tipos de entidades e cenários:

1.  **Usuários (`User`):**
    *   **Usuários Ativos:** Múltiplos usuários com `subscriptionStatus: 'active'`. Estes usuários podem criar cofres, convidar, gerenciar, etc.
    *   **Usuário `Trial`:** Um usuário com `subscriptionStatus: 'trial'` e uma data de expiração no futuro, para testar funcionalidades de período de teste.
    *   **Usuário `Inactive` (Trial Expirado):** Um usuário com `subscriptionStatus: 'trial'` cuja data de expiração (`trialExpiresAt`) está no passado, para testar as restrições de acesso (conforme `docs/user-access-control.md`).
    *   **Usuário Convidado (Sem Conta):** Um e-mail de um usuário que ainda não possui uma conta no sistema, para testar o fluxo de convite.
    *   **Avatares Fake:** Cada usuário recebe um URL de avatar fake para testar a exibição de imagens em diferentes contextos (perfil, membros de cofre).

2.  **Cofres (`Vault`):**
    *   **Cofres Pessoais:** Criados por usuários ativos, acessíveis apenas a eles.
    *   **Cofres Compartilhados:** Criados por usuários ativos, com convites enviados ou aceitos por outros usuários.
    *   **Cofres com Imagens:** Testar o upload e exibição de `imageUrl`.

3.  **Membros do Cofre (`VaultMember`):**
    *   Associações entre usuários e cofres, incluindo diferentes `roles` (proprietário, membro).

4.  **Convites (`Invitation`):**
    *   **Convites Pendentes:** Um usuário envia um convite para outro (existente ou não) que ainda não foi aceito.
    *   **Convites Aceitos:** Um usuário que já aceitou um convite e agora é membro de um cofre.
    *   **Convites Recusados:** Um convite que foi explicitamente recusado.
    *   **Testes de Permissão:** Verificar se apenas o proprietário pode cancelar convites.

5.  **Contas (`Account`):**
    *   Múltiplas contas fictícias associadas a usuários e/ou cofres.

6.  **Caixinhas (`Goal`):**
    *   **Caixinhas Pessoais:** Metas financeiras criadas por usuários para seus próprios objetivos.
    *   **Caixinhas de Cofre:** Metas financeiras criadas dentro de cofres compartilhados, com múltiplos participantes.
    *   **Caixinhas com Diferentes Progressos:** Algumas com `currentAmount` perto de `targetAmount`, outras vazias.

7.  **Transações (`Transaction`):**
    *   Transações de entrada e saída para contas e caixinhas, simulando o fluxo financeiro.

8.  **Categorias (`Category`):**
    *   Categorias predefinidas para organizar as transações.

9.  **Relatórios (`Report`):**
    *   Relatórios gerados e salvos para usuários.

10. **Notificações (`Notification`):**
    *   Diversos tipos de notificações (`vault_invite`, `goal_progress`, etc.) para diferentes usuários, com status de lida/não lida.

### 4.3. Logging Detalhado

O script `seed.ts` incluirá `console.log` para cada etapa principal da criação de dados, permitindo que o desenvolvedor acompanhe o progresso e verifique quais dados foram inseridos.

## 5. Procedimento de Execução dos Testes

Para preparar e executar os testes, siga estes passos:

1.  **Instalar Dependências:** Certifique-se de que todas as dependências do projeto e de testes estejam instaladas. Em particular, para o seed:
    ```bash
    npm install @faker-js/faker --save-dev
    npm install -D ts-node # Se ainda não tiver
    ```
2.  **Configurar Variáveis de Ambiente:** Ajuste o `DATABASE_URL` no seu `.env.local` para apontar para o banco de dados de teste.
    ```
    DATABASE_URL="file:./prisma/test.db" # Exemplo para SQLite
    # Certifique-se de ter as variáveis AWS S3 também para testar uploads de imagem
    AWS_REGION=your-aws-region
    AWS_ACCESS_KEY_ID=your-access-key-id
    AWS_SECRET_ACCESS_KEY=your-secret-access-key
    AWS_S3_BUCKET_NAME=your-s3-test-bucket-name
    ```
3.  **Limpar o Banco de Dados de Teste:**
    ```bash
    ts-node scripts/clean-db.ts
    ```
    Este comando executa `npx prisma migrate reset --force` para garantir que o banco esteja limpo antes do seed.
4.  **Executar o Seed de Dados:**
    ```bash
    npx prisma db seed
    ```
    Observe os logs no console para verificar a criação dos dados.
5.  **Executar os Testes:** Após o seed, execute seus testes (unitários, integração, E2E) utilizando os dados gerados.
    ```bash
    # Exemplo, dependendo do seu framework de teste (ex: Jest, Playwright)
    npm test
    ```

## 6. Boas Práticas

*   **Isolamento:** Sempre teste em um ambiente de banco de dados isolado.
*   **Reproducibilidade:** O seed deve ser determinístico, criando sempre os mesmos dados para que os testes sejam reproduzíveis.
*   **Dados Anônimos:** Utilize dados fake (`faker-js`) para evitar o uso de informações reais e garantir a privacidade.
*   **Cobertura:** Garanta que os dados de seed cubram os casos de uso críticos e edge cases (ex: usuário `inactive`, convites pendentes).
*   **Atualização:** Mantenha o `seed.ts` e este guia de testes atualizados conforme novas funcionalidades são adicionadas ao projeto.

Este guia, juntamente com os scripts fornecidos, deve fornecer uma base sólida para um processo de testes eficaz e eficiente.