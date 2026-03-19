import React from 'react';

interface DashboardBackgroundProps {
  children?: React.ReactNode;
}

export function DashboardBackground({ children }: DashboardBackgroundProps) {
  const backgroundElements = (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
      {/* Orbes de Brilho - Cores da Marca (Suaves) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#ff6b7b]/10 rounded-full blur-[100px] animation-delay-3000" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />

      {/* Camada sutil para escurecer levemente o fundo e aumentar o contraste dos textos */}
      <div className="absolute inset-0 bg-foreground/[0.03] pointer-events-none" />

      {/* Grid de Dashboard Dourado Sutil */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );

  if (!children) return backgroundElements;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {backgroundElements}
      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
