"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Shield, FileText } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-background to-secondary/20 border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-caixinhas.png"
                alt="Caixinhas Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-foreground">
                Caixinhas
              </span>
            </div>
            <p className="text-muted-foreground max-w-md mb-4">
              A plataforma de gestão financeira que ajuda casais e famílias a 
              realizarem seus sonhos juntos através da transparência e organização.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <a 
                href="mailto:suporte@caixinhas.app" 
                className="hover:text-primary transition-colors"
              >
                suporte@caixinhas.app
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#recursos" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Recursos
                </a>
              </li>
              <li>
                <a 
                  href="#como-funciona" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Como Funciona
                </a>
              </li>
              <li>
                <a 
                  href="#planos" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Planos
                </a>
              </li>
              <li>
                <Link 
                  href="/login" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Termos de Serviço
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Caixinhas. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Feito com ❤️ para casais</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
