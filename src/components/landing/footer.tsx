'use client';

import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

const links = {
  Produto: [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Preços', href: '#' },
    { name: 'FAQ', href: '#faq' },
  ],
  Empresa: [
    { name: 'Sobre Nós', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Contato', href: 'mailto:suporte@caixinhas.com' },
  ],
  Legal: [
    { name: 'Termos de Serviço', href: '/terms' },
    { name: 'Política de Privacidade', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <Logo className="h-10 w-auto" />
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

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            <div>
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
            <div>
              <h3 className="font-semibold">Empresa</h3>
              <ul className="mt-4 space-y-2">
                {links.Empresa.map((link) => (
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
            <div>
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