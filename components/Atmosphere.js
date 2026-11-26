"use client";

import { useEffect, useRef } from "react";

// Fixed decorative background, hidden from assistive tech:
// - ice-blue aurora clouds drifting slowly (CSS, see .atmosphere__aurora)
// - a fine engineering grid of slate dots (#CBD5E1), drawn on a canvas
// - a cobalt glow that follows the pointer with inertia (lerp); dots near it
//   light up and are pushed away, like iron filings near a magnet.

const GAP = 26; // px between dots
const DOT = 1.15; // dot radius
const REACH = 170; // px around the glow that dots react to
const PUSH = 14; // max px a dot is nudged away
const EASE = 0.08; // lerp factor: lower = more inertia
const BASE = [203, 213, 225]; // #CBD5E1
const LIT = [37, 99, 235]; // cobalt

/** How strongly a dot at distance d reacts: 1 at the centre, 0 at REACH, smooth in between. */
export function falloff(d) {
  if (d >= REACH) return 0;
  const t = 1 - d / REACH;
  return t * t * (3 - 2 * t); // smoothstep
}

export default function Atmosphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    let w = 0, h = 0, dpr = 1, raf = 0;
    const target = { x: -9999, y: -9999 };
    const pos = { x: -9999, y: -9999 };
    let active = false; // pointer has entered the page at least once

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // cobalt glow under the pointer
      if (active) {
        const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 320);
        g.addColorStop(0, "rgba(37, 99, 235, 0.12)");
        g.addColorStop(0.5, "rgba(37, 99, 235, 0.05)");
        g.addColorStop(1, "rgba(37, 99, 235, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(pos.x - 320, pos.y - 320, 640, 640);
      }

      // resting dots in one batch; dots near the glow are drawn one by one
      const near = [];
      ctx.beginPath();
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const dx = x - pos.x, dy = y - pos.y;
          const d = Math.hypot(dx, dy);
          const f = active ? falloff(d) : 0;
          if (f > 0.01) {
            near.push([x, y, dx, dy, d, f]);
          } else {
            ctx.moveTo(x + DOT, y);
            ctx.arc(x, y, DOT, 0, Math.PI * 2);
          }
        }
      }
      ctx.fillStyle = `rgb(${BASE})`;
      ctx.fill();

      for (const [x, y, dx, dy, d, f] of near) {
        const k = (PUSH * f) / (d || 1);
        const c = BASE.map((b, i) => Math.round(b + (LIT[i] - b) * f));
        ctx.beginPath();
        ctx.arc(x + dx * k, y + dy * k, DOT + f * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c}, ${0.55 + f * 0.45})`;
        ctx.fill();
      }
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * EASE;
      pos.y += (target.y - pos.y) * EASE;
      draw();
      // keep animating only while the glow is still catching up with the pointer
      raf = Math.hypot(target.x - pos.x, target.y - pos.y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!active) {
        active = true;
        pos.x = target.x;
        pos.y = target.y;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!still) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="atmosphere" aria-hidden="true">
      <span className="atmosphere__aurora atmosphere__aurora--a" />
      <span className="atmosphere__aurora atmosphere__aurora--b" />
      <span className="atmosphere__aurora atmosphere__aurora--c" />
      <canvas ref={canvasRef} className="atmosphere__canvas" />
    </div>
  );
}
