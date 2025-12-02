'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Brain, Sparkles, CheckCircle } from 'lucide-react';

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
    <Card className="w-full">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-primary">
              Gerando seu relatório financeiro
            </h3>
            <p className="text-muted-foreground">
              Enquanto isso, você pode navegar livremente pela aplicação
            </p>
          </div>

          {/* Barra de progresso principal */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso geral</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
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

          {/* Dica de navegação */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Dica:</strong> Você pode continuar usando a aplicação normalmente. 
              Seu relatório será salvo automaticamente quando estiver pronto!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}