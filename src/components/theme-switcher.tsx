
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
import { backgroundThemes, primaryThemes, saveThemeAndNotify } from "@/lib/theme-config";

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



  const handleThemeChange = (type: 'background' | 'primary', themeName: string) => {
    if (!userId) return; // Não faz nada se não houver usuário
    
    if (saveThemeAndNotify(type, themeName, userId)) {
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
