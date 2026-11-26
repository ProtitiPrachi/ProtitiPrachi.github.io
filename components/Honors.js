"use client";

import { motion } from "framer-motion";
import Section from "./Section";
import { honors } from "../data/content";

const grid = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const card = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22 } },
};

function Medal() {
  return (
    <svg viewBox="0 0 40 40" className="honor__medal" aria-hidden="true">
      <path d="M13 3 L20 15 L27 3" />
      <circle cx="20" cy="25" r="11" />
      <path d="M20 19.5 l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" />
    </svg>
  );
}

export default function Honors() {
  return (
    <Section
      id="honors"
      index="06"
      kicker="Honors"
      title="Proof of work."
      intro="Awards, certificates and the rooms I was lucky to be in."
    >
      <motion.ul
        className="honors"
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {honors.map((h) => (
          <motion.li key={h.title} className="honor" variants={card} whileHover={{ y: -5 }}>
            <Medal />
            <h3>{h.title}</h3>
            <p>{h.by}</p>
            {(h.certificate || h.certificateLink) && (
              <a
                href={h.certificate || h.certificateLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn--small honor__cert"
              >
                Certificate
              </a>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}
