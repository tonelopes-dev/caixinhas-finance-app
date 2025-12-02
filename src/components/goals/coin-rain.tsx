'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CoinRainProps {
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
}

interface Coin {
  id: number;
  left: number;
  animationDuration: number;
  delay: number;
  size: number;
}

export function CoinRain({ duration = 5000, intensity = 'medium' }: CoinRainProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isActive, setIsActive] = useState(true);

  const coinCounts = {
    low: 15,
    medium: 25,
    high: 40
  };

  useEffect(() => {
    const coinCount = coinCounts[intensity];
    const newCoins: Coin[] = [];

    for (let i = 0; i < coinCount; i++) {
      newCoins.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 2 + Math.random() * 3,
        delay: Math.random() * 2,
        size: 20 + Math.random() * 15
      });
    }

    setCoins(newCoins);

    // Para a animação após o tempo especificado
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, intensity]);

  if (!isActive || coins.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none overflow-hidden">
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{ y: -50, x: `${coin.left}vw`, opacity: 1 }}
          animate={{ 
            y: '110vh',
            rotate: 720,
            opacity: [1, 1, 0.8, 0]
          }}
          transition={{
            duration: coin.animationDuration,
            delay: coin.delay,
            ease: 'easeIn',
            rotate: { repeat: Infinity, duration: coin.animationDuration / 4 }
          }}
          className="absolute"
          style={{
            width: coin.size,
            height: coin.size,
          }}
        >
          <div 
            className="w-full h-full rounded-full flex items-center justify-center font-bold text-yellow-600 shadow-lg"
            style={{
              background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          >
            <span className="text-xs">R$</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}