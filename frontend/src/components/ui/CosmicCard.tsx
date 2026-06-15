import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ReactNode, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: 'purple' | 'amber' | 'cyan' | 'none';
  hover?: boolean;
  padded?: boolean;
}

const glowMap = {
  purple: 'cosmic-glow',
  amber: 'cosmic-glow-accent',
  cyan: 'cosmic-glow-cyan',
  none: '',
};

export function CosmicCard({ children, className, glow = 'purple', hover = true, padded = true, ...props }: Props) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : undefined}
      className={cn(
        'glass-card rounded-xl',
        glow !== 'none' && glowMap[glow],
        hover && 'card-hover',
        padded && 'p-6',
        className,
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
