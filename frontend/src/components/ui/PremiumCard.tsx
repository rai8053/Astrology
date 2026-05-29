import { motion } from 'framer-motion';
import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  animate?: boolean;
  delay?: number;
  glass?: boolean;
  glow?: boolean;
  floating?: boolean;
  children: ReactNode;
}

export function PremiumCard({ hover = true, animate = true, delay = 0, glass = false, className, children, ...props }: Props) {
  const Comp = animate ? motion.div : 'div';
  const animProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    whileHover: hover ? { y: -3, transition: { duration: 0.25 } } : undefined,
  } : {};

  return (
    <Comp
      className={cn(
        glass ? 'glass-card' : 'card-border bg-bg-primary dark:bg-dark-bg-secondary',
        hover && 'card-hover',
        'rounded-xl p-6 cursor-default',
        className,
      )}
      {...animProps}
      {...(props as any)}
    >
      {children}
    </Comp>
  );
}

export function PremiumCardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b border-border-primary dark:border-dark-border-primary pb-4 mb-4 ${className || ''}`} {...props} />;
}

export function PremiumCardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`font-sans text-lg font-semibold tracking-tight ${className || ''}`} {...props} />;
}
