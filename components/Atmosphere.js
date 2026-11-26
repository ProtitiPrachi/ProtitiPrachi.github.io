"use client";

import { useEffect, useRef } from "react";

// Fixed decorative layer: soft gradient orbs, film grain and a light that
// follows the pointer. Purely visual, so it is hidden from assistive tech.
export default function Atmosphere() {
  const light = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduce.matches || coarse.matches) return;

    const el = light.current;
    if (!el) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let raf = 0;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.09;
      pos.y += (target.y - pos.y) * 0.09;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    tick();

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="atmosphere" aria-hidden="true">
        <span className="atmosphere__orb atmosphere__orb--a" />
        <span className="atmosphere__orb atmosphere__orb--b" />
        <span className="atmosphere__orb atmosphere__orb--c" />
        <div ref={light} className="atmosphere__cursor" />
      </div>
      <div className="atmosphere__grain" aria-hidden="true" />
    </>
  );
}
