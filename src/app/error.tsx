'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Home, AlertTriangle, Wifi, Bug, ChevronDown } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Global Error Page:', {
      error: error.toString(),
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const handleHardRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleReportBug = () => {
    const subject = encodeURIComponent('Bug Report - Caixinhas App');
    const body = encodeURIComponent(`Erro: ${error.toString()}\nURL: ${window.location.href}`);
    window.open(`mailto:suporte@caixinhas.app?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(ellipse at top left, hsl(24,22%,90%) 0%, hsl(24,22%,95%) 60%)',
      }}
    >
      <div className="w-full max-w-sm">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-30"
              style={{ background: 'hsl(0,84%,60%)', transform: 'scale(1.4)' }}
            />
            <div
              className="relative h-20 w-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(0,84%,65%) 0%, hsl(0,84%,50%) 100%)',
                boxShadow: '0 8px 32px hsla(0,84%,60%,0.35)',
              }}
            >
              <AlertTriangle className="h-9 w-9 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-alegreya, serif)', color: 'hsl(26,29%,18%)' }}
          >
            Algo deu errado
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(26,29%,42%)' }}>
            Não se preocupe — isso acontece às vezes.
            <br />
            Tente uma das opções abaixo.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Primary */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, hsl(43,74%,52%) 0%, hsl(43,74%,42%) 100%)',
              color: 'hsl(43,74%,5%)',
              boxShadow: '0 4px 20px hsla(43,74%,49%,0.35)',
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>

          {/* Secondary */}
          <button
            onClick={handleHardRefresh}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-semibold border transition-all duration-200 active:scale-[0.98]"
            style={{
              background: 'hsl(60,50%,97%)',
              border: '1.5px solid hsl(60,30%,82%)',
              color: 'hsl(26,29%,25%)',
            }}
          >
            <Wifi className="h-4 w-4" style={{ color: 'hsl(26,29%,42%)' }} />
            Limpar Cache e Recarregar
          </button>

          {/* Tertiary row */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium border transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'hsl(60,50%,97%)',
                border: '1.5px solid hsl(60,30%,82%)',
                color: 'hsl(26,29%,30%)',
              }}
            >
              <Home className="h-4 w-4" style={{ color: 'hsl(26,29%,45%)' }} />
              Início
            </button>
            <button
              onClick={handleReportBug}
              className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium border transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'hsl(60,50%,97%)',
                border: '1.5px solid hsl(60,30%,82%)',
                color: 'hsl(26,29%,30%)',
              }}
            >
              <Bug className="h-4 w-4" style={{ color: 'hsl(26,29%,45%)' }} />
              Reportar
            </button>
          </div>
        </div>

        {/* Error ID */}
        {error.digest && (
          <p className="text-center text-xs mt-5" style={{ color: 'hsl(26,29%,55%)' }}>
            Código:{' '}
            <code
              className="rounded-md px-1.5 py-0.5"
              style={{ background: 'hsl(60,30%,90%)', color: 'hsl(26,29%,35%)' }}
            >
              {error.digest}
            </code>
          </p>
        )}

        {/* Dev details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-5">
            <button
              onClick={() => setShowDetails(v => !v)}
              className="w-full flex items-center justify-center gap-1.5 text-xs transition-colors"
              style={{ color: 'hsl(26,29%,55%)' }}
            >
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform duration-200"
                style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
              Detalhes técnicos
            </button>
            {showDetails && (
              <pre
                className="mt-3 whitespace-pre-wrap break-words rounded-xl p-3 text-xs overflow-auto max-h-36 border"
                style={{
                  background: 'hsl(60,30%,92%)',
                  border: '1px solid hsl(60,30%,82%)',
                  color: 'hsl(26,29%,30%)',
                }}
              >
                {error.toString()}
                {'\n\n'}
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}