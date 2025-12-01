// Script para verificar e atualizar o workspaceImageUrl do usuário específico
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndUpdateUser() {
  try {
    console.log('🔍 Verificando usuário tonelopes.dev@gmail.com...');

    // Buscar o usuário específico
    const user = await prisma.user.findUnique({
      where: { email: 'tonelopes.dev@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        workspaceImageUrl: true
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('📊 Dados atuais do usuário:');
    console.log('   Email:', user.email);
    console.log('   Avatar URL:', user.avatarUrl || 'null');
    console.log('   Workspace Image URL:', user.workspaceImageUrl || 'null');

    // Se não tem workspaceImageUrl, definir a imagem padrão
    if (!user.workspaceImageUrl) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          workspaceImageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800'
        },
        select: {
          email: true,
          workspaceImageUrl: true
        }
      });
      
      console.log('✅ Workspace image URL atualizada para:', updatedUser.workspaceImageUrl);
    } else {
      console.log('✅ Usuário já possui workspace image URL');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateUser();