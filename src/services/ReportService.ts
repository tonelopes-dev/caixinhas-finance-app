
import { prisma } from '@/services/prisma';
import type { SavedReport } from '@/lib/definitions';

export class ReportService {
  /**
   * Busca um relatório salvo pelo ownerId e período
   */
  static async getReport(ownerId: string, monthYear: string): Promise<SavedReport | null> {
    try {
      const report = await prisma.savedReport.findUnique({
        where: {
          ownerId_monthYear: {
            ownerId,
            monthYear
          }
        }
      });

      return report;
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      return null;
    }
  }

  /**
   * Salva um novo relatório no banco de dados
   */
  static async saveReport(data: {
    ownerId: string;
    monthYear: string;
    analysisHtml: string;
    transactionCount?: number;
  }): Promise<SavedReport | null> {
    try {
      const report = await prisma.savedReport.upsert({
        where: {
          ownerId_monthYear: {
            ownerId: data.ownerId,
            monthYear: data.monthYear
          }
        },
        update: {
          analysisHtml: data.analysisHtml,
          transactionCount: data.transactionCount ?? 0,
        },
        create: {
          ownerId: data.ownerId,
          monthYear: data.monthYear,
          analysisHtml: data.analysisHtml,
          transactionCount: data.transactionCount ?? 0,
        }
      });

      return report;
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      return null;
    }
  }

  /**
   * Remove um relatório específico (para invalidar cache).
   * Agora trata o erro P2025 (registro não encontrado) como um sucesso silencioso.
   */
  static async deleteReport(ownerId: string, monthYear: string): Promise<boolean> {
    try {
      // Usamos deleteMany em vez de delete para evitar o erro P2025 
      // (Record to delete does not exist) que polui os logs e pode confundir o usuário.
      await prisma.savedReport.deleteMany({
        where: {
          ownerId,
          monthYear,
        },
      });
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar relatório:', error);
      throw error;
    }
  }

