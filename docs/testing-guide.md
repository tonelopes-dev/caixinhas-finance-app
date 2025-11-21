# 🚀 Guia de Testes: Atualização e Verificação do Projeto

Com as últimas mudanças, o banco de dados foi alterado e novas lógicas de negócio foram introduzidas. Siga este guia para atualizar seu ambiente local e testar tudo.

## 1. Comandos para Atualizar o Projeto

Você precisará executar dois comandos principais para sincronizar seu banco de dados com o novo `schema.prisma` e populá-lo com os dados de teste atualizados.

```bash
# 1. Aplicar as novas migrações do banco de dados
# Este comando lerá as alterações no `schema.prisma` e atualizará a estrutura do seu banco.
npm run prisma:migrate

# 2. Popular o banco de dados com os novos dados
# O `seed.ts` foi atualizado para incluir o status de trial para os usuários.
npm run db:seed
```

Após executar esses comandos, seu banco de dados estará 100% atualizado. Agora, você pode iniciar a aplicação normalmente:

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

---

## 2. Como Começar a Testar

O objetivo principal é testar o fluxo de **trial (período de teste)** e **expiração de conta**.

### Cenário 1: Usuário Novo (Iniciando o Trial)

1.  **Acesse a página de registro:**
    *   Vá para `http://localhost:9002/register`.
2.  **Crie uma nova conta:**
    *   Use um e-mail que ainda não existe no banco (ex: `teste-trial@email.com`).
3.  **Verifique o acesso:**
    *   Após o registro, você deve ser redirecionado para a tela de seleção de cofres (`/vaults`).
    *   **Resultado esperado:** Você tem acesso total. Pode criar um cofre, acessar seu espaço pessoal, etc. Seu período de trial de 30 dias começou.

### Cenário 2: Simular um Usuário com Trial Expirado

Para este teste, vamos "forçar" a expiração do trial de um dos usuários criados pelo `seed`.

1.  **Abra o Prisma Studio:**
    *   Em um novo terminal, execute: `npm run prisma:studio`.
    *   Isso abrirá uma interface visual do seu banco de dados no navegador.
2.  **Modifique um Usuário:**
    *   Vá para o modelo `User`.
    *   Encontre o usuário **"Julia Mendes (Sem Cofre)"** (email: `julia@teste.com`).
    *   Clique na célula da coluna `trialExpiresAt` e altere a data para uma data no passado (ex: o dia de ontem).
    *   Clique em "Save changes".
3.  **Teste o Acesso Bloqueado:**
    *   Em uma janela anônima do navegador, acesse `http://localhost:9002/login`.
    *   Faça login com as credenciais da Julia:
        *   **E-mail:** `julia@teste.com`
        *   **Senha:** `julia123`
    *   **Resultado esperado:**
        *   Você será redirecionado para a página `/vaults`.
        *   Um alerta vermelho aparecerá no topo da página: **"Seu acesso expirou!"**.
        *   Você **não conseguirá** clicar para acessar seu espaço pessoal "Minha Conta Pessoal".
        *   O botão "Criar Novo Cofre" estará desabilitado.
        *   A única ação permitida seria aceitar um convite para um cofre de um usuário pagante.

### Cenário 3: Acessando um Cofre Compartilhado com Trial Expirado

Este cenário testa a regra mais importante: um usuário com conta expirada ainda pode colaborar em cofres de assinantes.

1.  **Use o usuário com trial expirado (Julia):**
    *   Mantenha a Julia logada (do Cenário 2).
2.  **Convide a Julia para um cofre:**
    *   Em outra janela do navegador (não anônima), faça login com o usuário principal:
        *   **E-mail:** `conta01@email.com`
        *   **Senha:** `conta@123`
    *   Acesse o cofre "Cofre da Família".
    *   Vá para a página de convite (`/invite`) e convide o e-mail `julia@teste.com`.
3.  **Aceite o Convite:**
    *   Volte para a janela onde a Julia está logada.
    *   Atualize a página `/vaults`.
    *   **Resultado esperado:**
        *   Um card de "Convite Pendente" aparecerá.
        *   Clique em "Aceitar".
        *   Agora, na lista de cofres da Julia, o "Cofre da Família" aparecerá.
        *   **Teste final:** Clique no "Cofre da Família". Você deve conseguir acessá-lo e ver o dashboard compartilhado, mesmo com a conta pessoal da Julia bloqueada.

Seguindo esses passos, você conseguirá validar todo o novo fluxo de assinatura e acesso implementado.