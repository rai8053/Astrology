import { motion } from 'framer-motion';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export function PremiumButton({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }: Props) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-sans font-medium overflow-hidden rounded-lg transition-all duration-200',
        variant === 'primary' && 'bg-accent text-white shadow-sm shadow-accent/20 hover:shadow-md hover:shadow-accent/25 hover:bg-accent-hover',
        variant === 'secondary' && 'card-border bg-bg-primary dark:bg-dark-bg-secondary text-text-primary dark:text-dark-text-primary hover:bg-bg-secondary dark:hover:bg-dark-bg-tertiary',
        variant === 'ghost' && 'bg-transparent text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-accent/5',
        variant === 'outline' && 'border border-accent/40 text-accent hover:bg-accent/5 hover:border-accent',
        size === 'sm' && 'px-4 py-2 text-[12px]',
        size === 'md' && 'px-6 py-2.5 text-[13px]',
        size === 'lg' && 'px-8 py-3 text-sm',
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
      {icon && <span className="relative z-[1]">{icon}</span>}
      {children && <span className="relative z-[1]">{children}</span>}
    </motion.button>
  );
}
