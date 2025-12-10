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
  const { isLoading } = useLoading();
  const [active, setActive] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Páginas onde o menu mobile NÃO deve aparecer
  const publicPages = ['/landing', '/login', '/register', '/terms'];
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // Só mostrar se usuário estiver autenticado, não estiver em página pública e não estiver com loading global ativo
  const shouldShowNav = status === 'authenticated' && session?.user && !isPublicPage && !isLoading;

  const items = [
    { 
      id: 0, 
      icon: <Home size={20} />, 
      label: "Início", 
      path: "/dashboard"
    },
    { 
      id: 1, 
      icon: <ArrowRightLeft size={20} />, 
      label: "Transações", 
      path: "/transactions"
    },
    { 
      id: 2, 
      icon: <Gift size={20} />, 
      label: "Caixinhas", 
      path: "/goals"
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
    
    if (currentItem !== -1) {
      setActive(currentItem);
    }
  }, [pathname]);

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
    setActive(index);
    router.push(item.path);
  };

  // Não renderizar se não deve mostrar a navegação
  if (!shouldShowNav) {
    return null;
  }

  return (
    <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-4">
      <div
        ref={containerRef}
        className="relative flex items-center justify-between bg-card/95 backdrop-blur-md shadow-2xl rounded-2xl px-2 py-3 border border-border/50"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              btnRefs.current[index] = el;
            }}
            onClick={() => handleNavigation(item, index)}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 px-3 py-2 text-sm font-medium transition-all duration-200",
              "hover:scale-105 active:scale-95",
              active === index 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
            aria-label={`Ir para ${item.label}`}
          >
            <div className={cn(
              "z-10 transition-all duration-200",
              active === index && "transform -translate-y-0.5"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "text-xs mt-1 transition-all duration-200 truncate max-w-[60px]",
              active === index 
                ? "opacity-100 font-semibold" 
                : "opacity-70"
            )}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Indicador deslizante ativo */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-2 bottom-2 rounded-xl bg-primary/10 border border-primary/20"
        />
        
        {/* Ponto indicador no topo */}
        <motion.div
          animate={{ left: indicatorStyle.left + indicatorStyle.width / 2 - 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute -top-1 w-1 h-1 rounded-full bg-primary shadow-lg"
        />
      </div>
    </div>
  );
};

export default MobileFloatingNav;