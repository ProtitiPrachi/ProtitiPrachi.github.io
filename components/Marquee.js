// Repeating ticker band. The items are rendered three times so the CSS
// translate loop (-33.333%) lands on an identical frame and loops seamlessly.
export default function Marquee({ items, className = "", speed = 38 }) {
  const row = [...items, ...items, ...items];

  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }}>
        {row.map((item, i) => (
          <span className="marquee__item" key={`${item}-${i}`}>
            {item}
            <i>✳</i>
          </span>
        ))}
      </div>
    </div>
  );
}