  /**
   * Lista todos os relatórios de um usuário
   */
  static async getUserReports(ownerId: string): Promise<SavedReport[]> {
    try {
      const reports = await prisma.savedReport.findMany({
        where: {
          ownerId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reports;
    } catch (error) {
      console.error('Erro ao buscar relatórios do usuário:', error);
      return [];
    }
  }

  /**
   * Remove relatórios antigos (limpeza de cache)
   */
  static async cleanOldReports(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.savedReport.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Erro ao limpar relatórios antigos:', error);
      return 0;
    }
  }

  /**
   * Verifica se o usuário tem alguma transação registrada
   */
  static async hasAnyTransactions(ownerId: string): Promise<boolean> {
    try {
      // Se ownerId é um workspace pessoal (userId), verifica transações pessoais
      // Se ownerId é um vault, verifica transações do vault
      const count = await prisma.transaction.count({
        where: {
          OR: [
            { actorId: ownerId }, // Transações executadas pelo usuário
            { userId: ownerId },  // Transações no workspace pessoal do usuário
            { vaultId: ownerId }  // Transações no vault especificado
          ]
        }
      });

      console.log(`🔍 hasAnyTransactions - ownerId: ${ownerId}, count: ${count}`);
      return count > 0;
    } catch (error) {
      console.error('Erro ao verificar transações:', error);
      return false;
    }
  }

  /**
   * Obtém os meses que possuem transações para um usuário
   */
  static async getMonthsWithTransactions(ownerId: string): Promise<{ value: string, label: string, year: number }[]> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { actorId: ownerId }, // Transações onde o usuário é o ator
            { 
              vault: {
                OR: [
                  { ownerId: ownerId }, // Vault onde o usuário é dono
                  { 
                    members: {
                      some: {
                        userId: ownerId
                      }
                    }
                  } // Vault onde o usuário é membro
                ]
              }
            }
          ]
        },
        select: {
          date: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      const monthsSet = new Set<string>();
      const monthsData: { value: string, label: string, year: number }[] = [];

      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        
        if (!monthsSet.has(monthKey)) {
          monthsSet.add(monthKey);
          const monthName = date.toLocaleString('pt-BR', { month: 'long' });
          const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
          
          monthsData.push({
            value: month.toString(),
            label,
            year
          });
        }
      });

      return monthsData.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return parseInt(b.value) - parseInt(a.value);
      });
    } catch (error) {
      console.error('Erro ao buscar meses com transações:', error);
      return [];
    }
  }

  /**
   * Verifica se houve mudanças nas transações ou dados relacionados desde a geração do relatório
   * Detecta: novas transações, edições, exclusões e mudanças em categorias/contas
   */
  static async hasTransactionChanges(ownerId: string, monthYear: string, report: SavedReport): Promise<boolean> {
    try {
      // Extrai ano e mês do monthYear (ex: "Novembro de 2024")
      const monthYearParts = monthYear.split(' de ');
      if (monthYearParts.length !== 2) return true;
      
      const monthName = monthYearParts[0].toLowerCase();
      const year = parseInt(monthYearParts[1]);
      
      const monthMap: { [key: string]: number } = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
        'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
        'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
      };
      
      const monthIndex = monthMap[monthName];
      if (monthIndex === undefined) return true;
      
      // Data de início e fim do mês
      const startOfMonth = new Date(year, monthIndex, 1);
      const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      
      // 1. Verificar se o número de transações mudou (detecta exclusões)
      const currentCount = await prisma.transaction.count({
        where: {
          OR: [
            { actorId: ownerId },
            { 
              vault: {
                OR: [
                  { ownerId: ownerId },
                  { 
                    members: {
                      some: {
                        userId: ownerId
                      }
                    }
                  }
                ]
              }
            }
          ],
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      if (currentCount !== report.transactionCount) {
        console.log(`🔍 Mudança detectada: contagem de transações mudou de ${report.transactionCount} para ${currentCount}`);
        return true;
      }

      // 2. Verificar se há transações criadas ou editadas após o relatório
      const modifiedTransactions = await prisma.transaction.count({
        where: {
          AND: [
            {
              OR: [
                { actorId: ownerId },
                { 
                  vault: {
                    OR: [
                      { ownerId: ownerId },
                      { 
                        members: {
                          some: {
                            userId: ownerId
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            },
            {
              date: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            },
            {
              OR: [
                {
                  createdAt: {
                    gt: report.updatedAt
                  }
                },
                {
                  updatedAt: {
                    gt: report.updatedAt
                  }
                }
              ]
            }
          ]
        }
      });

      if (modifiedTransactions > 0) {
        console.log(`🔍 Mudança detectada: ${modifiedTransactions} transações criadas/editadas`);
        return true;
      }

      // 3. Verificar se houve mudanças em categorias ou contas relacionadas
      // Busca IDs das categorias e contas usadas nas transações do período
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { actorId: ownerId },
            { 
              vault: {
                OR: [
                  { ownerId: ownerId },
                  { 
                    members: {
                      some: {
                        userId: ownerId
                      }
                    }
                  }
                ]
              }
            }
          ],
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: {
          categoryId: true,
          sourceAccountId: true,
          destinationAccountId: true
        }
      });

      const categoryIds = [...new Set(transactions.map(t => t.categoryId).filter(Boolean))] as string[];
      const accountIds = [...new Set([
        ...transactions.map(t => t.sourceAccountId).filter(Boolean),
        ...transactions.map(t => t.destinationAccountId).filter(Boolean)
      ])] as string[];

      // Verifica se alguma categoria foi atualizada
      if (categoryIds.length > 0) {
        const updatedCategories = await prisma.category.count({
          where: {
            id: { in: categoryIds },
            updatedAt: {
              gt: report.updatedAt
            }
          }
        });

        if (updatedCategories > 0) {
          console.log(`🔍 Mudança detectada: ${updatedCategories} categorias relacionadas foram atualizadas`);
          return true;
        }
      }

      // Verifica se alguma conta foi atualizada
      if (accountIds.length > 0) {
        const updatedAccounts = await prisma.account.count({
          where: {
            id: { in: accountIds },
            updatedAt: {
              gt: report.updatedAt
            }
          }
        });

        if (updatedAccounts > 0) {
          console.log(`🔍 Mudança detectada: ${updatedAccounts} contas relacionadas foram atualizadas`);
          return true;
        }
      }

      console.log(`✅ Nenhuma mudança detectada para ${monthYear}`);
      return false;
    } catch (error) {
      console.error('Erro ao verificar mudanças:', error);
      return true; // Em caso de erro, assume que há mudanças
    }
  }

  /**
   * Obtém o status completo do relatório para um período
   */
  static async getReportStatus(ownerId: string, monthYear: string): Promise<{
    exists: boolean;
    isOutdated: boolean;
    report: SavedReport | null;
    buttonLabel: string;
    buttonEnabled: boolean;
  }> {
    try {
      const report = await this.getReport(ownerId, monthYear);
      
      if (!report) {
        return {
          exists: false,
          isOutdated: false,
          report: null,
          buttonLabel: 'Gerar Relatório',
          buttonEnabled: true
        };
      }
      
      const hasChanges = await this.hasTransactionChanges(ownerId, monthYear, report);
      
      if (hasChanges) {
        return {
          exists: true,
          isOutdated: true,
          report,
          buttonLabel: 'Atualizar Relatório',
          buttonEnabled: true
        };
      }
      
      return {
        exists: true,
        isOutdated: false,
        report,
        buttonLabel: 'Visualizar Relatório',
        buttonEnabled: false
      };
    } catch (error) {
      console.error('Erro ao obter status do relatório:', error);
      return {
        exists: false,
        isOutdated: false,
        report: null,
        buttonLabel: 'Gerar Relatório',
        buttonEnabled: true
      };
    }
  }

  /**
   * Busca transações do usuário para um período específico
   */
  static async getTransactionsForPeriod(
    ownerId: string, 
    month: number, 
    year: number
  ): Promise<any[]> {
    try {
      const startDate = new Date(year, month - 1, 1); // Primeiro dia do mês
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Último dia do mês

      const transactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          OR: [
            { actorId: ownerId }, // Transações onde o usuário é o ator
            { 
              vault: {
                OR: [
                  { ownerId: ownerId }, // Vault onde o usuário é dono
                  { 
                    members: {
                      some: {
                        userId: ownerId
                      }
                    }
                  } // Vault onde o usuário é membro
                ]
              }
            }
          ]
        },
        include: {
          category: true,
          vault: true,
          sourceAccount: true,
          destinationAccount: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Converter para o formato esperado pelo gerador de relatórios
      return transactions.map(t => {
        const accounts = [t.sourceAccount?.name, t.destinationAccount?.name].filter(Boolean);
        const accountName = accounts.length > 0 ? accounts.join(' -> ') : 'Sem conta';
        return {
          id: t.id,
          date: t.date.toISOString(),
          description: t.description,
          amount: t.amount,
          type: t.type,
          paymentMethod: t.paymentMethod,
          category: t.category?.name || 'Sem categoria',
          account: accountName,
          ownerId: t.vaultId || t.actorId, // Para compatibilidade com o código existente
          isRecurring: t.isRecurring,
          isInstallment: t.isInstallment,
          installmentNumber: t.installmentNumber,
          totalInstallments: t.totalInstallments
        };
      });
    } catch (error) {
      console.error('Erro ao buscar transações por período:', error);
      return [];
    }
  }
}
