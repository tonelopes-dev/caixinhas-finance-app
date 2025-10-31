
"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Paintbrush, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { name: "Padrão", background: "60 56% 91%", primary: "45 65% 52%" }, // Original Gold
  { name: "Oceano", background: "210 40% 91%", primary: "220 80% 55%" }, // Blue
  { name: "Amanhecer", background: "30 60% 91%", primary: "25 95% 55%" }, // Orange
  { name: "Floresta", background: "120 20% 91%", primary: "130 50% 45%" }, // Green
  { name: "Lavanda", background: "260 50% 92%", primary: "250 60% 60%" }, // Purple
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("Padrão");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("app-theme") || "Padrão";
    const theme = themes.find(t => t.name === storedTheme) || themes[0];
    applyTheme(theme);
    setCurrentTheme(theme.name);
  }, []);

  const applyTheme = (theme: typeof themes[0]) => {
    const root = document.documentElement;
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--primary", theme.primary);
  };

  const handleThemeChange = (themeName: string) => {
    const theme = themes.find((t) => t.name === themeName);
    if (theme) {
      applyTheme(theme);
      localStorage.setItem("app-theme", themeName);
      setCurrentTheme(theme.name);
    }
  };
  
  if (!mounted) {
    return null; 
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Paintbrush className="mr-2 h-4 w-4" />
        <span>Tema</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.name}
              onClick={() => handleThemeChange(theme.name)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full border"
                  style={{
                    backgroundColor: `hsl(${theme.primary})`,
                  }}
                />
                <span>{theme.name}</span>
              </div>
              {currentTheme === theme.name && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
