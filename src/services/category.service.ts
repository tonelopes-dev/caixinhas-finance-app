import prisma from './prisma';

export type Category = {
  id: string;
  name: string;
  ownerId: string;
};

/**
 * Serviço para gerenciar categorias de despesa
 */
export class CategoryService {
  /**
   * Busca todas as categorias de um usuário
   */
  static async getUserCategories(userId: string): Promise<Category[]> {
    try {
      const categories = await prisma.category.findMany({
        where: { ownerId: userId },
        orderBy: { name: 'asc' },
      });
      return categories;
    } catch (error) {
      console.error('Erro ao buscar categorias do usuário:', error);
      throw new Error('Não foi possível buscar as categorias');
    }
  }

  /**
   * Cria uma nova categoria
   */
  static async createCategory(name: string, ownerId: string): Promise<Category> {
    try {
      const category = await prisma.category.create({
        data: { name, ownerId },
      });
      return category;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Não foi possível criar a categoria');
    }
  }

  /**
   * Atualiza uma categoria
   */
  static async updateCategory(id: string, name: string, ownerId: string): Promise<Category> {
    try {
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category || category.ownerId !== ownerId) {
        throw new Error('Categoria não encontrada ou permissão negada');
      }
      return await prisma.category.update({
        where: { id },
        data: { name },
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw new Error('Não foi possível atualizar a categoria');
    }
  }

  /**
   * Deleta uma categoria
   */
  static async deleteCategory(id: string, ownerId: string): Promise<void> {
    try {
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category || category.ownerId !== ownerId) {
        throw new Error('Categoria não encontrada ou permissão negada');
      }
      // TODO: Handle transactions that use this category before deleting.
      // For now, we will just delete it.
      await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw new Error('Não foi possível deletar a categoria');
    }
  }
}