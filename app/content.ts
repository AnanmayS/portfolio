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
  tagline: "I build backend systems and full-stack apps.",
  /** The small line over the name. */
  subline: "Computer engineering · University of Maryland · class of 2028",
  about:
    "Computer engineering student at the University of Maryland. I like building the parts of software people don't see: data pipelines, distributed systems, and the infrastructure that keeps them up.",
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
  /** One plain sentence, shown under the demo on the card and the project page. */
  lede: string;
  /** The number that says the project works, and what it measures. */
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
    lede:
      "A trading game in the browser: $25,000 and five minutes to out-trade 32 bots on a real exchange engine, written in C++ and running entirely in the tab.",
    metric: { value: "21M", label: "orders a second through the matching engine" },
    year: "2026",
    stack: "C++20 · WebAssembly · TypeScript · React · Vite",
  },
  {
    slug: "pitwall",
    name: "Pit Wall",
    lede:
      "Replays a real Formula 1 race to any lap, changes one decision, and simulates the rest 10,000 times to show how it would have gone.",
    metric: { value: "10,000", label: "finishes simulated in about a second" },
    year: "2026",
    stack: "Python · NumPy · ClickHouse · DynamoDB · FastAPI · Next.js",
  },
  {
    slug: "wildebeest",
    name: "Wildebeest",
    href: "https://github.com/AnanmayS/wildebeest",
    lede:
      "Sorts wildlife camera-trap photos with two AI models across many computers, and keeps going when one of them crashes.",
    metric: { value: "0.16 s", label: "to recover a crashed worker, was 5.6 s" },
    year: "2026",
    stack: "TypeScript · Python · PostgreSQL · Redis · Docker",
  },
  {
    slug: "tape",
    name: "Tape",
    href: "https://github.com/AnanmayS/tape",
    lede:
      "A DVR for the market: it records every live trade, marks anything it missed, and replays any moment exactly, so trading ideas can be tested on real history.",
    metric: { value: "2,790×", label: "real-time replay, byte-identical" },
    year: "2026",
    stack: "Go · AWS S3 · ECS · Terraform",
  },
  {
    slug: "showdownrl",
    name: "ShowdownRL",
    href: "https://github.com/AnanmayS/ShowdownRL",
    lede:
      "An AI that taught itself to battle in Pokémon, then plays real matches on the Pokémon Showdown website by clicking the moves itself.",
    metric: { value: "79%", label: "win rate over 1,000 battles" },
    year: "2026",
    stack: "Python · PyTorch · Gymnasium · Playwright",
  },
];

export type Role = {
  company: string;
  /** Short enough to share a line with the company. */
  title: string;
  /** What you built and the number that says it worked, in plain words: a sentence or two. */
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
    result:
      "Building HomeFlow AI, a real estate closing platform; cut contract extraction from 35 min to under 30 s.",
    when: "may 2026 – present",
    start: "2026",
    end: null,
  },
  {
    company: "theconviction.ai",
    title: "Software engineering intern",
    result:
      "Built a retail trader dashboard: a daily feed of filings and news, LLM 8-K summaries, and source-linked company timelines, on a FastAPI/PostgreSQL pipeline that saved 12 hrs/week.",
    when: "may – aug 2025",
    start: "2025",
    end: "2025",
  },
  {
    company: "SEDS at UMD · SatFab CubeSat",
    title: "Software engineer, GPS team",
    result: "Built the Python test framework for 26 Verilog modules; cut hardware regression from 4 h to 95 min.",
    when: "sep 2024 – feb 2026",
    start: "2024",
    end: "2026",
  },
];

/** The three named in the intro; everything else is on the project stack lines. */
export const languages = ["Go", "Python", "TypeScript"] as const;
