'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NotFoundAnalytics {
  path: string;
  timestamp: Date;
  userAgent: string;
  referrer: string;
}

interface SuggestedRoute {
  path: string;
  label: string;
  description: string;
  confidence: number;
}

export function use404Analytics() {
  const pathname = usePathname();
  const [suggestions, setSuggestions] = useState<SuggestedRoute[]>([]);

  useEffect(() => {
    // Log da página 404 para analytics
    const analytics: NotFoundAnalytics = {
      path: pathname,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    };

    console.log('📊 404 Analytics:', analytics);

    // Aqui você poderia enviar para um serviço de analytics
    // sendToAnalytics(analytics);

    // Gerar sugestões baseadas na URL
    generateSuggestions(pathname);
  }, [pathname]);

  const generateSuggestions = (path: string) => {
    // @ts-expect-error - pendencia estrutural a ser revisada
    const segments = path.split('/').filter(Boolean);
    const suggestions: SuggestedRoute[] = [];

    // Análise inteligente da URL para sugestões
    if (path.includes('goal')) {
      suggestions.push({
        path: '/goals',
        label: 'Todas as Caixinhas',
        description: 'Ver todas suas caixinhas',
        confidence: 0.9,
      });
      suggestions.push({
        path: '/goals/new',
        label: 'Nova Caixinha',
        description: 'Criar uma nova caixinha',
        confidence: 0.8,
      });
    }

    if (path.includes('transaction')) {
      suggestions.push({
        path: '/transactions',
        label: 'Transações',
        description: 'Ver todas as transações',
        confidence: 0.9,
      });
    }

    if (path.includes('report')) {
      suggestions.push({
        path: '/reports',
        label: 'Relatórios',
        description: 'Acessar relatórios',
        confidence: 0.9,
      });
    }

    if (path.includes('vault') || path.includes('workspace')) {
      suggestions.push({
        path: '/vaults',
        label: 'Workspaces',
        description: 'Selecionar workspace',
        confidence: 0.9,
      });
    }

    // Sugestões padrão se não houver correspondências específicas
    if (suggestions.length === 0) {
      suggestions.push(
        {
          path: '/dashboard',
          label: 'Painel Principal',
          description: 'Voltar ao painel',
          confidence: 0.7,
        },
        {
          path: '/goals',
          label: 'Caixinhas',
          description: 'Ver suas caixinhas',
          confidence: 0.6,
        }
      );
    }

    // Sempre adicionar o dashboard se não estiver presente
    if (!suggestions.some(s => s.path === '/dashboard')) {
      suggestions.push({
        path: '/dashboard',
        label: 'Painel Principal',
        description: 'Voltar ao início',
        confidence: 0.5,
      });
    }

    // Ordenar por confiança
    suggestions.sort((a, b) => b.confidence - a.confidence);

    setSuggestions(suggestions.slice(0, 4)); // Máximo 4 sugestões
  };

  return { suggestions };
}

// Hook para detectar padrões de 404 comuns
export function useCommon404Patterns() {
  const pathname = usePathname();
  const [pattern, setPattern] = useState<string | null>(null);

  useEffect(() => {
    // Detectar padrões comuns de erro 404
    const detectedPattern = detectPattern(pathname);
    setPattern(detectedPattern);
  }, [pathname]);

  const detectPattern = (path: string): string | null => {
    // Padrões comuns de URLs incorretas
    if (path.includes('admin') || path.includes('wp-admin')) {
      return 'wordpress-attempt';
    }
    
    if (path.includes('.php') || path.includes('.asp')) {
      return 'wrong-tech-stack';
    }
    
    if (path.match(/\/\d+$/) && path.length > 20) {
      return 'long-id-pattern';
    }
    
    if (path.includes('favicon') || path.includes('robots.txt')) {
      return 'crawler-request';
    }

    if (path.split('/').length > 6) {
      return 'deep-nested-url';
    }

    return null;
  };

  const getPatternMessage = (pattern: string): string => {
    const messages = {
      'wordpress-attempt': 'Parece que você está procurando por um painel WordPress. Este é um app Next.js!',
      'wrong-tech-stack': 'Esta URL parece ser de uma tecnologia diferente (PHP/ASP). Você está no lugar certo!',
      'long-id-pattern': 'Este ID parece muito longo ou mal formatado.',
      'crawler-request': 'Requisição de bot/crawler detectada.',
      'deep-nested-url': 'Esta URL é muito profunda. Pode ter sido mal construída.',
    };
    
    return messages[pattern as keyof typeof messages] || '';
  };

  return {
    pattern,
    message: pattern ? getPatternMessage(pattern) : null,
  };
}