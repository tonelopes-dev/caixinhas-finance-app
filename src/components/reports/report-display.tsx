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
            <ScrollArea className="flex-1 rounded-lg bg-background min-h-[400px] max-h-[calc(100vh-20rem)]">
                {isLoading ? (
                     <div className="p-3 md:p-4">
                        <ReportSkeleton />
                     </div>
                ) : reportHtml ? (
                    <div
                        className="p-3 md:p-4 prose prose-sm md:prose-base max-w-none
                        prose-headings:font-headline prose-headings:text-foreground
                        prose-h2:text-lg prose-h2:font-bold prose-h2:mb-2 prose-h2:mt-3 prose-h2:first:mt-0
                        prose-h3:text-base prose-h3:font-semibold prose-h3:mb-1.5 prose-h3:mt-2
                        prose-h4:text-sm prose-h4:font-medium prose-h4:mb-1
                        prose-p:text-foreground prose-p:leading-snug prose-p:mb-1.5 prose-p:text-sm
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-ul:my-1.5 prose-li:text-foreground prose-li:my-0.5 prose-li:text-sm
                        prose-table:text-sm prose-th:p-1.5 prose-td:p-1.5
                        [&_.space-y-6]:space-y-2 [&_.space-y-4]:space-y-1.5 [&_.space-y-3]:space-y-1
                        [&_.gap-4]:gap-1.5 [&_.gap-6]:gap-2
                        [&_svg]:inline-block [&_svg]:align-middle"
                        dangerouslySetInnerHTML={{ __html: reportHtml }}
                    />
                ) : (
                     <div className="flex h-full min-h-[400px] items-center justify-center p-6">
                        <div className="text-center max-w-md">
                            <div className="mb-3 text-5xl">📊</div>
                            <h3 className="font-headline text-lg font-semibold mb-2">Nenhum relatório gerado</h3>
                            <p className="text-sm text-muted-foreground">
                                Selecione um período acima e clique em "Gerar Relatório" ou "Visualizar Relatório" para começar sua análise financeira.
                            </p>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
