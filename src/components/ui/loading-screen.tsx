'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { Heart, Sparkles, Star } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingScreen({ 
  message = "Carregando sua jornada financeira...", 
  showProgress = true,
  progress: externalProgress 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(externalProgress || 0);
  const [currentMessage, setCurrentMessage] = useState(message);
  
  const loadingMessages = [
    "Organizando seus sonhos...",
    "Preparando suas caixinhas...",
    "Calculando suas conquistas...",
    "Sincronizando seus objetivos...",
    "Carregando momentos especiais...",
    "Construindo seu futuro..."
  ];

  // Sincronizar com progresso externo se fornecido
  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
    }
  }, [externalProgress]);

  // Animação de progresso suave (apenas se não tiver progresso externo)
  useEffect(() => {
    if (externalProgress !== undefined) return; // Não usar auto-progresso se controlado externamente
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [externalProgress]);

  // Rotação de mensagens
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Backdrop escuro para dar destaque */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Container do loading com fundo gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Partículas de fundo animadas */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          >
            {i % 3 === 0 && <Heart className="w-4 h-4 text-primary/40 animate-pulse" />}
            {i % 3 === 1 && <Sparkles className="w-3 h-3 text-accent/40 animate-spin-slow" />}
            {i % 3 === 2 && <Star className="w-3 h-3 text-primary/30 animate-bounce-slow" />}
          </div>
        ))}
      </div>

      {/* Círculos de fundo com gradientes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full animate-pulse-slow blur-xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-accent/20 to-transparent rounded-full animate-ping-slow blur-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-full animate-spin-very-slow blur-2xl" />
      </div>

      {/* Conteúdo principal */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-8 px-8">
        {/* Logo com animações especiais */}
        <div className="relative">
          {/* Círculo de luz atrás da logo */}
          <div className="absolute inset-0 scale-150 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 rounded-full animate-pulse-glow blur-xl" />
          
          {/* Anéis rotativos */}
          <div className="absolute inset-0 scale-125">
            <div className="w-full h-full border-4 border-primary/20 rounded-full animate-spin-slow" />
          </div>
          <div className="absolute inset-2 scale-110">
            <div className="w-full h-full border-2 border-accent/20 rounded-full animate-spin-reverse" />
          </div>
          
          {/* Logo principal */}
          <div className="relative p-8 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-full shadow-2xl border border-primary/20">
            <Logo 
              className="w-24 h-24 md:w-32 md:h-32 animate-float-logo drop-shadow-lg" 
              w={128} 
              h={128}
            />
          </div>
          
          {/* Brilho especial */}
          <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-white to-primary/50 rounded-full animate-twinkle blur-sm" />
        </div>

        {/* Título animado */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-text">
            Caixinhas
          </h1>
          <div className="h-8 flex items-center justify-center">
            <p className="text-lg md:text-xl text-foreground/80 animate-fade-in-up font-medium px-4">
              {currentMessage}
            </p>
          </div>
        </div>

        {/* Barra de progresso linda */}
        {showProgress && (
          <div className="w-full max-w-md space-y-4">
            <div className="relative h-3 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-full overflow-hidden shadow-inner">
              {/* Barra de progresso com gradiente */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
              
              {/* Brilho que se move */}
              <div 
                className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                style={{ transform: `translateX(${(progress / 100) * 300}%)` }}
              />
            </div>
            
            {/* Porcentagem */}
            <div className="text-center">
              <span className="text-sm font-semibold text-white/90 animate-pulse">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}

        {/* Dots animados */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-br from-primary to-accent rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Mensagem motivacional */}
        <div className="text-center space-y-2 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <p className="text-sm text-white/80 italic">
            ✨ Transformando sonhos em realidade ✨
          </p>
        </div>
      </div>

      {/* Efeito de ondas no fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-primary/10 to-transparent animate-wave" />
        <div className="absolute bottom-2 left-0 w-full h-12 bg-gradient-to-t from-accent/10 to-transparent animate-wave-reverse" />
      </div>
      </div>
    </div>
  );
}

// Componente para loading inline (botões, etc)
export function InlineLoading({ size = 'sm', message }: { size?: 'sm' | 'md' | 'lg', message?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-primary/30 border-t-primary rounded-full animate-spin`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} border border-accent/30 rounded-full animate-ping`} />
      </div>
      {message && (
        <span className="text-sm text-foreground/70 animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
}