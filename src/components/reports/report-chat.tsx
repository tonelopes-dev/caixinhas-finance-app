'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Bot, Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/definitions';

export type ChatMessage = {
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

interface ReportChatProps {
    reportHtml: string | null;
    isReportLoading?: boolean;
    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    chatAction: (payload: FormData) => void;
    isChatPending?: boolean;
    currentUser: User;
}

export function ReportChat({
    reportHtml,
    isReportLoading,
    chatHistory,
    setChatHistory,
    chatAction,
    isChatPending,
    currentUser
}: ReportChatProps) {
    const chatInputRef = useRef<HTMLInputElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatHistory]);

    useEffect(() => {
        if (!isChatPending) {
            setIsSubmitting(false);
            if (chatInputRef.current && chatHistory[chatHistory.length - 1]?.role === 'assistant') {
                chatInputRef.current.value = '';
            }
        }
    }, [isChatPending, chatHistory]);

    const handleChatSubmit = (formData: FormData) => {
        const userMessage = formData.get('message') as string;
        if (!userMessage.trim() || !reportHtml) return;

        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsSubmitting(true);
        
        const historyString = JSON.stringify(chatHistory);
        formData.set('chatHistory', historyString);
        formData.set('reportContext', reportHtml);

        chatAction(formData);
    };

    return (
        <div className={cn("flex flex-col rounded-lg border bg-card md:h-[600px]", !reportHtml || isReportLoading ? 'opacity-50 pointer-events-none' : '')}>
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
                    {isSubmitting && (
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
                    disabled={isChatPending}
                    autoComplete="off"
                />
                <ChatSubmitButton />
            </form>
        </div>
    );
}
