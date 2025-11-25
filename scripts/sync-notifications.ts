import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../src/services/notification.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Sincronizando convites com notificações...\n');

  try {
    // Buscar convites pendentes sem notificação correspondente
    const pendingInvitations = await prisma.invitation.findMany({
      where: { 
        status: 'pending',
        type: 'vault'
      },
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } },
      },
    });

    console.log(`📧 Encontrados ${pendingInvitations.length} convites pendentes\n`);

    let created = 0;
    let skipped = 0;

    for (const invitation of pendingInvitations) {
      // Verificar se já existe notificação para este convite
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: invitation.receiverId,
          type: 'vault_invite',
          link: '/vaults',
        },
      });

      if (existingNotif) {
        console.log(`⏭️  Notificação já existe para convite ${invitation.id}`);
        skipped++;
        continue;
      }

      // Criar notificação
      try {
        await NotificationService.createVaultInviteNotification({
          receiverId: invitation.receiverId,
          senderName: invitation.sender.name,
          vaultName: invitation.targetName,
          invitationId: invitation.id,
        });

        console.log(`✅ Notificação criada para ${invitation.receiver.name} - Cofre: ${invitation.targetName}`);
        created++;
      } catch (error) {
        console.error(`❌ Erro ao criar notificação para convite ${invitation.id}:`, error);
      }
    }

    console.log(`\n📊 RESUMO:`);
    console.log(`   Criadas: ${created}`);
    console.log(`   Ignoradas: ${skipped}`);
    console.log(`   Total: ${pendingInvitations.length}`);

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
