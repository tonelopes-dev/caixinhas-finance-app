import { Page, Locator, expect } from '@playwright/test';

export class TransactionsPage {
  readonly page: Page;
  
  // Principais Botões
  readonly addTransactionButton: Locator;
  readonly nextStepButton: Locator;
  readonly prevStepButton: Locator;
  readonly saveButton: Locator;
  
  // Passo 1: O Essencial
  readonly descriptionInput: Locator;
  readonly categorySelect: Locator;
  
  // Passo 2: A Movimentação
  readonly typeSelect: Locator;
  readonly dateButton: Locator;
  readonly sourceAccountSelect: Locator;
  readonly destinationAccountSelect: Locator;
  
  // Passo 3: Valores e Detalhes
  readonly amountInput: Locator;
  readonly chargeTypeRadioGroup: Locator;
  readonly totalInstallmentsInput: Locator;
  readonly installmentValueInput: Locator;
  readonly paymentMethodSelect: Locator;

    constructor(page: Page) {
    this.page = page;
    
    // Locators mapeados do add-transaction-dialog.tsx e edit-transaction-dialog.tsx
    this.addTransactionButton = page.getByRole('button', { name: /Adicionar/i }).first();
    this.nextStepButton = page.getByRole('button', { name: /Próximo Passo/i });
    this.prevStepButton = page.getByRole('button', { name: /Voltar/i });
    this.saveButton = page.getByRole('button', { name: /Finalizar e Salvar|Salvar Alterações/i });
    
    // Passo 1
    this.descriptionInput = page.getByLabel('Descrição'); // htmlFor="description_field"
    this.categorySelect = page.getByLabel('Categoria'); // id="category_field"
    
    // Passo 2
    this.typeSelect = page.getByLabel('Tipo de Operação'); // id="type_field"
    this.dateButton = page.locator('#date_field'); // id="date_field"
    this.sourceAccountSelect = page.getByLabel('De onde sai o dinheiro?'); // id="sourceAccountId_field"
    this.destinationAccountSelect = page.getByLabel('Para onde vai o dinheiro?'); // id="destinationAccountId_field"
    
    // Passo 3
    this.chargeTypeRadioGroup = page.getByRole('radiogroup');
    this.amountInput = page.locator('#amount'); // id="amount"
    this.totalInstallmentsInput = page.getByLabel('Qtd. de Parcelas'); 
    this.installmentValueInput = page.getByLabel('Valor da Parcela');
    this.paymentMethodSelect = page.getByLabel('Forma de Pagamento'); // id="paymentMethod_field"
  }

  async goto() {
    await this.page.goto('/transactions');
    // Esperar a tabela ou lista carregar
    await expect(this.addTransactionButton).toBeVisible();
  }

  async openAddDialog() {
    await this.addTransactionButton.click();
    await expect(this.page.getByText('Criar Nova Transação')).toBeVisible();
  }

  /**
   * Preenche o Passo 1: Descrição e Categoria
   */
  async fillStep1(description: string, category: string) {
    console.log(`  📝 Preenchendo Passo 1: ${description}`);
    await this.descriptionInput.fill(description);
    if (category) {
      console.log(`  📂 Selecionando categoria: ${category}`);
      await this.categorySelect.click();
      await this.page.getByRole('option', { name: category, exact: true }).click();
    }
    await this.nextStepButton.click();
  }

  /**
   * Preenche o Passo 2: Tipo, Conta(s) e Data
   */
  async fillStep2(type: 'Saída' | 'Entrada' | 'Transferência', sourceAccount?: string, destinationAccount?: string) {
    console.log(`  📝 Preenchendo Passo 2: ${type}`);
    // Tipo
    await this.typeSelect.click();
    await this.page.getByRole('option', { name: type, exact: true }).click();
    
    // Contas
    if (sourceAccount) {
      console.log(`  💳 Selecionando origem: ${sourceAccount}`);
      await this.sourceAccountSelect.click();
      const option = this.page.getByRole('option', { name: sourceAccount, exact: true });
      await expect(option).toBeVisible({ timeout: 10000 });
      await option.click();
    }
    if (destinationAccount) {
      console.log(`  📥 Selecionando destino: ${destinationAccount}`);
      await this.destinationAccountSelect.click();
      const option = this.page.getByRole('option', { name: destinationAccount, exact: true });
      await expect(option).toBeVisible({ timeout: 10000 });
      await option.click();
    }
    
    await this.nextStepButton.click();
  }

