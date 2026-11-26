"use client";

import Section, { Reveal } from "./Section";
import SkillMark from "./SkillMark";
import { skills } from "../data/content";

const focus = ["Selenium WebDriver", "Test plans", "Bug reports", "API testing"];

export default function Skills() {
  return (
    <Section
      id="skills"
      index="02"
      kicker="Skills"
      title="The toolbox."
      intro="What I test with, what I write in, and how I think about a system."
    >
      <div className="skills">
        {skills.map((g, i) => (
          <Reveal key={g.group} delay={0.05 * i} className="skill-card">
            <span className="skill-card__n">{String(i + 1).padStart(2, "0")}</span>
            <div className="skill-card__head">
              <h3>{g.group}</h3>
              <p>{g.note}</p>
            </div>
            <ul className="tags">
              {g.items.map((s) => (
                <li className="tag" key={s}>
                  <SkillMark name={s} />
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}

        <Reveal delay={0.2} className="skill-card skill-card--focus">
          <div className="skill-card__head">
            <h3>Currently sharpening</h3>
            <p>Next on the bench</p>
          </div>
          <ul className="tags">
            {focus.map((s) => (
              <li className="tag" key={s}>
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
