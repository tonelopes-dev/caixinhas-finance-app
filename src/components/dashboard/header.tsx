
'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, BookOpen, ArrowRightLeft, FileText, Wallet, Landmark, Building2, Gift } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { NotificationsDropdown } from './notifications-dropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { signOut } from 'next-auth/react';


type HeaderProps = {
  user: User;
  partner: User | null; // Partner can be null
};

export default function Header({ user, partner }: HeaderProps) {
  const router = useRouter();
  
  const handleLogout = async () => {
    // Limpar localStorage/sessionStorage por compatibilidade
    if (typeof window !== 'undefined') {
      localStorage.removeItem('CAIXINHAS_USER_ID');
      sessionStorage.removeItem('CAIXINHAS_VAULT_ID');
    }
    
    // Usar NextAuth signOut
    await signOut({ 
      callbackUrl: '/login',
      redirect: true
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/vaults" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="font-headline hidden sm:block text-xl font-bold text-foreground">Caixinhas</h1>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          {partner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex -space-x-2">
                        <Avatar className="h-9 w-9 border-2 border-background" style={{borderColor: 'hsl(var(--chart-2))'}}>
                        <AvatarImage src={partner.avatarUrl} alt={partner.name} data-ai-hint="man portrait"/>
                        <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{partner.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/invite">
              <UserPlus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Convidar</span>
            </Link>
          </Button>
          
          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 relative h-9 rounded-full pl-2 pr-2 md:pr-4">
                <Avatar className="h-9 w-9 border-2" style={{borderColor: 'hsl(var(--chart-1))'}}>
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="woman portrait"/>
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
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Mudar de Espaço</span>
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
        </div>
      </div>
    </header>
  );
}
