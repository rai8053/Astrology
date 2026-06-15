import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  tag?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeader({ tag, title, subtitle, align = 'center', className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        align === 'center' ? 'text-center' : 'text-left',
        'mb-16 md:mb-20',
        className,
      )}
    >
      {tag && (
        <span className="tag mb-5 inline-block">{tag}</span>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-balance">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
