import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando convites e notificações...\n');

  try {
    // Verificar convites
    const invitations = await prisma.invitation.findMany({
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } },
      },
    });

    console.log('📧 CONVITES NO BANCO:');
    console.log('====================');
    if (invitations.length === 0) {
      console.log('Nenhum convite encontrado.');
    } else {
      invitations.forEach((inv, i) => {
        console.log(`\n${i + 1}. ID: ${inv.id}`);
        console.log(`   Tipo: ${inv.type}`);
        console.log(`   De: ${inv.sender.name} (${inv.sender.email})`);
        console.log(`   Para: ${inv.receiver.name} (${inv.receiver.email})`);
        console.log(`   Status: ${inv.status}`);
        console.log(`   Criado em: ${inv.createdAt}`);
      });
    }

    // Verificar notificações
    const notifications = await prisma.notification.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n\n🔔 NOTIFICAÇÕES NO BANCO:');
    console.log('=========================');
    if (notifications.length === 0) {
      console.log('Nenhuma notificação encontrada.');
    } else {
      notifications.forEach((notif, i) => {
        console.log(`\n${i + 1}. ID: ${notif.id}`);
        console.log(`   Para: ${notif.user.name} (${notif.user.email})`);
        console.log(`   Tipo: ${notif.type}`);
        console.log(`   Mensagem: ${notif.message}`);
        console.log(`   Lida: ${notif.isRead ? 'Sim' : 'Não'}`);
        console.log(`   Link: ${notif.link || 'N/A'}`);
        console.log(`   Criado em: ${notif.createdAt}`);
      });
    }

    // Contar por usuário
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    console.log('\n\n👤 NOTIFICAÇÕES POR USUÁRIO:');
    console.log('============================');
    for (const user of users) {
      const count = await prisma.notification.count({
        where: { userId: user.id },
      });
      const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      });
      console.log(`${user.name} (${user.email}): ${count} total, ${unreadCount} não lidas`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
