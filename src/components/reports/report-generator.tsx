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
    availableMonths: { value: string, label: string }[];
    availableYears: string[];
    handleGenerateReport: (formData: FormData) => void;
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
}: ReportGeneratorProps) {
    const { pending } = useFormStatus();

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
                            {availableMonths.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
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
                <GenerateReportButton />
            </div>
        </form>
    );
}
