"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PAGES } from "./schema";
import { BlockView, setIn } from "./fields";
import { merge3 } from "./merge";
import {
  CONTENT_PATH, ConflictError, REPO, SITE_URL,
  commitChanges, contentHistory, deployRuns, fileToBase64, loadContent,
  redeploy, serialize, utf8ToBase64, verifyToken,
} from "./github";

const TOKEN_KEY = "portfolio-admin:token";
const DRAFT_KEY = "portfolio-admin:draft";

// Token lives in localStorage ("remember on this device") or sessionStorage (this tab only).
const store = {
  get: (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
  set: (k, v, persist) => (persist ? localStorage : sessionStorage).setItem(k, v),
  remove: (k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  },
};

function timeAgo(t) {
  const s = Math.round((Date.now() - new Date(t).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
}

function deployState(runs) {
  const run = runs?.[0];
  if (!runs) return { label: "deploy status unknown", tone: "muted", run };
  if (!run) return { label: "never deployed", tone: "muted", run };
  if (run.status !== "completed") return { label: "deploying…", tone: "warn", run };
  if (run.conclusion === "success") return { label: "live", tone: "ok", run };
  return { label: `deploy ${run.conclusion}`, tone: "bad", run };
}

export default function AdminApp() {
  const [phase, setPhase] = useState("boot"); // boot | login | loading | ready
  const [loginError, setLoginError] = useState("");
  const [token, setToken] = useState("");
  const [viewer, setViewer] = useState(null);
  const [base, setBase] = useState(null); // { content, sha } as on GitHub
  const [draft, setDraft] = useState(null);
  const [uploads, setUploads] = useState({}); // sitePath -> { base64, url }
  const [pageId, setPageId] = useState("dashboard");
  const [restore, setRestore] = useState(null);
  const [runs, setRuns] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState(null); // null | { confirm } | { error } | { done }
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);

  const flash = useCallback((text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3500);
  }, []);

  /* --------------------------------------------------------------- session */

  const open = useCallback(async (tok, remember) => {
    setPhase("loading");
    setLoginError("");
    try {
      const user = await verifyToken(tok);
      const loaded = await loadContent(tok);
      if (remember !== undefined) store.set(TOKEN_KEY, tok, remember);
      setToken(tok);
      setViewer(user);
      setBase(loaded);
      setDraft(loaded.content);
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        // drafts from before merging existed carry no base and cannot be merged safely
        if (!d.base) localStorage.removeItem(DRAFT_KEY);
        else {
          const merged = merge3(d.base, d.content, loaded.content);
          if (serialize(merged) !== serialize(loaded.content)) setRestore({ ...d, content: merged });
          else localStorage.removeItem(DRAFT_KEY);
        }
      }
      setPhase("ready");
    } catch (e) {
      store.remove(TOKEN_KEY);
      setLoginError(e.message);
      setPhase("login");
    }
  }, []);

  useEffect(() => {
    const saved = store.get(TOKEN_KEY);
    if (saved) open(saved);
    else setPhase("login");
  }, [open]);

  const refreshMeta = useCallback(async () => {
    if (!token) return;
    const [r, h] = await Promise.all([deployRuns(token), contentHistory(token).catch(() => [])]);
    setRuns(r);
    setHistory(h);
  }, [token]);

  // Poll deploy status: fast while a deploy runs, slow otherwise.
  const deploying = runs?.[0] && runs[0].status !== "completed";
  useEffect(() => {
    if (phase !== "ready") return;
    refreshMeta();
    const t = window.setInterval(refreshMeta, deploying ? 5000 : 30000);
    return () => window.clearInterval(t);
  }, [phase, refreshMeta, deploying]);

  /* ----------------------------------------------------------------- draft */

  const baseText = base ? serialize(base.content) : "";
  const draftText = draft ? serialize(draft) : "";
  const usedUploads = Object.keys(uploads).filter((p) => draftText.includes(JSON.stringify(p)));
  const dirty = baseText !== draftText || usedUploads.length > 0;

  const changedKeys = useMemo(() => {
    const keys = new Set();
    if (!base || !draft) return keys;
    for (const k of Object.keys(draft)) {
      if (JSON.stringify(draft[k]) !== JSON.stringify(base.content[k])) keys.add(k);
    }
    return keys;
  }, [base, draft]);

  // Local draft, so a closed tab or a crash never loses typing.
  useEffect(() => {
    if (phase !== "ready" || restore) return;
    const t = window.setTimeout(() => {
      if (dirty) localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: Date.now(), base: base.content, content: draft }));
      else localStorage.removeItem(DRAFT_KEY);
    }, 400);
    return () => window.clearTimeout(t);
  }, [phase, draft, dirty, restore, base]);

  useEffect(() => {
    const warn = (e) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const edit = useCallback((path, value) => setDraft((d) => setIn(d, path, value)), []);

  const stage = useCallback(async (sitePath, file) => {
    const base64 = await fileToBase64(file);
    setUploads((u) => ({ ...u, [sitePath]: { base64, url: URL.createObjectURL(file) } }));
  }, []);

  /* --------------------------------------------------------------- publish */

  const defaultMessage = () => {
    const names = PAGES.filter((p) => p.keys.some((k) => changedKeys.has(k))).map((p) => p.label);
    return names.length ? `Update ${names.join(", ")}` : "Update site content";
  };

  const publish = async () => {
    if (!draft || !base) return;
    setSaving(true);
    const message_ = (message || defaultMessage()).trim();
    const files = usedUploads.map((p) => ({ path: `public/${p}`, base64: uploads[p].base64 }));
    const save = (content, sha) =>
      commitChanges(token, {
        changes: [{ path: CONTENT_PATH, base64: utf8ToBase64(serialize(content)) }, ...files],
        message: message_,
        expectedSha: sha,
      });
    try {
      let content = draft;
      let res;
      try {
        res = await save(content, base.sha);
      } catch (e) {
        if (!(e instanceof ConflictError)) throw e;
        // GitHub has newer content (another tab, device or update): keep both, then save again.
        const latest = await loadContent(token);
        content = merge3(base.content, draft, latest.content);
        res = await save(content, latest.sha);
        flash("Merged your edits with newer changes from GitHub.");
      }
      setBase({ content, sha: res.contentSha });
      setDraft(content);
      setUploads({});
      setMessage("");
      localStorage.removeItem(DRAFT_KEY);
      setDialog({ done: res });
      window.setTimeout(refreshMeta, 3000);
    } catch (e) {
      setDialog({ error: e instanceof ConflictError ? "GitHub changed again while saving. Press Publish once more." : e.message });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) setDialog({ confirm: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving]);

  const logout = () => {
    if (dirty && !window.confirm("You have unsaved changes. They stay as a local draft on this device. Log out?")) return;
    store.remove(TOKEN_KEY);
    setToken("");
    setViewer(null);
    setBase(null);
    setDraft(null);
    setPhase("login");
  };

  /* ---------------------------------------------------------------- render */

  if (phase === "boot" || phase === "loading") {
    return <div className="adm-center"><p className="adm-muted">{phase === "loading" ? "Loading your content from GitHub…" : ""}</p></div>;
  }
  if (phase === "login" || !draft) return <Login error={loginError} onSubmit={open} />;

  const page = PAGES.find((p) => p.id === pageId);
  const deploy = deployState(runs);

  return (
    <div className="adm">
      <aside className="adm-side">
        <a className="adm-brand" href={SITE_URL} target="_blank" rel="noreferrer">
          <span>{(draft.profile.firstName?.[0] ?? "") + (draft.profile.lastName?.[0] ?? "")}</span>
          Portfolio admin
        </a>
        <nav>
          <NavItem active={pageId === "dashboard"} onClick={() => setPageId("dashboard")}>Dashboard</NavItem>
          <p className="adm-side__group">Content</p>
          {PAGES.map((p) => (
            <NavItem key={p.id} active={pageId === p.id} changed={p.keys.some((k) => changedKeys.has(k))} onClick={() => setPageId(p.id)}>
              {p.label}
            </NavItem>
          ))}
          <p className="adm-side__group">Advanced</p>
          <NavItem active={pageId === "raw"} onClick={() => setPageId("raw")}>Raw JSON</NavItem>
        </nav>
        <div className="adm-side__user">
          {viewer.avatar_url ? <img src={viewer.avatar_url} alt="" /> : null}
          <span>@{viewer.login}</span>
          <button type="button" className="adm-link" onClick={logout}>Log out</button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <a className={`adm-pill adm-pill--${deploy.tone}`} href={deploy.run?.html_url ?? `https://github.com/${REPO.owner}/${REPO.name}/actions`} target="_blank" rel="noreferrer">
            <i /> {deploy.label}
          </a>
          <span className="adm-spacer" />
          {dirty ? <span className="adm-muted">Unsaved changes</span> : <span className="adm-muted">All changes published</span>}
          <button
            type="button"
            className="adm-btn"
            disabled={!dirty}
            onClick={() => {
              if (window.confirm("Throw away all unpublished changes?")) {
                setDraft(base.content);
                setUploads({});
                localStorage.removeItem(DRAFT_KEY);
              }
            }}
          >
            Discard
          </button>
          <button type="button" className="adm-btn adm-btn--solid" disabled={!dirty || saving} onClick={() => setDialog({ confirm: true })}>
            Publish
          </button>
        </header>

        <main className="adm-content">
          {restore ? (
            <div className="adm-banner">
              <span><strong>Unsaved draft found</strong> from {timeAgo(restore.at)}.</span>
              <button type="button" className="adm-btn adm-btn--small adm-btn--solid" onClick={() => { setDraft(restore.content); setRestore(null); }}>Restore it</button>
              <button type="button" className="adm-btn adm-btn--small" onClick={() => { localStorage.removeItem(DRAFT_KEY); setRestore(null); }}>Discard draft</button>
            </div>
          ) : null}

          {pageId === "dashboard" ? (
            <Dashboard
              draft={draft}
              viewer={viewer}
              runs={runs}
              history={history}
              baseSha={base.sha}
              go={setPageId}
              onRedeploy={async () => {
                try {
                  await redeploy(token);
                  flash("Redeploy started.");
                  window.setTimeout(refreshMeta, 3000);
                } catch (e) {
                  flash(e.message);
                }
              }}
              onLoadVersion={async (sha) => {
                if (dirty && !window.confirm("Replace your unpublished changes with this older version?")) return;
                const old = await loadContent(token, sha);
                setDraft(old.content);
                flash("Older version loaded into the editor. Publish to make it live again.");
              }}
            />
          ) : pageId === "raw" ? (
            <RawEditor draft={draft} onApply={setDraft} flash={flash} />
          ) : (
            <>
              <div className="adm-head">
                <h1>{page.label}</h1>
                <p>{page.intro}</p>
              </div>
              {page.blocks.map((b, i) => (
                <BlockView key={`${page.id}-${i}`} block={b} data={draft} edit={edit} uploads={uploads} stage={stage} />
              ))}
            </>
          )}
        </main>
      </div>

      {dialog ? (
        <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && !saving && setDialog(null)}>
          <div className="adm-modal__box">
            {dialog.done ? (
              <>
                <h2>Published</h2>
                <p>Your changes are committed. The site rebuilds and goes live in about 1–2 minutes; the pill at the top turns green when it is done.</p>
                <p><a href={dialog.done.commitUrl} target="_blank" rel="noreferrer">See the commit on GitHub</a></p>
                <div className="adm-modal__actions"><button type="button" className="adm-btn adm-btn--solid" onClick={() => setDialog(null)}>OK</button></div>
              </>
            ) : dialog.error ? (
              <>
                <h2>Publishing failed</h2>
                <p className="adm-error">{dialog.error}</p>
                <p>Your edits are still here and saved as a local draft.</p>
                <div className="adm-modal__actions"><button type="button" className="adm-btn" onClick={() => setDialog(null)}>Close</button></div>
              </>
            ) : (
              <>
                <h2>Publish changes</h2>
                <p>
                  Changed: {PAGES.filter((p) => p.keys.some((k) => changedKeys.has(k))).map((p) => p.label).join(", ") || "files only"}
                  {usedUploads.length ? `, plus ${usedUploads.length} uploaded file${usedUploads.length > 1 ? "s" : ""}` : ""}.
                </p>
                <label className="adm-field adm-field--wide">
                  <span>Note for the history (optional)</span>
                  <input value={message} placeholder={defaultMessage()} onChange={(e) => setMessage(e.target.value)} />
                </label>
                <div className="adm-modal__actions">
                  <button type="button" className="adm-btn" onClick={() => setDialog(null)} disabled={saving}>Cancel</button>
                  <button type="button" className="adm-btn adm-btn--solid" onClick={publish} disabled={saving}>
                    {saving ? "Publishing…" : "Publish"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {toast ? <div className="adm-toast" role="status">{toast}</div> : null}
    </div>
  );
}

function NavItem({ active, changed, onClick, children }) {
  return (
    <button type="button" className={`adm-nav ${active ? "is-active" : ""}`} onClick={onClick} aria-current={active ? "page" : undefined}>
      {children}
      {changed ? <i className="adm-dot" title="Unpublished changes" /> : null}
    </button>
  );
}

function Login({ error, onSubmit }) {
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(true);
  return (
    <div className="adm-center">
      <form
        className="adm-login"
        onSubmit={(e) => {
          e.preventDefault();
          if (token.trim()) onSubmit(token.trim(), remember);
        }}
      >
        <h1>Portfolio admin</h1>
        <p className="adm-muted">
          Sign in with a GitHub token that can write to <code>{REPO.owner}/{REPO.name}</code>. Edits are published as
          commits and the site redeploys by itself.
        </p>
        <label className="adm-field adm-field--wide">
          <span>GitHub token</span>
          <input type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" autoFocus />
        </label>
        <label className="adm-check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember on this device
        </label>
        {error ? <p className="adm-error">{error}</p> : null}
        <button type="submit" className="adm-btn adm-btn--solid">Sign in</button>
      </form>
    </div>
  );
}

function Dashboard({ draft, viewer, runs, history, baseSha, go, onRedeploy, onLoadVersion }) {
  const counts = [
    { id: "projects", label: "projects", value: draft.projects.length },
    { id: "research", label: "papers", value: draft.research.length },
    { id: "skills", label: "skills", value: new Set(draft.skills.flatMap((g) => g.items)).size },
    { id: "honors", label: "honors", value: draft.honors.length },
    { id: "education", label: "education", value: draft.education.length },
    { id: "beyond", label: "activities", value: draft.activities.length },
  ];
  return (
    <>
      <div className="adm-head">
        <h1>Hi, {viewer.name?.split(" ")[0] ?? draft.profile.firstName} 👋</h1>
        <p>
          Pick a section on the left and edit it. Nothing goes live until you press <b>Publish</b> (or Ctrl+S); until then your
          edits are kept as a local draft on this device.
        </p>
      </div>
      <div className="adm-stats">
        {counts.map((c) => (
          <button type="button" key={c.id} className="adm-stat" onClick={() => go(c.id)}>
            <strong>{c.value}</strong>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <section className="adm-card">
        <header className="adm-card__head">
          <div>
            <h3>Deploys</h3>
            <p>
              Live site: <a href={SITE_URL} target="_blank" rel="noreferrer">{SITE_URL}</a>
            </p>
          </div>
          <button type="button" className="adm-btn adm-btn--small" onClick={onRedeploy}>Redeploy now</button>
        </header>
        {runs === null ? (
          <p className="adm-muted">
            Deploy status is not available. The token needs <b>Actions: Read and write</b>, and
            <code> .github/workflows/deploy.yml</code> must be on <code>main</code>.
          </p>
        ) : runs.length === 0 ? (
          <p className="adm-muted">No deploys yet.</p>
        ) : (
          <ul className="adm-rows">
            {runs.map((r) => {
              const st = deployState([r]);
              return (
                <li key={r.id}>
                  <span className={`adm-pill adm-pill--${st.tone}`}><i /> {st.label}</span>
                  <a href={r.html_url} target="_blank" rel="noreferrer">{r.display_title}</a>
                  <span className="adm-muted">{timeAgo(r.created_at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="adm-card">
        <header className="adm-card__head">
          <div>
            <h3>Version history</h3>
            <p>Every publish is a commit. Load an older one into the editor, then publish it to roll back.</p>
          </div>
        </header>
        <ul className="adm-rows">
          {history.map((c, i) => (
            <li key={c.sha}>
              <a href={c.html_url} target="_blank" rel="noreferrer">{c.commit.message.split("\n")[0]}</a>
              <span className="adm-muted">{c.commit.author.name} · {timeAgo(c.commit.author.date)}</span>
              {i === 0 ? (
                <span className="adm-badge">current</span>
              ) : (
                <button type="button" className="adm-btn adm-btn--small" onClick={() => onLoadVersion(c.sha)}>Load</button>
              )}
            </li>
          ))}
        </ul>
        {history.length === 0 ? <p className="adm-muted">No history yet ({baseSha.slice(0, 7)}).</p> : null}
      </section>
    </>
  );
}

function RawEditor({ draft, onApply, flash }) {
  const current = serialize(draft);
  const [text, setText] = useState(current);
  const [error, setError] = useState("");
  useEffect(() => setText(current), [current]); // the draft changed elsewhere: follow it
  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      for (const k of Object.keys(draft)) if (!(k in parsed)) throw new Error(`Missing top-level key "${k}".`);
      onApply(parsed);
      setError("");
      flash("JSON applied to the draft.");
    } catch (e) {
      setError(e.message);
    }
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([current], { type: "application/json" }));
    a.download = `site-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <div className="adm-head">
        <h1>Raw JSON</h1>
        <p>The whole of <code>{CONTENT_PATH}</code>. For bulk edits and backups. Apply puts it into the draft; nothing is published until you press Publish.</p>
      </div>
      <section className="adm-card">
        <textarea className="adm-raw" spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} />
        {error ? <p className="adm-error">{error}</p> : null}
        <div className="adm-modal__actions">
          <button type="button" className="adm-btn" onClick={download}>Download backup</button>
          <button type="button" className="adm-btn" disabled={text === current} onClick={() => setText(current)}>Reset</button>
          <button type="button" className="adm-btn adm-btn--solid" disabled={text === current} onClick={apply}>Apply to draft</button>
        </div>
      </section>
    </>
  );
}
