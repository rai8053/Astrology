import { motion } from 'framer-motion';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  magnetic?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, magnetic = true, disabled, onClick, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-[0.15em] overflow-hidden rounded-lg transition-colors duration-300',
        variant === 'primary' && 'bg-gradient-to-r from-gold to-amber-400 text-cosmic shadow-lg shadow-gold/25 hover:shadow-gold/40',
        variant === 'secondary' && 'bg-white/5 backdrop-blur-sm border border-white/20 text-parchment hover:bg-white/10',
        variant === 'ghost' && 'bg-transparent text-ink/70 dark:text-parchment/70 hover:bg-ink/5 dark:hover:bg-white/5',
        variant === 'outline' && 'border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold',
        size === 'sm' && 'px-5 py-2 text-[10px]',
        size === 'md' && 'px-7 py-3.5 text-xs',
        size === 'lg' && 'px-10 py-4.5 text-sm',
        loading && 'cursor-wait',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && <span className="relative z-10">{icon}</span>}
      {children && <span className="relative z-10">{children}</span>}
    </motion.button>
  ),
);

PremiumButton.displayName = 'PremiumButton';
