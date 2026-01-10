
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
import { NotificationsDropdown } from './notifications-dropdown';
import { NotificationService } from '@/services/notification.service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HeaderClient } from './header-client';
import { InviteButton } from './invite-button';


type HeaderProps = {
  user: User;
  partner: User | null; // Partner can be null
};

export default async function Header({ user, partner }: HeaderProps) {
  // Buscar notificações não lidas diretamente do service
  const [unreadNotifications, unreadCount] = await Promise.all([
    NotificationService.getUnreadNotifications(user.id),
    NotificationService.getUnreadCount(user.id),
  ]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-center border-b bg-background/80 px-6 backdrop-blur-sm md:px-6">
      <div className="container flex items-center justify-between">
        <Link href="/vaults" className="flex items-center gap-2">
          <Logo w={32} h={32} />
          <h1 className="font-headline sm:block text-xl font-bold text-foreground">Caixinhas</h1>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {partner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex -space-x-2">
                        <Avatar className="h-9 w-9 border-2 border-background" style={{borderColor: 'hsl(var(--chart-2))'}}>
                        <AvatarImage src={partner.avatarUrl || undefined} alt={partner.name} data-ai-hint="man portrait"/>
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
          <InviteButton />
          
          <NotificationsDropdown 
            initialNotifications={unreadNotifications}
            initialUnreadCount={unreadCount}
          />

          <HeaderClient user={user} />
        </div>
      </div>
    </header>
  );
}
