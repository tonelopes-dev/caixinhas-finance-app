'use client';

import { useFormStatus } from 'react-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }) }));

function GenerateReportButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
            {pending ? (
                <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Gerando Relatório...
                </>
            ) : 'Gerar Relatório'}
        </Button>
    )
}

interface ReportGeneratorProps {
    workspaceId: string;
    month: string;
    setMonth: (month: string) => void;
    year: string;
    setYear: (year: string) => void;
    handleGenerateReport: (formData: FormData) => void;
    isPending?: boolean;
}

export function ReportGenerator({
    workspaceId,
    month,
    setMonth,
    year,
    setYear,
    handleGenerateReport,
    isPending
}: ReportGeneratorProps) {

    return (
        <form action={handleGenerateReport} className="flex flex-col md:flex-row items-center gap-4 rounded-lg border p-4 mb-6">
            <input type="hidden" name="ownerId" value={workspaceId} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="year" value={year} />
            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className="space-y-2">
                    <label className='text-sm font-medium'>Mês</label>
                    <Select name="month" value={month} onValueChange={setMonth} disabled={isPending}>
                        <SelectTrigger>
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <label className='text-sm font-medium'>Ano</label>
                    <Select name="year" value={year} onValueChange={setYear} disabled={isPending}>
                        <SelectTrigger>
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className='self-stretch md:self-end mt-4 md:mt-0'>
                <GenerateReportButton />
            </div>
        </form>
    );
}
