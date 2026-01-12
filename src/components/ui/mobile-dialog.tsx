"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  mobileOptimized?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, mobileOptimized = true, ...props }, ref) => {
  const { isVirtualKeyboardOpen, viewportHeight } = useVirtualKeyboard();
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll para campo focado quando teclado virtual abrir
  React.useEffect(() => {
    if (!mobileOptimized || typeof window === 'undefined') return;

    const handleFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      
      const targetElement = event.target;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetElement.tagName);
      if (!isInput) return;

      // Aguardar a animação do teclado e o reposicionamento do modal
      setTimeout(() => {
        // Scroll suave para o elemento focado
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest', // Mudança para 'nearest' em vez de 'center'
          inline: 'nearest'
        });
        
        // Scroll adicional para garantir visibilidade no viewport
        const rect = targetElement.getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        
        if (rect.bottom > viewportHeight * 0.7) {
          window.scrollBy({
            top: rect.bottom - (viewportHeight * 0.6),
            behavior: 'smooth'
          });
        }
      }, 400); // Aumentado para 400ms para dar tempo do modal se reposicionar
    };

    const handleFocusOut = () => {
      // Pequeno delay para verificar se ainda há campo focado
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isStillFocused = activeElement && 
          activeElement instanceof HTMLElement &&
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
          
        if (!isStillFocused) {
          // Volta o scroll para o topo do modal se não há mais campos focados
          const modalContent = document.querySelector('[data-radix-dialog-content]');
          if (modalContent) {
            modalContent.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 100);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleFocusOut);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [mobileOptimized]);

  const mobileStyles = mobileOptimized && isVirtualKeyboardOpen ? {
    transform: 'translateX(-50%) translateY(0)',
    top: '10px',
    bottom: 'auto',
    maxHeight: `${viewportHeight * 0.95}px`,
    position: 'fixed' as const,
  } : {};

  return (
    <DialogPortal>
      <DialogOverlay data-keyboard-open={mobileOptimized && isVirtualKeyboardOpen} />
      <DialogPrimitive.Content
        ref={ref}
        data-keyboard-open={mobileOptimized && isVirtualKeyboardOpen}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          mobileOptimized && [
            "max-h-[90vh] overflow-hidden",
            "md:max-h-none md:overflow-visible",
            // Classes específicas para quando teclado virtual está ativo
            isVirtualKeyboardOpen && [
              "!top-[10px] !translate-y-0 !max-h-[95vh]", 
              "transition-all duration-300 ease-in-out",
              // Garante que modal fique acima do teclado
              "!z-[9999]"
            ]
          ],
          className
        )}
        style={mobileStyles}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}