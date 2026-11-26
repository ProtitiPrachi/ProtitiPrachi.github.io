"use client";

import Section, { Reveal } from "./Section";
import { activities } from "../data/content";

export default function Beyond() {
  return (
    <Section
      id="beyond"
      index="07"
      kicker="Beyond code"
      title="Off the clock."
      intro="Clubs, volunteering and music."
    >
      <ul className="beyond__list">
          {activities.map((a, i) => (
            <Reveal as="li" key={a.org} delay={0.07 * i}>
              <span className="beyond__n">0{i + 1}</span>
              <div>
                <h3>{a.role}</h3>
                <p>{a.org}</p>
              </div>
            </Reveal>
          ))}
      </ul>
    </Section>
  );
}
