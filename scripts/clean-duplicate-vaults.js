const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicateVaults() {
  try {
    console.log('🧹 Iniciando limpeza de cofres duplicados...');
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    console.log(`👥 Encontrados ${users.length} usuários`);
    
    for (const user of users) {
      // Buscar cofres com ID igual ao ID do usuário (cofres virtuais criados por engano)
      const virtualVaults = await prisma.vault.findMany({
        where: {
          id: user.id // Cofres com ID igual ao ID do usuário
        },
        include: {
          members: true,
          _count: {
            select: {
              accounts: true,
              goals: true,
              transactions: true
            }
          }
        }
      });
      
      for (const vault of virtualVaults) {
        console.log(`🔍 Usuário ${user.name} (${user.email}): Encontrado cofre virtual com ID ${vault.id}`);
        console.log(`   - Nome: ${vault.name}`);
        console.log(`   - Contas: ${vault._count.accounts}`);
        console.log(`   - Metas: ${vault._count.goals}`);
        console.log(`   - Transações: ${vault._count.transactions}`);
        
        // Se o cofre não tem dados importantes, podemos removê-lo
        if (vault._count.accounts === 0 && vault._count.goals === 0 && vault._count.transactions === 0) {
          console.log(`   ❌ Removendo cofre virtual vazio...`);
          
          // Remover membros primeiro
          await prisma.vaultMember.deleteMany({
            where: { vaultId: vault.id }
          });
          
          // Remover o cofre
          await prisma.vault.delete({
            where: { id: vault.id }
          });
          
          console.log(`   ✅ Cofre virtual removido com sucesso`);
        } else {
          console.log(`   ⚠️  Cofre tem dados, não será removido automaticamente`);
          console.log(`   📝 Considere migrar os dados manualmente se necessário`);
        }
      }
    }
    
    console.log('✅ Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicateVaults();