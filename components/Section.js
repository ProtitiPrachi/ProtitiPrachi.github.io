"use client";

import { motion } from "framer-motion";

// Two-column section: title sticks on the left while content scrolls on the right.
export default function Section({ id, index, kicker, title, intro, children, className = "" }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="section__inner">
        <motion.header
          className="section__head"
          initial={{ opacity: 0, x: -22 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <p className="section__kicker">
            <span className="section__index">{index}</span>
            {kicker}
          </p>
          <h2 className="section__title">{title}</h2>
          {intro && <p className="section__intro">{intro}</p>}
          <motion.span
            className="section__rule"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.header>
        <div className="section__body">{children}</div>
      </div>
    </section>
  );
}

export function Reveal({ children, delay = 0, y = 24, className, as = "div" }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}
