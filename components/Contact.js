"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Section";
import { profile } from "../data/content";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact__glow" aria-hidden="true" />

      <div className="contact__inner">
        <Reveal as="p" className="contact__kicker">
          <span>08</span> Contact
        </Reveal>

        <Reveal as="h2" delay={0.05} className="contact__title">
          Let&apos;s build software people can <em>trust.</em>
        </Reveal>

        <Reveal as="p" delay={0.12} className="contact__text">
          I&apos;m looking for opportunities in QA and software testing. The fastest way to reach me is email.
        </Reveal>

        <Reveal delay={0.2} className="contact__email">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <button onClick={copy} className="btn btn--small" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "y" : "n"}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {copied ? "Copied ✓" : "Copy email"}
              </motion.span>
            </AnimatePresence>
          </button>
        </Reveal>

        <Reveal delay={0.3} className="contact__grid">
          <div className="contact__item">
            <h3>Phone</h3>
            <a href={`tel:${profile.phone}`}>{profile.phone}</a>
          </div>
          <div className="contact__item">
            <h3>LinkedIn</h3>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              {profile.linkedinLabel}
            </a>
          </div>
          {profile.github && (
            <div className="contact__item">
              <h3>GitHub</h3>
              <a href={profile.github} target="_blank" rel="noreferrer">
                {profile.github.replace("https://", "")}
              </a>
            </div>
          )}
          <div className="contact__item">
            <h3>Location</h3>
            <p>{profile.address}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
