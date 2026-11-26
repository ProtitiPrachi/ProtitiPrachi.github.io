const marks = {
  Selenium: { color: "#43b02a", label: "Se" },
  Debugging: { color: "#5ab4f0", label: "</>" },
  "Statistical analysis": { color: "#7fe0c2", label: "Σ" },
  "Attention to detail": { color: "#9ad7ff", label: "◎" },
  Java: { color: "#f89820", label: "Ja" },
  "C#": { color: "#9b4dca", label: "C#" },
  "C++": { color: "#5c8dff", label: "C++" },
  HTML: { color: "#e34f26", label: "5" },
  CSS: { color: "#3b82f6", label: "3" },
  JavaScript: { color: "#f7df1e", label: "JS", ink: "#1a2330" },
  MySQL: { color: "#00758f", label: "My" },
  "SQL Server": { color: "#e04b4b", label: "SQL" },
  OOP: { color: "#7fe0c2", label: "{ }" },
  "Database design": { color: "#5ab4f0", label: "DB" },
  "Query optimization": { color: "#6eecc4", label: "⚡" },
  "Problem-solving": { color: "#8fd6ff", label: "?" },
  "Team collaboration": { color: "#7fe0c2", label: "++" },
  Communication: { color: "#5ab4f0", label: "Hi" },
  React: { color: "#61dafb", label: "Re" },
  "Next.js": { color: "#e8eef2", label: "Nx", ink: "#0b2433" },
  FastAPI: { color: "#009688", label: "API" },
  PostgreSQL: { color: "#336791", label: "Pg" },
  PHP: { color: "#777bb4", label: "PHP" },
  WinForms: { color: "#5ab4f0", label: "Wf" },
  "Relational database": { color: "#7fe0c2", label: "DB" },
};

export default function SkillMark({ name }) {
  const mark = marks[name] || { color: "#7fe0c2", label: name.slice(0, 2) };
  return (
    <span
      className="mark"
      style={{ background: mark.color, color: mark.ink || "#062033" }}
      aria-hidden="true"
    >
      {mark.label}
    </span>
  );
}
