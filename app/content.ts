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

/** The front page, top to bottom: the hero and the About card. */
export const home = {
  eyebrow: "hey, i'm",
  tagline: "I build backend systems and full-stack apps.",
  subline: "computer engineering @ umd '28 · college park, md",
  about:
    "Computer engineering student at the University of Maryland. I like building the parts of software people don't see: data pipelines, distributed systems, and the infrastructure that keeps them up.",
  /** The painting behind the hero, from public/paintings, and its credit line. */
  painting: "venice-dusk.webp",
  paintingAlt:
    "An impressionist painting in the manner of Monet: Venice at dusk, the domed church of San Giorgio Maggiore silhouetted against an orange and violet sky reflected in the lagoon.",
  paintingCredit: "after Claude Monet · San Giorgio Maggiore at Dusk",
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
  /** The painting the demo hangs in, from public/paintings. */
  painting: string;
};

/** The five projects with demos, on /work and each on its own page. */
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
    /** Pissarro, The Boulevard Montmartre on a Winter Morning (1897); The Met, public domain. */
    painting: "boulevard.webp",
  },
  {
    slug: "pitwall",
    name: "Pit Wall",
    lede:
      "Replays a real Formula 1 race to any lap, changes one decision, and simulates the rest 10,000 times to show how it would have gone.",
    metric: { value: "10,000", label: "finishes simulated in about a second" },
    year: "2026",
    stack: "Python · NumPy · ClickHouse · DynamoDB · FastAPI · Next.js",
    painting: "water-lilies.webp",
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
    painting: "serengeti.webp",
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
    painting: "river-fog.webp",
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
    painting: "clifftop.webp",
  },
];

export type Pick = {
  name: string;
  /** One line on what it is. */
  blurb: string;
  /** The mono stack tag at the right of the row. */
  stack: string;
  /** The repository; omitted when the code is private. */
  href?: string;
  /** Where it runs in the browser, when it does. */
  live?: string;
  /** The project page on this site, when it has one. */
  slug?: string;
};

/** The project rows on the front page, in order. */
export const picks: Pick[] = [
  {
    name: "beat the bots",
    blurb:
      "Browser futures game against 32 bots on a C++20 exchange compiled to WebAssembly; 21M orders/s, integer-exact zero-sum accounting, native and WASM byte-identical.",
    stack: "c++ · wasm · typescript",
    href: "https://github.com/AnanmayS/trading_arena",
    live: "https://ananmays.github.io/trading_arena/",
    slug: "beat-the-bots",
  },
  {
    name: "pitwall",
    blurb:
      "F1 telemetry coach and what-if race simulator over 32M rows of lap data; replays a race 10,000 times in about a second and serves cached scenarios in 9 ms.",
    stack: "python · clickhouse · dynamodb",
    slug: "pitwall",
  },
  {
    name: "tape",
    blurb: "Records live exchange feeds to S3 and replays them byte-for-byte; 49.8k msgs/sec in load tests.",
    stack: "go · aws · terraform",
    href: "https://github.com/AnanmayS/tape",
    slug: "tape",
  },
  {
    name: "wildebeest",
    blurb:
      "Fault-tolerant pipeline that runs wildlife-detection models on camera-trap photos; 0 photos lost across 30 injected failures.",
    stack: "typescript · postgres · redis",
    href: "https://github.com/AnanmayS/wildebeest",
    slug: "wildebeest",
  },
  {
    name: "showdownrl",
    blurb: "PPO agent for Pokémon Showdown that won 79% of 1,000 battles against a scripted opponent.",
    stack: "python · pytorch · ppo",
    href: "https://github.com/AnanmayS/ShowdownRL",
    slug: "showdownrl",
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
