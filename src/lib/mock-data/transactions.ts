import type { Transaction } from '../definitions';

export const transactions: Transaction[] = [
    // Transações Pessoais do Dev (user1)
    { id: 't-dev-1', ownerId: 'user1', ownerType: 'user', date: '2024-07-28', description: 'Salário', amount: 12000, type: 'income', category: 'Salário', destinationAccountId: 'acc-dev-1', actorId: 'user1', isRecurring: true },
    { id: 't-dev-2', ownerId: 'user1', ownerType: 'user', date: '2024-07-25', description: 'Almoço com cliente', amount: 80, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-dev-3', paymentMethod: 'credit_card', actorId: 'user1' },
    { id: 't-dev-3', ownerId: 'user1', ownerType: 'user', date: '2024-07-20', description: 'Economia para Setup', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-dev-1', destinationAccountId: 'goal-dev-1', actorId: 'user1' },
    { id: 't-dev-4', ownerId: 'user1', ownerType: 'user', date: '2024-07-15', description: 'Transferência para Cofre Família', amount: 1500, type: 'transfer', category: 'Contribuição Familiar', sourceAccountId: 'acc-dev-1', destinationAccountId: 'acc-family', actorId: 'user1', isRecurring: true },
    
    // Transações Pessoais da Nutri (user2)
    { id: 't-nutri-1', ownerId: 'user2', ownerType: 'user', date: '2024-07-29', description: 'Recebimento de Consultas', amount: 7000, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2', ownerId: 'user2', ownerType: 'user', date: '2024-07-26', description: 'Jantar com amigos', amount: 120, type: 'expense', category: 'Lazer', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-nutri-3', ownerId: 'user2', ownerType: 'user', date: '2024-05-10', description: 'Economia para Viagem', amount: 400, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-nutri-1', actorId: 'user2' },
    { id: 't-nutri-3a', ownerId: 'user2', ownerType: 'user', date: '2024-06-12', description: 'Economia para Viagem', amount: 500, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-nutri-1', actorId: 'user4' },
    { id: 't-nutri-3b', ownerId: 'user2', ownerType: 'user', date: '2024-07-18', description: 'Economia para Viagem', amount: 300, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-nutri-1', actorId: 'user1' },
    { id: 't-nutri-4', ownerId: 'user2', ownerType: 'user', date: '2024-07-16', description: 'Transferência para Cofre Família', amount: 1500, type: 'transfer', category: 'Contribuição Familiar', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'acc-family', actorId: 'user2', isRecurring: true },
    { id: 't-nutri-5', ownerId: 'user2', ownerType: 'user', date: '2024-07-22', description: 'Poupança para Consultório', amount: 3500, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-nutri-2', actorId: 'user2' },
    { id: 't-nutri-6', ownerId: 'user2', ownerType: 'user', date: '2024-07-28', description: 'Economia para Presente', amount: 980, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-nutri-3', actorId: 'user2' },

    // Transações do Cofre da Família (vault-family)
    { id: 't-fam-1', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-27', description: 'Supermercado do Mês', amount: 1800, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-family', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },
    { id: 't-fam-3', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-15', description: 'Depósito Reforma Cozinha', amount: 1000, type: 'transfer', category: 'Caixinha', sourceAccountId: 'acc-family', destinationAccountId: 'goal-family-1', actorId: 'user2' },
    { id: 't-fam-4', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-15', description: 'Contribuição do Dev', amount: 1500, type: 'income', category: 'Contribuição Familiar', sourceAccountId: 'acc-dev-1', destinationAccountId: 'acc-family', actorId: 'user1' },
    { id: 't-fam-5', ownerId: 'vault-family', ownerType: 'vault', date: '2024-07-16', description: 'Contribuição da Nutri', amount: 1500, type: 'income', category: 'Contribuição Familiar', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'acc-family', actorId: 'user2' },

    // Transações do Cofre do Consultório (vault-office)
    { id: 't-off-1', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-28', description: 'Consulta Paciente A', amount: 350, type: 'income', category: 'Consultas', destinationAccountId: 'acc-nutri-1', paymentMethod: 'pix', actorId: 'user2' },
    { id: 't-off-2', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-27', description: 'Aluguel do Consultório', amount: 1200, type: 'expense', category: 'Aluguel', sourceAccountId: 'acc-nutri-1', paymentMethod: 'boleto', actorId: 'user2', isRecurring: true },
    { id: 't-off-3', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-25', description: 'Compra de Suplementos', amount: 450, type: 'expense', category: 'Materiais', sourceAccountId: 'acc-nutri-1', paymentMethod: 'debit_card', actorId: 'user2' },
    { id: 't-off-4', ownerId: 'vault-office', ownerType: 'vault', date: '2024-07-20', description: 'Aporte para Bioimpedância', amount: 2000, type: 'transfer', category: 'Investimento', sourceAccountId: 'acc-nutri-1', destinationAccountId: 'goal-office-1', actorId: 'user2' },

    // Transações do Cofre da Viagem (vault-trip)
    { id: 't-trip-1', ownerId: 'vault-trip', ownerType: 'vault', date: '2024-07-10', description: 'Aporte inicial Dev', amount: 1000, type: 'income', category: 'Investimento', sourceAccountId: 'acc-dev-1', destinationAccountId: 'acc-trip-savings', actorId: 'user1' },
    { id: 't-trip-2', ownerId: 'vault-trip', ownerType: 'vault', date: '2024-07-11', description: 'Aporte inicial Nutri', amount: 1000, type: 'income', category: 'Investimento', sourceAccountId: 'acc-nutri-2', destinationAccountId: 'acc-trip-savings', actorId: 'user2' },
    { id: 't-trip-3', ownerId: 'vault-trip', ownerType: 'vault', date: '2024-07-20', description: 'Reserva Hotel', amount: 3000, type: 'expense', category: 'Hospedagem', sourceAccountId: 'acc-trip-card', paymentMethod: 'credit_card', actorId: 'user1' },
  
    // DADOS ADICIONAIS 2025 para user2
    // JANEIRO 2025
    { id: 't-nutri-2025-01-1', ownerId: 'user2', ownerType: 'user', date: '2025-01-05', description: 'Recebimento de Consultas', amount: 7500, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-01-2', ownerId: 'user2', ownerType: 'user', date: '2025-01-15', description: 'Supermercado', amount: 600, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-nutri-1', paymentMethod: 'debit_card', actorId: 'user2' },
    { id: 't-fam-2025-01-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-01-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // FEVEREIRO 2025
    { id: 't-nutri-2025-02-1', ownerId: 'user2', ownerType: 'user', date: '2025-02-05', description: 'Recebimento de Consultas', amount: 7800, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-02-2', ownerId: 'user2', ownerType: 'user', date: '2025-02-18', description: 'Cinema', amount: 90, type: 'expense', category: 'Lazer', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2025-02-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-02-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // MARÇO 2025
    { id: 't-nutri-2025-03-1', ownerId: 'user2', ownerType: 'user', date: '2025-03-05', description: 'Recebimento de Consultas', amount: 8200, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-03-2', ownerId: 'user2', ownerType: 'user', date: '2025-03-20', description: 'Roupas', amount: 450, type: 'expense', category: 'Outros', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2025-03-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-03-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // ABRIL 2025
    { id: 't-nutri-2025-04-1', ownerId: 'user2', ownerType: 'user', date: '2025-04-05', description: 'Recebimento de Consultas', amount: 7900, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-04-2', ownerId: 'user2', ownerType: 'user', date: '2025-04-22', description: 'Farmácia', amount: 150, type: 'expense', category: 'Saúde', sourceAccountId: 'acc-nutri-1', paymentMethod: 'debit_card', actorId: 'user2' },
    { id: 't-fam-2025-04-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-04-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // MAIO 2025
    { id: 't-nutri-2025-05-1', ownerId: 'user2', ownerType: 'user', date: '2025-05-05', description: 'Recebimento de Consultas', amount: 8500, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-05-2', ownerId: 'user2', ownerType: 'user', date: '2025-05-19', description: 'Restaurante', amount: 250, type: 'expense', category: 'Alimentação', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2025-05-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-05-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // JUNHO 2025
    { id: 't-nutri-2025-06-1', ownerId: 'user2', ownerType: 'user', date: '2025-06-05', description: 'Recebimento de Consultas', amount: 8100, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-06-2', ownerId: 'user2', ownerType: 'user', date: '2025-06-15', description: 'Show', amount: 300, type: 'expense', category: 'Lazer', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2025-06-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-06-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // JULHO 2025
    { id: 't-nutri-2025-07-1', ownerId: 'user2', ownerType: 'user', date: '2025-07-05', description: 'Recebimento de Consultas', amount: 8800, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-07-2', ownerId: 'user2', ownerType: 'user', date: '2025-07-25', description: 'Viagem Fim de Semana', amount: 900, type: 'expense', category: 'Lazer', sourceAccountId: 'acc-nutri-1', paymentMethod: 'pix', actorId: 'user2' },
    { id: 't-fam-2025-07-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-07-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // AGOSTO 2025
    { id: 't-nutri-2025-08-1', ownerId: 'user2', ownerType: 'user', date: '2025-08-05', description: 'Recebimento de Consultas', amount: 8300, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-08-2', ownerId: 'user2', ownerType: 'user', date: '2025-08-18', description: 'Uber', amount: 80, type: 'expense', category: 'Transporte', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2025-08-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-08-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },
    
    // SETEMBRO 2025
    { id: 't-nutri-2025-09-1', ownerId: 'user2', ownerType: 'user', date: '2025-09-05', description: 'Recebimento de Consultas', amount: 9000, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-09-2', ownerId: 'user2', ownerType: 'user', date: '2025-09-21', description: 'Presente para o Dev', amount: 500, type: 'expense', category: 'Outros', sourceAccountId: 'acc-nutri-1', paymentMethod: 'pix', actorId: 'user2' },
    { id: 't-fam-2025-09-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-09-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },

    // OUTUBRO 2025
    { id: 't-nutri-2025-10-1', ownerId: 'user2', ownerType: 'user', date: '2025-10-05', description: 'Recebimento de Consultas', amount: 8700, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-10-2', ownerId: 'user2', ownerType: 'user', date: '2025-10-15', description: 'Conta de Luz', amount: 250, type: 'expense', category: 'Utilidades', sourceAccountId: 'acc-nutri-1', paymentMethod: 'boleto', actorId: 'user2' },
    { id: 't-fam-2025-10-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-10-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },
    
    // NOVEMBRO 2025
    { id: 't-nutri-2025-11-1', ownerId: 'user2', ownerType: 'user', date: '2025-11-05', description: 'Recebimento de Consultas', amount: 9200, type: 'income', category: 'Renda Principal', destinationAccountId: 'acc-nutri-1', actorId: 'user2' },
    { id: 't-nutri-2025-11-2', ownerId: 'user2', ownerType: 'user', date: '2025-11-28', description: 'Compras Black Friday', amount: 1200, type: 'expense', category: 'Outros', sourceAccountId: 'acc-nutri-1', paymentMethod: 'credit_card', actorId: 'user2' },
    { id: 't-fam-2025-11-1', ownerId: 'vault-family', ownerType: 'vault', date: '2025-11-26', description: 'Pagamento Aluguel', amount: 2500, type: 'expense', category: 'Casa', sourceAccountId: 'acc-family', paymentMethod: 'boleto', actorId: 'user1' },
];
