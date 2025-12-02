'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';
import { useConfettiOnce } from '@/hooks/use-confetti-once';
import { useCelebrationEffects } from '@/hooks/use-celebration-effects';
import { CoinRain } from '@/components/goals/coin-rain';
import { Trophy, Target, DollarSign, Star, Zap, Sparkles, Gift, Heart, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
}

interface CompletedGoalsConfettiProps {
  completedGoals: Goal[];
  userId: string;
}

const celebrationMessages = [
  { icon: Trophy, text: 'Parabéns! Meta conquistada!', color: 'text-yellow-500', subtitle: 'Sua dedicação valeu a pena!' },
  { icon: Target, text: 'Objetivo alcançado!', color: 'text-green-500', subtitle: 'Foco e planejamento deram certo!' },
  { icon: DollarSign, text: 'Sonho realizado!', color: 'text-emerald-500', subtitle: 'Sua organização financeira funcionou!' },
  { icon: Star, text: 'Você é incrível!', color: 'text-purple-500', subtitle: 'Continue assim!' },
  { icon: Zap, text: 'Foco e determinação!', color: 'text-blue-500', subtitle: 'Disciplina é a chave do sucesso!' },
  { icon: Sparkles, text: 'Continue brilhando!', color: 'text-pink-500', subtitle: 'Você está no caminho certo!' },
  { icon: Gift, text: 'Presente conquistado!', color: 'text-orange-500', subtitle: 'Sua recompensa chegou!' },
  { icon: Heart, text: 'Realização completa!', color: 'text-red-500', subtitle: 'Emoção em forma de conquista!' },
  { icon: Coins, text: 'Dinheiro organizado!', color: 'text-amber-500', subtitle: 'Sua gestão financeira evoluiu!' },
];

export function CompletedGoalsConfetti({ completedGoals, userId }: CompletedGoalsConfettiProps) {
  const { width, height } = useWindowSize();
  const hasCompletedGoals = completedGoals.length > 0;
  const showConfetti = useConfettiOnce(`goals_${userId}_${completedGoals.length}`, hasCompletedGoals);
  const [showMessage, setShowMessage] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showCoinRain, setShowCoinRain] = useState(false);
  const { celebrate } = useCelebrationEffects();

  // Determina o nível de celebração baseado na quantidade de metas
  const getCelebrationLevel = (count: number): 'small' | 'medium' | 'big' => {
    if (count >= 5) return 'big';
    if (count >= 3) return 'medium';
    return 'small';
  };

  useEffect(() => {
    if (showConfetti && hasCompletedGoals) {
      // Celebração baseada no nível de conquista
      const level = getCelebrationLevel(completedGoals.length);
      // Pega o ID da primeira meta completa para destacar
      const firstCompletedGoal = completedGoals[0];
      celebrate(level, completedGoals.length, firstCompletedGoal.id);
      
      // Mensagem de celebração
      setMessageIndex(Math.floor(Math.random() * celebrationMessages.length));
      setShowMessage(true);
      
      // Chuva de moedas para celebrações médias e grandes
      if (level === 'medium' || level === 'big') {
        setShowCoinRain(true);
        setTimeout(() => setShowCoinRain(false), level === 'big' ? 6000 : 4000);
      }
      
      // Esconder mensagem após tempo baseado no nível
      const duration = level === 'big' ? 9000 : level === 'medium' ? 8000 : 7000;
      const messageTimer = setTimeout(() => {
        setShowMessage(false);
      }, duration);
      
      return () => clearTimeout(messageTimer);
    }
  }, [showConfetti, hasCompletedGoals, completedGoals, celebrate]);

  if (!showConfetti) {
    return null;
  }

  const currentMessage = celebrationMessages[messageIndex];
  const IconComponent = currentMessage.icon;

  const celebrationLevel = getCelebrationLevel(completedGoals.length);

  return (
    <>
      {/* Chuva de moedas */}
      {showCoinRain && (
        <CoinRain 
          duration={celebrationLevel === 'big' ? 6000 : 4000}
          intensity={celebrationLevel === 'big' ? 'high' : 'medium'}
        />
      )}

      {/* Confetti */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400 + (completedGoals.length * 150)}
          gravity={0.12}
          colors={[
            '#10B981', // green-500 (sucesso financeiro)
            '#F59E0B', // amber-500 (ouro/riqueza)
            '#8B5CF6', // violet-500 (conquista)
            '#EF4444', // red-500 (energia/paixão)
            '#06B6D4', // cyan-500 (progresso)
            '#EC4899', // pink-500 (celebração)
            '#F97316', // orange-500 (entusiasmo)
          ]}
          wind={0.02}
          initialVelocityY={-10}
        />
      </div>

      {/* Mensagem de celebração */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotate: [0, -2, 2, -1, 1, 0], // Pequeno balanço
            }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut",
              rotate: { duration: 0.8, repeat: 1 }
            }}
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-[110] pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border-2 border-primary/20 text-center celebration-card celebrate-glow">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="flex justify-center mb-3"
              >
                <IconComponent className={`h-12 w-12 ${currentMessage.color}`} />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {currentMessage.text}
              </h2>
              
              <p className="text-gray-600 text-sm mb-1">
                {currentMessage.subtitle}
              </p>
              
              <p className="text-primary font-semibold text-sm">
                {completedGoals.length === 1 
                  ? '1 meta alcançada!' 
                  : `${completedGoals.length} metas alcançadas!`
                }
              </p>
              
              {/* Barra de progresso animada */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-green-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Efeitos de brilho nas bordas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 2, repeat: 2 }}
        className="fixed inset-0 z-[90] pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent animate-pulse" />
      </motion.div>
    </>
  );
}