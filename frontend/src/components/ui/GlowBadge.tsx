import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'cyan' | 'success' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary/10 text-primary-light border-primary/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  cyan: 'bg-cyan-500/10 text-secondary border-cyan-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function GlowBadge({ children, variant = 'primary', size = 'sm', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold border rounded-full',
        variantClasses[variant],
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className,
      )}
    >
      {children}
    </span>
  );
}
