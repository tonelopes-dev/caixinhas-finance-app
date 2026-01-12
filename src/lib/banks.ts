// Lista de bancos com seus respectivos logos
export const BANKS = [
  {
    id: 'nubank',
    name: 'Nubank',
    logo: '/images/banks/nubank.png',
    color: '#8A05BE'
  },
  {
    id: 'itau',
    name: 'Itaú',
    logo: '/images/banks/itau.png',
    color: '#EC7000'
  },
  {
    id: 'bradesco',
    name: 'Bradesco',
    logo: '/images/banks/bradesco.png',
    color: '#CC092F'
  },
  {
    id: 'banco_do_brasil',
    name: 'Banco do Brasil',
    logo: '/images/banks/banco-do-brasil.png',
    color: '#FED100'
  },
  {
    id: 'santander',
    name: 'Santander',
    logo: '/images/banks/santander.png',
    color: '#D50000'
  },
  {
    id: 'inter',
    name: 'Inter',
    logo: '/images/banks/inter.png',
    color: '#FF7A00'
  },
  {
    id: 'caixa',
    name: 'Caixa Econômica Federal',
    logo: '/images/banks/caixa.png',
    color: '#0066B3'
  },
  {
    id: 'c6',
    name: 'C6 Bank',
    logo: '/images/banks/c6.png',
    color: '#FFD320'
  },
  {
    id: 'original',
    name: 'Banco Original',
    logo: '/images/banks/original.png',
    color: '#01D764'
  },
  {
    id: 'neon',
    name: 'Neon',
    logo: '/images/banks/neon.png',
    color: '#00D4FF'
  },
  {
    id: 'picpay',
    name: 'PicPay',
    logo: '/images/banks/picpay.png',
    color: '#21C25E'
  },
  {
    id: 'btg',
    name: 'BTG Pactual',
    logo: '/images/banks/btg.png',
    color: '#1C4B9C'
  },
  {
    id: 'xp',
    name: 'XP Investimentos',
    logo: '/images/banks/xp.png',
    color: '#00A859'
  },
  {
    id: 'safra',
    name: 'Safra',
    logo: '/images/banks/safra.png',
    color: '#1E3A96'
  },
  {
    id: 'will',
    name: 'Will Bank',
    logo: '/images/banks/will.png',
    color: '#6B46FF'
  },
  {
    id: 'generic',
    name: 'Outro Banco',
    logo: '/images/banks/generic.png',
    color: '#6B7280'
  }
];

// Função para buscar banco por ID
export const getBankById = (id: string) => {
  return BANKS.find(bank => bank.id === id) || BANKS.find(bank => bank.id === 'generic');
};

// Função para buscar banco por nome (busca parcial)
export const searchBanks = (query: string) => {
  if (!query) return BANKS;
  return BANKS.filter(bank => 
    bank.name.toLowerCase().includes(query.toLowerCase())
  );
};