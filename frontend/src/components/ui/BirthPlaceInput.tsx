import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { List, RowComponentProps } from 'react-window';
import type { ListImperativeAPI } from 'react-window';
import { cn } from '@/lib/utils';

interface Place {
  v: string;
  d: string;
  s: string;
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

interface MyRowProps {
  results: Place[];
  focusedIdx: number;
  select: (p: Place) => void;
  setFocusedIdx: (i: number) => void;
}

let cachedPlaces: Place[] | null = null;
let loadingPromise: Promise<Place[]> | null = null;
const ITEM_H = 57;
const MAX_VISIBLE_H = 240;

function loadPlaces(): Promise<Place[]> {
  if (cachedPlaces) return Promise.resolve(cachedPlaces);
  if (loadingPromise) return loadingPromise;
  loadingPromise = fetch('/data/places.json')
    .then((r) => r.json())
    .then((data: Place[]) => {
      cachedPlaces = data;
      return data;
    });
  return loadingPromise;
}

function searchPlaces(places: Place[], q: string): Place[] {
  const nq = q.trim().toLowerCase();
  if (!nq) return [];
  const seen = new Set<string>();
  const exact: Place[] = [];
  const prefix: Place[] = [];
  const infix: Place[] = [];
  for (const p of places) {
    const lower = p.v.toLowerCase();
    if (!lower.includes(nq)) continue;
    const key = `${p.v}|${p.d}|${p.s}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (lower === nq) exact.push(p);
    else if (lower.startsWith(nq)) prefix.push(p);
    else infix.push(p);
  }
  return [...exact, ...prefix, ...infix];
}

function RowComponent({ index, style, results, focusedIdx, select, setFocusedIdx }: RowComponentProps<MyRowProps>) {
  const place = results[index];
  if (!place) return null;
  return (
    <div style={style}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => select(place)}
        onMouseEnter={() => setFocusedIdx(index)}
        className={cn(
          'w-full h-full text-left px-4 transition-colors flex flex-col justify-center',
          focusedIdx === index ? 'bg-gold/10' : 'hover:bg-gold/5',
        )}
      >
        <h3 className="text-sm font-sans font-semibold text-text-primary dark:text-dark-text-primary truncate leading-tight">
          {place.v}
        </h3>
        <p className="text-xs text-ink/40 dark:text-parchment/40 truncate leading-tight">
          {place.v}{place.d ? `, ${place.d}` : ''}{place.s ? ` (${place.s})` : ''}
        </p>
      </button>
    </div>
  );
}

export function BirthPlaceInput({ label, id, value, onChange, required, placeholder, error, state, onStateChange, country, onCountryChange }: BirthPlaceInputProps) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListImperativeAPI | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchIdRef = useRef(0);

  const doSearch = async (q: string, id: number) => {
    const nq = q.trim();
    if (!nq) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(false);
    try {
      const places = await loadPlaces();
      if (id !== searchIdRef.current) return;
      setResults(searchPlaces(places, nq));
      setSearched(true);
    } catch {
      if (id === searchIdRef.current) { setResults([]); setSearched(true); }
    } finally {
      if (id === searchIdRef.current) setLoading(false);
    }
  };

  const onChangeInput = (v: string) => {
    onChange(v);
    if (!v.trim()) { setResults([]); setOpen(false); setSearched(false); return; }
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const id = ++searchIdRef.current;
      doSearch(v, id);
    }, 250);
  };

  const updatePosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
      });
    }
  };

  const select = useCallback((place: Place) => {
    onChange(`${place.v}, ${place.d}`);
    onStateChange(place.s);
    onCountryChange('India');
    setOpen(false);
    setFocusedIdx(-1);
    setResults([]);
    setSearched(false);
  }, [onChange, onStateChange, onCountryChange]);

  useEffect(() => {
    if (results.length > 0) setOpen(true);
  }, [results]);

  useEffect(() => {
    setFocusedIdx(-1);
  }, [results.length]);

  useEffect(() => {
    if (!open) setFocusedIdx(-1);
  }, [open]);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, results]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node) &&
          portalRef.current && !portalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    setTimeout(() => loadPlaces(), 200);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(focusedIdx + 1, results.length - 1);
      setFocusedIdx(next);
      listRef.current?.scrollToRow({ index: next, align: 'smart' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(focusedIdx - 1, 0);
      setFocusedIdx(prev);
      listRef.current?.scrollToRow({ index: prev, align: 'smart' });
    } else if (e.key === 'Enter' && focusedIdx >= 0 && results[focusedIdx]) {
      e.preventDefault();
      select(results[focusedIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const noResults = searched && !loading && results.length === 0;
  const show = open && (results.length > 0 || loading || noResults);
  const listHeight = Math.min(results.length * ITEM_H, MAX_VISIBLE_H);

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
            'w-full bg-transparent border-b text-sm py-2 outline-none transition-colors focus:border-accent font-sans placeholder:text-text-tertiary',
            error ? 'border-red-500' : 'border-ink/20 dark:border-parchment/20',
          )}
          autoComplete="off"
        />
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        {show && createPortal(
          <div
            ref={portalRef}
            style={menuStyle}
            className="z-[9999] rounded-xl bg-white dark:bg-cosmic-deeper border border-ink/10 dark:border-parchment/10 shadow-lg shadow-black/5"
          >
            {loading && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-ink/40 dark:text-parchment/40">Loading places database...</div>
            )}
            {noResults && (
              <div className="px-4 py-3 text-sm text-ink/40 dark:text-parchment/40">No results found</div>
            )}
            {results.length > 0 && (
              <List<MyRowProps>
                listRef={listRef}
                rowComponent={RowComponent}
                rowProps={{ results, focusedIdx, select, setFocusedIdx }}
                rowCount={results.length}
                rowHeight={ITEM_H}
                overscanCount={5}
                style={{ height: listHeight }}
              />
            )}
          </div>,
          document.body,
        )}
      </div>
    </div>
  );
}
