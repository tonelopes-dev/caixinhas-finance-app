'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingDown } from 'lucide-react';

const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ExpensesByCategoryChart({ data }: { data: Record<string, number> }) {
    const chartData = Object.entries(data).map(([category, value]) => ({
        name: category,
        value: value,
        fill: chartColors[Object.keys(data).indexOf(category) % chartColors.length],
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
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <TrendingDown />
                Despesas por Categoria
            </CardTitle>
            <CardDescription>Distribuição dos seus gastos no período.</CardDescription>
        </CardHeader>
        <CardContent>
             <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[250px]"
            >
                <PieChart>
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
