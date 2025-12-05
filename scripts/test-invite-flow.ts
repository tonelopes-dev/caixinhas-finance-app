/**
 * Teste do fluxo completo de convites por email
 * 
 * Este script testa o processo:
 * 1. Criar um convite para um email que ainda não tem conta
 * 2. Simular registro do usuário com esse email
 * 3. Verificar se o convite aparece para o usuário
 */

import { PrismaClient } from '@prisma/client';
import { VaultService } from '../src/services/vault.service';

const prisma = new PrismaClient();

async function testInviteFlow() {
  console.log('🧪 Iniciando teste do fluxo de convites...\n');

  try {
    // 1. Criar um usuário de teste (remetente)
    const testSender = await prisma.user.create({
      data: {
        name: 'Teste Remetente',
        email: 'remetente@teste.com',
        password: 'hash123',
        emailVerified: true,
      }
    });

    console.log('✅ Usuário remetente criado:', testSender.id);

    // 2. Criar um cofre para o remetente
    const testVault = await prisma.vault.create({
      data: {
        name: 'Cofre de Teste',
        ownerId: testSender.id,
        imageUrl: 'https://example.com/vault.jpg',
      }
    });

    console.log('✅ Cofre criado:', testVault.id);

    // 3. Criar convite para um email que não existe
    const testEmail = 'destinatario@teste.com';
    
    const invitation = await prisma.invitation.create({
      data: {
        type: 'vault',
        targetId: testVault.id,
        targetName: testVault.name,
        senderId: testSender.id,
        receiverEmail: testEmail,
        status: 'pending',
      }
    });

    console.log('✅ Convite criado:', invitation.id);

    // 4. Verificar convites antes do registro
    console.log('\n📋 Buscando convites antes do registro...');
    const invitesBefore = await prisma.invitation.findMany({
      where: {
        receiverEmail: testEmail,
        status: 'pending',
      }
    });
    console.log(`Encontrados ${invitesBefore.length} convites para ${testEmail}`);

    // 5. Simular registro do usuário destinatário
    const testReceiver = await prisma.user.create({
      data: {
        name: 'Teste Destinatário',
        email: testEmail,
        password: 'hash456',
        emailVerified: true,
      }
    });

    console.log('✅ Usuário destinatário criado:', testReceiver.id);

    // 6. Vincular convites por email (simular o que acontece no registro)
    console.log('\n🔗 Vinculando convites...');
    await VaultService.linkInvitationsByEmail(testEmail, testReceiver.id);

    // 7. Verificar convites após vinculação
    console.log('\n📋 Buscando convites após vinculação...');
    const invitesAfter = await VaultService.getPendingInvitations(testReceiver.id);
    console.log(`Encontrados ${invitesAfter.length} convites pendentes para o usuário`);

    if (invitesAfter.length > 0) {
      console.log('✅ SUCESSO! O usuário pode ver seus convites pendentes');
      invitesAfter.forEach(invite => {
        console.log(`  - Cofre: ${invite.targetName}, Convite de: ${invite.sender.name}`);
      });
    } else {
      console.log('❌ FALHA! O usuário não consegue ver os convites pendentes');
    }

    // 8. Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await prisma.invitation.deleteMany({
      where: { id: invitation.id }
    });
    await prisma.vault.deleteMany({
      where: { id: testVault.id }
    });
    await prisma.user.deleteMany({
      where: { 
        id: { in: [testSender.id, testReceiver.id] }
      }
    });

    console.log('✅ Dados de teste removidos');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testInviteFlow();