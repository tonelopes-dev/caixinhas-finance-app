import { test, expect } from '@playwright/test';

test.describe('Gestão de Transações - CRUD Completo', () => {
    
    test.beforeEach(async ({ page }) => {
        // LOGIN
        await page.goto('/login');
        await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
        await page.getByLabel(/Senha/i).fill('password123');
        await page.getByRole('button', { name: 'Entrar' }).click();
        
        // Esperar chegar na página de seleção de cofres e entrar no primeiro
        await page.waitForURL(/.*vaults/, { timeout: 15000 });
        await page.locator('div, button').filter({ hasText: 'Cofre' }).first().click();
        
        // Ir para transações
        await page.goto('/transactions');
        await page.waitForURL(/.*transactions/, { timeout: 15000 });
    });

    test('Deve criar uma despesa simples de 3 passos', async ({ page }) => {
        const description = `Almoço Executivo ${Date.now()}`;
        
        // 1. Abrir diálogo de criação
        await page.getByRole('button', { name: /Adicionar/i }).first().click();
        
        // Step 1: Descrição e Categoria
        await page.getByPlaceholder(/O que você está pagando ou recebendo/i).fill(description);
        await page.getByLabel(/Categoria/i).click();
        // Clicar em uma categoria do dropdown (ex: Alimentação)
        await page.getByRole('option', { name: /Alimentação/i }).first().click();
        await page.getByRole('button', { name: /Próximo Passo/i }).click();
        
        // Step 2: Detalhes (Tipo e Conta)
        await page.getByLabel(/Tipo de Operação/i).click();
        await page.getByRole('option', { name: /Saída/i }).first().click();
        await page.getByLabel(/De onde sai o dinheiro/i).click();
        await page.getByRole('option').first().click(); // Seleciona a primeira conta disponível
        await page.getByRole('button', { name: /Próximo Passo/i }).click();
        
        // Step 3: Valor
        await page.getByLabel(/Valor Total/i).fill('45,90');
        await page.getByRole('button', { name: /Finalizar e Salvar/i }).click();
        
        // Verificação final
        await expect(page.getByText(description)).toBeVisible();
    });

    test('Deve criar uma despesa parcelada (3x)', async ({ page }) => {
        const description = `Notebook ${Date.now()}`;
        
        await page.getByRole('button', { name: /Adicionar/i }).first().click();
        
        // Step 1
        await page.getByPlaceholder(/O que você está pagando ou recebendo/i).fill(description);
        await page.getByLabel(/Categoria/i).click();
        await page.getByRole('option', { name: /Eletrônicos|Outros/i }).first().click();
        await page.getByRole('button', { name: /Próximo Passo/i }).click();
        
        // Step 2
        await page.getByLabel(/Tipo de Operação/i).click();
        await page.getByRole('option', { name: /Saída/i }).first().click();
        await page.getByLabel(/De onde sai o dinheiro/i).click();
        await page.getByRole('option').first().click();
        
        // Habilitar parcelamento (Splits)
        await page.getByLabel(/Dividir em parcelas/i).click();
        await page.getByLabel(/Número de Parcelas/i).fill('3');
        await page.getByRole('button', { name: /Próximo Passo/i }).click();
        
        // Step 3
        await page.getByLabel(/Valor Total/i).fill('3000,00');
        await page.getByRole('button', { name: /Finalizar e Salvar/i }).click();
        
        await expect(page.getByText(description)).toBeVisible();
    });

    test('Deve editar e depois excluir uma transação', async ({ page }) => {
        // Encontrar a primeira transação da lista
        const firstTransaction = page.locator('div, button').filter({ hasText: /R\$/ }).first();
        const description = await firstTransaction.locator('h3, p').first().textContent();
        
        // 1. Editar
        await firstTransaction.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).click();
        await page.getByRole('menuitem', { name: /Editar/i }).click();
        
        const newDescription = `${description} (Editado)`;
        await page.getByPlaceholder(/O que você está pagando ou recebendo/i).fill(newDescription);
        await page.getByRole('button', { name: /Salvar Alterações/i }).click();
        
        await expect(page.getByText(newDescription)).toBeVisible();
        
        // 2. Excluir
        const editedTransaction = page.locator('div, button').filter({ hasText: newDescription }).last();
        await editedTransaction.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).click();
        await page.getByRole('menuitem', { name: /Excluir/i }).click();
        
        // Confirmar exclusão no AlertDialog
        await page.getByRole('button', { name: /Sim, excluir/i }).click();
        
        await expect(page.getByText(newDescription)).not.toBeVisible();
    });

});
