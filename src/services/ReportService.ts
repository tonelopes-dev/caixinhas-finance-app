

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
        },
        create: {
          ownerId: data.ownerId,
          monthYear: data.monthYear,
          analysisHtml: data.analysisHtml,
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
   * Agora não lança erro se o relatório não existir.
   */
  static async deleteReport(ownerId: string, monthYear: string): Promise<boolean> {
    try {
      await prisma.savedReport.delete({
        where: {
          ownerId_monthYear: {
            ownerId,
            monthYear,
          },
        },
      });
      return true;
    } catch (error: any) {
      // Prisma's P2025 error code means "Record to delete does not exist."
      // We can safely treat this as a success case for cache invalidation.
      if (error.code === 'P2025') {
        console.log(`Cache invalidation skipped: Report for ${monthYear} did not exist.`);
        return true; // <<< THIS IS THE FIX: Return true to indicate success.
      }
      // For any other error, log it and re-throw.
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
      const count = await prisma.transaction.count({
        where: {
          OR: [
            { userId: ownerId },
            { vaultId: ownerId }
          ]
        }
      });

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
            { userId: ownerId },
            { vaultId: ownerId }
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
   * Verifica se há novas transações desde a geração do relatório
   */
  static async hasNewTransactionsSince(ownerId: string, monthYear: string, reportCreatedAt: Date): Promise<boolean> {
    try {
      // Extrai ano e mês do monthYear (ex: "Novembro de 2024")
      const monthYearParts = monthYear.split(' de ');
      if (monthYearParts.length !== 2) return true; // Se não conseguir parsear, assume que há mudanças
      
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
      
      const newTransactionsCount = await prisma.transaction.count({
        where: {
          OR: [
            { userId: ownerId },
            { vaultId: ownerId }
          ],
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          },
          createdAt: {
            gt: reportCreatedAt
          }
        }
      });

      return newTransactionsCount > 0;
    } catch (error) {
      console.error('Erro ao verificar novas transações:', error);
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
      
      const hasNewTransactions = await this.hasNewTransactionsSince(ownerId, monthYear, report.createdAt);
      
      if (hasNewTransactions) {
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
}
