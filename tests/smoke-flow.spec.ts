import { test, expect } from '@playwright/test';

/**
 * Smoke Test: Fluxo Completo de Onboarding e Uso do Usuário
 */

test.describe('Fluxo Principal do Usuário (Smoke Test)', () => {
  
  test('deve completar a jornada de configuração inicial', async ({ page }) => {
    // 1. LOGIN
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Esperar chegar na página de seleção de cofres
    await expect(page).toHaveURL(/\/vaults/);
    console.log('✅ Login realizado com sucesso');

    // 2. CRIAR NOVO COFRE
    await page.getByText('Criar Novo Cofre').click();
    await page.getByPlaceholder(/Ex: Reforma da Casa/i).fill('Cofre de Teste Automatizado');
    
    // Passo 2 do modal (Imagem)
    await page.getByRole('button', { name: /Continuar/i }).click();
    
    // Passo 3 do modal (Privacidade)
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Finalizar
    await page.getByRole('button', { name: /Finalizar e Abrir/i }).click();
    
    // Esperar o cofre aparecer na lista
    const newVault = page.getByText('Cofre de Teste Automatizado').last();
    await expect(newVault).toBeVisible();
    console.log('✅ Novo cofre criado');

    // 3. ENTRAR NO COFRE (DASHBOARD)
    await newVault.click();
    await expect(page).toHaveURL(/\//); // Dashboard é na raiz
    console.log('✅ Entrou na Dashboard do cofre');

    // 4. ADICIONAR CONTA FINANCEIRA
    await page.goto('/accounts');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Adicionar/i }).first().click();
    await page.getByPlaceholder(/Ex: Minha Conta Principal/i).fill('Conta Corrente Teste');
    await page.getByPlaceholder(/Ex: Nubank, Itaú.../i).fill('Banco Teste');
    
    // Step 3: Valor (Conta Corrente)
    await page.getByLabel(/Saldo Atual/i).fill('1000');
    await page.getByRole('button', { name: /Salvar Conta/i }).click();
    
    await expect(page.getByText('Conta Corrente Teste')).toBeVisible();
    console.log('✅ Conta financeira adicionada');

    // 5. ADICIONAR TRANSAÇÃO
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Adicionar/i }).first().click();
    
    // Step 1: Descrição
    await page.getByPlaceholder(/O que você está pagando ou recebendo/i).fill('Almoço de Teste');
    await page.getByLabel(/Categoria/i).click();
    await page.getByLabel(/Alimentação/i).last().click();
    await page.getByRole('button', { name: /Próximo Passo/i }).click();
    
    // Step 2: Detalhes
    await page.getByLabel(/Tipo de Operação/i).click();
    await page.getByLabel(/Saída \/ Despesa/i).last().click();
    await page.getByLabel(/De onde sai o dinheiro/i).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /Próximo Passo/i }).click();
    
    // Step 3: Valor
    await page.getByLabel(/Valor Total/i).fill('50,00');
    await page.getByRole('button', { name: /Finalizar e Salvar/i }).click();
    
    // Verificar se a transação aparece
    await expect(page.getByText('Almoço de Teste')).toBeVisible();
    console.log('✅ Transação adicionada com sucesso');

    // 6. CRIAR CAIXINHA (GOAL)
    await page.goto('/goals/new'); 
    await page.getByPlaceholder(/Ex: Viagem para o Japão/i).fill('Viagem de Teste');
    await page.getByLabel(/Meta de Valor/i).fill('5000');
    await page.getByRole('button', { name: /Continuar/i }).click();
    
    // Finalizar
    await page.getByRole('button', { name: /Finalizar e Criar/i }).click();
    
    await expect(page.getByText('Viagem de Teste')).toBeVisible();
    console.log('✅ Caixinha criada com sucesso');
  });

});
