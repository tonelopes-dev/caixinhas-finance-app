'use client';

import React from 'react';

export function DashboardBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#fdfcf7]">
      {/* Orbes de Brilho - Cores da Marca (Suaves) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#D4A15E]/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#ff6b7b]/10 rounded-full blur-[100px] animation-delay-3000" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#D4A15E]/5 rounded-full blur-[80px]" />

      {/* Grid de Dashboard Dourado Sutil */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D4A15E 1px, transparent 1px),
            linear-gradient(to bottom, #D4A15E 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
