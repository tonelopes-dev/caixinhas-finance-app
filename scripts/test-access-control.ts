/**
 * Script de Teste do Sistema de Controle de Acesso
 * 
 * Execute com: node --loader tsx scripts/test-access-control.ts
 * Ou: tsx scripts/test-access-control.ts
 */

import { 
  getEffectiveStatus,
  hasFullAccess,
  canCreateVaults,
  canAccessPersonalWorkspace,
  canAcceptInvitations,
  getAccessInfo 
} from '../src/lib/access-control';
import type { UserWithoutPassword } from '../src/services/auth.service';

// Mock de usuários para teste
const activeUser: UserWithoutPassword = {
  id: '1',
  email: 'active@test.com',
  name: 'Active User',
  avatarUrl: null,
  subscriptionStatus: 'active',
  trialExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const trialActiveUser: UserWithoutPassword = {
  id: '2',
  email: 'trial@test.com',
  name: 'Trial User',
  avatarUrl: null,
  subscriptionStatus: 'trial',
  trialExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias no futuro
  createdAt: new Date(),
  updatedAt: new Date(),
};

const trialExpiredUser: UserWithoutPassword = {
  id: '3',
  email: 'expired@test.com',
  name: 'Expired User',
  avatarUrl: null,
  subscriptionStatus: 'trial',
  trialExpiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
  createdAt: new Date(),
  updatedAt: new Date(),
};

const inactiveUser: UserWithoutPassword = {
  id: '4',
  email: 'inactive@test.com',
  name: 'Inactive User',
  avatarUrl: null,
  subscriptionStatus: 'inactive',
  trialExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log('🧪 TESTE DO SISTEMA DE CONTROLE DE ACESSO\n');
console.log('='.repeat(60));

function testUser(user: UserWithoutPassword, label: string) {
  console.log(`\n📋 ${label}`);
  console.log('-'.repeat(60));
  
  const effectiveStatus = getEffectiveStatus(user);
  const fullAccess = hasFullAccess(user);
  const canCreate = canCreateVaults(user);
  const canAccessPersonal = canAccessPersonalWorkspace(user);
  const canAccept = canAcceptInvitations(user);
  const accessInfo = getAccessInfo(user);
  
  console.log(`Status no BD: ${user.subscriptionStatus}`);
  console.log(`Status Efetivo: ${effectiveStatus}`);
  console.log(`Trial expira em: ${user.trialExpiresAt?.toLocaleDateString() || 'N/A'}`);
  console.log(`\n✅ Permissões:`);
  console.log(`  - Acesso Completo: ${fullAccess ? '✅' : '❌'}`);
  console.log(`  - Criar Cofres: ${canCreate ? '✅' : '❌'}`);
  console.log(`  - Acessar Pessoal: ${canAccessPersonal ? '✅' : '❌'}`);
  console.log(`  - Aceitar Convites: ${canAccept ? '✅' : '❌'}`);
  console.log(`\n📊 Informações de Acesso:`);
  console.log(`  - Restrito: ${accessInfo.isRestricted ? 'SIM' : 'NÃO'}`);
  console.log(`  - Dias Restantes: ${accessInfo.daysRemaining}`);
  console.log(`  - Mensagem: ${accessInfo.message}`);
}

// Testes
testUser(activeUser, 'Usuário ATIVO (Assinante)');
testUser(trialActiveUser, 'Usuário TRIAL ATIVO (15 dias restantes)');
testUser(trialExpiredUser, 'Usuário TRIAL EXPIRADO (expirou há 5 dias)');
testUser(inactiveUser, 'Usuário INATIVO');

console.log('\n' + '='.repeat(60));
console.log('\n✅ RESUMO DOS TESTES:\n');

console.log('🟢 Usuário Active:');
console.log('   - Deve ter acesso completo a tudo');
console.log('   - Status efetivo = "active"');

console.log('\n🔵 Usuário Trial Ativo:');
console.log('   - Deve ter acesso completo a tudo');
console.log('   - Status efetivo = "trial"');

console.log('\n🔴 Usuário Trial Expirado:');
console.log('   - NÃO deve ter acesso completo');
console.log('   - Status efetivo = "inactive" (não "trial")');
console.log('   - PODE aceitar convites e colaborar');
console.log('   - NÃO PODE acessar workspace pessoal');
console.log('   - NÃO PODE criar cofres');

console.log('\n⚫ Usuário Inactive:');
console.log('   - Mesmas restrições do trial expirado');
console.log('   - Status efetivo = "inactive"');

console.log('\n' + '='.repeat(60));
console.log('\n🎯 VALIDAÇÃO:\n');

// Validações automáticas
const tests = [
  {
    name: 'Active tem acesso completo',
    pass: hasFullAccess(activeUser),
  },
  {
    name: 'Trial ativo tem acesso completo',
    pass: hasFullAccess(trialActiveUser),
  },
  {
    name: 'Trial expirado NÃO tem acesso completo',
    pass: !hasFullAccess(trialExpiredUser),
  },
  {
    name: 'Inactive NÃO tem acesso completo',
    pass: !hasFullAccess(inactiveUser),
  },
  {
    name: 'Trial expirado pode aceitar convites',
    pass: canAcceptInvitations(trialExpiredUser),
  },
  {
    name: 'Inactive pode aceitar convites',
    pass: canAcceptInvitations(inactiveUser),
  },
  {
    name: 'Trial expirado NÃO pode criar cofres',
    pass: !canCreateVaults(trialExpiredUser),
  },
  {
    name: 'Inactive NÃO pode acessar pessoal',
    pass: !canAccessPersonalWorkspace(inactiveUser),
  },
  {
    name: 'Status efetivo de trial expirado é "inactive"',
    pass: getEffectiveStatus(trialExpiredUser) === 'inactive',
  },
  {
    name: 'Status efetivo de trial ativo é "trial"',
    pass: getEffectiveStatus(trialActiveUser) === 'trial',
  },
];

const passed = tests.filter(t => t.pass).length;
const total = tests.length;

tests.forEach(test => {
  console.log(`${test.pass ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n📈 Resultado: ${passed}/${total} testes passaram`);

if (passed === total) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.\n');
  process.exit(0);
} else {
  console.log('\n⚠️ ALGUNS TESTES FALHARAM! Revise a implementação.\n');
  process.exit(1);
}
