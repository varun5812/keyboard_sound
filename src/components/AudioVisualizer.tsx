import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const BAR_COUNT = 32;

export const AudioVisualizer: React.FC = () => {
  const { settings, activityLevel, lastKeyTime } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(0));
  const animRef = useRef<number>(0);

  const theme = settings.selectedThemeId;

  const THEME_COLORS: Record<string, [string, string]> = {
    rain: ['#4A90D9', '#7BB8F0'],
    ocean: ['#1D9BF0', '#4DC8FF'],
    forest: ['#27AE60', '#58D68D'],
    piano: ['#9B59B6', '#C39BD3'],
    mechanical: ['#E67E22', '#F0A06A'],
    bubbles: ['#00BCD4', '#4DD0E1'],
    magical: ['#F39C12', '#F8C471'],
    typewriter: ['#C0392B', '#E74C3C'],
    cafe: ['#8D6E63', '#BCAAA4'],
    space: ['#6C5CE7', '#A29BFE'],
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const bars = barsRef.current;
      const [c1, c2] = THEME_COLORS[theme] ?? ['#6C5CE7', '#A29BFE'];

      // Decay existing bars
      const decayRate = settings.isEnabled ? 8 : 20;
      for (let i = 0; i < BAR_COUNT; i++) {
        bars[i] = Math.max(0, bars[i] - dt * decayRate);
      }

      // Excite bars based on last key time
      const timeSinceKey = performance.now() - lastKeyTime;
      if (timeSinceKey < 150 && settings.isEnabled && !settings.isMuted) {
        const excitement = Math.max(0, 1 - timeSinceKey / 150);
        const center = Math.floor(BAR_COUNT / 2) + Math.floor(Math.random() * 6 - 3);
        const spread = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < BAR_COUNT; i++) {
          const dist = Math.abs(i - center);
          if (dist < spread) {
            const bump = excitement * (1 - dist / spread) * (0.6 + Math.random() * 0.4) * activityLevel;
            bars[i] = Math.min(1, bars[i] + bump);
          }
        }
      }

      // Draw bars
      const barW = W / BAR_COUNT;
      for (let i = 0; i < BAR_COUNT; i++) {
        const barH = bars[i] * H * 0.85;
        const x = i * barW;
        const y = H - barH;

        const grad = ctx.createLinearGradient(x, y, x, H);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2 + '60');
        ctx.fillStyle = grad;

        const radius = Math.min(barW * 0.3, 3);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barW - radius - 1, y);
        ctx.quadraticCurveTo(x + barW - 1, y, x + barW - 1, y + radius);
        ctx.lineTo(x + barW - 1, H);
        ctx.lineTo(x, H);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Mirror bar (top half, flipped)
        const mirrorH = barH * 0.4;
        const mirrorY = H - barH - mirrorH - 2;
        const mirrorGrad = ctx.createLinearGradient(x, mirrorY, x, mirrorY + mirrorH);
        mirrorGrad.addColorStop(0, c1 + '10');
        mirrorGrad.addColorStop(1, c1 + '40');
        ctx.fillStyle = mirrorGrad;
        if (mirrorH > 1) {
          ctx.fillRect(x, mirrorY, barW - 1, mirrorH);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [theme, settings.isEnabled, settings.isMuted, lastKeyTime, activityLevel]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="audio-visualizer"
      style={{ width: '100%', height: '100%' }}
      aria-label="Audio visualizer"
    />
  );
};
