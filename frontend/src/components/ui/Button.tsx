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
        variant === 'primary' && 'btn-gold',
        variant === 'secondary' && 'btn-ghost-premium subtle-border',
        variant === 'ghost' && 'btn-ghost-premium',
        variant === 'outline' && 'btn-outline-premium',
        size === 'sm' && 'px-4 py-1.5 text-[11px]',
        size === 'md' && 'px-6 py-2.5 text-xs',
        size === 'lg' && 'px-8 py-3.5 text-sm',
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
