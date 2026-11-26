"use client";

import { MotionConfig } from "framer-motion";
import Atmosphere from "../components/Atmosphere";
import Marquee from "../components/Marquee";
import Nav from "../components/Nav";
import Hero from "../components/Hero";
import About from "../components/About";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Research from "../components/Research";
import Education from "../components/Education";
import Honors from "../components/Honors";
import Beyond from "../components/Beyond";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { marquee } from "../data/content";

export default function Home() {
  return (
    // reducedMotion="user" turns animations off for people who ask their OS for less motion
    <MotionConfig reducedMotion="user">
      <Atmosphere />
      <Nav />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Research />
        <Education />
        <Honors />
        <Beyond />
        <Marquee
          items={marquee}
          className="marquee--invert"
          speed={26}
        />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
