'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', href: '#hero' },
  { name: 'Sobre Nós', href: '#features' },
  { name: 'Preços', href: '#' },
  { name: 'Funcionalidades', href: '#faq' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Logo className="h-8 w-auto" />
          <span className="hidden font-bold sm:inline-block text-xl">Caixinhas</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "font-medium text-foreground transition-colors hover:text-primary",
                link.name === 'Home' && 'text-primary font-bold'
                )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Button asChild>
            <Link href="/register">Download</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <Logo className="h-8 w-auto" />
                  <span>Caixinhas</span>
                </Link>
                 {navLinks.map((link) => (
                    <Link
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground"
                    >
                    {link.name}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
