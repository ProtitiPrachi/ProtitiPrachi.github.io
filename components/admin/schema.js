/**
 * What the dashboard shows. Each page is a stack of blocks; a block edits an
 * object ("fields") or an ordered array ("list") at a path inside data/site.json.
 * Adding a field to the site = give it a value in site.json, render it in the
 * component, and add it here.
 *
 * Field types: text, url, textarea, number, tags (array of short strings),
 * lines (array of sentences, one per line), file (uploads into public/).
 */

const s = (v) => (typeof v === "string" ? v : "");

export const PAGES = [
  {
    id: "profile",
    label: "Profile & hero",
    intro: "The first screen: your name, the typed roles, the one-line pitch, your photo and the CV button.",
    keys: ["profile"],
    blocks: [
      {
        kind: "fields",
        title: "Your photo",
        description: "Shown beside your name at the top of the page. Upload a new one any time; it goes live when you publish.",
        path: ["profile"],
        fields: [
          {
            key: "photo",
            label: "Profile photo",
            type: "file",
            accept: "image/*",
            folder: "photos",
            wide: true,
            hint: "A portrait (taller than wide) looks best. JPG or PNG.",
          },
          { key: "photoAlt", label: "Photo description (for screen readers)", type: "text", wide: true },
        ],
      },
      {
        kind: "fields",
        title: "Identity",
        path: ["profile"],
        fields: [
          { key: "firstName", label: "First name", type: "text" },
          { key: "middleName", label: "Middle name", type: "text" },
          { key: "lastName", label: "Last name", type: "text" },
          { key: "status", label: "Status badge", type: "text", hint: "The pill at the top right of the menu, e.g. Open for Jobs." },
          { key: "roles", label: "Typed roles", type: "tags", wide: true, hint: "Shown one after another under your name." },
          { key: "pitch", label: "Pitch", type: "textarea", rows: 2, wide: true },
        ],
      },
      {
        kind: "fields",
        title: "CV",
        description: "Uploads are committed together with your text when you publish.",
        path: ["profile"],
        fields: [
          {
            key: "cv",
            label: "CV file",
            type: "file",
            accept: "image/*,application/pdf",
            name: "cv",
            wide: true,
            hint: "A PDF or an image. The “Download CV” button opens it.",
          },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About & stats",
    intro: "The About paragraph and the four counting numbers next to it.",
    keys: ["profile", "stats"],
    blocks: [
      {
        kind: "fields",
        path: ["profile"],
        fields: [{ key: "about", label: "About me", type: "textarea", rows: 6, wide: true }],
      },
      {
        kind: "list",
        title: "Stats",
        path: ["stats"],
        itemName: "stat",
        fields: [
          { key: "value", label: "Number", type: "number", step: 0.01 },
          { key: "decimals", label: "Decimals shown", type: "number", step: 1, hint: "0 for whole numbers, 2 for 3.80." },
          { key: "label", label: "Label", type: "text", wide: true },
        ],
        summary: (it) => ({ title: `${it.value ?? ""}`, meta: s(it.label) }),
        blank: () => ({ value: 0, decimals: 0, label: "" }),
      },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    intro: "Skill groups. Each has a title, a short note and its skills.",
    keys: ["skills"],
    blocks: [
      {
        kind: "list",
        title: "Skill groups",
        path: ["skills"],
        itemName: "group",
        fields: [
          { key: "group", label: "Group", type: "text" },
          { key: "note", label: "Note", type: "text" },
          { key: "items", label: "Skills", type: "tags", wide: true },
        ],
        summary: (it) => ({ title: s(it.group), meta: (it.items ?? []).join(", ") }),
        blank: () => ({ group: "", note: "", items: [] }),
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    intro: "Project cards. The GitHub and Live demo buttons appear only when a link is set.",
    keys: ["projects", "testingShowcase"],
    blocks: [
      {
        kind: "list",
        title: "Projects",
        path: ["projects"],
        itemName: "project",
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "kind", label: "Kind", type: "text", hint: "e.g. Web application" },
          { key: "live", label: "Live demo link", type: "url", placeholder: "https://…", hint: "Shows a “Live demo” button on the card." },
          { key: "github", label: "GitHub (code) link", type: "url", placeholder: "https://github.com/…", hint: "Shows a “View code” button." },
          { key: "date", label: "Dates", type: "text", hint: "e.g. Jan – Feb 2026" },
          { key: "duration", label: "Duration", type: "text" },
          { key: "image", label: "Picture", type: "file", accept: "image/*", folder: "projects", wide: true },
          { key: "overview", label: "Overview", type: "textarea", rows: 3, wide: true },
          { key: "stack", label: "Tech stack", type: "tags", wide: true },
          { key: "points", label: "Bullet points", type: "lines", wide: true, hint: "One bullet per line." },
        ],
        summary: (it) => ({ title: s(it.name), meta: [s(it.kind), s(it.date)].filter(Boolean).join(" · ") }),
        blank: () => ({
          name: "", kind: "", date: "", duration: "", image: "", overview: "",
          stack: [], points: [], github: "", live: "",
        }),
      },
      {
        kind: "fields",
        title: "QA showcase card",
        path: ["testingShowcase"],
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "status", label: "Status", type: "text", hint: "e.g. Planned, In progress, Done" },
          { key: "text", label: "Description", type: "textarea", rows: 3, wide: true },
        ],
      },
    ],
  },
  {
    id: "research",
    label: "Research",
    intro: "Papers and abstracts, newest first.",
    keys: ["research"],
    blocks: [
      {
        kind: "list",
        title: "Papers",
        path: ["research"],
        itemName: "paper",
        fields: [
          { key: "title", label: "Title", type: "textarea", rows: 2, wide: true },
          { key: "year", label: "Year", type: "text" },
          { key: "status", label: "Status", type: "text", hint: "e.g. Paper accepted" },
          { key: "venue", label: "Venue", type: "text", wide: true },
          { key: "summary", label: "Summary", type: "textarea", rows: 2, wide: true },
          {
            key: "link",
            label: "Published paper link",
            type: "url",
            wide: true,
            placeholder: "https://ieeexplore.ieee.org/document/…",
            hint: "IEEE Xplore, DOI or proceedings page. Shows a “Read paper” button.",
          },
        ],
        summary: (it) => ({ title: s(it.title), meta: [s(it.year), s(it.status)].filter(Boolean).join(" · ") }),
        blank: () => ({ year: "", title: "", status: "", venue: "", summary: "", link: "" }),
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    intro: "Degrees and exams, newest first.",
    keys: ["education"],
    blocks: [
      {
        kind: "list",
        title: "Education",
        path: ["education"],
        itemName: "entry",
        fields: [
          { key: "degree", label: "Degree", type: "text", wide: true },
          { key: "school", label: "School", type: "text", wide: true },
          { key: "years", label: "Years", type: "text" },
          { key: "result", label: "Result", type: "text" },
        ],
        summary: (it) => ({ title: s(it.degree), meta: s(it.school) }),
        blank: () => ({ degree: "", school: "", years: "", result: "" }),
      },
    ],
  },
  {
    id: "honors",
    label: "Honors",
    intro: "Awards, certificates and events.",
    keys: ["honors"],
    blocks: [
      {
        kind: "list",
        title: "Honors",
        path: ["honors"],
        itemName: "honor",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "by", label: "Given by / details", type: "textarea", rows: 2, wide: true },
          {
            key: "certificate",
            label: "Certificate file",
            type: "file",
            accept: "image/*,application/pdf",
            folder: "certificates",
            wide: true,
            hint: "A photo, scan or PDF of the certificate. Shows a “Certificate” button on the card.",
          },
          {
            key: "certificateLink",
            label: "Certificate link",
            type: "url",
            wide: true,
            placeholder: "https://…",
            hint: "Online certificate or verification page. Used when there is no uploaded file.",
          },
        ],
        summary: (it) => ({ title: s(it.title), meta: s(it.by) }),
        blank: () => ({ title: "", by: "", certificate: "", certificateLink: "" }),
      },
    ],
  },
  {
    id: "beyond",
    label: "Beyond code",
    intro: "Clubs, volunteering and music, shown as one list.",
    keys: ["activities"],
    blocks: [
      {
        kind: "list",
        title: "Activities",
        path: ["activities"],
        itemName: "activity",
        fields: [
          { key: "role", label: "Role", type: "text" },
          { key: "org", label: "Organisation", type: "text" },
        ],
        summary: (it) => ({ title: s(it.role), meta: s(it.org) }),
        blank: () => ({ role: "", org: "" }),
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    intro: "How people reach you. An empty GitHub link hides that row.",
    keys: ["profile"],
    blocks: [
      {
        kind: "fields",
        path: ["profile"],
        fields: [
          { key: "email", label: "Email", type: "text" },
          { key: "phone", label: "Phone", type: "text" },
          { key: "address", label: "Address", type: "text", wide: true },
          { key: "linkedin", label: "LinkedIn link", type: "url" },
          { key: "linkedinLabel", label: "LinkedIn label", type: "text" },
          { key: "github", label: "GitHub profile", type: "url", placeholder: "https://github.com/…" },
        ],
      },
    ],
  },
  {
    id: "site",
    label: "Site & SEO",
    intro: "Browser-tab title, search/link-preview text, and the scrolling banner.",
    keys: ["seo", "marquee"],
    blocks: [
      {
        kind: "fields",
        path: ["seo"],
        fields: [
          { key: "title", label: "Page title", type: "text", wide: true },
          { key: "description", label: "Description", type: "textarea", rows: 2, wide: true },
        ],
      },
      {
        kind: "fields",
        title: "Scrolling banner",
        path: [],
        fields: [{ key: "marquee", label: "Banner phrases", type: "tags", wide: true }],
      },
    ],
  },
];
