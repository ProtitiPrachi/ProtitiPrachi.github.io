// Layered, slowly drifting waves along the bottom of the hero.
// Each layer is a wide SVG that slides sideways in a seamless loop (see .waves in globals.css).
const wave =
  "M0 60 C 150 20 350 100 500 60 S 850 20 1000 60 S 1350 100 1500 60 S 1850 20 2000 60 V160 H0 Z";

export default function Waves() {
  return (
    <div className="waves" aria-hidden="true">
      {["waves__layer--back", "waves__layer--mid", "waves__layer--front"].map((cls) => (
        <svg key={cls} className={`waves__layer ${cls}`} viewBox="0 0 2000 160" preserveAspectRatio="none">
          <path d={wave} />
        </svg>
      ))}
      <div className="bubbles">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>
    </div>
  );
}
