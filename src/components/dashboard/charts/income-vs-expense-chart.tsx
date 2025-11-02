'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import { ArrowRightLeft } from 'lucide-react';

const chartConfig = {
    income: {
        label: 'Receitas',
        color: 'hsl(var(--chart-2))',
    },
    expenses: {
        label: 'Despesas',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;


export function IncomeVsExpenseChart({ data }: { data: { month: string; income: number; expenses: number }[] }) {
    return (
        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 font-headline">
                    <ArrowRightLeft />
                    Receitas vs. Despesas
                </CardTitle>
                <CardDescription>Análise do fluxo de caixa mensal.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={data} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${Number(value) / 1000}k`}
                        />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Legend content={<ChartLegendContent />} />
                        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
