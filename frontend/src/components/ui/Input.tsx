import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink/60 dark:text-parchment/60">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'w-full bg-transparent border-b border-ink/20 dark:border-parchment/20 text-sm py-2 outline-none transition-colors focus:border-gold font-serif placeholder:text-ink/30 dark:placeholder:text-parchment/30',
          error && 'border-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
