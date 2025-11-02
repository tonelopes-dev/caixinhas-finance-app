'use client';

import { useState, useEffect, useRef } from 'react';
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
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { users } from '@/lib/data';
import { generateNewFinancialReport, getFinancialReportChat, type FinancialReportState } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import withAuth from '@/components/auth/with-auth';
import type { User } from '@/lib/definitions';
import { ReportSkeleton } from '@/components/reports/report-skeleton';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

function ChatSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Send className="h-4 w-4" />}
      <span className="sr-only">Enviar</span>
    </Button>
  );
}

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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }) }));


function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const initialState: FinancialReportState = { reportHtml: null, chatResponse: null, error: null };
  const [reportState, generateReportAction] = useFormState(generateNewFinancialReport, initialState);
  const [chatState, chatAction] = useFormState(getFinancialReportChat, initialState);

  const chatInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem('DREAMVAULT_USER_ID');
    const selectedWorkspaceId = sessionStorage.getItem('DREAMVAULT_VAULT_ID');
    if (userId) {
        setCurrentUser(users.find(u => u.id === userId) || null);
    }
    if (selectedWorkspaceId) {
        setWorkspaceId(selectedWorkspaceId);
    }
  }, []);

  // Effect to handle new report generation
  useEffect(() => {
    if (reportState?.isNewReport) {
        setReportHtml(reportState.reportHtml ?? null);
        setChatHistory([]); // Clear chat history for new report
    }
    if (reportState?.error) {
        // You might want to show a toast here
        console.error(reportState.error);
    }
  }, [reportState]);

  // Effect to handle new chat messages
  useEffect(() => {
    if (chatState?.chatResponse && !chatState.isNewReport && chatHistory[chatHistory.length - 1]?.role !== 'assistant') {
        setChatHistory(prev => [...prev, { role: 'assistant', content: chatState.chatResponse! }]);
        setIsChatting(false);
        if (chatInputRef.current) {
            chatInputRef.current.value = '';
        }
    } else if (chatState?.error) {
        setIsChatting(false);
    }
  }, [chatState, chatHistory]);


  // Effect to scroll chat
  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [chatHistory])

  const handleChatSubmit = (formData: FormData) => {
    const userMessage = formData.get('message') as string;
    if (!userMessage.trim() || !reportHtml) return;

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatting(true);
    
    const historyString = JSON.stringify(chatHistory);
    formData.set('chatHistory', historyString);
    formData.set('reportContext', reportHtml);

    chatAction(formData);
  };
  
  const handleGenerateReport = (formData: FormData) => {
    setReportHtml(null); // Clear previous report before generating a new one
    formData.set('month', month);
    formData.set('year', year);
    generateReportAction(formData);
  }


  if (!currentUser || !workspaceId) {
    return <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>;
  }

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
              Relatórios Financeiros Sob Demanda
            </CardTitle>
            <CardDescription>
              Selecione um período e gere uma análise de saúde financeira profissional com nossa IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleGenerateReport} className="flex flex-col md:flex-row items-center gap-4 rounded-lg border p-4 mb-6">
                <input type="hidden" name="ownerId" value={workspaceId} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />
                <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className="space-y-2">
                        <label className='text-sm font-medium'>Mês</label>
                        <Select name="month" value={month} onValueChange={setMonth}>
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
                        <Select name="year" value={year} onValueChange={setYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className='self-end md:self-center mt-4 md:mt-0'>
                    <GenerateReportButton />
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div ref={reportContainerRef} className='md:h-[600px] flex flex-col'>
                    <h3 className="font-headline text-lg font-bold mb-2">Relatório Gerado</h3>
                    <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/20">
                        {reportState.pending ? (
                             <ReportSkeleton />
                        ) : reportHtml ? (
                            <div
                                className="prose prose-sm prose-p:leading-normal prose-headings:font-headline max-w-none text-foreground"
                                dangerouslySetInnerHTML={{ __html: reportHtml }}
                            />
                        ) : (
                             <div className="flex h-full items-center justify-center">
                                <p className="text-center text-muted-foreground">Selecione um período e clique em "Gerar Relatório" para começar.</p>
                            </div>
                        )}
                        
                    </ScrollArea>
                </div>
                
                <div className={cn("flex flex-col rounded-lg border bg-card md:h-[600px]", !reportHtml || reportState.pending ? 'opacity-50 pointer-events-none' : '')}>
                    <div className="p-4 border-b">
                        <h3 className="font-semibold flex items-center gap-2"><Bot className='h-5 w-5' /> Assistente Financeiro</h3>
                        <p className='text-xs text-muted-foreground'>Tire dúvidas sobre seu relatório.</p>
                    </div>
                    <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
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
                                    {msg.role === 'user' && currentUser && (
                                    <Avatar className="h-8 w-8 border-2 border-muted-foreground">
                                        <AvatarImage src={currentUser.avatarUrl} />
                                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                            {isChatting && (
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
                    <form action={handleChatSubmit} className="flex items-center gap-2 border-t p-2">
                        <Input
                            ref={chatInputRef}
                            name="message"
                            placeholder="Pergunte sobre seu relatório..."
                            className="flex-1"
                            disabled={isChatting}
                            autoComplete="off"
                        />
                        <ChatSubmitButton />
                    </form>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ReportsPage);
