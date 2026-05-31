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
  error?: string;
  state: string;
  onStateChange: (v: string) => void;
  country: string;
  onCountryChange: (v: string) => void;
}

interface Place {
  village: string;
  district: string;
  state: string;
  country: string;
}

const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Brazil', 'Mexico', 'Japan', 'China', 'South Korea', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Morocco', 'Saudi Arabia', 'UAE', 'Turkey', 'Russia', 'Ukraine', 'Poland', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Portugal', 'Greece', 'Ireland', 'New Zealand', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Myanmar', 'Afghanistan', 'Iran', 'Iraq', 'Israel'].sort();

export function BirthPlaceInput({ label, id, value, onChange, required, placeholder, error, state, onStateChange, country, onCountryChange }: BirthPlaceInputProps) {
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

  const allStates = useMemo(() => {
    const s = new Set((indianPlaces as Place[]).map((p) => p.state));
    return Array.from(s).sort();
  }, []);

  const stateOptions = useMemo(() => {
    if (!country) return [];
    if (country === 'India') return [...allStates, 'Other'];
    return ['Other'];
  }, [country, allStates]);

  const select = (place: Place) => {
    onChange(`${place.village}, ${place.district}`);
    onStateChange(place.state);
    onCountryChange(place.country);
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
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink/60 dark:text-parchment/60">
          {label}
        </label>
      )}
      <div className="relative">
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
            'w-full bg-transparent border-b text-sm py-2 outline-none transition-colors focus:border-gold font-serif placeholder:text-ink/30 dark:placeholder:text-parchment/30',
            error ? 'border-red-500' : 'border-ink/20 dark:border-parchment/20',
          )}
          autoComplete="off"
        />
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
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

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink/60 dark:text-parchment/60">
            State Name
          </label>
          <select
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={!country}
            className={cn(
              'w-full bg-transparent border-b text-sm py-2 outline-none transition-colors focus:border-gold font-serif',
              !state ? 'text-ink/30 dark:text-parchment/30' : 'text-ink dark:text-parchment',
              'border-ink/20 dark:border-parchment/20',
              !country && 'opacity-40 cursor-not-allowed',
            )}
          >
            <option value="" disabled>Select State</option>
            {stateOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink/60 dark:text-parchment/60">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => { onCountryChange(e.target.value); onStateChange(''); }}
            className={cn(
              'w-full bg-transparent border-b text-sm py-2 outline-none transition-colors focus:border-gold font-serif',
              !country ? 'text-ink/30 dark:text-parchment/30' : 'text-ink dark:text-parchment',
              'border-ink/20 dark:border-parchment/20',
            )}
          >
            <option value="" disabled>Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
