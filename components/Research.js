"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Section, { Reveal } from "./Section";
import { research } from "../data/content";

export default function Research() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.78", "end 0.6"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <Section
      id="research"
      index="04"
      kicker="Research"
      title="Questions, tested."
      intro="Three papers and abstracts — because trusting a result requires checking it twice."
    >
      <ol className="timeline" ref={ref}>
        <span className="timeline__track" aria-hidden="true">
          <motion.span className="timeline__fill" style={{ scaleY: fill }} />
        </span>

        {research.map((r, i) => (
          <Reveal as="li" key={r.title} delay={0.05 * i} className="timeline__item">
            <motion.span
              className="timeline__dot"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              aria-hidden="true"
            />
            <div className="timeline__card">
              <p className="timeline__meta">
                <span className="timeline__year">{r.year}</span>
                <span className={`timeline__status ${r.status === "Paper accepted" ? "is-new" : ""}`}>
                  {r.status}
                </span>
              </p>
              <h3 className="timeline__title">{r.title}</h3>
              <p className="timeline__venue">{r.venue}</p>
              <p className="timeline__summary">{r.summary}</p>
              {r.link && (
                <a href={r.link} target="_blank" rel="noreferrer" className="btn btn--small timeline__link">
                  Read paper
                </a>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
