import { motion } from 'framer-motion';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-t border-ink/10 dark:border-white/[0.04] py-10 mt-20 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gold/[0.02]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-sans text-ink/40 dark:text-parchment/40">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-medium"
          >
            28.6139° N, 77.2090° E — Sidereal Epoch
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-medium"
          >
            © 2026 Soma & Surya • VedicPath Systems
          </motion.span>
        </div>
      </div>
    </motion.footer>
  );
}
