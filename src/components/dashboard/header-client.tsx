'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, ArrowRightLeft, FileText, Wallet, Landmark, Building2, Gift, LifeBuoy, Vault } from 'lucide-react';
import type { User } from '@/lib/definitions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon } from 'lucide-react';
import { ThemeSwitcher } from '../theme-switcher';
import { useTheme } from '@/hooks/use-theme';
import { performLogout } from '@/lib/auth-utils';
import { useLoading } from '@/components/providers/loading-provider';

type HeaderClientProps = {
  user: User;
};

export function HeaderClient({ user }: HeaderClientProps) {
  const { themeVersion } = useTheme(); // Force re-render on theme change
  const { showLoading, hideLoading } = useLoading();
  
  const handleLogout = async () => {
    const setAuthLoading = (show: boolean, message?: string) => {
      if (show) {
        showLoading(message || 'Saindo...');
      } else {
        hideLoading();
      }
    };
    await performLogout(setAuthLoading);
  };

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 relative h-11 rounded-full pl-1.5 pr-5 bg-white hover:bg-[#fdfcf7] hover:text-[#2D241E] text-[#2D241E] border-none shadow-sm hover:shadow-md transition-all active:scale-95 group focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none">
           <Avatar className="h-8 w-8 ring-2 ring-[#ff6b7b] ring-offset-2 ring-offset-white">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="woman portrait"/>
            <AvatarFallback className="bg-[#2D241E] text-white font-bold">{user.name.split(' ')[0][0]}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline font-headline font-bold text-base tracking-tight italic opacity-90 group-hover:opacity-100">Olá, {user.name.split(' ')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 🔥 Ações Frequentes - Mais usadas */}
        <DropdownMenuItem asChild>
          <Link href="/transactions">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            <span>Transações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/goals">
            <Gift className="mr-2 h-4 w-4" />
            <span>Caixinhas</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/vaults">
            <Vault className="mr-2 h-4 w-4" />
            <span>Mudar de Cofre</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* 💰 Gestão Financeira */}
        <DropdownMenuItem asChild>
          <Link href="/accounts">
            <Landmark className="mr-2 h-4 w-4" />
            <span>Contas</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/patrimonio">
            <Wallet className="mr-2 h-4 w-4" />
            <span>Patrimônio</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/reports">
            <FileText className="mr-2 h-4 w-4" />
            <span>Relatórios</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* ⚙️ Configurações & Ajuda */}
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tutorial">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Tutorial</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support">
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Suporte</span>
          </Link>
        </DropdownMenuItem>
        
        <ThemeSwitcher />
        
        <DropdownMenuSeparator />
        
        {/* 🚪 Sair */}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}
