"use client";

import { useEffect } from 'react';
import { PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Goal } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

export function MotivationalNudge({ goal }: { goal: Goal }) {
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Quase lá!', {
        body: `Vocês estão muito perto de alcançar a meta "${goal.name}"!`,
        icon: '/icons/icon-192x192.png',
        data: { url: `/goals/${goal.id}` },
      });
    } else {
        toast({
            title: "Quase lá!",
            description: `Vocês estão muito perto de alcançar a meta "${goal.name}"!`
        });
    }
  }, [goal, toast]);

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
            <PartyPopper className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="font-headline text-xl">Parabéns, vocês estão quase lá!</CardTitle>
                <CardDescription>Falta muito pouco para vocês realizarem o sonho: <span className="font-bold text-primary">{goal.name}</span>. Continuem assim!</CardDescription>
            </div>
        </div>
      </CardHeader>
    </Card>
  );
}
