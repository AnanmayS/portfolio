/*
  Everything the page says, in one place. Components read from here; nothing
  here renders.
*/

export const person = {
  name: "Ananmay Singh",
  /** The email card greets with it. */
  first: "Ananmay",
  /** Commencement, for the countdown in the plate's sky. The day is a placeholder until UMD publishes it. */
  graduation: "2028-05-22T10:00:00-04:00",
  /** Over the clock while it counts, and in its place once the day has passed. */
  graduationLabel: "Graduation from Maryland, May 2028",
  graduatedLabel: "Graduated from Maryland, May 2028",
  email: "ananmaysom@gmail.com",
  /** In the footer. */
  whereLong: "College Park, MD",
  github: "https://github.com/AnanmayS",
  linkedin: "https://www.linkedin.com/in/ananmaysingh",
} as const;

/** The front page's opening: what the sky says, and the plate behind it. */
export const home = {
  /** The front page's list, in lowercase: who I am, not where I've worked (that's the work tab). A `link` turns the named words into a link. */
  facts: [
    { text: "studying computer engineering at maryland, class of 2028" },
    { text: "grew up in the bay area, now in college park" },
    { text: "big f1 fan, enough to build a way to replay a race and change the strategy calls" },
    { text: "play badminton when i’m away from the keyboard" },
  ] as { text: string; link?: { words: string; href: string } }[],
  /**
   * The line above the name: one of these a day, the same for everyone that
   * day, cycling in order. Short, and only ones whose source is solid.
   */
  quotes: [
    { text: "Simplicity is prerequisite for reliability.", by: "Edsger W. Dijkstra" },
    { text: "Simplify, then add lightness.", by: "Colin Chapman" },
    { text: "What I cannot create, I do not understand.", by: "Richard Feynman" },
    { text: "Make it work, make it right, make it fast.", by: "Kent Beck" },
    { text: "If you no longer go for a gap that exists, you are no longer a racing driver.", by: "Ayrton Senna" },
    { text: "Real artists ship.", by: "Steve Jobs" },
    { text: "Fall seven times, stand up eight.", by: "Japanese proverb" },
    { text: "Premature optimization is the root of all evil.", by: "Donald Knuth" },
    { text: "Leave me alone, I know what I’m doing.", by: "Kimi Räikkönen" },
    { text: "The best way to predict the future is to invent it.", by: "Alan Kay" },
    { text: "Talk is cheap. Show me the code.", by: "Linus Torvalds" },
    { text: "Risk comes from not knowing what you’re doing.", by: "Warren Buffett" },
    { text: "The first principle is that you must not fool yourself, and you are the easiest person to fool.", by: "Richard Feynman" },
    { text: "The cheapest, fastest, and most reliable components are those that aren’t there.", by: "Gordon Bell" },
    { text: "Simple things should be simple, complex things should be possible.", by: "Alan Kay" },
    { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", by: "Antoine de Saint-Exupéry" },
    { text: "Programs must be written for people to read, and only incidentally for machines to execute.", by: "Abelson and Sussman" },
    { text: "Stay hungry. Stay foolish.", by: "The Whole Earth Catalog" },
  ] as { text: string; by: string }[],
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
  /** One line shown under the shelf when the book is pulled out. */
  note?: string;
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
