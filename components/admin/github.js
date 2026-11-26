/**
 * The admin's whole "backend": GitHub's REST API, called straight from the browser
 * with the owner's personal access token. Publishing creates one commit on `main`;
 * the deploy workflow then rebuilds the static site from it.
 */

// The deploy workflow sets NEXT_PUBLIC_REPO to the repository it runs in,
// so the admin saves to whichever repo the site was built from.
const [OWNER = "ProtitiPrachi", NAME = "ProtitiPrachi.github.io"] = (process.env.NEXT_PUBLIC_REPO ?? "")
  .split("/")
  .filter(Boolean);

export const REPO = { owner: OWNER, name: NAME, branch: "main", workflow: "deploy.yml" };
export const CONTENT_PATH = "data/site.json";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SITE_URL = `https://${OWNER.toLowerCase()}.github.io${BASE_PATH}/`;

const API = "https://api.github.com";
const R = `/repos/${REPO.owner}/${REPO.name}`;

export class GitHubError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** Someone (or another tab) committed the content file after this session loaded it. */
export class ConflictError extends Error {}

async function gh(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    // API responses carry max-age=60; a stale read right after a save would undo it.
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      message = (await res.json()).message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new GitHubError(explain(res.status, message), res.status);
  }
  return res.status === 204 ? undefined : res.json();
}

function explain(status, message) {
  if (status === 401) return "GitHub rejected the token (expired or mistyped).";
  if (status === 403 && /rate limit/i.test(message)) return "GitHub rate limit hit. Wait a minute.";
  if (status === 403 || status === 404)
    return `The token cannot do this on ${REPO.name} (${message}). Check its repository access and permissions.`;
  return message;
}

/* ------------------------------------------------------------- encoding */

export function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Pretty-printed with a trailing newline, so hand edits and admin edits diff cleanly. */
export const serialize = (content) => `${JSON.stringify(content, null, 2)}\n`;

/* ---------------------------------------------------------------- calls */

export async function verifyToken(token) {
  const [user, repo] = await Promise.all([gh(token, "/user"), gh(token, R)]);
  if (repo.permissions && repo.permissions.push === false) {
    throw new GitHubError(`@${user.login} does not have write access to ${REPO.name}.`, 403);
  }
  return user;
}

export async function loadContent(token, ref = REPO.branch) {
  const file = await gh(token, `${R}/contents/${CONTENT_PATH}?ref=${encodeURIComponent(ref)}`);
  return { content: JSON.parse(base64ToUtf8(file.content)), sha: file.sha };
}

/**
 * Writes every change ({ path, base64 }) as a single commit through the Git Data API,
 * so a save with a new picture and edited text triggers one deploy, not two.
 * Refuses (ConflictError) if the content file changed since expectedSha, unless force.
 */
export async function commitChanges(token, { changes, message, expectedSha, force = false }) {
  const head = await gh(token, `${R}/git/ref/heads/${REPO.branch}`);
  const parent = head.object.sha;

  if (!force) {
    const current = await gh(token, `${R}/contents/${CONTENT_PATH}?ref=${parent}`);
    if (current.sha !== expectedSha) {
      throw new ConflictError("The content file changed on GitHub since you opened the dashboard.");
    }
  }

  const commit = await gh(token, `${R}/git/commits/${parent}`);

  const blobs = await Promise.all(
    changes.map(async (change) => {
      const blob = await gh(token, `${R}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: change.base64, encoding: "base64" }),
      });
      return { path: change.path, sha: blob.sha };
    })
  );

  const tree = await gh(token, `${R}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: commit.tree.sha,
      tree: blobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })),
    }),
  });

  const created = await gh(token, `${R}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [parent] }),
  });

  await gh(token, `${R}/git/refs/heads/${REPO.branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: created.sha }),
  });

  return {
    commitSha: created.sha,
    commitUrl: `https://github.com/${REPO.owner}/${REPO.name}/commit/${created.sha}`,
    contentSha: blobs.find((b) => b.path === CONTENT_PATH)?.sha ?? expectedSha,
  };
}

/** null means the token cannot read Actions, or the workflow is not installed yet. */
export async function deployRuns(token) {
  try {
    const data = await gh(token, `${R}/actions/workflows/${REPO.workflow}/runs?per_page=6`);
    return data.workflow_runs;
  } catch {
    return null;
  }
}

export async function redeploy(token) {
  await gh(token, `${R}/actions/workflows/${REPO.workflow}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: REPO.branch }),
  });
}

export async function contentHistory(token) {
  return gh(token, `${R}/commits?path=${encodeURIComponent(CONTENT_PATH)}&sha=${REPO.branch}&per_page=8`);
}
