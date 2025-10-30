import Image from 'next/image';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';
import type { User, Partner } from '@/lib/definitions';

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
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="woman portrait"/>
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Avatar className="h-9 w-9 border-2 border-background">
              <AvatarImage src={partner.avatarUrl} alt={partner.name} data-ai-hint="man portrait"/>
              <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar
        </Button>
      </div>
    </header>
  );
}
