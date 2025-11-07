'use client';

import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

const links = {
  Links: [
    { name: 'Home', href: '#' },
    { name: 'About Us', href: '#' },
    { name: 'Bookings', href: '#' },
    { name: 'Blog', href: '#' },
  ],
  Legal: [
    { name: 'Termos de Uso', href: '/terms' },
    { name: 'Política de Privacidade', href: '#' },
    { name: 'Política de Cookies', href: '#' },
  ],
  Produto: [
    { name: 'Fazer Tour', href: '#' },
    { name: 'Preços', href: '#' },
    { name: 'FAQ', href: '#faq' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <Logo className="h-8 w-auto" />
              <span className='font-bold text-xl'>Caixinhas</span>
            </Link>
            <div className="space-y-2 text-muted-foreground">
                <a href="mailto:suporte@caixinhas.com" className="flex items-center gap-2 hover:text-primary">
                    <Mail className="h-4 w-4" />
                    suporte@caixinhas.com
                </a>
                 <a href="tel:+5511999999999" className="flex items-center gap-2 hover:text-primary">
                    <Phone className="h-4 w-4" />
                    +55 (11) 99999-9999
                </a>
            </div>
          </div>

          <div className='col-span-2 md:col-span-1'>
            <h3 className="font-semibold">Links</h3>
            <ul className="mt-4 space-y-2">
              {links.Links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className='col-span-2 md:col-span-1'>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              {links.Legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className='col-span-2 md:col-span-1'>
            <h3 className="font-semibold">Produto</h3>
            <ul className="mt-4 space-y-2">
              {links.Produto.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

           <div className="col-span-2 md:col-span-1">
              <h3 className="font-semibold">Newsletter</h3>
              <p className="mt-4 text-muted-foreground">Fique por dentro</p>
              <form className="mt-2 flex gap-2">
                <Input type="email" placeholder="Seu email" className='bg-background'/>
                <Button>Inscrever</Button>
              </form>
            </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Caixinhas. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
