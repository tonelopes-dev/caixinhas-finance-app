
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
    <div className="relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500">
      <div className="p-8 md:p-10 space-y-2 border-b border-[#2D241E]/5 bg-white/30">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-[#ff6b7b]/10 p-3 shadow-inner">
            <BellRing className="h-6 w-6 text-[#ff6b7b]" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-[#2D241E] italic">Central de <span className="text-[#ff6b7b]">Notificações</span></h2>
            <p className="text-xs font-medium text-[#2D241E]/40 italic">Escolha como e quando você quer ser notificado sobre seu progresso.</p>
          </div>
        </div>
      </div>
      <div className="p-8 md:p-10 space-y-6">
        <div className="group flex items-center justify-between space-x-4 rounded-3xl border-2 border-[#2D241E]/5 bg-white/30 p-6 transition-all hover:bg-white/50 hover:border-[#ff6b7b]/20">
            <Label htmlFor="motivational-notifications" className="flex flex-col space-y-2 cursor-pointer">
                <span className="text-base font-bold text-[#2D241E]">Incentivos Motivacionais</span>
                <span className="text-xs font-medium text-[#2D241E]/40 italic">
                Receba notificações quando estiver perto de alcançar uma meta.
                </span>
            </Label>
            <Switch 
              id="motivational-notifications" 
              defaultChecked 
              className="data-[state=checked]:bg-[#ff6b7b]"
            />
        </div>
         <div className="group flex items-center justify-between space-x-4 rounded-3xl border-2 border-[#2D241E]/5 bg-white/30 p-6 transition-all hover:bg-white/50 hover:border-[#ff6b7b]/20">
            <Label htmlFor="partner-activity" className="flex flex-col space-y-2 cursor-pointer">
                <span className="text-base font-bold text-[#2D241E]">Atividade do Parceiro(a)</span>
                <span className="text-xs font-medium text-[#2D241E]/40 italic">
                Seja notificado sobre novas transações ou metas criadas no cofre compartilhado.
                </span>
            </Label>
            <Switch 
              id="partner-activity" 
              defaultChecked 
              className="data-[state=checked]:bg-[#ff6b7b]"
            />
        </div>
      </div>
       <div className="p-8 md:p-10 border-t border-[#2D241E]/5 flex justify-end bg-white/30 backdrop-blur-sm">
        <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-2xl hover:shadow-[#ff6b7b]/30 transition-all duration-300 active:scale-[0.98]">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
