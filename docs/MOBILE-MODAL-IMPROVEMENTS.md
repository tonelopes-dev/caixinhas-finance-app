# Melhorias de Experiência Mobile - Modais e Teclado Virtual

## Problema Identificado

Em dispositivos móveis, quando um modal estava aberto e o usuário tentava digitar em campos de entrada, o teclado virtual aparecia por cima do modal, dificultando a experiência do usuário. Os campos de input ficavam ocultos ou inacessíveis.

## Solução Implementada

### 1. Hook `useVirtualKeyboard`

Criado o hook `src/hooks/use-virtual-keyboard.ts` que:

- **Detecta abertura do teclado virtual**: Usa a Visual Viewport API quando disponível ou fallback para window.resize
- **Calcula mudanças no viewport**: Monitora mudanças na altura da viewport para identificar quando o teclado está ativo
- **Threshold inteligente**: Ajusta o limite de detecção baseado no tamanho da tela (200px para tablets, 150px para smartphones)
- **Eventos de foco**: Monitora eventos focusin/focusout para melhor precisão
- **Compatibilidade**: Funciona apenas em dispositivos móveis/touch

### 2. Componente `mobile-dialog.tsx`

Criado `src/components/ui/mobile-dialog.tsx` que substitui o dialog padrão com:

- **Posicionamento dinâmico**: Quando teclado virtual está aberto, reposiciona o modal para melhor visibilidade
- **Altura responsiva**: Limita altura máxima baseada no viewport disponível
- **Scroll otimizado**: Implementa `overscroll-contain` para melhor performance
- **Auto-scroll para campos**: Automaticamente rola para campos focados quando teclado abre
- **Prop `mobileOptimized`**: Permite desabilitar otimizações quando necessário

### 3. Estilos CSS Globais

Adicionado ao `src/app/globals.css`:

- **Viewport units dinâmicos**: Usa `dvh` quando disponível para altura mais precisa
- **Detecção de landscape**: Ajustes específicos quando teclado está aberto em landscape
- **Safe areas**: Suporte para dispositivos com notch/ilha dinâmica
- **Scroll melhorado**: `-webkit-overflow-scrolling: touch` para iOS
- **Margin para foco**: `scroll-margin` para garantir visibilidade de campos focados

### 4. Modais Atualizados

Os seguintes modais foram migrados para usar a versão otimizada:

- ✅ `add-transaction-dialog.tsx` - Modal de adicionar transação
- ✅ `edit-transaction-dialog.tsx` - Modal de editar transação  
- ✅ `create-vault-dialog.tsx` - Modal de criar vault
- ✅ `edit-vault-dialog.tsx` - Modal de editar vault
- ✅ `goal-transaction-dialog.tsx` - Modal de transações de metas

## Como Usar

### Para novos modais:

```tsx
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/mobile-dialog"

export function MeuModal() {
  return (
    <Dialog>
      <DialogContent 
        className="max-h-[90vh] md:max-h-none" 
        mobileOptimized={true}
      >
        {/* Conteúdo do modal */}
      </DialogContent>
    </Dialog>
  )
}
```

### Para modals com formulários longos:

```tsx
<form className="flex flex-1 flex-col justify-between overflow-hidden min-h-0">
  <div className="flex-1 space-y-4 overflow-y-auto px-1 py-4 min-h-0 overscroll-contain">
    {/* Campos do formulário */}
  </div>
  <DialogFooter className="mt-auto pt-4 border-t">
    {/* Botões de ação */}
  </DialogFooter>
</form>
```

## Benefícios

1. **Melhor visibilidade**: Campos de input sempre visíveis mesmo com teclado virtual ativo
2. **Navegação intuitiva**: Auto-scroll para campos focados
3. **Performance otimizada**: Usa APIs nativas quando disponível
4. **Compatibilidade**: Funciona em todos os navegadores mobile modernos
5. **Responsivo**: Adapta-se a diferentes tamanhos de tela e orientações
6. **Acessibilidade**: Mantém funcionalidades de acessibilidade do Radix UI

## Notas Técnicas

- **Visual Viewport API**: Usado quando disponível para detecção precisa do teclado virtual
- **Threshold adaptativo**: Ajusta automaticamente baseado no dispositivo
- **Debounce natural**: Usa timeouts para evitar detecções falsas
- **Fallback robusto**: Funciona mesmo em navegadores mais antigos
- **Zero impacto desktop**: Otimizações aplicadas apenas em dispositivos móveis

## Modais Restantes

Para aplicar as melhorias nos modais restantes, simplesmente altere o import de:
```tsx
import { ... } from "@/components/ui/dialog"
```

Para:
```tsx
import { ... } from "@/components/ui/mobile-dialog"
```

E adicione as props `mobileOptimized={true}` no `DialogContent`.