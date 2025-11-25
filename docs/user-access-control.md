# Guia de Acesso de Usuário: Trial, Ativo e Expirado

Este documento explica, de forma simples, como o aplicativo Caixinhas controla o que cada usuário pode ver e fazer com base em seu status de assinatura.

## 1. Visão Geral: O Porteiro Inteligente

Pense no sistema de controle de acesso como um "porteiro" inteligente na entrada do seu condomínio financeiro. Ele reconhece cada morador e sabe exatamente quais portas ele pode abrir.

Nosso sistema se baseia em três "crachás" principais que cada usuário possui:

1.  **Crachá `trial` (Visitante VIP):** Para novos usuários que estão conhecendo o aplicativo.
2.  **Crachá `active` (Morador Premium):** Para usuários que são assinantes e têm acesso total.
3.  **Crachá `inactive` (Acesso Expirado):** Para usuários cujo período de teste ou assinatura terminou.

Esse sistema garante que a experiência seja justa: todos podem experimentar o potencial do Caixinhas, mas os membros que apoiam o projeto têm acesso contínuo e irrestrito a todos os benefícios.

---

## 2. O Status "Trial" (Período de Teste)

*   **O que é?**
    É um período de degustação gratuita. Quando um novo usuário se cadastra, ele recebe um "crachá" de **trial**, que lhe dá acesso completo a **todas** as funcionalidades do Caixinhas, como se fosse um assinante. Ele pode criar cofres pessoais, cofres compartilhados, caixinhas, registrar transações, etc.

*   **Como funciona?**
    O sistema funciona como um cronômetro. No momento do cadastro, o "crachá" do usuário é marcado como `trial` e uma data de validade (`trialExpiresAt`) é definida para 30 dias no futuro.

*   **Onde a mágica acontece?**
    A lógica principal está no arquivo `src/services/auth.service.ts`, dentro da função `register`. Quando um novo usuário é criado, essa função define o `subscriptionStatus` como "trial" e calcula a data de expiração.

*   **Quando acontece?**
    No exato momento em que um usuário completa o seu cadastro no aplicativo.

---

## 3. O Status "Active" (Assinante Ativo)

*   **O que é?**
    É o "crachá" de acesso total, sem data para expirar (enquanto a assinatura estiver ativa). Um usuário com status `active` tem liberdade total no aplicativo.

*   **Como funciona?**
    Este status é geralmente concedido após um pagamento bem-sucedido. Em nosso sistema atual, ele ainda não está sendo atribuído automaticamente após uma compra, mas a estrutura está pronta para isso.

*   **Onde a mágica acontece?**
    A mudança para `active` aconteceria, no futuro, em um *webhook* (um gatilho automático) vindo da plataforma de pagamento. Por enquanto, podemos simular isso alterando manualmente o `subscriptionStatus` de um usuário no banco de dados. A verificação do status é feita em lugares como a página `/vaults/page.tsx`.

*   **Quando acontece?**
    Aconteceria quando o usuário se tornasse um assinante pagante do Caixinhas.

---

## 4. O Status "Inactive" (Acesso Expirado)

*   **O que é?**
    É o que acontece quando o "crachá" de `trial` vence e o usuário não se tornou um assinante. Ele não é expulso do "condomínio", mas seu acesso fica limitado.

*   **Como funciona?**
    O sistema não altera o status no banco de dados de `trial` para `inactive`. Em vez disso, ele faz uma verificação inteligente em tempo real:
    1.  O usuário está com o status `trial`?
    2.  Se sim, a data atual é **posterior** à data de expiração (`trialExpiresAt`)?
    3.  Se a resposta for sim, o sistema trata o usuário **como se** ele fosse `inactive`.

    Essa abordagem é eficiente, pois não requer uma atualização constante no banco de dados para cada usuário cujo trial expira.

*   **O que um usuário "inativo" pode (e não pode) fazer?**
    *   **Pode:**
        *   Fazer login e ver a tela de seleção de cofres.
        *   **Aceitar convites** para participar de cofres de outros usuários que são assinantes (`active`).
        *   Colaborar normalmente dentro dos cofres para os quais foi convidado.
    *   **Não Pode:**
        *   Acessar seu próprio espaço pessoal ("Minha Conta Pessoal").
        *   Criar novos cofres compartilhados.

    Essa regra é crucial: a colaboração não é interrompida. Um usuário com acesso expirado ainda pode ser um parceiro valioso no planejamento financeiro de um assinante.

*   **Onde a mágica acontece?**
    A principal verificação ocorre na página `src/app/vaults/page.tsx`. Antes de renderizar a página, o código do servidor busca o usuário, verifica a data de expiração do trial e decide se deve ou não mostrar o alerta de "acesso expirado", bloqueando as funcionalidades restritas.

*   **Quando acontece?**
    Sempre que um usuário com o status `trial` tenta acessar a aplicação após a data de validade do seu período de teste.

---

### Resumo do Fluxo de Vida do Usuário:

`Cadastro` -> `Status: trial` (30 dias de acesso total) -> `Tempo Passa` -> `Data de Expiração Chega` -> `Acesso é Restrito (tratado como inactive)` -> `Usuário Assina (Futuro)` -> `Status: active` (Acesso total restaurado).