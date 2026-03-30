"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportSkeleton } from "@/components/reports/report-skeleton";

interface ReportDisplayProps {
  reportHtml: string | null;
  isLoading?: boolean;
}

export function ReportDisplay({ reportHtml, isLoading }: ReportDisplayProps) {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <ReportSkeleton />
        </div>
      ) : reportHtml ? (
        <ScrollArea className="w-full flex-1 rounded-[24px] sm:rounded-[32px] md:rounded-[48px] bg-white/50 backdrop-blur-3xl border border-white/80 shadow-2xl overflow-hidden min-h-[600px] md:min-h-[700px]">
          <div
            className="p-0 sm:p-8 md:p-16 prose prose-amber max-w-none w-full break-words
                        prose-headings:font-headline prose-headings:text-[#2D241E] prose-headings:italic prose-headings:break-words
                        prose-h2:text-xl sm:prose-h2:text-2xl md:prose-h2:text-4xl prose-h2:font-black prose-h2:mb-6 sm:prose-h2:mb-8 prose-h2:mt-10 sm:prose-h2:mt-12 md:prose-h2:mt-16 prose-h2:first:mt-0 prose-h2:tracking-tight
                        prose-h3:text-lg sm:prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4 sm:prose-h3:mb-6 prose-h3:mt-8 sm:prose-h3:mt-10 prose-h3:tracking-tight
                        prose-h4:text-base sm:prose-h4:text-lg md:prose-h4:text-xl prose-h4:font-bold prose-h4:mb-3 sm:prose-h4:mb-4
                        prose-p:text-sm sm:prose-p:text-base md:prose-p:text-lg prose-p:text-[#2D241E]/80 prose-p:leading-relaxed prose-p:mb-5 sm:prose-p:mb-6 md:prose-p:mb-8
                        prose-strong:text-[#2D241E] prose-strong:font-black
                        prose-ul:my-5 sm:prose-ul:my-6 md:prose-ul:my-8 prose-li:text-sm sm:prose-li:text-base md:prose-li:text-lg prose-li:text-[#2D241E]/80 prose-li:my-2 md:prose-li:my-3
                        prose-table:text-xs sm:prose-table:text-sm md:prose-table:text-base prose-th:p-2 sm:prose-th:p-3 md:prose-th:p-5 prose-td:p-2 sm:prose-td:p-3 md:prose-td:p-5 prose-th:bg-[#2D241E]/5 prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:text-[9px] sm:prose-th:text-[10px] md:prose-th:text-[11px]
                        [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:rounded-[16px] md:[&_table]:rounded-[32px] [&_table]:border [&_table]:border-white/40 [&_table]:bg-white/10
                        [&_.space-y-6]:space-y-4 md:[&_.space-y-6]:space-y-6 [&_.space-y-4]:space-y-3 md:[&_.space-y-4]:space-y-4 [&_.space-y-3]:space-y-2 md:[&_.space-y-3]:space-y-3
                        [&_.gap-4]:gap-3 md:[&_.gap-4]:gap-6 [&_.gap-6]:gap-4 md:[&_.gap-6]:gap-8
                        [&_svg]:inline-block [&_svg]:align-middle
                        [&_*]:max-w-full [&_div]:max-w-full
                        [&_.flex:not(.flex-col)]:flex-wrap md:[&_.flex:not(.flex-col)]:flex-nowrap"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        </ScrollArea>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-12 min-h-[400px]">
          <div className="text-center w-full max-w-xl bg-white/40 backdrop-blur-3xl p-8 sm:p-16 rounded-[56px] border border-white/60 shadow-2xl mx-auto">
            <div className="mb-6 sm:mb-10 text-6xl sm:text-8xl animate-float">
              📈
            </div>
            <h3 className="font-headline text-2xl sm:text-4xl font-black text-[#2D241E] mb-4 sm:mb-6 italic">
              Aguardando Estratégia
            </h3>
            <p className="text-sm sm:text-xl font-bold text-[#2D241E]/40 leading-relaxed uppercase tracking-[0.2em] font-inter">
              Selecione o período acima para iniciar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
