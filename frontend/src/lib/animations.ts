import { type Variants, type Transition } from 'framer-motion';

export const easeOut = [0.25, 0.1, 0.25, 1] as const;
export const easeInOut = [0.42, 0, 0.58, 1] as const;
export const springOut = [0.34, 1.56, 0.64, 1] as const;
export const smoothSpring = { type: 'spring' as const, stiffness: 200, damping: 20 } as Transition;
export const gentleSpring = { type: 'spring' as const, stiffness: 120, damping: 14 } as Transition;
export const bouncySpring = { type: 'spring' as const, stiffness: 300, damping: 10 } as Transition;
export const fastTransition = { duration: 0.25, ease: easeOut } as Transition;
export const smoothTransition = { duration: 0.4, ease: easeOut } as Transition;
export const slowTransition = { duration: 0.7, ease: easeOut } as Transition;

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: smoothTransition },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
};

export const fadeLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: smoothTransition },
};

export const fadeRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: smoothTransition },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: smoothTransition },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: springOut } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
};

export const cardHover = {
  rest: { scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const buttonTap = { scale: 0.97 };

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

export const floatingAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

export const glowPulse = {
  scale: [1, 1.05, 1],
  opacity: [0.6, 1, 0.6],
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
};

export const shimmer = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
};

export const slideUpReveal: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.6, ease: easeOut } },
};

export const rotateIn: Variants = {
  initial: { opacity: 0, rotate: -10, scale: 0.9 },
  animate: { opacity: 1, rotate: 0, scale: 1, transition: smoothTransition },
};

export function getStaggerDelay(index: number, base = 0.06) {
  return index * base;
}

export function getCardAnimation(index: number) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: easeOut, delay: index * 0.08 },
  };
}
