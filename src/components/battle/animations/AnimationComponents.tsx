import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, duration = 0.2, className }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({ children, direction = 'up', delay = 0, duration = 0.3, className }) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -30, y: 0 };
      case 'right': return { x: 30, y: 0 };
      case 'up': return { x: 0, y: 30 };
      case 'down': return { x: 0, y: -30 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...getInitialPosition() }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  bounce?: boolean;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, delay = 0, duration = 0.2, bounce = false, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: bounce ? 0.8 : 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: bounce ? 0.8 : 0.9 }}
    transition={{ duration, delay, ease: bounce ? [0.175, 0.885, 0.32, 1.275] : 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

interface CardDrawProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export const CardDraw: React.FC<CardDrawProps> = ({ children, index = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, rotateY: 180 }}
    animate={{ opacity: 1, y: 0, rotateY: 0 }}
    transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

interface CardPlayProps {
  children: React.ReactNode;
  isPlaying?: boolean;
  onPlayComplete?: () => void;
  className?: string;
}

export const CardPlay: React.FC<CardPlayProps> = ({ children, isPlaying = false, onPlayComplete, className }) => (
  <motion.div
    initial={{ scale: 1, y: 0 }}
    animate={isPlaying ? { scale: 1.1, y: -50, opacity: 0 } : { scale: 1, y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
    onAnimationComplete={isPlaying ? onPlayComplete : undefined}
    className={className}
  >
    {children}
  </motion.div>
);

interface DamageFlashProps {
  children: React.ReactNode;
  isDamaged?: boolean;
  className?: string;
}

export const DamageFlash: React.FC<DamageFlashProps> = ({ children, isDamaged = false, className }) => (
  <motion.div
    animate={isDamaged ? {
      filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
      x: [0, -5, 5, -5, 5, 0],
    } : {}}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

interface HealPulseProps {
  children: React.ReactNode;
  isHealing?: boolean;
  className?: string;
}

export const HealPulse: React.FC<HealPulseProps> = ({ children, isHealing = false, className }) => (
  <motion.div
    animate={isHealing ? { scale: [1, 1.02, 1] } : {}}
    transition={{ duration: 0.5 }}
    className={className}
  >
    {children}
    {isHealing && (
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ boxShadow: '0 0 0 0 rgba(90, 201, 114, 0.4)' }}
        animate={{ boxShadow: '0 0 20px 5px rgba(90, 201, 114, 0.2)' }}
        transition={{ duration: 0.5 }}
      />
    )}
  </motion.div>
);

interface PhaseTransitionProps {
  children: React.ReactNode;
  phaseKey: string | number;
  className?: string;
}

export const PhaseTransition: React.FC<PhaseTransitionProps> = ({ children, phaseKey, className }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={phaseKey}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

interface GlowPulseProps {
  children: React.ReactNode;
  isActive?: boolean;
  color?: string;
  className?: string;
}

export const GlowPulse: React.FC<GlowPulseProps> = ({ children, isActive = true, color = 'rgba(201, 149, 42, 0.3)', className }) => (
  <motion.div
    animate={isActive ? {
      boxShadow: [
        `0 0 5px ${color}`,
        `0 0 20px ${color.replace('0.3', '0.6')}`,
        `0 0 5px ${color}`,
      ],
    } : {}}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={className}
  >
    {children}
  </motion.div>
);

interface FloatProps {
  children: React.ReactNode;
  className?: string;
}

export const Float: React.FC<FloatProps> = ({ children, className }) => (
  <motion.div
    animate={{ y: [0, -5, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({ children, staggerDelay = 0.05, className }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={{
      initial: {},
      animate: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className }) => (
  <motion.div
    variants={{
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

interface NumberChangeProps {
  value: number;
  previousValue?: number;
  className?: string;
}

export const NumberChange: React.FC<NumberChangeProps> = ({ value, previousValue, className }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const diff = previousValue !== undefined ? value - previousValue : 0;

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  return (
    <div className={`relative ${className}`}>
      <motion.span
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.span>
      {diff !== 0 && (
        <motion.span
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0 }}
          className={`absolute -top-2 left-1/2 -translate-x-1/2 text-sm font-bold ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}
        >
          {diff > 0 ? '+' : ''}{diff}
        </motion.span>
      )}
    </div>
  );
};

interface ShimmerProps {
  children: React.ReactNode;
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ children, className }) => (
  <motion.div className={`relative overflow-hidden ${className}`}>
    {children}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </motion.div>
);
