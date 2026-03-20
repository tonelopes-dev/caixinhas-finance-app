"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Vault, Gift, ArrowRightLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useLoading } from "@/components/providers/loading-provider";

const MobileFloatingNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [active, setActive] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Páginas onde o menu mobile NÃO deve aparecer
  const publicPages = ['/landing', '/login', '/register', '/terms'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // Só mostrar se usuário estiver autenticado e não estiver em página pública
  // REMOVIDO: !isLoading - não devemos ocultar o menu durante loading global (ex: navegação de workspace)
  const shouldShowNav = status === 'authenticated' && session?.user && !isPublicPage;

  const items = [
    { 
      id: 0, 
      icon: <Home size={20} />, 
      label: "Início", 
      path: "/dashboard"
    },
    { 
      id: 1, 
      icon: <Gift size={20} />, 
      label: "Caixinhas", 
      path: "/goals"
    },
    { 
      id: 2, 
      icon: <ArrowRightLeft size={20} />, 
      label: "Transações", 
      path: "/transactions"
    },
    { 
      id: 3, 
      icon: <Vault size={20} />, 
      label: "Cofres", 
      path: "/vaults"
    },
  ];

  // Determinar item ativo baseado na rota atual
  useEffect(() => {
    const currentItem = items.findIndex(item => {
      if (item.path === "/dashboard") {
        return pathname === "/" || pathname === "/dashboard";
      }
      return pathname.startsWith(item.path);
    });
    
    // Se a rota atual não corresponde a nenhum item do menu, desativa todos (ex: /profile)
    if (currentItem === -1) {
      console.log('📍 [MobileNav] Rota não encontrada no menu, desativando (pathname:', pathname, ')');
      setActive(-1);
    } else if (currentItem !== active) {
      console.log('📍 [MobileNav] Atualizando active de', active, 'para', currentItem, '(pathname:', pathname, ')');
      setActive(currentItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Apenas pathname como dependência

  // Atualizar posição do indicador quando ativo muda ou resize
  useEffect(() => {
    const updateIndicator = () => {
      if (btnRefs.current[active] && containerRef.current) {
        const btn = btnRefs.current[active];
        const container = containerRef.current;
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [active]);

  const handleNavigation = (item: typeof items[0], index: number) => {
    // Se já estiver navegando, prevenir múltiplos cliques
    if (isLoading) {
      console.warn('⚠️ [MobileNav] Navegação já em andamento, ignorando clique');
      return;
    }
    
    // Se já estiver na página de destino, não fazer nada
    const isAlreadyThere = 
      (item.path === "/dashboard" && (pathname === "/" || pathname === "/dashboard")) ||
      pathname.startsWith(item.path);
    
    if (isAlreadyThere) {
      console.log('ℹ️ [MobileNav] Já está em:', item.path);
      return;
    }
    
    // Validar se a rota é válida antes de navegar
    if (!item.path || !item.path.startsWith('/')) {
      console.error('❌ Rota inválida:', item.path);
      return;
    }
    
    console.log('🚀 [MobileNav] Iniciando navegação para:', item.path);
    setActive(index);
    showLoading('Navegando...');
    
    // Pequeno delay para mostrar a tela de loading antes de navegar
    setTimeout(() => {
      try {
        router.push(item.path);
      } catch (error) {
        console.error('❌ Erro ao navegar:', error);
        hideLoading();
      }
    }, 300);
  };

  // Não renderizar se não deve mostrar a navegação
  if (!shouldShowNav) {
    return null;
  }

  return (
    <>
    <div 
        className="sm:hidden fixed left-1/2 -translate-x-1/2 z-40 w-full max-w-[400px] px-4"
        style={{ 
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom))'
        }}
    >
      <div
        ref={containerRef}
        className="relative flex items-center justify-between bg-white/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(45,36,30,0.15)] rounded-[32px] px-2 py-2.5 border border-white/60"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              btnRefs.current[index] = el;
            }}
            onClick={() => handleNavigation(item, index)}
            disabled={isLoading}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 px-2 py-2 transition-all duration-300",
              "active:scale-90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              active === index 
                ? "text-[#ff6b7b]" 
                : "text-[#2D241E]/40"
            )}
            aria-label={`Ir para ${item.label}`}
          >
            <div className={cn(
              "z-10 transition-all duration-500",
              active === index && "transform -translate-y-1 scale-110"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "font-headline text-[10px] mt-1.5 transition-all duration-500 uppercase tracking-widest whitespace-nowrap",
              active === index 
                ? "opacity-100 font-black italic" 
                : "opacity-60 font-bold"
            )}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Indicador deslizante ativo */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="absolute top-1.5 bottom-1.5 rounded-[24px] bg-white/60 shadow-sm border border-white/40"
        />
        
        {/* Ponto indicador no topo */}
        <motion.div
          animate={{ 
            left: indicatorStyle.left + indicatorStyle.width / 2 - 2,
            opacity: active === -1 ? 0 : 1
          }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#ff6b7b] shadow-[0_0_10px_rgba(255,107,123,0.5)]"
        />
      </div>
    </div>
    </>
  );
};

export default MobileFloatingNav;