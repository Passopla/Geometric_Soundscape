import { useEffect, useRef } from 'react';
import { POST_CONFIG } from '../sketches/post';

const GRAIN_POOL_SIZE = 6; // pre-baked grain frames to cycle through

export default function PostOverlay() {
  const glowRef  = useRef<HTMLCanvasElement>(null);
  const grainRef = useRef<HTMLCanvasElement>(null);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const glow  = glowRef.current!;
    const grain = grainRef.current!;
    const glowCtx  = glow.getContext('2d')!;
    const grainCtx = grain.getContext('2d', { willReadFrequently: false })!;

    // Pre-baked grain pool — regenerated on resize
    let grainPool: ImageData[] = [];
    let poolIdx = 0;
    let frameCount = 0;

    function buildGrainPool(w: number, h: number) {
      const cfg: typeof POST_CONFIG = (window as any).POST_CONFIG ?? POST_CONFIG;
      grainPool = [];
      for (let f = 0; f < GRAIN_POOL_SIZE; f++) {
        const img = new ImageData(w, h);
        const d = img.data;
        const density = cfg.grain;
        const total = w * h;
        for (let i = 0; i < total; i++) {
          if (Math.random() > density) continue;
          const v = (Math.random() * 180 + 60) | 0;
          const a = (Math.random() * 120 + 30) | 0;
          const idx = i * 4;
          d[idx]     = v;
          d[idx + 1] = v;
          d[idx + 2] = v;
          d[idx + 3] = a;
        }
        grainPool.push(img);
      }
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      glow.width  = grain.width  = w;
      glow.height = grain.height = h;
      buildGrainPool(w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    // Apply base blur once (rarely changes)
    function applyBaseBlur() {
      const cfg: typeof POST_CONFIG = (window as any).POST_CONFIG ?? POST_CONFIG;
      const el = document.getElementById('p5-wrapper');
      if (el) el.style.filter = cfg.blur > 0 ? `blur(${cfg.blur}px)` : '';
    }
    applyBaseBlur();
    const blurTimer = setInterval(applyBaseBlur, 1000);

    function tick() {
      const cfg: typeof POST_CONFIG = (window as any).POST_CONFIG ?? POST_CONFIG;
      frameCount++;

      // ── Bloom: blurred copy of full scene, screen-blended — update every other frame ──
      if (frameCount % 2 === 0) {
        const p5Canvas = (window as any).__p5Instance?.canvas as HTMLCanvasElement | undefined;
        glow.style.filter  = `brightness(3) blur(${cfg.bloomBlur}px)`;
        glow.style.opacity = String(cfg.bloomStrength);
        if (p5Canvas && cfg.bloomBlur > 0 && cfg.bloomStrength > 0) {
          glowCtx.clearRect(0, 0, glow.width, glow.height);
          glowCtx.drawImage(p5Canvas, 0, 0, glow.width, glow.height);
        } else {
          glowCtx.clearRect(0, 0, glow.width, glow.height);
        }
      }

      // ── Grain: cycle pre-baked frames ──
      if (cfg.grain > 0 && grainPool.length > 0) {
        poolIdx = (poolIdx + 1) % GRAIN_POOL_SIZE;
        grainCtx.putImageData(grainPool[poolIdx], 0, 0);
      } else {
        grainCtx.clearRect(0, 0, grain.width, grain.height);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(blurTimer);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={glowRef}
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{ mixBlendMode: 'screen' }}
      />
      <canvas
        ref={grainRef}
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{ mixBlendMode: 'overlay' }}
      />
    </>
  );
}
