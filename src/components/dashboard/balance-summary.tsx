import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

type BalanceSummaryProps = {
  income: number;
  expenses: number;
  onFilterChange: (filter: 'all' | 'income' | 'expense') => void;
  activeFilter: 'all' | 'income' | 'expense';
};

export default function BalanceSummary({ income, expenses, onFilterChange, activeFilter }: BalanceSummaryProps) {
  const balance = income - expenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const cardBaseClasses = "cursor-pointer transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl";
  const activeClasses = "ring-2 ring-primary shadow-lg scale-[1.02]";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card
        onClick={() => onFilterChange('all')}
        className={cn(cardBaseClasses, activeFilter === 'all' && activeClasses)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">
            O primeiro passo para a tranquilidade financeira.
          </p>
        </CardContent>
      </Card>
      <Card
        onClick={() => onFilterChange('income')}
        className={cn(cardBaseClasses, activeFilter === 'income' && activeClasses)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(income)}</div>
          <p className="text-xs text-muted-foreground">
            Construindo sonhos, juntos.
          </p>
        </CardContent>
      </Card>
      <Card
        onClick={() => onFilterChange('expense')}
        className={cn(cardBaseClasses, activeFilter === 'expense' && activeClasses)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saídas do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(expenses)}</div>
          <p className="text-xs text-muted-foreground">
            Planejando cada passo com cuidado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
