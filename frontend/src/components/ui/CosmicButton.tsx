import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export function CosmicButton({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }: Props) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-xl transition-colors duration-200',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary-light shadow-lg shadow-primary/20 hover:shadow-primary/30',
        variant === 'gradient' && 'gradient-animated text-white font-semibold shadow-lg shadow-primary/20',
        variant === 'secondary' && 'bg-muted text-foreground hover:bg-muted/80 border border-border',
        variant === 'ghost' && 'text-muted-foreground hover:text-foreground hover:bg-primary/5',
        variant === 'outline' && 'border border-primary/30 text-primary-light hover:bg-primary/5 hover:border-primary/50',
        size === 'sm' && 'px-4 py-1.5 text-[11px]',
        size === 'md' && 'px-6 py-2.5 text-xs',
        size === 'lg' && 'px-8 py-3.5 text-sm',
        loading && 'cursor-wait',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...(props as any)}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
}
