
import type { Account } from '../definitions';

export const bankLogos = [
    'https://cdn.worldvectorlogo.com/logos/nubank-1.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-inter.svg',
    'https://cdn.worldvectorlogo.com/logos/c6-bank.svg',
    'https://cdn.worldvectorlogo.com/logos/itau-unibanco-2.svg',
    'https://cdn.worldvectorlogo.com/logos/bradesco-logo-2.svg',
    'https://cdn.worldvectorlogo.com/logos/banco-do-brasil-logo.svg',
    'https://cdn.worldvectorlogo.com/logos/caixa-economica-federal.svg',
]

// As contas agora pertencem a um 'user' ou a um 'vault'
export const accounts: Account[] = [
  // --- Contas do Dev (user1) ---
  // Pessoal, mas visível no cofre da família
  { id: 'acc-dev-1', ownerId: 'user1', scope: 'personal', visibleIn: ['vault-family'], name: 'Conta Corrente Pessoal', bank: 'Banco Digital', type: 'checking', balance: 12500, logoUrl: bankLogos[0] },
  // Pessoal, não visível em nenhum cofre
  { id: 'acc-dev-2', ownerId: 'user1', scope: 'personal', visibleIn: [], name: 'Investimentos Pessoais', bank: 'Corretora Ágil', type: 'investment', balance: 75000, logoUrl: bankLogos[2] },
  { id: 'acc-dev-3', ownerId: 'user1', scope: 'personal', visibleIn: [], name: 'Cartão Pessoal', bank: 'Banco Digital', type: 'credit_card', balance: 0, creditLimit: 15000, logoUrl: bankLogos[0] },
  
  // --- Contas da Nutri (user2) ---
  // Pessoal, não visível em nenhum cofre
  { id: 'acc-nutri-1', ownerId: 'user2', scope: 'personal', visibleIn: [], name: 'Conta Profissional', bank: 'Banco Verde', type: 'checking', balance: 23000, logoUrl: bankLogos[1] },
  // Conta poupança pessoal da Nutri, mas visível no cofre da família
  { id: 'acc-nutri-2', ownerId: 'user2', scope: 'personal', visibleIn: ['vault-family'], name: 'Poupança Pessoal', bank: 'PoupaBanco', type: 'savings', balance: 42000, logoUrl: bankLogos[6] },
  
  // --- Contas Conjuntas (scope = vaultId) ---
  // Conta conjunta do cofre da família, criada pelo Dev
  { id: 'acc-family', ownerId: 'user1', scope: 'vault-family', name: 'Conta Conjunta da Família', bank: 'Banco Familiar', type: 'checking', balance: 5200, logoUrl: bankLogos[4] },
  // Conta conjunta do cofre de viagem, criada pelo Dev
  { id: 'acc-trip', ownerId: 'user1', scope: 'vault-trip', name: 'Conta para Viagem', bank: 'Banco Internacional', type: 'checking', balance: 0, logoUrl: bankLogos[3] },
  // Conta da Agência de Software
  { id: 'acc-agency-1', ownerId: 'user1', scope: 'vault-agency', name: 'Conta PJ Agência', bank: 'Banco Empresarial', type: 'checking', balance: 25000, logoUrl: bankLogos[5] },
];
