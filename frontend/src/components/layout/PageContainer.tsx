import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animated?: boolean;
  id?: string;
}

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function PageContainer({ children, className, maxWidth = 'xl', animated = true, id }: Props) {
  const Wrapper = animated ? motion.div : 'div';
  return (
    <Wrapper
      id={id}
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={animated ? { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } : undefined}
      className={cn('mx-auto px-5 sm:px-8 w-full', maxWidths[maxWidth], className)}
    >
      {children}
    </Wrapper>
  );
}
