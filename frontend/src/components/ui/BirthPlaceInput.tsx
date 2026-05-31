import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import indianPlaces from '@/data/indian-places.json';

interface BirthPlaceInputProps {
  label?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

interface Place {
  village: string;
  district: string;
}

export function BirthPlaceInput({ label, id, value, onChange, required, placeholder }: BirthPlaceInputProps) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value.trim()) return [];
    const q = value.trim().toLowerCase();
    return (indianPlaces as Place[])
      .filter((p) => p.village.toLowerCase().startsWith(q))
      .slice(0, 8);
  }, [value]);

  const select = (place: Place) => {
    onChange(`${place.village}, ${place.district}`);
    setOpen(false);
    setFocusedIdx(-1);
  };

  useEffect(() => {
    setFocusedIdx(-1);
  }, [filtered.length]);

  useEffect(() => {
    if (!open) setFocusedIdx(-1);
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node) &&
          listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx((prev) => Math.min(prev + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx((prev) => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter' && focusedIdx >= 0 && filtered[focusedIdx]) { e.preventDefault(); select(filtered[focusedIdx]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const show = open && filtered.length > 0;

  return (
    <div className="space-y-1 relative">
      {label && (
        <label htmlFor={id} className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink/60 dark:text-parchment/60">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        required={required}
        placeholder={placeholder}
        className={cn(
          'w-full bg-transparent border-b border-ink/20 dark:border-parchment/20 text-sm py-2 outline-none transition-colors focus:border-gold font-serif placeholder:text-ink/30 dark:placeholder:text-parchment/30',
        )}
        autoComplete="off"
      />
      {show && (
        <div
          ref={listRef}
          className="absolute z-50 left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-cosmic-deeper border border-ink/10 dark:border-parchment/10 shadow-lg shadow-black/5"
        >
          {filtered.map((place, i) => (
            <div key={`${place.village}-${place.district}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(place)}
                className={cn(
                  'w-full text-left px-4 py-2.5 transition-colors',
                  focusedIdx === i ? 'bg-gold/10' : 'hover:bg-gold/5',
                )}
              >
                <span className="block text-sm font-serif font-semibold text-ink dark:text-parchment">
                  {place.village}
                </span>
                <span className="block text-xs text-ink/40 dark:text-parchment/40 mt-px">
                  {place.village}, {place.district}
                </span>
              </button>
              {i < filtered.length - 1 && <hr className="border-t border-ink/5 dark:border-parchment/5 mx-3" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
