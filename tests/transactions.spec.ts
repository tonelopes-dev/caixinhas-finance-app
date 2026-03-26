import { test, expect } from '@playwright/test';
import { TransactionsPage } from './transactions.pom';

test.describe('Módulo de Transações - Fluxos Financeiros', () => {
    let txPage: TransactionsPage;
    const mainAccount = 'Inter Beatriz';
    const secondaryAccount = 'Nubank Clara';

    test.beforeEach(async ({ page }) => {
        // Logar console do browser no terminal do teste
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.type() === 'warning' || msg.text().includes('🔍')) {
                console.log(`  🌐 [BROWSER] ${msg.type()}: ${msg.text()}`);
            }
        });

        // 1. LOGIN
        await page.goto('/login');
        await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
        await page.getByLabel(/Senha/i).fill('password123');
        await page.getByRole('button', { name: 'Entrar' }).click();
        
        // 2. Aguardar login e ir direto para Transações (Workspace Pessoal por padrão)
        await page.waitForURL(/.*(dashboard|vaults|transactions)/, { timeout: 15000 });
        
        // 3. Inicializar POM
        txPage = new TransactionsPage(page);
        await txPage.goto();
    });

    test('Deve registrar uma Despesa Simples e atualizar o Saldo Líquido', async ({ page }) => {
        const description = `Jantar E2E ${Date.now()}`;
        const amount = '50,00';
        
        // Capturar saldo inicial
        const initialBalance = await txPage.getSummaryBalance('Saldo Líquido');

        // Fluxo de criação
        await txPage.openAddDialog();
        await txPage.fillStep1(description, 'Alimentação');
        await txPage.fillStep2('Saída', mainAccount);
        await txPage.fillStep3(amount, { chargeType: 'Único' });
        await txPage.submitAndAwaitSave();

        // Asserção 1: Visibilidade na lista
        await expect(page.getByText(description)).toBeVisible();

        // Asserção 2: Efeito colateral no Saldo Líquido
        const newBalance = await txPage.getSummaryBalance('Saldo Líquido');
        expect(newBalance).toBe(initialBalance - 50);
    });

    test('Deve registrar uma Receita e atualizar o Saldo Líquido', async ({ page }) => {
        const description = `Freelance E2E ${Date.now()}`;
        const amount = '500,00';
        
        const initialBalance = await txPage.getSummaryBalance('Saldo Líquido');

        await txPage.openAddDialog();
        await txPage.fillStep1(description, 'Outros');
        await txPage.fillStep2('Entrada', undefined, mainAccount); // Entrada usa destinationAccount
        await txPage.fillStep3(amount, { chargeType: 'Único' });
        await txPage.submitAndAwaitSave();

        await expect(page.getByText(description)).toBeVisible();

        const newBalance = await txPage.getSummaryBalance('Saldo Líquido');
        expect(newBalance).toBe(initialBalance + 500);
    });

    test('Deve realizar uma Transferência entre contas', async ({ page }) => {
        const description = `Transfer E2E ${Date.now()}`;
        const amount = '100,00';
        
        // Em uma transferência entre contas do mesmo workspace, o Saldo Líquido total não muda,
        // mas o saldo individual de cada conta muda. 
        // Para simplificar esta asserção sem ir ao Dashboard, validamos que o Saldo Líquido permanece IGUAL.
        const initialBalance = await txPage.getSummaryBalance('Saldo Líquido');

        await txPage.openAddDialog();
        await txPage.fillStep1(description, 'Outros');
        await txPage.fillStep2('Transferência', mainAccount, secondaryAccount); // Transferindo de uma conta para outra
        await txPage.fillStep3(amount, { chargeType: 'Único' });
        await txPage.submitAndAwaitSave();

        await expect(page.getByText(description)).toBeVisible();

        const newBalance = await txPage.getSummaryBalance('Saldo Líquido');
        expect(newBalance).toBe(initialBalance); // Não muda o total do workspace
    });

    test('Deve registrar uma Despesa Parcelada (12x)', async ({ page }) => {
        const description = `Smartphone E2E ${Date.now()}`;
        const installmentAmount = '200,00'; // Valor da parcela
        
        await txPage.openAddDialog();
        await txPage.fillStep1(description, 'Eletrônicos');
        await txPage.fillStep2('Saída', mainAccount);
        await txPage.fillStep3(installmentAmount, { 
            chargeType: 'Parcelado', 
            installments: '12' 
        });
        await txPage.submitAndAwaitSave();

        await expect(page.getByText(description)).toBeVisible();
        // O app deve mostrar o indicador de parcela (ex: 1/12)
        await expect(page.getByText('1/12')).toBeVisible();
    });

    test('Deve editar uma transação e recalcular o saldo (Ajuste de Valor)', async ({ page }) => {
        const description = `Ajuste E2E ${Date.now()}`;
        
        // 1. Criar transação inicial de 100
        await txPage.openAddDialog();
        await txPage.fillStep1(description, 'Outros');
        await txPage.fillStep2('Saída', mainAccount);
        await txPage.fillStep3('100,00', { chargeType: 'Único' });
        await txPage.submitAndAwaitSave();

        const balanceAfterCreate = await txPage.getSummaryBalance('Saldo Líquido');

        // 2. Editar para 150 (deve debitar mais 50)
        await txPage.editFirstTransaction(description);
        
        // Ir para Passo 3 do Edit
        await txPage.nextStepButton.click(); // Passo 1 -> 2
        await txPage.nextStepButton.click(); // Passo 2 -> 3
        
        await txPage.amountInput.fill('150,00');
        await txPage.submitAndAwaitSave();

        // 3. Validar novo saldo
        const finalBalance = await txPage.getSummaryBalance('Saldo Líquido');
        expect(finalBalance).toBe(balanceAfterCreate - 50);
    });

    test('Deve excluir uma transação e estornar o saldo', async ({ page }) => {
        const description = `Delete E2E ${Date.now()}`;
        
        // 1. Criar transação de 200
        await txPage.openAddDialog();
        await txPage.fillStep1(description, 'Outros');
        await txPage.fillStep2('Saída', mainAccount);
        await txPage.fillStep3('200,00', { chargeType: 'Único' });
        await txPage.submitAndAwaitSave();

        const balanceAfterCreate = await txPage.getSummaryBalance('Saldo Líquido');

        // 2. Excluir
        await txPage.deleteFirstTransaction(description);

        // 3. Validar estorno (+200)
        const finalBalance = await txPage.getSummaryBalance('Saldo Líquido');
        expect(finalBalance).toBe(balanceAfterCreate + 200);
    });

});
