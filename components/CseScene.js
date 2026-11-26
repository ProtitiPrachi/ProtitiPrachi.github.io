"use client";

import { motion, useReducedMotion } from "framer-motion";

const tests = [
  { name: "sign-up flow", ms: 842 },
  { name: "job search filters", ms: 1204 },
  { name: "apply to listing", ms: 967 },
  { name: "saved jobs persist", ms: 613 },
];

const gates = ["0 regressions", "96% coverage", "0 blockers"];

export default function CseScene() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="scene"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      aria-hidden="true"
    >
      <div className="scene__halo" />

      <div className="scene__window">
        <div className="scene__bar">
          <span className="scene__dots">
            <i />
            <i />
            <i />
          </span>
          <span>qa-suite / job-portal</span>
          <span className="scene__live">
            <i />
            sample run
          </span>
        </div>

        <div className="scene__cmd">
          <span className="scene__prompt">$</span>
          <span>npm run test:e2e</span>
          <motion.span
            className="scene__caret"
            animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          />
        </div>

        <ul className="scene__tests">
          {tests.map((t, i) => (
            <motion.li
              key={t.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.18, duration: 0.4 }}
            >
              <span className="scene__check">✓</span>
              <span className="scene__name">{t.name}</span>
              <span className="scene__leader" />
              <span className="scene__ms">{t.ms}ms</span>
              <span className="scene__pass">PASS</span>
            </motion.li>
          ))}
        </ul>

        <div className="scene__summary">
          <div className="scene__summary-top">
            <span>24 checks</span>
            <strong>all passing</strong>
          </div>
          <div className="scene__bar-track">
            <motion.span
              className="scene__bar-fill"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
            />
          </div>
        </div>

        <div className="scene__gates">
          {gates.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
      </div>

      <motion.div
        className="scene__float scene__float--a"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>✓</span>
        suite green <b>just now</b>
      </motion.div>

      <motion.div
        className="scene__float scene__float--b"
        animate={reduce ? undefined : { y: [0, 9, 0] }}
        transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
        <span>◎</span>
        find defects early
      </motion.div>
    </motion.div>
  );
}
