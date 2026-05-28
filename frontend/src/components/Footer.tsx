export function Footer() {
  return (
    <footer className="border-t border-ink/10 dark:border-white/10 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-sans text-ink/50 dark:text-parchment/50">
          <span>28.6139° N, 77.2090° E — Sidereal Epoch</span>
          <span>© 2026 Soma & Surya • VedicPath Systems</span>
        </div>
      </div>
    </footer>
  );
}
