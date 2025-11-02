'use client';

import { useState, useEffect } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Bot, FileText, Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { financialReports, users } from '@/lib/data';
import type { FinancialReport } from '@/lib/definitions';
import { getFinancialReport, type FinancialReportState } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import withAuth from '@/components/auth/with-auth';

function ChatSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Send className="h-4 w-4" />}
      <span className="sr-only">Enviar</span>
    </Button>
  );
}

function ReportsPage() {
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(financialReports[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const initialState: FinancialReportState = { reportId: currentReport?.id ?? '' };
  const [state, dispatch] = useFormState(getFinancialReport, initialState);

  const handleTabChange = (reportId: string) => {
    const newReport = financialReports.find(r => r.id === reportId);
    setCurrentReport(newReport || null);
    setChatHistory([]); // Reset chat when changing reports
  }
  
  useEffect(() => {
    if (state.analysis && state.sender === 'assistant') {
        setChatHistory(prev => [...prev, { role: 'assistant', content: state.analysis! }]);
        setIsGenerating(false);
    }
  }, [state]);

  const handleFormSubmit = (formData: FormData) => {
    const userMessage = formData.get('message') as string;
    if (!userMessage) return;

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);
    dispatch(formData);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Início
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              Relatórios Financeiros Mensais
            </CardTitle>
            <CardDescription>
              Sua análise de saúde financeira profissional, gerada por IA. Converse sobre os resultados para tirar dúvidas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={currentReport?.id} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {financialReports.map(report => (
                    <TabsTrigger key={report.id} value={report.id}>{report.month}</TabsTrigger>
                ))}
              </TabsList>
              {financialReports.map(report => (
                <TabsContent key={report.id} value={report.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Report Content */}
                        <div className='md:h-[600px] flex flex-col'>
                            <h3 className="font-headline text-lg font-bold mb-2">Análise de {report.month}</h3>
                            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/20">
                                <div
                                    className="prose prose-sm prose-p:leading-normal prose-headings:font-headline max-w-none text-foreground"
                                    dangerouslySetInnerHTML={{ __html: report.analysisHtml }}
                                />
                            </ScrollArea>
                        </div>
                        
                        {/* Chat */}
                        <div className="flex flex-col rounded-lg border bg-card md:h-[600px]">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold flex items-center gap-2"><Bot className='h-5 w-5' /> Assistente Financeiro</h3>
                                <p className='text-xs text-muted-foreground'>Tire dúvidas sobre seu relatório de {report.month}</p>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                               <div className="space-y-4">
                                {chatHistory.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-8">
                                        Comece a conversa! Pergunte algo como "Qual foi minha maior despesa?" ou "Como posso melhorar minhas economias?".
                                    </div>
                                )}
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        {msg.role === 'assistant' && (
                                            <Avatar className="h-8 w-8 border-2 border-primary">
                                                <AvatarFallback><Bot /></AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("max-w-xs rounded-lg px-4 py-2 text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                            <p>{msg.content}</p>
                                        </div>
                                         {msg.role === 'user' && (
                                            <Avatar className="h-8 w-8 border-2 border-muted-foreground">
                                                <AvatarImage src={users[0].avatarUrl} />
                                                <AvatarFallback>{users[0].name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                 {isGenerating && (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border-2 border-primary">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                        <div className="bg-muted px-4 py-3 rounded-lg flex items-center gap-2">
                                            <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="h-2 w-2 bg-foreground rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                 )}
                               </div>
                            </ScrollArea>
                            <form action={handleFormSubmit} className="flex items-center gap-2 border-t p-2">
                                <input type="hidden" name="reportId" value={currentReport?.id ?? ''} />
                                <Input
                                    name="message"
                                    placeholder="Pergunte sobre seu relatório..."
                                    className="flex-1"
                                    disabled={isGenerating}
                                />
                                <ChatSubmitButton />
                            </form>
                        </div>
                    </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ReportsPage);
