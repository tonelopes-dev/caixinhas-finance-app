'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Transaction } from '@/lib/definitions';
import { TrendingUp } from 'lucide-react';

const chartConfig = {
    netWorth: {
        label: 'Patrimônio',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

export function NetWorthChart({ data, initialBalance }: { data: Transaction[], initialBalance: number }) {
    const chartData = React.useMemo(() => {
        const sortedTransactions = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentBalance = initialBalance;
        const dailyBalances: Record<string, number> = {};

        sortedTransactions.forEach(t => {
            const date = new Date(t.date).toISOString().split('T')[0];
            if (t.type === 'income') {
                currentBalance += t.amount;
            } else if (t.type === 'expense') {
                currentBalance -= t.amount;
            }
            dailyBalances[date] = currentBalance;
        });
        
        const result = Object.entries(dailyBalances).map(([date, balance]) => ({
            date,
            netWorth: balance,
        }));
        
        // Ensure there is at least one data point to show chart
        if (result.length === 0) {
            return [{ date: new Date().toISOString().split('T')[0], netWorth: initialBalance }];
        }

        return result;

    }, [data, initialBalance]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <TrendingUp />
                    Evolução do Patrimônio
                </CardTitle>
                <CardDescription>
                    Acompanhe o crescimento do seu saldo total ao longo do tempo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${Number(value) / 1000}k`}
                        />
                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Area
                            dataKey="netWorth"
                            type="natural"
                            fill="var(--color-netWorth)"
                            fillOpacity={0.4}
                            stroke="var(--color-netWorth)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
