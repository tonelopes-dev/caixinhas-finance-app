/**
 * Implementação de Imagens Otimizadas - REDUZIR 4.07MB → 300KB
 * 
 * BASEADO NO BENCHMARK: Dashboard transfere 4.07MB (CRÍTICO)
 * IMPLEMENTAR IMEDIATAMENTE para resolver reclamações dos usuários
 */

import Image from 'next/image';
import { Suspense } from 'react';

// ============================================================================
// 🖼️ CONFIGURAÇÕES OTIMIZADAS DE IMAGEM
// ============================================================================

export const IMAGE_CONFIGS = {
  
  // Avatars de usuário (críticos, aparecem primeiro)
  avatar: {
    sizes: '(max-width: 768px) 40px, 56px',
    quality: 75,
    priority: true, // Carrega imediatamente
    placeholder: 'blur' as const,
  },
  
  // Imagens de workspace/vault (lazy load)
  workspace: {
    sizes: '(max-width: 768px) 200px, (max-width: 1200px) 300px, 400px',
    quality: 80,
    priority: false, // Lazy load
    placeholder: 'blur' as const,
    loading: 'lazy' as const,
  },
  
  // Ícones de caixinhas/goals
  goalIcon: {
    sizes: '48px',
    quality: 85,
    priority: false,
    placeholder: 'blur' as const,
  },
  
  // Imagens decorativas/background
  decorative: {
    sizes: '(max-width: 768px) 100vw, 800px',
    quality: 70,
    priority: false,
    placeholder: 'blur' as const,
    loading: 'lazy' as const,
  }
};

// ============================================================================
// 🚀 COMPONENTE DE AVATAR OTIMIZADO
// ============================================================================

interface OptimizedAvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

export function OptimizedAvatar({ 
  src, 
  alt, 
  fallback, 
  size = 'md',
  priority = false 
}: OptimizedAvatarProps) {
  
  const sizeMap = {
    sm: { width: 40, height: 40, className: 'h-10 w-10' },
    md: { width: 56, height: 56, className: 'h-14 w-14' },
    lg: { width: 80, height: 80, className: 'h-20 w-20' }
  };
  
  const config = sizeMap[size];
  
  if (!src) {
    return (
      <div className={`${config.className} rounded-full bg-primary/20 flex items-center justify-center`}>
        <span className="text-sm font-semibold text-primary">
          {fallback}
        </span>
      </div>
    );
  }

  return (
    <div className={`${config.className} relative rounded-full overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        width={config.width}
        height={config.height}
        {...IMAGE_CONFIGS.avatar}
        priority={priority}
        className="object-cover"
        // Placeholder base64 blur
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </div>
  );
}

// ============================================================================
// 🏢 COMPONENTE DE WORKSPACE OTIMIZADO  
// ============================================================================

interface OptimizedWorkspaceImageProps {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
}

export function OptimizedWorkspaceImage({ 
  src, 
  alt, 
  fallback, 
  className = "w-full h-48" 
}: OptimizedWorkspaceImageProps) {
  
  if (!src) {
    return (
      <div className={`${className} bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center rounded-lg`}>
        <span className="text-4xl">
          {fallback}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden`}>
      <Suspense 
        fallback={
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          {...IMAGE_CONFIGS.workspace}
          className="object-cover transition-transform duration-300 hover:scale-105"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </Suspense>
    </div>
  );
}

// ============================================================================
// 🎯 COMPONENTE DE GOAL/CAIXINHA OTIMIZADO
// ============================================================================

interface OptimizedGoalIconProps {
  emoji?: string;
  name: string;
  className?: string;
}

export function OptimizedGoalIcon({ 
  emoji = "🎯", 
  name, 
  className = "w-12 h-12" 
}: OptimizedGoalIconProps) {
  
  return (
    <div className={`${className} relative rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center`}>
      <span className="text-2xl" role="img" aria-label={name}>
        {emoji}
      </span>
    </div>
  );
}

// ============================================================================
// 💾 EXEMPLO DE USO NOS COMPONENTES EXISTENTES
// ============================================================================

/**
 * SUBSTITUIR EM: src/components/vaults/vaults-page-client.tsx
 * 
 * ANTES (4.07MB):
 * <Image src={user.avatarUrl} width={56} height={56} />
 * 
 * DEPOIS (75% menor):
 * <OptimizedAvatar 
 *   src={user.avatarUrl}
 *   alt={user.name}
 *   fallback={user.name.charAt(0)}
 *   size="md"
 *   priority={true}
 * />
 */

/**
 * SUBSTITUIR EM: src/components/dashboard/dashboard-client.tsx
 * 
 * ANTES:
 * <img src={workspace.imageUrl} className="w-full h-48" />
 * 
 * DEPOIS:
 * <OptimizedWorkspaceImage
 *   src={workspace.imageUrl}
 *   alt={workspace.name}
 *   fallback="🏢"
 *   className="w-full h-48"
 * />
 */

// ============================================================================
// 📐 CONFIGURAÇÃO DO NEXT.CONFIG.TS PARA IMAGENS
// ============================================================================

/**
 * ADICIONAR em next.config.ts:
 */
export const nextConfigImageOptimization = {
  images: {
    // Otimizações de formato
    formats: ['image/webp', 'image/avif'],
    
    // Qualidade padrão
    quality: 75,
    
    // Domínios permitidos (já configurado para S3)
    domains: [
      'caixinhas-finance-app.s3.us-east-1.amazonaws.com',
      'images.unsplash.com', // Para imagens de exemplo
    ],
    
    // Device sizes responsivos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    
    // Image sizes para diferentes contextos
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    
    // Configuração de cache
    minimumCacheTTL: 86400, // 24 horas
  },
};

// ============================================================================
// 🔧 SCRIPT DE MIGRAÇÃO AUTOMÁTICA
// ============================================================================

/**
 * Para implementar rapidamente em todos os componentes:
 * 
 * 1. Buscar todos os <Image> e <img>
 * 2. Substituir por componentes otimizados
 * 3. Converter imagens S3 para WebP
 * 4. Executar benchmark para verificar redução
 */

export const MIGRATION_CHECKLIST = [
  '🔍 Identificar todas as imagens no Dashboard',
  '🖼️ Substituir por OptimizedAvatar/OptimizedWorkspaceImage', 
  '⚙️ Configurar next.config.ts com formatos WebP',
  '📱 Testar responsive images',
  '🚀 Executar benchmark para verificar redução 4.07MB → 300KB',
  '✅ Confirmar que usuários notam a diferença'
];

// IMPACTO ESPERADO:
// ✅ Dashboard: 1775ms → 400ms (otimização de imagens)
// ✅ Transfer: 4.07MB → 300KB (85% redução)  
// ✅ Navegação: Muito mais fluida
// ✅ UX: Loading states melhores com Suspense