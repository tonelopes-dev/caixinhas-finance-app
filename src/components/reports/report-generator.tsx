'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

function GenerateReportButton({ 
    label = 'Gerar Relatório', 
    enabled = true, 
    isGenerating = false 
}: { 
    label?: string; 
    enabled?: boolean; 
    isGenerating?: boolean; 
}) {
    const { pending } = useFormStatus();
    const isDisabled = !enabled || pending || isGenerating;
    
    return (
        <Button type="submit" disabled={isDisabled} className="w-full md:w-auto">
            {(pending || isGenerating) ? (
                <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Gerando Relatório...
                </>
            ) : label}
        </Button>
    )
}

interface ReportGeneratorProps {
    workspaceId: string;
    month: string;
    setMonth: (month: string) => void;
    year: string;
    setYear: (year: string) => void;
    availableMonths: { value: string, label: string, year: number }[];
    availableYears: string[];
    handleGenerateReport: (formData: FormData) => void;
    buttonLabel?: string;
    buttonEnabled?: boolean;
    isGenerating?: boolean;
}

export function ReportGenerator({
    workspaceId,
    month,
    setMonth,
    year,
    setYear,
    availableMonths,
    availableYears,
    handleGenerateReport,
    buttonLabel = 'Gerar Relatório',
    buttonEnabled = true,
    isGenerating = false,
}: ReportGeneratorProps) {
    const { pending } = useFormStatus();
    
    // Filtra meses do ano selecionado
    const monthsForSelectedYear = availableMonths.filter(m => m.year.toString() === year);
    
    // Atualiza mês se o selecionado não existe no ano atual
    React.useEffect(() => {
        if (year && monthsForSelectedYear.length > 0) {
            const monthExists = monthsForSelectedYear.some(m => m.value === month);
            if (!monthExists) {
                setMonth(monthsForSelectedYear[0].value);
            }
        }
    }, [year, month, monthsForSelectedYear, setMonth]);

    return (
        <form action={handleGenerateReport} className="flex flex-col md:flex-row items-center gap-4 rounded-lg border p-4 mb-6">
            <input type="hidden" name="ownerId" value={workspaceId} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="year" value={year} />
            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className="space-y-2">
                    <label className='text-sm font-medium'>Mês</label>
                    <Select name="month-select" value={month} onValueChange={setMonth} disabled={pending}>
                        <SelectTrigger>
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthsForSelectedYear.map(m => (
                                <SelectItem key={`${m.year}-${m.value}`} value={m.value}>
                                    {new Date(m.year, parseInt(m.value) - 1).toLocaleString('pt-BR', { month: 'long' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <label className='text-sm font-medium'>Ano</label>
                    <Select name="year-select" value={year} onValueChange={setYear} disabled={pending}>
                        <SelectTrigger>
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className='self-stretch flex items-end'>
                <GenerateReportButton 
                    label={buttonLabel}
                    enabled={buttonEnabled && month && year && monthsForSelectedYear.length > 0}
                    isGenerating={isGenerating}
                />
            </div>
        </form>
    );
}
