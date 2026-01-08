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
    
    // Verifica se os valores necessários estão presentes
    const hasValidValues = Boolean(month && year && workspaceId);
    
    console.log('🔍 ReportGenerator - valores:', { month, year, workspaceId, hasValidValues, buttonEnabled });
    
    // Atualiza mês quando o ano muda
    React.useEffect(() => {
        if (year && monthsForSelectedYear.length > 0) {
            const monthExists = monthsForSelectedYear.some(m => m.value === month);
            if (!monthExists) {
                // Se o mês atual não existe no ano selecionado, seleciona o primeiro disponível
                setMonth(monthsForSelectedYear[0].value);
            }
        } else if (!year) {
            // Se não há ano selecionado, limpa o mês
            setMonth('');
        }
    }, [year, month, monthsForSelectedYear, setMonth]);

    return (
        <form action={handleGenerateReport} className="space-y-3 rounded-lg border border-border/50 bg-card p-3 shadow-sm">
            <input type="hidden" name="ownerId" value={workspaceId} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="year" value={year} />
            {/* Debug: mostra valores atuais */}
            {process.env.NODE_ENV === 'development' && (
                <input type="hidden" data-debug="true" value={`month:${month},year:${year},workspaceId:${workspaceId}`} />
            )}
            
            <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <h3 className="font-headline text-base font-semibold">Selecione o Período</h3>
            </div>
            
            <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className="space-y-1.5">
                    <label className='text-sm font-medium flex items-center gap-1.5'>
                        <span>📅</span> Ano
                    </label>
                    <Select name="year-select" value={year} onValueChange={setYear} disabled={pending}>
                        <SelectTrigger className="w-full h-9 bg-background hover:bg-accent/50 transition-colors">
                            <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <label className='text-sm font-medium flex items-center gap-1.5'>
                        <span>📆</span> Mês
                    </label>
                    <Select name="month-select" value={month} onValueChange={setMonth} disabled={pending || !year}>
                        <SelectTrigger className="w-full h-9 bg-background hover:bg-accent/50 transition-colors">
                            <SelectValue placeholder={!year ? "Selecione o ano primeiro" : "Selecione o mês"} />
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
            </div>
            
            <div className="pt-1">
                <GenerateReportButton 
                    label={buttonLabel}
                    enabled={buttonEnabled && hasValidValues && monthsForSelectedYear.length > 0}
                    isGenerating={isGenerating}
                />
            </div>
        </form>
    );
}
