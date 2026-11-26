"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { profile } from "../data/content";

const links = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export default function Nav() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const ids = ["hero", ...links.map((l) => l.id), "honors", "beyond"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            setActive(id === "honors" || id === "beyond" ? "education" : id === "hero" ? "" : id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <motion.div className="nav__progress" style={{ scaleX: progress }} />

      <div className="nav__inner">
        <a href="#hero" className="brand" aria-label="Back to top">
          <span className="brand__mark">P</span>
          <span className="brand__text">
            <strong>Protiti Prachi</strong>
            <small>QA · CSE</small>
          </span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          {links.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} className={`nav__link ${active === l.id ? "is-active" : ""}`}>
              {active === l.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="nav__pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="nav__label">
                <i>{String(i + 1).padStart(2, "0")}</i>
                {l.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="nav__end">
          <span className="nav__status">
            <span className="dot" />
            Open to QA roles
          </span>
          <button
            className={`nav__toggle ${open ? "is-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav__sheet"
            aria-label="Sections"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {links.map((l, i) => (
              <motion.a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
              >
                <i>{String(i + 1).padStart(2, "0")}</i>
                {l.label}
              </motion.a>
            ))}
            <div className="nav__sheet-foot">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <span>{profile.address}</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
