import { useEffect, useRef } from 'react';

interface Star { x: number; y: number; size: number; opacity: number; speed: number; twinkleSpeed: number; twinklePhase: number; }

interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number; }

export function CosmicBackground({ intensity = 1, interactive = false }: { intensity?: number; interactive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const starCount = Math.floor(120 * intensity);
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    const particleCount = Math.floor(25 * intensity);
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.15,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      hue: 40 + Math.random() * 20,
    }));

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / canvas.width, y: e.clientY / canvas.height };
    };
    if (interactive) window.addEventListener('mousemove', handleMouse);

    let frameId: number;
    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = interactive ? mouseRef.current.x : 0.5;
      const my = interactive ? mouseRef.current.y : 0.5;

      for (const star of starsRef.current) {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.3 + 0.7;
        const parallaxX = interactive ? (star.x - canvas.width * mx) * 0.01 : 0;
        const parallaxY = interactive ? (star.y - canvas.height * my) * 0.01 : 0;
        ctx.beginPath();
        ctx.arc(star.x + parallaxX, star.y + parallaxY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 247, 237, ${star.opacity * twinkle})`;
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
      ctx.lineWidth = 0.5;
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const si = stars[i]!;
          const sj = stars[j]!;
          const dx = si.x - sj.x;
          const dy = si.y - sj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(si.x, si.y);
            ctx.lineTo(sj.x, sj.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10 || p.x > canvas.width + 10) p.vx = -p.vx;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.opacity})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      frameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      if (interactive) window.removeEventListener('mousemove', handleMouse);
    };
  }, [intensity, interactive]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.8 }} />;
}
