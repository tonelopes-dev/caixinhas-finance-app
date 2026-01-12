"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { useIOSDetection } from "@/hooks/use-ios-detection"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const { needsIOSFixes } = useIOSDetection();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-[10000] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "touch-action-manipulation", // Melhor suporte touch no iOS
          needsIOSFixes && "!fixed !z-[999999]", // Força position fixed e z-index alto no iOS
          className
        )}
        onPointerDownOutside={(event) => {
          // Previne fechamento acidental no iOS
          const target = event.target as HTMLElement;
          if (target.closest('[data-radix-dialog-content]')) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => {
          // Previne fechamento quando foco sai no iOS
          if (needsIOSFixes) {
            const target = event.target as HTMLElement;
            if (target.closest('[data-radix-dialog-content]')) {
              event.preventDefault();
            }
          }
        }}
        style={needsIOSFixes ? { 
          transform: 'translateZ(0)', // Force hardware acceleration
          WebkitTransform: 'translateZ(0)',
          isolation: 'isolate'
        } : undefined}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
