"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center mb-4",
        caption_label: "text-lg font-headline font-bold italic text-[#2D241E]",
        nav: "space-x-2 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white border-2 border-[#2D241E]/5 p-0 opacity-100 hover:bg-[#ff6b7b]/10 hover:text-[#ff6b7b] absolute left-1 rounded-xl transition-all"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white border-2 border-[#2D241E]/5 p-0 opacity-100 hover:bg-[#ff6b7b]/10 hover:text-[#ff6b7b] absolute right-1 rounded-xl transition-all"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-2",
        weekday:
          "text-[#2D241E]/30 w-10 font-black text-[10px] uppercase tracking-widest",
        week: "flex w-full mt-2",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-bold text-sm text-[#2D241E] rounded-xl hover:bg-[#ff6b7b]/10 hover:text-[#ff6b7b] transition-all aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected:
          "bg-[#ff6b7b] text-white hover:bg-[#fa8292] hover:text-white focus:bg-[#ff6b7b] focus:text-white shadow-lg shadow-[#ff6b7b]/30 scale-110 z-10",
        today: "bg-[#2D241E]/5 text-[#ff6b7b] font-black rounded-xl",
        outside:
          "day-outside text-[#2D241E]/10 opacity-50 aria-selected:bg-[#ff6b7b]/50 aria-selected:text-white aria-selected:opacity-30",
        disabled: "text-[#2D241E]/10 opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
