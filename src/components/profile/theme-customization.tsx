'use client';

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paintbrush, Check, RotateCcw } from "lucide-react";
import { backgroundThemes, primaryThemes, applyTheme, saveThemeAndNotify } from "@/lib/theme-config";
import { useToast } from "@/hooks/use-toast";

export function ThemeCustomization() {
  const { toast } = useToast();
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
    const hasThemeChanges = currentBackground !== originalBackground || currentPrimary !== originalPrimary;
    console.log('Theme changes detected:', {
      currentBackground,
      originalBackground,
      currentPrimary,
      originalPrimary,
      hasThemeChanges
    });
    setHasChanges(hasThemeChanges);
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
    
    // Salva as alterações e notifica outros componentes
    const bgSaved = saveThemeAndNotify('background', currentBackground, userId);
    const primarySaved = saveThemeAndNotify('primary', currentPrimary, userId);
    
    if (bgSaved && primarySaved) {
      // Atualiza os valores originais
      setOriginalBackground(currentBackground);
      setOriginalPrimary(currentPrimary);
      setHasChanges(false);
      
      toast({
        title: "Personalização Aplicada",
        description: "Suas novas cores foram salvas com sucesso.",
        variant: "default",
      });
      
      console.log('Tema salvo e notificado com sucesso!');
    }
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

    setHasChanges(false);

    toast({
      title: "Alterações Descartadas",
      description: "Voltamos para as cores anteriores.",
      variant: "default",
    });
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
    <div className="relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500">
      <div className="p-8 md:p-10 space-y-2 border-b border-[#2D241E]/5 bg-white/30">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-[#ff6b7b]/10 p-3 shadow-inner">
            <Paintbrush className="h-6 w-6 text-[#ff6b7b]" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-[#2D241E] italic">Visual & <span className="text-[#ff6b7b]">Cores</span></h2>
            <p className="text-xs font-medium text-[#2D241E]/40 italic">Customize a aparência do aplicativo com suas cores favoritas.</p>
          </div>
        </div>
      </div>
      <div className="p-8 md:p-10 space-y-10">
        {/* Cor de Fundo */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">Cor de Fundo</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {backgroundThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemePreview('background', theme.name)}
                className={`
                  relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300
                  ${currentBackground === theme.name 
                    ? 'border-[#ff6b7b] bg-white shadow-lg shadow-[#ff6b7b]/10 scale-[1.02]' 
                    : 'border-[#2D241E]/5 bg-white/40 hover:border-[#ff6b7b]/20 hover:scale-[1.01]'
                  }
                `}
              >
                <div
                  className="h-10 w-10 rounded-full border-4 border-white shadow-md ring-1 ring-black/5"
                  style={{
                    backgroundColor: `hsl(${theme.color})`
                  }}
                />
                <span className={`text-[10px] font-black uppercase tracking-widest ${currentBackground === theme.name ? 'text-[#ff6b7b]' : 'text-[#2D241E]/50'}`}>
                  {theme.name}
                </span>
                {currentBackground === theme.name && (
                  <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#ff6b7b] flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white stroke-[4]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cor de Destaque */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">Cor de Destaque</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {primaryThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleThemePreview('primary', theme.name)}
                className={`
                  relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300
                  ${currentPrimary === theme.name 
                    ? 'border-[#ff6b7b] bg-white shadow-lg shadow-[#ff6b7b]/10 scale-[1.02]' 
                    : 'border-[#2D241E]/5 bg-white/40 hover:border-[#ff6b7b]/20 hover:scale-[1.01]'
                  }
                `}
              >
                <div
                  className="h-10 w-10 rounded-full border-4 border-white shadow-md ring-1 ring-black/5"
                  style={{
                    backgroundColor: `hsl(${theme.color})`
                  }}
                />
                <span className={`text-[10px] font-black uppercase tracking-widest ${currentPrimary === theme.name ? 'text-[#ff6b7b]' : 'text-[#2D241E]/50'}`}>
                  {theme.name}
                </span>
                {currentPrimary === theme.name && (
                  <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#ff6b7b] flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white stroke-[4]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Botão de Reset para Padrão */}
        {(currentBackground !== 'Padrão' || currentPrimary !== 'Padrão') && (
          <div className="pt-8 border-t border-[#2D241E]/5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefault}
              className="flex items-center gap-2 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[8px] border-[#2D241E]/10 text-[#2D241E]/60 hover:bg-[#ff6b7b]/5 hover:text-[#ff6b7b] hover:border-[#ff6b7b]/20 transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar Padrão
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-8 md:p-10 border-t border-[#2D241E]/5 flex justify-end bg-white/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-gradient-to-br from-[#ff6b7b] to-[#fa8292] text-white shadow-xl shadow-[#ff6b7b]/20 border-none hover:shadow-2xl hover:shadow-[#ff6b7b]/30 transition-all duration-300 active:scale-[0.98] ${!hasChanges ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            Salvar Alterações
          </Button>
          {hasChanges && (
            <Button 
              variant="outline" 
              onClick={handleDiscardChanges}
              className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-[#2D241E]/10 text-[#2D241E]/60 hover:bg-white hover:border-[#ff6b7b]/30 transition-all"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Descartar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}