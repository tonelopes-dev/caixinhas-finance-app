
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
  { name: "Padrão", background: "60 56% 91%", secondary: "60 30% 88%" },
  { name: "Oceano", background: "210 40% 91%", secondary: "210 30% 88%" },
  { name: "Amanhecer", background: "30 60% 91%", secondary: "30 40% 88%" },
  { name: "Floresta", background: "120 20% 91%", secondary: "120 15% 88%" },
  { name: "Lavanda", background: "260 50% 92%", secondary: "260 35% 89%" },
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
    root.style.setProperty("--secondary", theme.secondary);
  };

  const handleThemeChange = (themeName: string) => {
    const theme = themes.find((t) => t.name === themeName);
    if (theme) {
      applyTheme(theme);
      localStorage.setItem("app-theme", themeName);
      setCurrentTheme(themeName);
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
                    background: `radial-gradient(circle at top left, hsl(${theme.secondary}), hsl(${theme.background}) 50%)`,
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
