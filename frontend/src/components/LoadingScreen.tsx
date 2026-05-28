import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-parchment dark:bg-cosmic flex flex-col items-center justify-center z-50">
      <div className="relative">
        <Sparkles className="w-10 h-10 text-gold animate-pulse" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-ping" />
      </div>
      <p className="mt-4 text-sm font-serif text-ink/50 dark:text-parchment/50 italic">Loading cosmic data...</p>
    </div>
  );
}
