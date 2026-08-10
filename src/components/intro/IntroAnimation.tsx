"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Particle {
  sx: number; sy: number;
  tx: number; ty: number;
  x: number;  y: number;
  size: number;
  speed: number;
  delay: number;
  color: string;
  alpha: number;
  progress: number;
  angle: number;
  orbitR: number;
  orbitSpeed: number;
  trail: { x: number; y: number }[];
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const COLORS = [
  "#a855f7","#9333ea","#8b5cf6","#c084fc",
  "#7c3aed","#d946ef","#a78bfa","#e879f9",
];

// ─── Easing ───────────────────────────────────────────────────────────────────

const easeInQuint  = (t: number) => t * t * t * t * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp         = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Component ───────────────────────────────────────────────────────────────

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const startRef     = useRef<number>(0);
  const psRef        = useRef<Particle[]>([]);

  // Build particles deterministically so SSR/client match
  const buildParticles = useCallback((W: number, H: number): Particle[] => {
    const cx = W / 2;
    const cy = H / 2;
    const list: Particle[] = [];
    const seed = (n: number, m: number) => ((n * 1664525 + 1013904223) & 0xffffffff) % m;

    for (let i = 0; i < 200; i++) {
      const zone = i % 8;
      let sx = 0, sy = 0;

      // 0=TL corner, 1=TR, 2=BL, 3=BR, 4=top edge, 5=bottom, 6=left, 7=right
      const r1 = seed(i * 7 + 1, 1000) / 1000;
      const r2 = seed(i * 13 + 3, 1000) / 1000;

      if      (zone === 0) { sx = W * r1 * 0.25;            sy = H * r2 * 0.25; }
      else if (zone === 1) { sx = W * (0.75 + r1 * 0.25);   sy = H * r2 * 0.25; }
      else if (zone === 2) { sx = W * r1 * 0.25;            sy = H * (0.75 + r2 * 0.25); }
      else if (zone === 3) { sx = W * (0.75 + r1 * 0.25);   sy = H * (0.75 + r2 * 0.25); }
      else if (zone === 4) { sx = W * r1;                    sy = H * r2 * 0.1; }
      else if (zone === 5) { sx = W * r1;                    sy = H * (0.9 + r2 * 0.1); }
      else if (zone === 6) { sx = W * r1 * 0.1;             sy = H * r2; }
      else                 { sx = W * (0.9 + r1 * 0.1);     sy = H * r2; }

      const tx = cx + (r1 - 0.5) * 24;
      const ty = cy + (r2 - 0.5) * 24;

      list.push({
        sx, sy, tx, ty, x: sx, y: sy,
        size:       1.0 + r1 * 2.5,
        speed:      0.45 + r2 * 0.65,
        delay:      r1 * 1.3,
        color:      COLORS[seed(i, COLORS.length)],
        alpha:      0,
        progress:   0,
        angle:      r1 * Math.PI * 2,
        orbitR:     12 + r2 * 70,
        orbitSpeed: (0.4 + r1 * 0.8) * (i % 2 === 0 ? 1 : -1),
        trail:      [],
      });
    }
    return list;
  }, []);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    const logo      = logoRef.current;
    if (!canvas || !container || !logo) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W   = window.innerWidth;
    const H   = window.innerHeight;
    const cx  = W / 2;
    const cy  = H / 2;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    psRef.current = buildParticles(W, H);

    // ── GSAP logo elements ──────────────────────────────────────────────────
    const iconEl = logo.querySelector<HTMLElement>(".ii-icon");
    const textEl = logo.querySelector<HTMLElement>(".ii-text");
    const glowEl = logo.querySelector<HTMLElement>(".ii-glow");
    const wrapEl = logo.querySelector<HTMLElement>(".ii-wrap");

    gsap.set([iconEl, textEl, glowEl], { opacity: 0 });
    gsap.set(iconEl, { scale: 0, filter: "blur(16px)" });
    gsap.set(textEl, { x: 24, filter: "blur(8px)" });
    gsap.set(glowEl, { scale: 0 });
    gsap.set(wrapEl, { scale: 1 });

    const tl = gsap.timeline({ paused: true });

    // Glow burst from center
    tl.to(glowEl, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }, 0);
    // Icon: scale + blur clear
    tl.to(iconEl, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.7)" }, 0.08);
    // Text slides in
    tl.to(textEl, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, 0.28);
    // Glow breathe
    tl.to(glowEl, { opacity: 0.45, scale: 1.6, duration: 1.0, ease: "sine.inOut" }, 0.6);
    // Cinematic zoom
    tl.to(wrapEl, { scale: 1.22, duration: 2.3, ease: "power1.inOut" }, 0.7);
    // Fade entire container out
    tl.to(container, { opacity: 0, duration: 0.55, ease: "power2.inOut", onComplete }, 3.1);

    // ── Animation loop ──────────────────────────────────────────────────────
    // Timeline (seconds):
    //  0.00 – 0.80  dark background, particles spawn at edges
    //  0.80 – 2.30  particles rush to center with trails & glow
    //  2.30 – 2.80  particles orbit/dissolve, energy glow peaks
    //  2.80          logo materializes (GSAP tl starts)
    //  2.80 – 5.80  logo + zoom + particles dissolve
    //  ~5.80         onComplete

    const T_RUSH    = 0.85;
    const T_CONV    = 2.30;
    const T_LOGO    = 2.75;
    const T_END     = 5.85;

    let logoFired = false;
    startRef.current = performance.now();

    const drawGlow = (t: number) => {
      const gp = Math.min(1, (t - T_RUSH) / (T_CONV - T_RUSH));
      const ge = easeOutCubic(gp);
      const a  = ge * 0.5;
      const r  = ge * 320;
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g2.addColorStop(0,   `rgba(168,85,247,${a})`);
      g2.addColorStop(0.35, `rgba(139,92,246,${a * 0.55})`);
      g2.addColorStop(0.7,  `rgba(109,40,217,${a * 0.2})`);
      g2.addColorStop(1,    `rgba(109,40,217,0)`);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;

      // Clear
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#050814";
      ctx.fillRect(0, 0, W, H);

      // Central energy glow
      if (t > T_RUSH) drawGlow(t);

      // Particles
      for (const p of psRef.current) {
        const lt = t - p.delay;
        if (lt < 0) continue;

        if (t < T_RUSH) {
          // Idle spawn: appear at start position, gentle sway
          const sp = Math.min(1, lt / 0.5);
          p.alpha  = sp * (0.5 + Math.sin(lt * 2 + p.angle) * 0.25);
          const fx = p.sx + Math.sin(lt * 1.4 + p.angle) * 3;
          const fy = p.sy + Math.cos(lt * 1.1 + p.angle) * 3;
          drawPx(ctx, fx, fy, p.size, p.color, p.alpha, 3);
        } else {
          // Rush phase
          const re = t - T_RUSH;
          const rd = (T_CONV - T_RUSH) / p.speed;
          p.progress = Math.min(1, re / rd);
          const te   = easeInQuint(p.progress);
          const px   = lerp(p.sx, p.tx, te);
          const py   = lerp(p.sy, p.ty, te);

          // Trail (keep 10 points)
          p.trail.push({ x: px, y: py });
          if (p.trail.length > 10) p.trail.shift();
          p.trail.forEach((tp, j) => {
            const ta = (j / p.trail.length) * 0.3;
            drawPx(ctx, tp.x, tp.y, p.size * 0.55, p.color, ta, 1.5);
          });

          if (p.progress >= 1) {
            // Orbit then dissolve
            const dissolveA = logoFired
              ? Math.max(0, 1 - (t - T_LOGO) / 2.2)
              : 0.85;
            p.alpha  = dissolveA;
            p.angle += p.orbitSpeed * 0.022;
            const orbitDecay = 1 - easeOutCubic(Math.min(1, (t - T_CONV) / 0.7));
            const ox = cx + Math.cos(p.angle) * p.orbitR * orbitDecay;
            const oy = cy + Math.sin(p.angle) * p.orbitR * orbitDecay;
            drawPx(ctx, ox, oy, p.size, p.color, p.alpha, 6);
          } else {
            p.alpha = 0.95;
            drawPx(ctx, px, py, p.size, p.color, p.alpha, 5);
          }
        }
      }

      // Fire logo
      if (t >= T_LOGO && !logoFired) {
        logoFired = true;
        tl.play();
      }

      if (t >= T_END) {
        cancelAnimationFrame(rafRef.current);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      tl.kill();
      gsap.killTweensOf([container, wrapEl, iconEl, textEl, glowEl]);
    };
  }, [buildParticles, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] overflow-hidden bg-[#050814]"
    >
      {/* Particle canvas — full screen */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Logo layer */}
      <div
        ref={logoRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        {/* Glow blob */}
        <div
          className="ii-glow absolute"
          style={{
            width: 320,
            height: 160,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(168,85,247,0.8) 0%, rgba(139,92,246,0.45) 35%, rgba(109,40,217,0.15) 65%, transparent 100%)",
            filter: "blur(32px)",
          }}
        />

        {/* Logo composition */}
        <div className="ii-wrap relative flex items-center gap-3">
          {/* Icon box */}
          <span
            className="ii-icon relative flex h-12 w-12 items-center justify-center rounded-xl text-white"
            style={{
              background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)",
              boxShadow:
                "0 0 40px 10px rgba(147,51,234,0.75), 0 0 12px 3px rgba(168,85,247,0.5), inset 0 0 10px 2px rgba(196,132,252,0.2)",
            }}
          >
            {/* BrainCircuit SVG inline */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28" height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
              <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
              <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
              <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
              <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
              <path d="M6 18a4 4 0 0 1-1.967-.516"/>
              <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
            </svg>
          </span>

          {/* Brand text */}
          <span
            className="ii-text whitespace-nowrap text-3xl font-bold tracking-tight"
            style={{
              color: "#f0ebff",
              textShadow: "0 0 22px rgba(168,85,247,0.65), 0 0 8px rgba(168,85,247,0.4)",
            }}
          >
            Interview
            <span style={{ color: "#c084fc", textShadow: "0 0 28px rgba(192,132,252,0.9)" }}>
              AI
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Draw helper (outside component to avoid re-creation) ─────────────────────

function drawPx(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  color: string,
  alpha: number,
  glow: number,
) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  if (glow > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur  = size * glow;
  }
  ctx.fillStyle = color;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.restore();
}

