import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Bell } from 'lucide-react';
import type { User, Partner } from '@/lib/definitions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon } from 'lucide-react';


type HeaderProps = {
  user: User;
  partner: Partner;
};

export default function Header({ user, partner }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <Logo className="h-8 w-8" />
        <h1 className="font-headline text-xl font-bold text-foreground">DreamVault</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex -space-x-2">
            <Avatar className="h-9 w-9 border-2 border-background">
              <AvatarImage src={partner.avatarUrl} alt={partner.name} data-ai-hint="man portrait"/>
              <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/invite">
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
            <Link href="/invitations">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Convites</span>
            </Link>
        </Button>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 relative h-9 rounded-full pl-2 pr-4">
               <Avatar className="h-9 w-9 border-2 border-background">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="woman portrait"/>
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium text-sm">Olá, {user.name}</span>
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
                <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
