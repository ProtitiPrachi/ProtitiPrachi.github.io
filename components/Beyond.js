"use client";

import Section, { Reveal } from "./Section";
import { activities, music } from "../data/content";

export default function Beyond() {
  return (
    <Section
      id="beyond"
      index="07"
      kicker="Beyond code"
      title="Off the clock."
      intro="Clubs, volunteering and a microphone."
    >
      <div className="beyond">
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

        <Reveal delay={0.15} className="music">
          <span className="music__tag">On stage</span>
          <div className="music__eq" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} style={{ "--i": i }} />
            ))}
          </div>
          <h3>
            {music.role} · {music.org}
          </h3>
          <p>{music.text}</p>
        </Reveal>
      </div>
    </Section>
  );
}
