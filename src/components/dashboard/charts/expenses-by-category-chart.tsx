'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import { TrendingDown } from 'lucide-react';

const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ExpensesByCategoryChart({ data }: { data: Record<string, number> }) {
    const chartData = Object.entries(data).map(([category, value], index) => ({
        name: category,
        value: value,
        fill: chartColors[index % chartColors.length],
    }));

    const chartConfig = Object.fromEntries(
        Object.keys(data).map((key, index) => [
            key,
            { 
                label: key,
                color: chartColors[index % chartColors.length]
            },
        ])
    ) satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <TrendingDown />
                Despesas por Categoria
            </CardTitle>
            <CardDescription>Distribuição dos seus gastos no período.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
             <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[250px]"
            >
                <PieChart>
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent formatter={(value, name) => `${name}: ${Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                         {chartData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </CardContent>
         <CardFooter className="flex-col gap-2 border-t pt-4">
            <ChartLegendContent payload={chartData.map(item => ({ value: item.name, type: 'rect', id: item.name, color: item.fill }))} />
        </CardFooter>
    </Card>
  );
}
