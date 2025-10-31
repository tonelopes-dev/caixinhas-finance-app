'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BellRing } from 'lucide-react';

export function NotificationsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Notificações</CardTitle>
        <CardDescription>
          Escolha como e quando você quer ser notificado.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="motivational-notifications" className="flex flex-col space-y-1">
                <span className="font-medium">Incentivos Motivacionais</span>
                <span className="text-xs font-normal leading-snug text-muted-foreground">
                Receba notificações quando estiver perto de alcançar uma meta.
                </span>
            </Label>
            <Switch id="motivational-notifications" defaultChecked />
        </div>
         <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="partner-activity" className="flex flex-col space-y-1">
                <span className="font-medium">Atividade do Parceiro(a)</span>
                <span className="text-xs font-normal leading-snug text-muted-foreground">
                Seja notificado sobre novas transações ou metas criadas.
                </span>
            </Label>
            <Switch id="partner-activity" defaultChecked />
        </div>
      </CardContent>
       <CardFooter className="border-t px-6 py-4">
        <Button>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  );
}
