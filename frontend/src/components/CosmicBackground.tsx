import { useEffect, useRef } from 'react';

interface Star { x: number; y: number; size: number; opacity: number; twinkleSpeed: number; twinklePhase: number; hue: number; }
interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number; life: number; maxLife: number; }
interface Nebula { x: number; y: number; radius: number; hue: number; saturation: number; lightness: number; opacity: number; pulseSpeed: number; pulsePhase: number; }
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; tail: number; }

export function CosmicBackground({ intensity = 1, interactive = false }: { intensity?: number; interactive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const cw = () => window.innerWidth;
    const ch = () => window.innerHeight;

    const starCount = Math.floor(160 * intensity);
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * cw(),
      y: Math.random() * ch(),
      size: Math.random() * 2 + 0.3,
      opacity: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.025 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      hue: 220 + Math.random() * 60,
    }));

    const particleCount = Math.floor(35 * intensity);
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * cw(),
      y: Math.random() * ch(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2,
      size: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      hue: 35 + Math.random() * 30,
      life: 0,
      maxLife: 300 + Math.random() * 200,
    }));

    nebulasRef.current = Array.from({ length: Math.floor(3 * intensity) }, () => ({
      x: Math.random() * cw(),
      y: Math.random() * ch(),
      radius: 150 + Math.random() * 250,
      hue: 260 + Math.random() * 80,
      saturation: 40 + Math.random() * 30,
      lightness: 30 + Math.random() * 20,
      opacity: 0.03 + Math.random() * 0.04,
      pulseSpeed: 0.002 + Math.random() * 0.003,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / cw(), y: e.clientY / ch() };
    };
    if (interactive) window.addEventListener('mousemove', handleMouse);

    let frameId: number;
    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, cw(), ch());

      const mx = interactive ? mouseRef.current.x : 0.5;
      const my = interactive ? mouseRef.current.y : 0.5;

      for (const neb of nebulasRef.current) {
        const pulse = Math.sin(time * neb.pulseSpeed * 60 + neb.pulsePhase) * 0.3 + 0.7;
        const gradient = ctx.createRadialGradient(
          neb.x + (mx - 0.5) * 20, neb.y + (my - 0.5) * 20, 0,
          neb.x + (mx - 0.5) * 20, neb.y + (my - 0.5) * 20, neb.radius,
        );
        gradient.addColorStop(0, `hsla(${neb.hue}, ${neb.saturation}%, ${neb.lightness}%, ${neb.opacity * pulse})`);
        gradient.addColorStop(0.5, `hsla(${neb.hue + 20}, ${neb.saturation}%, ${neb.lightness + 10}%, ${neb.opacity * pulse * 0.5})`);
        gradient.addColorStop(1, `hsla(${neb.hue}, ${neb.saturation}%, ${neb.lightness}%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, cw(), ch());
      }

      for (const star of starsRef.current) {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.35 + 0.65;
        const parallaxX = interactive ? (star.x - cw() * mx) * 0.015 : 0;
        const parallaxY = interactive ? (star.y - ch() * my) * 0.015 : 0;
        const sx = star.x + parallaxX;
        const sy = star.y + parallaxY;
        if (star.size > 1.2) {
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 3);
          glow.addColorStop(0, `rgba(255, 247, 237, ${star.opacity * twinkle * 0.4})`);
          glow.addColorStop(1, 'rgba(255, 247, 237, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(sx - star.size * 3, sy - star.size * 3, star.size * 6, star.size * 6);
        }
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 247, 237, ${star.opacity * twinkle})`;
        ctx.fill();
      }

      if (Math.random() < 0.003 * intensity) {
        const angle = Math.PI / 4 + Math.random() * Math.PI / 4;
        const speed = 4 + Math.random() * 3;
        shootingStarsRef.current.push({
          x: Math.random() * cw() * 1.2 - cw() * 0.1,
          y: Math.random() * ch() * 0.3,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          tail: 30 + Math.random() * 40,
        });
      }
      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const s = shootingStarsRef.current[i]!;
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life > s.maxLife) { shootingStarsRef.current.splice(i, 1); continue; }
        const progress = s.life / s.maxLife;
        const alpha = (1 - progress) * 0.8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * s.tail * (1 - progress), s.y - s.vy * s.tail * (1 - progress));
        ctx.strokeStyle = `rgba(255, 247, 237, ${alpha})`;
        ctx.lineWidth = 1.5 * (1 - progress);
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(212, 175, 55, ${0.04 * intensity})`;
      ctx.lineWidth = 0.5;
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const si = stars[i]!;
          const sj = stars[j]!;
          const dx = si.x - sj.x;
          const dy = si.y - sj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
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
        p.life++;
        if (p.life > p.maxLife) {
          p.x = Math.random() * cw();
          p.y = Math.random() * ch();
          p.life = 0;
          p.maxLife = 300 + Math.random() * 200;
        }
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 75%, ${p.opacity})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 70%, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.85 }} />;
}
