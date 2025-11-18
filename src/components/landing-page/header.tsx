"use client"

import { useState } from "react"
import {  Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <Image
            src="/logo-caixinhas.png"
            alt="Caixinhas Logo"
            width={40}
            height={40}
            className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
          />
          <span className="text-xl md:text-2xl font-bold text-foreground">
            Caixinhas
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <a
            href="#recursos"
            className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
          >
            Recursos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#como-funciona"
            className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
          >
            Como Funciona
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#historia"
            className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
          >
            História
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#planos"
            className="text-foreground/70 hover:text-foreground transition-colors text-lg relative group"
          >
            Planos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </a>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-foreground text-lg hover:bg-primary/10 transition-all"
            asChild
          >
            <Link href="/login">
            Entrar
            </Link>
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold hover:scale-105 transition-transform relative overflow-hidden group">
            <span className="relative z-10">Assinar Agora</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`lg:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
          <a
            href="#recursos"
            onClick={handleNavClick}
            className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
          >
            Recursos
          </a>
          <a
            href="#como-funciona"
            onClick={handleNavClick}
            className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
          >
            Como Funciona
          </a>
          <a
            href="#historia"
            onClick={handleNavClick}
            className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
          >
            História
          </a>
          <a
            href="#planos"
            onClick={handleNavClick}
            className="text-foreground/70 hover:text-primary transition-colors text-lg py-2 border-b border-border/50"
          >
            Planos
          </a>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="ghost"
              className="text-foreground text-lg hover:bg-primary/10 transition-all w-full"
            >
              Entrar
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold w-full">
              Assinar Agora
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
