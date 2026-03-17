export const battleAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  scaleInBounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { 
      duration: 0.4, 
      ease: [0.175, 0.885, 0.32, 1.275],
    },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideInDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const cardAnimations = {
  draw: {
    initial: { opacity: 0, y: 100, rotateY: 180 },
    animate: { opacity: 1, y: 0, rotateY: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  play: {
    initial: { scale: 1, y: 0 },
    animate: { scale: 1.1, y: -50 },
    exit: { opacity: 0, scale: 0.8, y: -100 },
    transition: { duration: 0.3 },
  },

  hover: {
    scale: 1.05,
    y: -10,
    transition: { duration: 0.2 },
  },

  select: {
    scale: 1.1,
    y: -20,
    boxShadow: '0 0 20px rgba(201, 149, 42, 0.5)',
    transition: { duration: 0.2 },
  },

  discard: {
    opacity: 0,
    x: 100,
    rotate: 10,
    transition: { duration: 0.3 },
  },
};

export const phaseAnimations = {
  phaseTransition: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.5 },
    transition: { duration: 0.5, ease: 'easeInOut' },
  },

  phaseIndicator: {
    initial: { width: 0 },
    animate: { width: '100%' },
    exit: { width: 0 },
    transition: { duration: 0.3 },
  },

  phaseBanner: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const combatAnimations = {
  attack: {
    x: [0, 30, 0],
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  attackEnemy: {
    x: [0, -30, 0],
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  damage: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.2 },
  },

  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.3 },
  },

  death: {
    opacity: 0,
    scale: 0,
    rotate: 180,
    transition: { duration: 0.5 },
  },
};

export const effectAnimations = {
  glow: {
    boxShadow: [
      '0 0 5px rgba(201, 149, 42, 0.3)',
      '0 0 20px rgba(201, 149, 42, 0.6)',
      '0 0 5px rgba(201, 149, 42, 0.3)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },

  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 2, repeat: Infinity },
  },

  float: {
    y: [0, -5, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },

  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
};

export const panelAnimations = {
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },

  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  tooltip: {
    initial: { opacity: 0, scale: 0.9, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 10 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

export const staggerChildren = {
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
};

export const getStaggerDelay = (index: number, baseDelay: number = 0.05): number => {
  return index * baseDelay;
};

export const createTransition = (
  type: keyof typeof battleAnimations,
  customDuration?: number
) => {
  const animation = battleAnimations[type];
  if (customDuration) {
    return {
      ...animation,
      transition: { ...animation.transition, duration: customDuration },
    };
  }
  return animation;
};
