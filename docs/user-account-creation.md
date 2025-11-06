# Sistema de Criação de Contas de Usuário

Este documento detalha o processo automatizado de criação e gerenciamento de contas de usuário, que é acionado por eventos da plataforma de pagamento Kiwify e gerenciado pelo serviço de autenticação Clerk.

## 1. Visão Geral

A criação de contas de usuário não é feita por um formulário de registro tradicional. Em vez disso, ela é totalmente automatizada e ocorre no momento em que um cliente finaliza uma compra com sucesso pela Kiwify. Essa abordagem simplifica a jornada do usuário, concedendo acesso ao produto imediatamente após o pagamento.

O fluxo principal é:

1.  Cliente compra um produto/assinatura na Kiwify.
2.  Kiwify envia um webhook de `order_approved` para a nossa aplicação.
3.  A aplicação verifica se o cliente já possui uma conta.
4.  Se não possuir, cria uma nova conta no Clerk e envia um e-mail de boas-vindas com as credenciais.
5.  Se já possuir, atualiza seu status de assinatura.

## 2. Tecnologias Principais

-   **Clerk:** Serviço de plataforma como serviço (PaaS) para autenticação e gerenciamento de usuários. Ele cuida de toda a complexidade de logins, sessões, perfis de usuário e segurança.
-   **Kiwify Webhook:** O gatilho que inicia todo o processo. Especificamente, o evento `order_approved`.
-   **SendGrid:** Utilizado para enviar o e-mail transacional de boas-vindas com as credenciais de acesso.
-   **generate-password:** Uma biblioteca para gerar senhas aleatórias e seguras para os novos usuários.

## 3. O Fluxo de Criação de Conta Detalhado

O processo ocorre inteiramente no back-end, dentro do nosso webhook da Kiwify (`app/api/webhooks/kiwify/route.ts`).

#### Passo 1: Receber e Validar o Evento

O webhook aguarda por um evento `order_approved`. Ao receber, ele primeiro valida os dados para garantir que são legítimos e contêm as informações necessárias, como os dados do cliente (`Customer`).

#### Passo 2: Verificar a Existência do Usuário

A aplicação extrai o e-mail do cliente (`Customer.email`) dos dados do webhook e usa a API do Clerk para verificar se já existe um usuário com esse endereço de e-mail.

```typescript
const users = await clerkClient().users.getUserList({
  emailAddress: [emailCustomer],
});
```

#### Passo 3: Cenário de Novo Usuário (`users.data.length === 0`)

Se nenhum usuário é encontrado, a aplicação executa os seguintes passos:

1.  **Gerar Senha Segura:** Uma senha temporária é criada usando a biblioteca `generate-password`.
    ```typescript
    const password = generatePassword.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
    });
    ```

2.  **Criar o Usuário no Clerk:** Um novo registro de usuário é criado no painel do Clerk através da API.
    ```typescript
    const newUser = await clerkClient().users.createUser({
      emailAddress: [emailCustomer],
      firstName: Customer.first_name,
      password,
      publicMetadata: {
        subscriptionPlan: "essential",
        subscriptionStatus: "active",
      },
    });
    ```
    -   **`publicMetadata`:** Este é um campo crucial. Armazenamos o plano (`subscriptionPlan`) e o status da assinatura (`subscriptionStatus`) diretamente nos metadados do usuário no Clerk. Isso permite que a aplicação verifique facilmente as permissões do usuário em qualquer lugar do front-end ou back-end sem precisar consultar a Kiwify novamente.

3.  **Enviar E-mail de Boas-Vindas:** Um e-mail é disparado via SendGrid, contendo o e-mail de login e a senha temporária gerada, com instruções para o usuário fazer o login e alterar a senha.

#### Passo 4: Cenário de Usuário Existente

Se um usuário com o mesmo e-mail já existe (por exemplo, um cliente antigo que está comprando novamente), a aplicação simplesmente atualiza seus dados no Clerk.

1.  **Atualizar Metadados:** O `publicMetadata` do usuário é atualizado para reativar sua assinatura.
    ```typescript
    await clerkClient().users.updateUser(userId, {
      publicMetadata: {
        ...existingUser.publicMetadata,
        subscriptionStatus: "active",
      },
    });
    ```
2.  **Enviar E-mail de Confirmação:** Um e-mail notificando a reativação ou atualização da assinatura é enviado.

## 4. Como Replicar este Sistema

1.  **Configure o Clerk:** Crie uma conta no Clerk e configure um projeto. Obtenha sua `CLERK_SECRET_KEY`.
2.  **Integre o SDK do Clerk:** Instale `@clerk/nextjs` e envolva sua aplicação com o `<ClerkProvider>` conforme a documentação oficial.
3.  **Crie o Webhook:** Configure um endpoint de API (como `app/api/webhooks/kiwify/route.ts`) para receber os eventos da Kiwify.
4.  **Implemente a Lógica:** Dentro do seu webhook, para o evento `order_approved`, implemente o fluxo de verificação (`getUserList`) e criação/atualização (`createUser`/`updateUser`) de usuários usando a API do Clerk.
5.  **Gerencie Metadados:** Defina uma estrutura para os `publicMetadata` que faça sentido para o seu negócio (ex: planos, permissões, datas de expiração) e certifique-se de atualizá-la a cada evento relevante (compra, cancelamento, etc.).
6.  **Envie Credenciais por E-mail:** Integre um serviço de e-mail como o SendGrid para notificar os novos usuários sobre a criação da conta e fornecer a eles a senha temporária.

Ao seguir este modelo, você cria um sistema de integração de ponta a ponta que automatiza o ciclo de vida do cliente desde o pagamento até o acesso ao produto, de forma segura e eficiente.
