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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
    const isActionPending = pending || isGenerating;
    const isDisabled = !enabled && !isActionPending;
    
    return (
        <Button 
            type="submit" 
            disabled={!enabled || isActionPending} 
            className={cn(
                "w-full h-16 rounded-[24px] font-black text-lg tracking-tight transition-all duration-500 relative overflow-hidden",
                isDisabled 
                    ? "bg-[#2D241E]/10 text-[#2D241E]/20" 
                    : "bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] text-white shadow-[0_10px_30px_rgba(255,107,123,0.3)] hover:shadow-[0_15px_40px_rgba(255,107,123,0.4)] hover:scale-[1.02] active:scale-[0.98] border border-white/20"
            )}
        >
            {isActionPending && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-wave pointer-events-none" />
            )}
            
            {isActionPending ? (
                <div className="flex items-center justify-center gap-3 relative z-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span className="uppercase tracking-[0.25em] text-sm font-black italic">Processando Análise...</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-3 relative z-10">
                    <span className="uppercase tracking-[0.25em] text-sm font-black italic">{label}</span>
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                </div>
            )}
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
        <form action={handleGenerateReport} className="bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(45,36,30,0.1)]">
            <input type="hidden" name="ownerId" value={workspaceId} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="year" value={year} />
            
            <div className="p-8 md:p-10 border-b border-white/20 bg-white/20 flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center shadow-sm">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#ff6b7b]/10 blur-lg rounded-full animate-pulse" />
                        <span className="relative text-2xl">📊</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-[#2D241E] font-headline tracking-tighter italic">Gerar Relatório</h3>
                    <p className="text-[11px] font-black text-[#2D241E]/30 uppercase tracking-[0.25em] mt-1 font-inter">Configuração de Análise Estratégica</p>
                </div>
            </div>
            
            <div className='p-8 md:p-10 space-y-8'>
                <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className="space-y-4">
                        <label className='text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1'>
                            Ano de <span className="text-[#ff6b7b]">Referência</span>
                        </label>
                        <Select name="year-select" value={year} onValueChange={setYear} disabled={pending}>
                            <SelectTrigger className="w-full h-16 bg-white/40 border-white/60 rounded-[20px] shadow-sm focus:ring-[#ff6b7b]/10 focus:border-[#ff6b7b]/30 transition-all font-bold text-[#2D241E] text-lg px-6">
                                <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/40 shadow-2xl backdrop-blur-xl bg-white/90">
                                {availableYears.map(y => <SelectItem key={y} value={y} className="font-bold py-3">{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-4">
                        <label className='text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1'>
                            Mês de <span className="text-[#ff6b7b]">Referência</span>
                        </label>
                        <Select name="month-select" value={month} onValueChange={setMonth} disabled={pending || !year}>
                            <SelectTrigger className="w-full h-16 bg-white/40 border-white/60 rounded-[20px] shadow-sm focus:ring-[#ff6b7b]/10 focus:border-[#ff6b7b]/30 transition-all font-bold text-[#2D241E] text-lg px-6">
                                <SelectValue placeholder={!year ? "Selecione o ano primeiro" : "Selecione o mês"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/40 shadow-2xl backdrop-blur-xl bg-white/90 max-h-[300px]">
                                {monthsForSelectedYear.map(m => (
                                    <SelectItem key={`${m.year}-${m.value}`} value={m.value} className="font-bold py-3">
                                        {new Date(m.year, parseInt(m.value) - 1).toLocaleString('pt-BR', { month: 'long' })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-1 py-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                name="forceRegenerate" 
                                value="true"
                                className="peer sr-only"
                            />
                            <div className="w-10 h-5 bg-[#2D241E]/10 rounded-full peer-checked:bg-[#ff6b7b]/20 transition-all duration-300" />
                            <div className="absolute left-1 top-1 w-3 h-3 bg-[#2D241E]/20 rounded-full peer-checked:left-6 peer-checked:bg-[#ff6b7b] transition-all duration-300 shadow-sm" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#2D241E]/40 group-hover:text-[#2D241E]/60 transition-colors">
                            Forçar <span className="text-[#ff6b7b]/60">Nova Análise</span> por IA
                        </span>
                    </label>
                </div>
                
                <div className="pt-4">
                    <GenerateReportButton 
                        label={buttonLabel}
                        enabled={buttonEnabled && hasValidValues && monthsForSelectedYear.length > 0}
                        isGenerating={isGenerating}
                    />
                </div>
            </div>
        </form>
    );
}
