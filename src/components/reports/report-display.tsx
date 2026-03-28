'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ReportSkeleton } from '@/components/reports/report-skeleton';

interface ReportDisplayProps {
    reportHtml: string | null;
    isLoading?: boolean;
}

export function ReportDisplay({ reportHtml, isLoading }: ReportDisplayProps) {
    return (
        <div className="w-full">
            <ScrollArea className="w-full h-[600px] md:h-[700px] rounded-[48px] bg-white/20 backdrop-blur-3xl border border-white/60 shadow-2xl overflow-hidden">
                {isLoading ? (
                     <div className="p-12 md:p-16">
                        <ReportSkeleton />
                     </div>
                ) : reportHtml ? (
                    <div
                        className="p-12 md:p-16 prose prose-amber max-w-none
                        prose-headings:font-headline prose-headings:text-[#2D241E] prose-headings:italic
                        prose-h2:text-4xl prose-h2:font-black prose-h2:mb-8 prose-h2:mt-16 prose-h2:first:mt-0 prose-h2:tracking-tight
                        prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-6 prose-h3:mt-10 prose-h3:tracking-tight
                        prose-h4:text-xl prose-h4:font-bold prose-h4:mb-4
                        prose-p:text-[#2D241E]/70 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-lg
                        prose-strong:text-[#2D241E] prose-strong:font-black
                        prose-ul:my-8 prose-li:text-[#2D241E]/70 prose-li:my-3 prose-li:text-lg
                        prose-table:text-base prose-th:p-5 prose-td:p-5 prose-th:bg-[#2D241E]/5 prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:text-[11px]
                        [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:rounded-[32px] [&_table]:border [&_table]:border-white/40 [&_table]:bg-white/10
                        [&_.space-y-6]:space-y-6 [&_.space-y-4]:space-y-4 [&_.space-y-3]:space-y-3
                        [&_.gap-4]:gap-6 [&_.gap-6]:gap-8
                        [&_svg]:inline-block [&_svg]:align-middle"
                        dangerouslySetInnerHTML={{ __html: reportHtml }}
                    />
                ) : (
                     <div className="flex h-full min-h-[600px] items-center justify-center p-12">
                        <div className="text-center max-w-xl bg-white/40 backdrop-blur-3xl p-16 rounded-[56px] border border-white/60 shadow-2xl">
                            <div className="mb-10 text-8xl animate-float">📈</div>
                            <h3 className="font-headline text-4xl font-black text-[#2D241E] mb-6 italic">Aguardando Estratégia</h3>
                            <p className="text-xl font-bold text-[#2D241E]/40 leading-relaxed uppercase tracking-[0.2em] font-inter">
                                Selecione o período acima para iniciar
                            </p>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
