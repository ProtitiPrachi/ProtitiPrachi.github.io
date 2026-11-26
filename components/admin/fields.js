"use client";

import { useId, useState } from "react";
import { BASE_PATH } from "./github";

/* ------------------------------------------------------------ path helpers */

export const getIn = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);

/** Immutable set: copies only the objects along the path. */
export function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [k, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[k] = setIn(obj?.[k], rest, value);
  return copy;
}

const slug = (name) =>
  name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "file";
/** First 8 hex chars of the file's SHA-256. */
async function fingerprint(file) {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()));
  return Array.from(hash.slice(0, 4), (b) => b.toString(16).padStart(2, "0")).join("");
}

const ext = (name) => (name.match(/\.([a-z0-9]+)$/i)?.[1] ?? "bin").toLowerCase();

/** Where a site path (relative to public/) can be seen: a staged upload, or the deployed file. */
export const previewUrl = (sitePath, uploads) =>
  uploads[sitePath]?.url ?? (sitePath ? `${BASE_PATH}/${sitePath}` : "");

/* ------------------------------------------------------------------ fields */

function Tags({ value = [], onChange, placeholder }) {
  const [text, setText] = useState("");
  const add = () => {
    const parts = text.split(",").map((t) => t.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts]);
    setText("");
  };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="adm-tags">
      {value.map((t, i) => (
        <span className="adm-chip" key={`${t}-${i}`}>
          <button type="button" onClick={() => move(i, -1)} aria-label={`Move ${t} left`} disabled={i === 0}>‹</button>
          {t}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}>×</button>
        </span>
      ))}
      <input
        value={text}
        placeholder={placeholder ?? "Type and press Enter"}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !text && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

function FileField({ field, value, onChange, uploads, stage }) {
  const [error, setError] = useState("");
  const url = previewUrl(value, uploads);
  const isImage = /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(value ?? "");
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError("That file is over 20 MB. GitHub's API refuses files that big.");
      return;
    }
    setError("");
    // A fixed name ("cv") replaces the file in place, so links people already have keep working.
    // Everything else gets a fingerprint of its contents in the name: a new or fixed file always
    // has a new address, so no browser or GitHub Pages cache can keep showing the old one.
    const base = field.name ?? `${field.folder}/${slug(file.name)}-${await fingerprint(file)}`;
    const sitePath = `${base}.${ext(file.name)}`;
    await stage(sitePath, file);
    onChange(sitePath);
  };
  return (
    <div className="adm-file">
      {value && isImage ? <img src={url} alt="" /> : null}
      <div>
        <code>{value || "no file"}</code>
        {value ? (
          <a href={url} target="_blank" rel="noreferrer">open</a>
        ) : null}
        {uploads[value] ? <span className="adm-badge">new, publishes with your next save</span> : null}
        <label className="adm-btn adm-btn--small">
          {value ? "Replace…" : "Upload…"}
          <input type="file" accept={field.accept} onChange={pick} hidden />
        </label>
        {error ? <p className="adm-error">{error}</p> : null}
      </div>
    </div>
  );
}

export function FieldInput({ field, value, onChange, uploads, stage }) {
  const id = useId();
  let input;
  switch (field.type) {
    case "textarea":
      input = <textarea id={id} rows={field.rows ?? 3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      input = (
        <input
          id={id}
          type="number"
          step={field.step ?? 1}
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      );
      break;
    case "tags":
      input = <Tags value={value} onChange={onChange} placeholder={field.placeholder} />;
      break;
    case "lines":
      input = (
        <textarea
          id={id}
          rows={Math.max(3, (value?.length ?? 0) + 1)}
          value={(value ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={() => onChange((value ?? []).map((l) => l.trim()).filter(Boolean))}
        />
      );
      break;
    case "file":
      input = <FileField field={field} value={value} onChange={onChange} uploads={uploads} stage={stage} />;
      break;
    default:
      input = (
        <input
          id={id}
          type={field.type === "url" ? "url" : "text"}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          // "example.com" would be read as a page on this site; links need their https://
          onBlur={field.type === "url" ? () => value && !/^[a-z][a-z+.-]*:/i.test(value) && onChange(`https://${value.trim()}`) : undefined}
        />
      );
  }
  return (
    <div className={`adm-field ${field.wide ? "adm-field--wide" : ""}`}>
      <label htmlFor={id}>{field.label}</label>
      {input}
      {field.hint ? <small>{field.hint}</small> : null}
    </div>
  );
}

function FieldGrid({ fields, obj, path, edit, uploads, stage }) {
  return (
    <div className="adm-grid">
      {fields.map((f) => (
        <FieldInput
          key={f.key}
          field={f}
          value={obj?.[f.key]}
          onChange={(v) => edit([...path, f.key], v)}
          uploads={uploads}
          stage={stage}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ blocks */

function ListBlock({ block, data, edit, uploads, stage }) {
  const items = getIn(data, block.path) ?? [];
  const [open, setOpen] = useState(null);
  const set = (next) => edit(block.path, next);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
    if (open === i) setOpen(j);
  };
  return (
    <section className="adm-card">
      <header className="adm-card__head">
        <div>
          <h3>{block.title}</h3>
          {block.description ? <p>{block.description}</p> : null}
        </div>
        <button
          type="button"
          className="adm-btn adm-btn--small"
          onClick={() => {
            set([...items, block.blank()]);
            setOpen(items.length);
          }}
        >
          + Add {block.itemName}
        </button>
      </header>
      {items.length === 0 ? <p className="adm-muted">Nothing here yet.</p> : null}
      <ol className="adm-list">
        {items.map((item, i) => {
          const sum = block.summary(item);
          const isOpen = open === i;
          return (
            <li key={i} className={isOpen ? "is-open" : ""}>
              <div className="adm-list__row">
                <button type="button" className="adm-list__title" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <strong>{sum.title || `Untitled ${block.itemName}`}</strong>
                  {sum.meta ? <span>{sum.meta}</span> : null}
                </button>
                <div className="adm-list__tools">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                  <button
                    type="button"
                    onClick={() => set([...items.slice(0, i + 1), structuredClone(item), ...items.slice(i + 1)])}
                    aria-label="Duplicate"
                    title="Duplicate"
                  >⧉</button>
                  <button
                    type="button"
                    className="adm-danger"
                    aria-label="Delete"
                    title="Delete"
                    onClick={() => {
                      if (window.confirm(`Delete “${sum.title || block.itemName}”?`)) {
                        set(items.filter((_, j) => j !== i));
                        setOpen(null);
                      }
                    }}
                  >🗑</button>
                </div>
              </div>
              {isOpen ? (
                <FieldGrid fields={block.fields} obj={item} path={[...block.path, i]} edit={edit} uploads={uploads} stage={stage} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function BlockView({ block, data, edit, uploads, stage }) {
  if (block.kind === "list") return <ListBlock block={block} data={data} edit={edit} uploads={uploads} stage={stage} />;
  return (
    <section className="adm-card">
      {block.title ? (
        <header className="adm-card__head">
          <div>
            <h3>{block.title}</h3>
            {block.description ? <p>{block.description}</p> : null}
          </div>
        </header>
      ) : null}
      <FieldGrid fields={block.fields} obj={getIn(data, block.path)} path={block.path} edit={edit} uploads={uploads} stage={stage} />
    </section>
  );
}
