import { useEffect, useRef } from 'react';

export function AnimatedBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        canvas.width * (0.5 + Math.sin(time * 0.3) * 0.2),
        canvas.height * (0.5 + Math.cos(time * 0.4) * 0.2),
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.6,
      );
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.03)');
      gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.015)');
      gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * (0.2 + Math.sin(time * 0.5 + i * 1.2) * 0.3 + i * 0.1);
        const y = canvas.height * (0.2 + Math.cos(time * 0.4 + i * 0.9) * 0.3 + i * 0.08);
        const r = 60 + Math.sin(time + i) * 20;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(212, 175, 55, ${0.03 + Math.sin(time + i * 0.5) * 0.01})`);
        g.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      frameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-0 ${className}`} />;
}
