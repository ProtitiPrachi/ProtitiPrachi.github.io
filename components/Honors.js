"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Section from "./Section";
import { honors } from "../data/content";

const grid = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const card = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22 } },
};

const isImage = (path) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(path ?? "");

/** What to show on the back: the image itself, or for a PDF the page-1 preview the deploy workflow renders next to it. */
function previewOf(file) {
  if (isImage(file)) return file;
  if (/\.pdf$/i.test(file ?? "")) return `${file}.png`;
  return "";
}

function Medal() {
  return (
    <svg viewBox="0 0 40 40" className="honor__medal" aria-hidden="true">
      <path d="M13 3 L20 15 L27 3" />
      <circle cx="20" cy="25" r="11" />
      <path d="M20 19.5 l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" />
    </svg>
  );
}

/** One honor. With a certificate it is a two-sided card that turns over to show it. */
function Honor({ h }) {
  const [flipped, setFlipped] = useState(false);
  const [noPreview, setNoPreview] = useState(false);
  const cert = h.certificate || h.certificateLink;
  const preview = noPreview ? "" : previewOf(h.certificate);
  const img = useRef(null);

  // The static page can fail to load the image before React attaches onError, so check once on mount too.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setNoPreview(true);
  }, []);

  return (
    <motion.li className={`honor ${flipped ? "is-flipped" : ""}`} variants={card} whileHover={flipped ? undefined : { y: -5 }}>
      <div className="honor__flip">
        <div className="honor__face honor__front" inert={flipped}>
          <Medal />
          <h3>{h.title}</h3>
          <p>{h.by}</p>
          {cert && (
            <button type="button" className="honor__turn" onClick={() => setFlipped(true)} aria-expanded={flipped}>
              View certificate <span aria-hidden="true">↻</span>
            </button>
          )}
        </div>

        {cert && (
          <div className="honor__face honor__back" inert={!flipped} aria-label={`${h.title} certificate`}>
            {preview ? (
              <img ref={img} src={preview} alt={`${h.title} certificate`} onError={() => setNoPreview(true)} />
            ) : (
              <div className="honor__doc">
                <Medal />
                <strong>{h.title}</strong>
                <span>{h.certificate ? "Certificate (PDF)" : "Online certificate"}</span>
              </div>
            )}
            <div className="honor__back-bar">
              <a href={cert} target="_blank" rel="noreferrer">
                {preview ? "Open full size" : "Open certificate"} ↗
              </a>
              <button type="button" onClick={() => setFlipped(false)}>
                <span aria-hidden="true">↺</span> Back
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.li>
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
          <Honor key={h.title} h={h} />
        ))}
      </motion.ul>
    </Section>
  );
}
