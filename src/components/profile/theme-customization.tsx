'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paintbrush, Check, RotateCcw } from "lucide-react";
import { backgroundThemes, primaryThemes, applyTheme, saveThemeAndNotify } from "@/lib/theme-config";

export function ThemeCustomization() {
  const [currentBackground, setCurrentBackground] = useState("Padrão");
  const [currentPrimary, setCurrentPrimary] = useState("Padrão");
  const [originalBackground, setOriginalBackground] = useState("Padrão");
  const [originalPrimary, setOriginalPrimary] = useState("Padrão");
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Primeiro tenta pegar do localStorage, se não tiver, usa um ID temporário
    let id = localStorage.getItem("CAIXINHAS_USER_ID");
    if (!id) {
      // Se não tiver no localStorage, cria um ID temporário baseado no sessionStorage ou timestamp
      id = sessionStorage.getItem("temp_user_id") || `temp_${Date.now()}`;
      sessionStorage.setItem("temp_user_id", id);
    }
    setUserId(id);
    
    const storedBg = localStorage.getItem(`app-theme-background-${id}`) || "Padrão";
    const storedPrimary = localStorage.getItem(`app-theme-primary-${id}`) || "Padrão";
    setCurrentBackground(storedBg);
    setCurrentPrimary(storedPrimary);
    setOriginalBackground(storedBg);
    setOriginalPrimary(storedPrimary);
    
    // Aplica os temas salvos automaticamente quando a página carrega
    const bgTheme = backgroundThemes.find(t => t.name === storedBg);
    const primaryTheme = primaryThemes.find(t => t.name === storedPrimary);
    
    if (bgTheme) {
      applyTheme('background', bgTheme.color);
    }
    if (primaryTheme) {
      applyTheme('primary', primaryTheme.color);
    }
  }, []);

  // Detecta mudanças nos temas
  useEffect(() => {
    setHasChanges(
      currentBackground !== originalBackground || 
      currentPrimary !== originalPrimary
    );
  }, [currentBackground, currentPrimary, originalBackground, originalPrimary]);

  const handleThemePreview = (type: 'background' | 'primary', themeName: string) => {
    if (!userId) return;
    
    // Apenas aplica a visualização, não salva ainda
    const themes = type === 'background' ? backgroundThemes : primaryThemes;
    const theme = themes.find(t => t.name === themeName);
    
    if (theme) {
      applyTheme(type, theme.color);
    }
    
    if (type === 'background') {
      setCurrentBackground(themeName);
    } else {
      setCurrentPrimary(themeName);
    }
  };

  const handleSaveChanges = () => {
    if (!userId) return;
    
    // Salva as alterações no localStorage
    localStorage.setItem(`app-theme-background-${userId}`, currentBackground);
    localStorage.setItem(`app-theme-primary-${userId}`, currentPrimary);
    
    // Atualiza os valores originais
    setOriginalBackground(currentBackground);
    setOriginalPrimary(currentPrimary);
    
    // Mostra notificação (você pode adicionar uma toast notification aqui)
    console.log('Tema salvo com sucesso!');
  };

  const handleDiscardChanges = () => {
    // Restaura os valores originais
    setCurrentBackground(originalBackground);
    setCurrentPrimary(originalPrimary);
    
    // Reaplica os temas originais
    const bgTheme = backgroundThemes.find(t => t.name === originalBackground);
    const primaryTheme = primaryThemes.find(t => t.name === originalPrimary);
    
    if (bgTheme) {
      applyTheme('background', bgTheme.color);
    }
    if (primaryTheme) {
      applyTheme('primary', primaryTheme.color);
    }
  };

  const resetToDefault = () => {
    if (!userId) return;
    handleThemePreview('background', 'Padrão');
    handleThemePreview('primary', 'Padrão');
  };

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Personalização do Tema
          </CardTitle>
          <CardDescription>
            Carregando...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Personalização do Tema
        </CardTitle>
        <CardDescription>
          Customize a aparência do aplicativo com suas cores favoritas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cor de Fundo */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Cor de Fundo</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {backgroundThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemePreview('background', theme.name)}
                className={`
                  relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all
                  ${currentBackground === theme.name 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div
                  className="h-8 w-8 rounded-full border-2 border-gray-300"
                  style={{
                    backgroundColor: `hsl(${theme.color})`
                  }}
                />
                <span className="text-xs font-medium">{theme.name}</span>
                {currentBackground === theme.name && (
                  <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cor de Destaque */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Cor de Destaque</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {primaryThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemePreview('primary', theme.name)}
                className={`
                  relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all
                  ${currentPrimary === theme.name 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div
                  className="h-8 w-8 rounded-full border-2 border-gray-300"
                  style={{
                    backgroundColor: `hsl(${theme.color})`
                  }}
                />
                <span className="text-xs font-medium">{theme.name}</span>
                {currentPrimary === theme.name && (
                  <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="pt-4 border-t space-y-3">
          {/* Botões de Salvar e Descartar */}
          {hasChanges && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleSaveChanges}
                className="flex items-center gap-2 flex-1"
              >
                <Check className="h-4 w-4" />
                Salvar Alterações
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDiscardChanges}
                className="flex items-center gap-2 flex-1"
              >
                <RotateCcw className="h-4 w-4" />
                Descartar
              </Button>
            </div>
          )}
          
          {/* Botão de Reset para Padrão */}
          {(currentBackground !== 'Padrão' || currentPrimary !== 'Padrão') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefault}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Padrão
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}