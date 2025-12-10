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
import { signOut } from 'next-auth/react';
import { useTheme } from '@/hooks/use-theme';

type HeaderClientProps = {
  user: User;
};

export function HeaderClient({ user }: HeaderClientProps) {
  const { themeVersion } = useTheme(); // Force re-render on theme change
  
  const handleLogout = async () => {
    try {
      // Limpar localStorage/sessionStorage antes do signOut
      if (typeof window !== 'undefined') {
        localStorage.removeItem('CAIXINHAS_USER_ID');
        sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
        // Limpar todos os dados relacionados à sessão
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Usar NextAuth signOut sem redirecionamento automático
      await signOut({ 
        redirect: false
      });
      
      // Redirecionamento manual para evitar loops
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erro no logout:', error);
      // Em caso de erro, forçar redirecionamento
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 relative h-9 rounded-full pl-2 pr-2 md:pr-4">
          <Avatar className="h-9 w-9 border-2" style={{borderColor: 'hsl(var(--chart-1))'}}>
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="woman portrait"/>
            <AvatarFallback>{user.name.split(' ')[0]}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline font-medium text-sm">Olá, {user.name.split(' ')[0]}</span>
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
        <DropdownMenuItem asChild>
          <Link href="/patrimonio">
            <Wallet className="mr-2 h-4 w-4" />
            <span>Patrimônio</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/accounts">
            <Landmark className="mr-2 h-4 w-4" />
            <span>Contas</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/reports">
            <FileText className="mr-2 h-4 w-4" />
            <span>Relatórios</span>
          </Link>
        </DropdownMenuItem>
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
          <Link href="/vaults">
            <Vault className="mr-2 h-4 w-4" />
            <span>Mudar de Cofre</span>
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
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
