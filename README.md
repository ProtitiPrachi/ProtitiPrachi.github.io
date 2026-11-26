# Protiti Sahajee Prachi — Portfolio

Personal portfolio for Protiti Sahajee Prachi: CSE student at AIUB, aspiring QA engineer and researcher.
Next.js 15 with the App Router, React 19 and Framer Motion, statically exported to `out/` so GitHub
Pages serves it as plain files.

**Live:** https://protitiprachi.github.io/

**To edit the site, open [/admin](https://protitiprachi.github.io/admin/)**: a dashboard that edits every
section, uploads a new CV or project picture, and publishes in one click.

```bash
npm install
npm run dev      # http://localhost:3000  (admin: http://localhost:3000/admin/)
npm run build    # writes the static site to out/
```

## What lives where

- Every fact on the page (profile, stats, skills, projects, research, education, honors, activities,
  music, contact, the scrolling banner, the page title and description) is data in **`data/site.json`**.
  `data/content.js` exposes it to the components; the sections hold no copy of their own.
- `/admin` (`app/admin/`, `components/admin/`) edits that file through the GitHub API with the owner's
  token: one commit per publish, conflict-checked, with local drafts, version history and deploy status.
- One file per section in `components/`. Colours and fonts are the tokens at the top of `app/globals.css`.
- Pictures and the CV are in `public/`. Paths in `site.json` are relative (`projects/x.jpg`, `cv.jpg`),
  so they work at any web address.

```
app/
  page.js, layout.js, globals.css   the public page
  admin/                            the dashboard route and its styles
components/
  Hero.js, About.js, Projects.js…   one file per section
  admin/
    AdminApp.js                     sign-in, navigation, publish, dashboard, raw JSON
    schema.js                       which form fields each section gets
    fields.js                       inputs, tag chips, file upload, reorderable lists
    github.js                       the GitHub API calls (the admin's whole "backend")
data/
  site.json                         all content
  content.js                        exposes site.json to the components
public/                             cv, project pictures
.github/workflows/deploy.yml        builds and publishes on every push to main
```

## The admin dashboard (`/admin`)

**How it works.** `/admin` is a page of this same static site. You sign in with a GitHub token; the page
then reads `data/site.json` straight from the repository, gives you a form for every section, and on
**Publish** writes your edits (plus any uploaded CV or picture) to `main` as **one commit**. The workflow
in `.github/workflows/deploy.yml` sees that push, runs `npm run build`, and publishes `out/` to the
`gh-pages` branch. The live site updates in about 1–2 minutes, and the dashboard shows the deploy going
from *deploying…* to *live*.

```
/admin (your browser) ──GitHub API──▶ commit on main ──Actions──▶ npm run build ──▶ gh-pages ──▶ live site
```

**One-time setup: create a token**

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token.
2. Repository access: *Only select repositories* → `ProtitiPrachi.github.io`.
3. Permissions: **Contents: Read and write** and **Actions: Read and write**.
4. Open `/admin`, paste the token, keep *Remember on this device* ticked if it is your own computer.

**What you can do there**

- Edit every section: profile and hero, about and stats, skills, projects (and the QA showcase card),
  research, education, honors, activities and music, contact, and the page title / banner.
- Add, duplicate, delete and reorder (↑ ↓) any list item. Tags are chips: Enter or comma adds one.
- Upload a new CV or project picture. A new CV keeps the name `cv.*`, so the link stays the same.
- See which sections have unpublished edits (gold dot), discard them, or publish with `Ctrl+S`.
- **Drafts are kept on your device**: close the tab by accident and the dashboard offers to restore them.
- **Version history**: load any earlier version into the editor and publish it to roll back.
- **Raw JSON** page for bulk edits, and a one-click backup download.
- **Redeploy now** rebuilds the site without changing anything.

**Safety.** The token is stored only in your browser. Without a token the page can do nothing: anyone
can open `/admin`, nobody else can publish. Log out on shared computers, and if a token leaks, delete
it on GitHub, which disables it at once. If the content changed on GitHub since you opened the
dashboard, publishing stops and asks which version should win instead of silently overwriting.

**Adding a new field** that the dashboard cannot edit yet: give it a value in `data/site.json`, show it
in the section's component, and add a form field for it in `components/admin/schema.js`.

## Deploying

GitHub Pages publishes the `gh-pages` branch, which holds nothing but the built `out/`. The workflow
regenerates it on every push to `main`, including every publish from `/admin`, so the branch is never
edited by hand. It works in any repository: `<user>.github.io` is served from `/`, any other repo from
`/<repo>/`.

Animations respect the "reduce motion" setting on the visitor's device.
