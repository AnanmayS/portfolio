/*
  Everything the page says, in one place. Components read from here; nothing
  here renders.
*/

export const person = {
  name: "Ananmay Singh",
  fullName: "Ananmay Som Singh",
  first: "Ananmay",
  /** The handwritten phrase in the intro; follows "who likes". */
  role: "building software",
  school: "UMD",
  /** The class year, as it reads on the nav pill. */
  classOf: "'28",
  /** Commencement, for the countdown at the foot of the front page. The day is a placeholder until UMD publishes it. */
  graduation: "2028-05-22T10:00:00-04:00",
  graduationLabel: "Graduation from Maryland, May 2028",
  email: "ananmaysom@gmail.com",
  /** Shown beside the clock above the work; the intro does not say where. */
  where: "College Park",
  whereLong: "College Park, MD",
  timeZone: "America/New_York",
  github: "https://github.com/AnanmayS",
  handle: "@AnanmayS",
  linkedin: "https://www.linkedin.com/in/ananmaysingh",
  linkedinShort: "in/ananmaysingh",
} as const;

/** The front page, top to bottom: the plate and the About card. */
export const home = {
  tagline: "I build the plumbing behind apps: pipelines, exchanges, and the odd AI.",
  /** Two sentences under the tagline. */
  about:
    "Into finance, AI and distributed systems, and especially where the three meet. I like it when something I built keeps running after I stop watching.",
  /** The engraved plate behind the name, from public/plates. Sepia on disk; the page tints it to the ink. */
  plate: "bay.webp",
  plateAlt:
    "An engraving of the Chesapeake Bay at dawn: a screw-pile lighthouse on stilts at left, a skipjack under sail, a far shore with a small town, a steeple and a water tower, marsh grass and a tall pine at right.",
} as const;

export type Project = {
  slug: string;
  name: string;
  /** The repository; omitted when the code is private. */
  href?: string;
  /** Where it runs in the browser, when it does. */
  live?: string;
  /** One quick sentence, on the card and the project page. */
  lede: string;
  /** The one number, and what it counts. */
  metric: { value: string; label: string };
  year: string;
  stack: string;
};

/** The five projects, on the front page and /work, each on its own page. */
export const projects: Project[] = [
  {
    slug: "beat-the-bots",
    name: "Beat the Bots",
    href: "https://github.com/AnanmayS/trading_arena",
    live: "https://ananmays.github.io/trading_arena/",
    lede: "A trading game in the browser: five minutes and $25,000 to beat 32 bots on a real exchange engine, written in C++.",
    metric: { value: "21M", label: "orders matched a second" },
    year: "2026",
    stack: "C++, WebAssembly, React",
  },
  {
    slug: "pitwall",
    name: "Pit Wall",
    lede: "Replays a real F1 race to any lap, changes one call, and simulates the rest 10,000 times to see how it would have gone.",
    metric: { value: "10,000", label: "race finishes simulated a second" },
    year: "2026",
    stack: "Python, ClickHouse, FastAPI",
  },
  {
    slug: "wildebeest",
    name: "Wildebeest",
    href: "https://github.com/AnanmayS/wildebeest",
    lede: "Sorts wildlife camera photos with AI across many machines, and keeps going when one of them crashes.",
    metric: { value: "0.16 s", label: "to recover a crashed worker, down from 5.6 s" },
    year: "2026",
    stack: "TypeScript, Python, Postgres, Redis",
  },
  {
    slug: "tape",
    name: "Tape",
    href: "https://github.com/AnanmayS/tape",
    lede: "A DVR for the market: records every trade and replays any moment exactly, so trading ideas can be tested on real history.",
    metric: { value: "2,790×", label: "faster than real time, byte for byte" },
    year: "2026",
    stack: "Go, AWS, Terraform",
  },
  {
    slug: "showdownrl",
    name: "ShowdownRL",
    href: "https://github.com/AnanmayS/ShowdownRL",
    lede: "An AI that taught itself Pokémon battles, then plays real matches on Pokémon Showdown by clicking the moves itself.",
    metric: { value: "79%", label: "win rate over 1,000 battles" },
    year: "2026",
    stack: "Python, PyTorch, Playwright",
  },
];

export type Book = {
  title: string;
  /** What the spine says when the title is too long for it. */
  spine?: string;
  author: string;
  status: "reading" | "read";
  /** Sets the spine's width. */
  pages: number;
  /** Sets the spine's height: a small paperback, a normal one, or a big hardback. */
  format?: "s" | "m" | "l";
  /** Which of the page's inks the spine is bound in; cycles when omitted. */
  tone?: "ink" | "plate" | "soft" | "paper" | "muted";
};

/* The shelf on the front page, in the order the books stand. */
export const books: Book[] = [
  { title: "Red Rising", author: "Pierce Brown", status: "read", pages: 382, tone: "ink" },
  { title: "Golden Son", author: "Pierce Brown", status: "read", pages: 442, tone: "ink" },
  { title: "Morning Star", author: "Pierce Brown", status: "read", pages: 518, tone: "ink", format: "l" },
  { title: "Scythe", author: "Neal Shusterman", status: "read", pages: 435, tone: "plate" },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", status: "read", pages: 662, tone: "soft", format: "l" },
  { title: "Lord of the Mysteries", author: "Cuttlefish That Loves Diving", status: "reading", pages: 1400, tone: "paper", format: "l" },
];

export type Role = {
  company: string;
  /** Short enough to share a line with the company. */
  title: string;
  /** What you built, in one plain sentence with its number. */
  result: string;
  /** The dates, as they read on the row. */
  when: string;
  start: string;
  end: string | null;
};

export const roles: Role[] = [
  {
    company: "GSAlpha Labs",
    title: "Software engineering intern",
    result: "Building HomeFlow AI, which reads real estate contracts so agents don't have to: 35 minutes of data entry down to 30 seconds.",
    when: "may 2026 – present",
    start: "2026",
    end: null,
  },
  {
    company: "theconviction.ai",
    title: "Software engineering intern",
    result: "Built a research feed for retail traders: filings, news and AI summaries, each linked to its source.",
    when: "may – aug 2025",
    start: "2025",
    end: "2025",
  },
  {
    company: "SEDS at UMD, SatFab CubeSat",
    title: "Software engineer, GPS team",
    result: "Wrote the test framework for a CubeSat GPS receiver; the nightly regression went from 4 hours to 95 minutes.",
    when: "sep 2024 – feb 2026",
    start: "2024",
    end: "2026",
  },
];
