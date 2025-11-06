'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ReportSkeleton } from '@/components/reports/report-skeleton';

interface ReportDisplayProps {
    reportHtml: string | null;
    isLoading?: boolean;
}

export function ReportDisplay({ reportHtml, isLoading }: ReportDisplayProps) {
    return (
        <div className='flex flex-col'>
            <h3 className="font-headline text-lg font-bold mb-2">Relatório Gerado</h3>
            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/20 min-h-[400px]">
                {isLoading ? (
                     <ReportSkeleton />
                ) : reportHtml ? (
                    <div
                        className="prose prose-sm prose-p:leading-normal prose-headings:font-headline max-w-none text-foreground prose-h3:text-xl prose-h4:text-lg"
                        dangerouslySetInnerHTML={{ __html: reportHtml }}
                    />
                ) : (
                     <div className="flex h-full items-center justify-center">
                        <p className="text-center text-muted-foreground">Selecione um período e clique em "Gerar Relatório" para começar.</p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
