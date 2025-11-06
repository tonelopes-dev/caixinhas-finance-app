
"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Paintbrush, Check } from "lucide-react";

const backgroundThemes = [
  { name: "Padrão", color: "60 56% 91%" }, // Original beige
  { name: "Oceano", color: "210 40% 96%" }, // Light Blue
  { name: "Verde", color: "140 40% 96%" }, // Light Green
  { name: "Névoa", color: "260 50% 96%" }, // Light Purple
  { name: "Pêssego", color: "30 60% 96%" }, // Light Orange
];

const primaryThemes = [
  { name: "Padrão", color: "45 65% 52%" }, // Gold
  { name: "Oceano", color: "220 80% 55%" }, // Blue
  { name: "Amanhecer", color: "25 95% 55%" }, // Orange
  { name: "Floresta", color: "130 50% 45%" }, // Green
  { name: "Lavanda", color: "250 60% 60%" }, // Purple
];

export function ThemeSwitcher() {
  const [currentBackground, setCurrentBackground] = useState("Padrão");
  const [currentPrimary, setCurrentPrimary] = useState("Padrão");
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = localStorage.getItem("CAIXINHAS_USER_ID");
    setUserId(id);
    if (id) {
      const storedBg = localStorage.getItem(`app-theme-background-${id}`) || "Padrão";
      const storedPrimary = localStorage.getItem(`app-theme-primary-${id}`) || "Padrão";
      setCurrentBackground(storedBg);
      setCurrentPrimary(storedPrimary);
    }
  }, []);

  const applyTheme = (type: 'background' | 'primary', color: string) => {
    document.documentElement.style.setProperty(`--${type}`, color);
  };

  const handleThemeChange = (type: 'background' | 'primary', themeName: string) => {
    if (!userId) return; // Não faz nada se não houver usuário
    const themeList = type === 'background' ? backgroundThemes : primaryThemes;
    const theme = themeList.find((t) => t.name === themeName);
    if (theme) {
      applyTheme(type, theme.color);
      const themeKey = `app-theme-${type}-${userId}`;
      localStorage.setItem(themeKey, themeName);
      if (type === 'background') {
        setCurrentBackground(themeName);
      } else {
        setCurrentPrimary(themeName);
      }
    }
  };
  
  if (!mounted || !userId) {
    return null; // Não renderiza o componente se não estiver montado ou não houver usuário
  }
  
  const preventClose = (e: Event) => e.preventDefault();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Paintbrush className="mr-2 h-4 w-4" />
        <span>Tema</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
            <DropdownMenuLabel>Cor de Fundo</DropdownMenuLabel>
            {backgroundThemes.map((theme) => (
                <DropdownMenuItem
                key={theme.name}
                onClick={() => handleThemeChange('background', theme.name)}
                onSelect={preventClose}
                className="flex items-center justify-between"
                >
                <div className="flex items-center gap-2">
                    <div
                    className="h-4 w-4 rounded-full border-2"
                    style={{
                        borderColor: `hsl(${theme.color})`,
                        backgroundColor: `hsl(${theme.color})`
                    }}
                    />
                    <span>{theme.name}</span>
                </div>
                {currentBackground === theme.name && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
             <DropdownMenuLabel>Cor de Destaque</DropdownMenuLabel>
            {primaryThemes.map((theme) => (
                <DropdownMenuItem
                key={theme.name}
                onClick={() => handleThemeChange('primary', theme.name)}
                onSelect={preventClose}
                className="flex items-center justify-between"
                >
                <div className="flex items-center gap-2">
                    <div
                    className="h-4 w-4 rounded-full border"
                    style={{
                        backgroundColor: `hsl(${theme.color})`,
                    }}
                    />
                    <span>{theme.name}</span>
                </div>
                {currentPrimary === theme.name && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
            ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
