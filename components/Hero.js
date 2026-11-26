"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile } from "../data/content";
import Marquee from "./Marquee";

const letter = {
  hidden: { y: "110%", rotate: 6 },
  show: (i) => ({
    y: "0%",
    rotate: 0,
    transition: { delay: 0.12 + i * 0.03, type: "spring", stiffness: 190, damping: 21 },
  }),
};

function SplitWord({ word, offset, className }) {
  return (
    <span className={`hero__word ${className || ""}`} aria-hidden="true">
      {word.split("").map((ch, i) => (
        <span className="hero__clip" key={i}>
          <motion.span className="hero__char" custom={offset + i} variants={letter}>
            {ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function RoleRotator() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % profile.roles.length), 2800);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <span className="hero__rotate" aria-live="polite">
      <motion.span
        key={profile.roles[index]}
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.32 }}
      >
        {profile.roles[index]}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const words = [profile.firstName, profile.middleName, profile.lastName];
  let offset = 0;

  return (
    <section id="hero" className="hero" ref={ref}>
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__inner">
        <motion.div className="hero__text" style={{ y: textY, opacity: fade }}>
          <motion.p
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span>
              <span className="dot" style={{ animation: "none" }} />
              Dhaka, Bangladesh
            </span>
            <span>B.Sc. CSE · AIUB · 2027</span>
            <em>QA engineering</em>
          </motion.p>

          <motion.h1 className="hero__name" initial="hidden" animate="show" aria-label={words.join(" ")}>
            {words.map((w, wi) => {
              const el = (
                <SplitWord key={w} word={w} offset={offset} className={wi === 1 ? "hero__word--outline" : ""} />
              );
              offset += w.length;
              return el;
            })}
          </motion.h1>

          <motion.p
            className="hero__roles"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
          >
            I&apos;m a <RoleRotator />
          </motion.p>

          <motion.p
            className="hero__pitch"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88, duration: 0.6 }}
          >
            {profile.pitch}
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.02, duration: 0.6 }}
          >
            <a href="#projects" className="btn btn--solid">
              View selected work
              <span aria-hidden="true">↘</span>
            </a>
            <a href={profile.cv} className="btn" target="_blank" rel="noreferrer">
              Download CV
            </a>
          </motion.div>

          <motion.div
            className="hero__meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25, duration: 0.6 }}
          >
            <span>3 research papers</span>
            <span>4 builds shipped</span>
            <span>CGPA 3.80</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__scene"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <motion.figure
            className="portrait"
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="portrait__frame">
              <img src={profile.photo} alt={profile.photoAlt} />
            </div>
            <figcaption className="portrait__badge">
              <i aria-hidden="true" /> {profile.roles[0]}
            </figcaption>
          </motion.figure>
        </motion.div>
      </div>

      <motion.div
        className="hero__ticker"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
      >
        <Marquee
          items={[
            "Quality assurance",
            "Selenium",
            "Test automation",
            "Research",
            "Attention to detail",
            "Clean ship",
          ]}
        />
      </motion.div>
    </section>
  );
}
