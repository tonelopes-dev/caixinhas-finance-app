// Script para sincronizar imagens de workspace para usuários existentes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncWorkspaceImages() {
  try {
    console.log('🔄 Sincronizando imagens de workspace...');

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        workspaceImageUrl: true
      }
    });

    console.log(`📊 Encontrados ${users.length} usuários`);

    let updated = 0;

    for (const user of users) {
      // Se o usuário não tem workspaceImageUrl, usar a imagem padrão
      if (!user.workspaceImageUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            workspaceImageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800'
          }
        });
        
        console.log(`✅ Usuário ${user.email} - workspace image definida`);
        updated++;
      } else {
        console.log(`⏭️  Usuário ${user.email} já tem workspace image`);
      }
    }

    console.log(`\n📈 Sincronização concluída:`);
    console.log(`   - ${updated} usuários atualizados`);
    console.log(`   - ${users.length - updated} já estavam atualizados`);

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncWorkspaceImages();