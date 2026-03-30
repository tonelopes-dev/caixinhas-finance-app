'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Brain, CheckCircle, Clock, FileText, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReportLoadingProps {
  isVisible: boolean;
}

const loadingSteps = [
  { 
    id: 1, 
    label: 'Coletando transações...', 
    icon: FileText,
    description: 'Analisando suas movimentações financeiras'
  },
  { 
    id: 2, 
    label: 'Processando dados...', 
    icon: Brain,
    description: 'Organizando informações para análise'
  },
  { 
    id: 3, 
    label: 'Gerando insights...', 
    icon: Sparkles,
    description: 'Criando análise personalizada com IA'
  },
  { 
    id: 4, 
    label: 'Finalizando relatório...', 
    icon: CheckCircle,
    description: 'Preparando visualização final'
  }
];

export function ReportLoadingProgress({ isVisible }: ReportLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15 + 5; // Incremento entre 5-20%
        
        // Atualiza o step baseado no progresso
        if (newProgress < 25) setCurrentStep(0);
        else if (newProgress < 50) setCurrentStep(1);
        else if (newProgress < 75) setCurrentStep(2);
        else setCurrentStep(3);
        
        // Para no máximo 95% para evitar completar antes do relatório real
        return Math.min(newProgress, 95);
      });
    }, 800 + Math.random() * 400); // Intervalo variável entre 800-1200ms

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStepData = loadingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Card className="w-full border-none bg-white/20 backdrop-blur-xl rounded-[40px] shadow-none">
      <CardContent className="p-8 sm:p-12">
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <h3 className="font-headline text-2xl sm:text-3xl font-black text-[#2D241E] italic uppercase tracking-tight">
              Gerando seu <span className="text-[#ff6b7b]">Relatório Financeiro</span>
            </h3>
            <p className="text-[11px] font-black text-[#2D241E]/40 uppercase tracking-[0.25em]">
              Sua estratégia personalizada está sendo preparada
            </p>
          </div>

          {/* Barra de progresso principal */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2D241E]/40">Etapa de Progressão</span>
              <span className="text-sm font-black text-[#ff6b7b] italic">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 w-full bg-[#2D241E]/5 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-[#ff6b7b] to-[#fa8292] rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(255,107,123,0.3)]" 
                 style={{ width: `${progress}%` }} 
               />
            </div>
          </div>

          {/* Step atual */}
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
            <div className="mt-1">
              <IconComponent className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">{currentStepData.label}</p>
              <p className="text-xs text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>

          {/* Lista de steps */}
          <div className="space-y-2">
            {loadingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 text-sm ${
                    isCompleted ? 'text-primary' : 
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-4 h-4 flex items-center justify-center ${
                    isCompleted ? 'text-primary' : isCurrent ? 'animate-pulse' : ''
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <StepIcon className={`h-4 w-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  <span className={isCompleted ? 'line-through' : ''}>{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-[28px] bg-white/60 border border-white/80 shadow-sm flex items-start gap-5">
            <div className="h-10 w-10 rounded-xl bg-[#ff6b7b]/10 flex items-center justify-center shrink-0">
               <Clock className="h-5 w-5 text-[#ff6b7b]" />
            </div>
            <div className="space-y-1">
               <p className="text-[11px] font-black text-[#2D241E] uppercase tracking-wider italic">
                 Dica de <span className="text-[#ff6b7b]">Navegação</span>
               </p>
               <p className="text-[13px] font-bold text-[#2D241E]/50 leading-relaxed italic">
                 A análise pode levar até <span className="text-[#ff6b7b]">5 minutos</span>. 
                 Sinta-se à vontade para navegar pelo app; o relatório será salvo automaticamente.
               </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}