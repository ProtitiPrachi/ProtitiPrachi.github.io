"use client";

import Section, { Reveal } from "./Section";
import { education } from "../data/content";

export default function Education() {
  return (
    <Section
      id="education"
      index="05"
      kicker="Education"
      title="The road so far."
      intro="From school in Monohardi to computer science at AIUB."
    >
      <ol className="edu">
        {education.map((e, i) => (
          <Reveal as="li" key={e.degree} delay={0.07 * i} className="edu__item">
            <span className="edu__index">0{i + 1}</span>
            <div>
              <p className="edu__years">{e.years}</p>
              <h3 className="edu__degree">{e.degree}</h3>
              <p className="edu__school">{e.school}</p>
            </div>
            <span className="edu__result">{e.result}</span>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
