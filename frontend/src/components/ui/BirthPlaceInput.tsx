import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import indianPlaces from '@/data/indian-places.json';
import countryStates from '@/data/country-states.json';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  state_district?: string;
  county?: string;
  district?: string;
  region?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  display_name: string;
  address: NominatimAddress;
}

interface Place {
  village: string;
  district: string;
  state: string;
  country: string;
}

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

const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Brazil', 'Mexico', 'Japan', 'China', 'South Korea', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Morocco', 'Saudi Arabia', 'UAE', 'Turkey', 'Russia', 'Ukraine', 'Poland', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Portugal', 'Greece', 'Ireland', 'New Zealand', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Myanmar', 'Afghanistan', 'Iran', 'Iraq', 'Israel'].sort();

const COUNTRY_ALIASES: Record<string, string> = {
  'United Arab Emirates': 'UAE',
  'Russian Federation': 'Russia',
  'Republic of Korea': 'South Korea',
  'Viet Nam': 'Vietnam',
  'Türkiye': 'Turkey',
  'United States of America': 'United States',
  'Iran (Islamic Republic of)': 'Iran',
};

function normalizeCountry(raw: string): string {
  if (!raw) return '';
  if (countries.includes(raw)) return raw;
  const mapped = COUNTRY_ALIASES[raw];
  if (mapped) return mapped;
  const lower = raw.toLowerCase();
  const match = countries.find((c) => c.toLowerCase() === lower);
  if (match) return match;
  return raw;
}

function extractPlace(r: NominatimResult): Place {
  const a = r.address;
  const village = a.city || a.town || a.village || a.hamlet || a.municipality || '';
  const districtLevels = [a.state_district, a.county, a.district, a.region].filter((x): x is string => !!x);
  const district = districtLevels[0] || village;
  const state = a.state || districtLevels[0] || village;
  const country = normalizeCountry(a.country || '');
  return { village, district, state, country };
}

export function BirthPlaceInput({ label, id, value, onChange, required, placeholder, error, state, onStateChange, country, onCountryChange }: BirthPlaceInputProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`, {
        headers: { 'Accept-Language': 'en' },
      });
      if (!res.ok) { setResults([]); return; }
      const data: NominatimResult[] = await res.json();
      setResults(data.map(extractPlace).filter(p => p.village));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onChangeInput = (v: string) => {
    onChange(v);
    if (!v.trim()) { setResults([]); setOpen(false); return; }
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 300);
  };

  const stateOptions = (() => {
    if (!country) return [];
    const states = (countryStates as Record<string, string[]>)[country];
    const base = states && states.length > 0 ? [...states] : [];
    if (state && !base.includes(state)) base.unshift(state);
    base.push('Other');
    return base;
  })();

  const select = (place: Place) => {
    onChange(`${place.village}, ${place.district}`);
    onStateChange(place.state);
    onCountryChange(place.country);
    setOpen(false);
    setFocusedIdx(-1);
    setResults([]);
  };

  useEffect(() => {
    setFocusedIdx(-1);
  }, [results.length]);

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

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx((prev) => Math.min(prev + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx((prev) => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter' && focusedIdx >= 0 && results[focusedIdx]) { e.preventDefault(); select(results[focusedIdx]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const show = open && (results.length > 0 || loading);

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
          onChange={(e) => onChangeInput(e.target.value)}
          onFocus={() => { if (!value.trim()) { setResults([]); } else if (results.length > 0) setOpen(true); }}
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
            {loading && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-ink/40 dark:text-parchment/40">Searching...</div>
            )}
            {results.map((place, i) => (
              <div key={`${place.village}-${place.district}-${i}`}>
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
                    {place.district ? `${place.village}, ${place.district}` : place.village}
                  </span>
                </button>
                {i < results.length - 1 && <hr className="border-t border-ink/5 dark:border-parchment/5 mx-3" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink/60 dark:text-parchment/60">
            {t('common.stateName')}
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
            <option value="" disabled>{t('common.selectState')}</option>
            {stateOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-ink/60 dark:text-parchment/60">
            {t('common.country')}
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
            <option value="" disabled>{t('common.selectCountry')}</option>
            {(() => {
              const opts = [...countries];
              if (country && !opts.includes(country)) opts.unshift(country);
              return opts;
            })().map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
