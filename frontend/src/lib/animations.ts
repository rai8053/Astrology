import { type Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
};

const easeOut = [0.25, 0.1, 0.25, 1] as const;
const springOut = [0.34, 1.56, 0.64, 1] as const;

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

export const fadeLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};

export const fadeRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
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
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

export const cardHover = {
  rest: { scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const buttonTap = { scale: 0.97 };

export const springTransition = { type: 'spring' as const, stiffness: 300, damping: 25 };

export const smoothTransition = { duration: 0.4, ease: easeOut };

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

export const floatingAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

export function getStaggerDelay(index: number, base = 0.06) {
  return index * base;
}
