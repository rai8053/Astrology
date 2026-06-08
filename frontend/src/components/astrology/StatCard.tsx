import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  className?: string;
}

export function StatCard({ icon, label, value, sublabel, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('min-w-[120px]', className)}
    >
      <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="whitespace-normal text-sm font-semibold text-foreground">{value}</p>
            {sublabel && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
