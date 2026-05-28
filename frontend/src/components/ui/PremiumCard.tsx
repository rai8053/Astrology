import { motion } from 'framer-motion';
import { type HTMLAttributes, type ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
  floating?: boolean;
  glass?: boolean;
  animate?: boolean;
  delay?: number;
  children: ReactNode;
}

export function PremiumCard({ glow, hover = true, floating, glass = true, animate = true, delay = 0, className, children, ...props }: Props) {
  const Comp = animate ? motion.div : 'div';
  const animProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    whileHover: hover ? { y: -4, transition: { duration: 0.3 } } : undefined,
  } : {};

  return (
    <Comp
      className={`
        ${glass ? 'glass-card' : 'bg-white dark:bg-cosmic-light/50 border border-ink/10 dark:border-white/10'}
        ${glow ? 'cosmic-glow' : ''}
        ${floating ? 'animate-float' : ''}
        rounded-xl p-6 transition-all duration-300
        ${hover ? 'cursor-default' : ''}
        ${className || ''}
      `}
      {...animProps}
      {...(props as any)}
    >
      {children}
    </Comp>
  );
}

export function PremiumCardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b border-ink/10 dark:border-white/10 pb-4 mb-4 ${className || ''}`} {...props} />;
}

export function PremiumCardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`font-serif text-xl font-semibold ${className || ''}`} {...props} />;
}
