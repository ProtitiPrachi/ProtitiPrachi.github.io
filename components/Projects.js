"use client";

import { motion } from "framer-motion";
import Section from "./Section";
import SkillMark from "./SkillMark";
import { projects, testingShowcase } from "../data/content";

function ProjectCard({ p, index }) {
  return (
    <motion.article
      className={`project ${index === 0 ? "project--feature" : ""}`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.07, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <figure className="project__figure">
        <img src={p.image} alt={`Overview of ${p.name}: ${p.kind}`} />
        <span className="project__index">0{index + 1}</span>
        <span className="project__kind">{p.kind}</span>
      </figure>

      <div className="project__body">
        <div className="project__top">
          <h3>{p.name}</h3>
          <p className="project__date">
            {p.date}
            <small>{p.duration}</small>
          </p>
        </div>

        <p className="project__overview">{p.overview}</p>

        <ul className="project__points">
          {p.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>

        <ul className="project__stack">
          {p.stack.map((s) => (
            <li className="tag" key={s}>
              <SkillMark name={s} />
              {s}
            </li>
          ))}
        </ul>

        {(p.github || p.live) && (
          <div className="project-card__links">
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer" className="btn btn--small btn--solid">
                View code
              </a>
            )}
            {p.live && (
              <a href={p.live} target="_blank" rel="noreferrer" className="btn btn--small">
                Live demo
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default function Projects() {
  return (
    <Section
      id="projects"
      index="03"
      kicker="Projects"
      className="section--wide"
      title="Selected work."
      intro="Four builds across web, desktop and databases — each one shipped end to end."
    >
      <div className="projects">
        {projects.map((p, i) => (
          <ProjectCard key={p.name} p={p} index={i} />
        ))}

        <article className="showcase">
          <span className="showcase__status">{testingShowcase.status}</span>
          <h3>{testingShowcase.name}</h3>
          <p>{testingShowcase.text}</p>
        </article>
      </div>
    </Section>
  );
}
