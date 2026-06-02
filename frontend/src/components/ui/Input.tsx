import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  onTrailingIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, icon, trailingIcon, onTrailingIconClick, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-dark-text-tertiary z-[1]">
            {icon}
          </div>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'input-glass',
            icon && 'pl-10',
            trailingIcon && 'pr-10',
            error && '!border-red-500/40 !shadow-[0_0_0_3px_rgba(239,68,68,0.08)]',
            className,
          )}
          {...props}
        />
        {trailingIcon && (
          <button type="button" onClick={onTrailingIconClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-dark-text-tertiary hover:text-accent transition-colors z-[1]">
            {trailingIcon}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
