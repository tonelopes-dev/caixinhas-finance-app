// Script de debug para testar os dados de workspace do usuário
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserWorkspace() {
  try {
    console.log('🔍 Debug: Verificando dados completos do usuário...');

    // Simular exatamente a chamada que o AuthService faz
    const user = await prisma.user.findUnique({
      where: { email: 'tonelopes.dev@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        workspaceImageUrl: true,
        subscriptionStatus: true,
        trialExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('📊 Dados do usuário (como retornado pelo AuthService):');
    console.log(JSON.stringify(user, null, 2));

    // Verificar se há diferença entre avatarUrl e workspaceImageUrl
    console.log('\n🎨 Comparação de imagens:');
    console.log('   Avatar URL (perfil):', user.avatarUrl || 'null');
    console.log('   Workspace Image URL (capa):', user.workspaceImageUrl || 'null');
    
    if (user.avatarUrl === user.workspaceImageUrl) {
      console.log('⚠️  ATENÇÃO: Avatar e workspace estão iguais!');
    } else {
      console.log('✅ Avatar e workspace são diferentes (correto)');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserWorkspace();