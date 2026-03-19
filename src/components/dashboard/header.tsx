
import Link from 'next/link';
import { PremiumLogo } from '@/components/ui/premium-logo';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 overflow-hidden">

      <div className="container mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
        <PremiumLogo href="/vaults" />

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