  /**
   * Preenche o Passo 3: Frequência, Valor e Pagamento
   */
  async fillStep3(amount: string, options?: { 
    chargeType?: 'Único' | 'Fixo' | 'Parcelado', 
    installments?: string,
    paymentMethod?: string 
  }) {
    // Frequência
    if (options?.chargeType) {
      await this.page.getByLabel(options.chargeType).click();
      
      if (options.chargeType === 'Parcelado' && options.installments) {
        await this.totalInstallmentsInput.fill(options.installments);
        // O valor da parcela é calculado ou preenchido. 
        // No componente, se preenchermos totalInstallments e amount, ele se ajusta.
        // Mas o amount no Step 3 é readonly se for parcelado? 
        // Na verdade, no componente: amount onChange preenche.
        // Vamos preencher o totalInstallments e depois o installmentValue se necessário.
      }
    }

    // Valor - Se não for parcelado, preenche direto. Se for, o componente as vezes bloqueia.
    if (options?.chargeType !== 'Parcelado') {
      await this.amountInput.fill(amount);
    } else {
      // Se parcelado, preenchemos o valor da parcela
      await this.installmentValueInput.fill(amount); // Aqui amount é o valor da PARCELA
    }

    // Forma de Pagamento
    if (options?.paymentMethod) {
      await this.paymentMethodSelect.click();
      await this.page.getByRole('option', { name: options.paymentMethod, exact: true }).click();
    }
  }

  async submitAndAwaitSave() {
    console.log('  🚀 Submetendo formulário...');
    
    // Interceptar a resposta da Server Action
    const responsePromise = this.page.waitForResponse(resp => 
      resp.url().includes('transactions') && resp.status() === 200,
      { timeout: 15000 }
    );
    
    await this.saveButton.click();
    
    try {
        await responsePromise;
        console.log('  ✅ Resposta recebida');
    } catch (e) {
        console.log('  ⚠️ Timeout ou erro na resposta, mas continuando...');
    }
    
    // Aguardar o Toast de sucesso
    await expect(this.page.getByText(/Sucesso/i)).toBeVisible({ timeout: 10000 });
    console.log('  🎉 Toast de sucesso detectado');
    
    // Aguardar o modal fechar
    await expect(this.page.getByText('Criar Nova Transação')).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Captura o saldo de uma conta ou o saldo líquido
   */
  async getSummaryBalance(label: 'Saldo Líquido' | 'Entradas' | 'Saídas'): Promise<number> {
    const card = this.page.locator(`div:has-text("${label}")`).nth(0);
    const balanceText = await card.locator('h3').innerText();
    return this.parseCurrency(balanceText);
  }

  async getAccountBalanceFromDashboard(accountName: string): Promise<number> {
    await this.page.goto('/dashboard');
    // Encontrar o card da conta. Geralmente tem o nome e o valor.
    const accountCard = this.page.locator(`div:has-text("${accountName}")`).first();
    const balanceText = await accountCard.locator('p, span').filter({ hasText: 'R$' }).first().innerText();
    return this.parseCurrency(balanceText);
  }

  private parseCurrency(text: string): number {
    return parseFloat(text.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  }

  async deleteFirstTransaction(description: string) {
    // Encontrar a linha da transação
    const row = this.page.locator('tr, div').filter({ hasText: description }).first();
    
    // No desktop é um hover para mostrar os botões. No mobile está visível.
    // Vamos tentar clicar no botão de lixeira diretamente se estiver visível ou fazer hover.
    const deleteButton = row.locator('button').filter({ has: this.page.locator('svg.lucide-trash2') });
    
    // Se não estiver visível (desktop table), faz hover na linha
    if (!await deleteButton.isVisible()) {
        await row.hover();
    }
    
    await deleteButton.click();
    
    // Confirmar no AlertDialog
    await this.page.getByRole('button', { name: /Sim, Excluir Registro/i }).click();
    
    // Aguardar desaparecer
    await expect(row).not.toBeVisible();
  }

  async editFirstTransaction(description: string) {
    const row = this.page.locator('tr, div').filter({ hasText: description }).first();
    const editButton = row.locator('button').filter({ has: this.page.locator('svg.lucide-edit') });
    
    if (!await editButton.isVisible()) {
        await row.hover();
    }
    
    await editButton.click();
    await expect(this.page.getByText('Editar Transação')).toBeVisible();
  }
}
