import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-sans font-semibold uppercase tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-ink text-parchment hover:bg-ink/90 dark:bg-gold dark:text-cosmic dark:hover:bg-gold/90',
        variant === 'secondary' && 'bg-transparent border border-ink/20 text-ink hover:bg-ink/5 dark:border-parchment/20 dark:text-parchment',
        variant === 'ghost' && 'bg-transparent text-ink hover:bg-ink/5 dark:text-parchment',
        variant === 'outline' && 'border border-gold text-gold hover:bg-gold/10',
        size === 'sm' && 'px-4 py-2 text-[10px]',
        size === 'md' && 'px-6 py-3 text-xs',
        size === 'lg' && 'px-8 py-4 text-sm',
        loading && 'cursor-wait',
        className,
      )}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
