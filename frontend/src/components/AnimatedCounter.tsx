import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({ from = 0, to, suffix = '', prefix = '', duration = 2, delay = 0, className = '', decimals = 0 }: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') {
      animate(count, to, { duration, ease: [0.25, 0.1, 0.25, 1] });
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setTimeout(() => {
            animate(count, to, { duration, ease: [0.25, 0.1, 0.25, 1] });
          }, delay * 1000);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, to, duration, delay]);

  return <motion.span ref={ref} className={className}>{rounded}</motion.span>;
}
