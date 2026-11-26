"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import Section, { Reveal } from "./Section";
import { profile, stats } from "../data/content";

function Counter({ value, decimals }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState((0).toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals, reduce]);

  return <span ref={ref}>{display}</span>;
}

const facts = [
  { label: "Now", text: "B.Sc. CSE at AIUB, class of 2027" },
  { label: "Focus", text: "QA engineering, test automation, reliability" },
  { label: "Based in", text: profile.address },
];

export default function About() {
  return (
    <Section
      id="about"
      index="01"
      kicker="About"
      title="Curious by default."
      intro="Student, tester, researcher — with a bias for finding what breaks."
    >
      <Reveal as="p" className="about__lead">
        {profile.about}
      </Reveal>

      <Reveal as="p" delay={0.1} className="about__pull">
        Find the defect before the user does.
      </Reveal>

      <dl className="stats">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.06 * i} className="stats__item">
            <dt>{s.label}</dt>
            <dd>
              <Counter value={s.value} decimals={s.decimals} />
            </dd>
          </Reveal>
        ))}
      </dl>

      <ul className="about__facts">
        {facts.map((f, i) => (
          <Reveal as="li" key={f.label} delay={0.08 * i} className="about__fact">
            <span>{f.label}</span>
            <p>{f.text}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
