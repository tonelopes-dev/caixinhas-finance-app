import { VaultService } from '@/services/vault.service';

async function testValidation() {
    console.log('🧪 Iniciando teste de validação de e-mail...');
    
    const invalidEmail = 'safsdfasdf';
    const vaultId = 'any-id';
    const senderId = 'any-sender';
    
    try {
        console.log(`📡 Tentando criar convite para: ${invalidEmail}`);
        await VaultService.createInvitation(vaultId, senderId, invalidEmail);
        console.error('❌ ERRO: O sistema aceitou um e-mail inválido!');
    } catch (error) {
        if (error instanceof Error && error.message === 'Formato de e-mail inválido.') {
            console.log('✅ SUCESSO: O sistema bloqueou o e-mail inválido com a mensagem correta.');
        } else {
            console.error('❌ ERRO: O sistema lançou um erro inesperado:', error);
        }
    }
}

testValidation();
