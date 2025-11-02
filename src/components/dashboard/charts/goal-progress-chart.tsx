'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
} from '@/components/ui/chart';
import type { Goal } from '@/lib/definitions';
import { PiggyBank } from 'lucide-react';

const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function GoalProgressChart({ data }: { data: Goal[] }) {
  const chartData = data.map((goal, index) => ({
    name: goal.name,
    progress: Math.round((goal.currentAmount / goal.targetAmount) * 100),
    fill: chartColors[index % chartColors.length],
  }));

  const totalProgress = React.useMemo(() => {
    const totalTarget = data.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = data.reduce((sum, goal) => sum + goal.currentAmount, 0);
    if (totalTarget === 0) return 0;
    return Math.round((totalCurrent / totalTarget) * 100);
  }, [data]);

   const chartConfig = data.reduce((acc, goal, index) => {
    acc[goal.name] = {
      label: goal.name,
      color: chartColors[index % chartColors.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col">
       <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <PiggyBank />
          Progresso das Metas
        </CardTitle>
        <CardDescription>Acompanhamento geral das suas caixinhas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <Pie
              data={[{ progress: 100 }]}
              dataKey="progress"
              strokeWidth={5}
              innerRadius={85}
              outerRadius={110}
              fill="hsl(var(--muted))"
            />
            <Pie
              data={[{ progress: totalProgress }]}
              dataKey="progress"
              strokeWidth={5}
              innerRadius={85}
              outerRadius={110}
              fill="hsl(var(--primary))"
              startAngle={90}
              endAngle={90 + (totalProgress / 100) * 360}
              cornerRadius={5}
            >
              <Cell />
            </Pie>
            <Pie
              data={chartData}
              dataKey="progress"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
         <div className="flex items-center gap-2 font-medium leading-none">
          Progresso Total: {totalProgress}%
        </div>
        <div className="leading-none text-muted-foreground">
          Soma de todas as suas metas ativas
        </div>
      </CardFooter>
    </Card>
  );
}
