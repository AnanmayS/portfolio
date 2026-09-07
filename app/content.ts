/*
  One source of truth for everything the page, the command palette, and the
  terminal mode say about Ananmay. Components read from here; nothing here
  renders.
*/

export const person = {
  name: "Ananmay Som Singh",
  short: "Ananmay",
  email: "ananmaysom@gmail.com",
  where: "College Park, MD",
  school: "computer engineering · umd 2028",
  github: "https://github.com/AnanmayS",
  linkedin: "https://www.linkedin.com/in/ananmaysingh",
  githubUser: "AnanmayS",
} as const;

export const degree = {
  start: Date.UTC(2024, 7, 28), // first day of term at UMD
  end: Date.UTC(2028, 4, 18), // expected commencement
} as const;

export type Evidence = {
  /** Short label shown on the claim, e.g. "results.md" or "1,000 episodes". */
  label: string;
  /** What the visitor sees inside the drawer. */
  kind: "link" | "excerpt" | "table";
  href?: string;
  /** For "excerpt": verbatim lines from a log, test, or doc. */
  lines?: string[];
  /** For "table": rows of [label, value]. */
  rows?: [string, string][];
  /** One sentence on where this came from. */
  source: string;
};

export type Project = {
  slug: string;
  name: string;
  href: string;
  /** The question the project answers. Shown as the entry's subtitle. */
  question: string;
  lede: string;
  stack: string[];
  /** Which interactive demo renders under the lede, if any. */
  demo?:
    | "forgegrid"
    | "tape"
    | "showdown"
    | "orderbook"
    | "options"
    | "polymarket"
    | "dailydelve";
  /** Claims the visitor can open. Keys are the claim text as it appears. */
  evidence: Record<string, Evidence>;
  year: string;
};

export const projects: Project[] = [
  {
    slug: "tape",
    name: "Tape",
    href: "https://github.com/AnanmayS/tape",
    question: "Can a backtest be made to answer the same way twice?",
    lede:
      "Records live exchange feeds to S3 and replays them byte-identical at 2,790× real time. With the feed severed every 25 seconds it caught all three gaps and wrote each into the data, where replay stops, so nothing silently backtests on missing trades.",
    stack: ["Go", "AWS S3", "ECS", "CloudWatch", "Terraform", "Docker"],
    demo: "tape",
    year: "2026",
    evidence: {
      "byte-identical": {
        label: "sha256 in CI",
        kind: "excerpt",
        source: "tape/docs/results.md, M3 replay determinism",
        lines: [
          "fixture: 2,340 real BTC-USD frames across three files",
          "replay twice → 2,197,803 bytes of canonical NDJSON both times",
          "sha256 ee9576040361b07272db0cb6e614b02cef53dec1fcc772aeea1fa609b4fb7a21",
          "digest checked into the test; neither test is skippable",
        ],
        href: "https://github.com/AnanmayS/tape/blob/main/docs/results.md",
      },
      "three gaps": {
        label: "fault injection",
        kind: "table",
        source: "tape/docs/results.md, reconnect behaviour with the feed severed every 25s",
        rows: [
          ["reconnects", "3"],
          ["gap records", "3"],
          ["missing sequence numbers", "649 · 526 · 3,240"],
          ["backfill available", "none, so windows are flagged"],
        ],
        href: "https://github.com/AnanmayS/tape/blob/main/docs/results.md",
      },
      "2,790× real time": {
        label: "tape verify",
        kind: "table",
        source: "tape/docs/results.md, live 3m20s capture",
        rows: [
          ["records", "6,434 across four files, 5.4 MB"],
          ["replay wall time", "72 ms"],
          ["throughput", "89,844 events/sec"],
          ["speed", "2,790× the time it took to record"],
        ],
        href: "https://github.com/AnanmayS/tape/blob/main/docs/results.md",
      },
    },
  },
  {
    slug: "forgegrid",
    name: "ForgeGrid",
    href: "https://github.com/AnanmayS/forgegrid",
    question: "How much faster does a build get with more machines, and where does it stop?",
    lede:
      "Spreads a seven-task game build across worker processes and starts each task the moment its dependencies finish: three workers take 59% less time than one. A content-addressed cache means an identical rebuild has 7 of 7 tasks reused, and a worker dying mid-build gets its tasks reassigned instead of failing the run. The artifact it produces is a game you can play.",
    stack: ["Node.js", "JavaScript", "Docker", "Linux"],
    demo: "forgegrid",
    year: "2026",
    evidence: {
      "59% less time": {
        label: "worker comparison",
        kind: "table",
        source: "forgegrid/README.md, results at a glance, caching disabled and no simulated delay",
        rows: [
          ["cold build, one worker", "2.5 s"],
          ["cold build, three workers", "1.0 s"],
          ["wall-clock reduction", "59%"],
          ["parallel speedup", "2.44×"],
        ],
        href: "https://github.com/AnanmayS/forgegrid#results-at-a-glance",
      },
      "7 of 7 tasks reused": {
        label: "cache hit",
        kind: "excerpt",
        source: "forgegrid/README.md, identical second build",
        lines: [
          "identical second build → 7 of 7 tasks reused from cache",
          "worker failure → task reassigned; build completes",
        ],
        href: "https://github.com/AnanmayS/forgegrid#results-at-a-glance",
      },
    },
  },
  {
    slug: "showdownrl",
    name: "ShowdownRL",
    href: "https://github.com/AnanmayS/ShowdownRL",
    question: "Can a policy trained in a simulator hold up in the real game?",
    lede:
      "A MaskablePPO agent that plays live Pokémon Showdown battles through Playwright. It reads a 106-feature view of the board and is masked out of illegal moves, so it never wastes a turn. Every battle log is saved, so the 79% win rate traces back to the games behind it.",
    stack: ["Python", "PyTorch", "Gymnasium", "Playwright"],
    demo: "showdown",
    year: "2026",
    evidence: {
      "79% win rate": {
        label: "1,000 episodes × 2 seeds",
        kind: "table",
        source: "ShowdownRL/docs/benchmarks/current_evaluation.csv, bench simulator vs the type-aware opponent",
        rows: [
          ["Maskable PPO v11, seed 42", "790-41-169 · 79.0%"],
          ["Maskable PPO v11, seed 99", "788-40-172 · 78.8%"],
          ["type-aware heuristic", "75.2% / 75.3%"],
          ["max-damage heuristic", "54.2% / 54.5%"],
          ["random", "31.9% / 32.3%"],
        ],
        href: "https://github.com/AnanmayS/ShowdownRL/blob/main/docs/benchmarks/current_evaluation.csv",
      },
    },
  },
  {
    slug: "orderbook",
    name: "Limit order book",
    href: "https://github.com/AnanmayS/limit-order-book-simulator",
    question: "What does price-time priority actually look like as orders arrive?",
    lede:
      "A matching engine in C with a live terminal view of the book. Orders match on price first, then time, and every fill is reported as it happens. The version below is the same engine ported to the browser so you can drive it.",
    stack: ["C", "Make"],
    demo: "orderbook",
    year: "2025",
    evidence: {},
  },
  {
    slug: "options",
    name: "Option pricing",
    href: "https://github.com/AnanmayS/Option-Pricing-Model-Dashboard",
    question: "How does an option's price move when you move its inputs?",
    lede:
      "Black-Scholes pricing with the greeks, built as a dashboard so the model is something you turn rather than a formula you read.",
    stack: ["Python", "Streamlit", "NumPy"],
    demo: "options",
    year: "2025",
    evidence: {},
  },
  {
    slug: "polymarket",
    name: "Polymarket paper trader",
    href: "https://github.com/AnanmayS/polymarket-papertrade-agent",
    question: "Can a rules-based agent trade sports prediction markets without losing its bankroll?",
    lede:
      "Scans live Polymarket sports markets, estimates fair probability, enforces bankroll and exposure limits, then simulates fills with fees and slippage. No real money, and every closed trade gets a postmortem.",
    stack: ["FastAPI", "SQLAlchemy", "scikit-learn", "React", "Docker"],
    demo: "polymarket",
    year: "2026",
    evidence: {},
  },
  {
    slug: "dailydelve",
    name: "Daily Delve",
    href: "https://github.com/AnanmayS/Daily-Devele",
    question: "Can a small game be worth coming back to every day?",
    lede: "A daily dungeon crawl with a fresh seed each morning.",
    stack: ["TypeScript"],
    demo: "dailydelve",
    year: "2026",
    evidence: {},
  },
];

/** Smaller things, listed by name only. */
export const more: { name: string; href: string; what: string }[] = [
  {
    name: "AI Equity Research Platform",
    href: "https://github.com/AnanmayS/AI-Equity-Research-Platform",
    what: "SEC filings, transcripts and news for 50+ companies in one queryable record",
  },
  {
    name: "F1 Telemetry Analytics",
    href: "https://github.com/AnanmayS/Formula-1-Telemetry-Analytics-Platform",
    what: "lap-by-lap telemetry comparison",
  },
  {
    name: "futures-strategy-lab",
    href: "https://github.com/AnanmayS/futures-strategy-lab",
    what: "systematic strategy research on futures",
  },
  {
    name: "friday",
    href: "https://github.com/AnanmayS/friday",
    what: "personal automation assistant",
  },
  {
    name: "Terminal Poker",
    href: "https://github.com/AnanmayS/Terminal-Poker",
    what: "hold 'em in the shell",
  },
  {
    name: "Earnings Surprise Prediction",
    href: "https://github.com/AnanmayS/Earnings-Surprise-Prediction-Platform",
    what: "predicting beats and misses from filings",
  },
];

export type Role = {
  company: string;
  title: string;
  where: string;
  when: string;
  points: string[];
};

export const roles: Role[] = [
  {
    company: "GSAlpha Labs",
    title: "Software Engineering Intern",
    where: "San Francisco",
    when: "May 2026 — now",
    points: [
      "Built HomeFlow AI, a Next.js and TypeScript platform that does the transaction-coordinator work California brokerages outsource at $400–600 a file.",
      "Cut purchase-agreement intake to under 30 seconds with an LLM pipeline that validates all 52 fields against a Zod schema: 96% field-level accuracy across 15 real closed transactions, with a human signing off before anything is filed.",
      "Scored OpenAI, Anthropic and DeepSeek field by field on accuracy, latency and cost per contract, then shipped the one that held accuracy at 8× lower cost.",
    ],
  },
  {
    company: "SEDS @ UMD",
    title: "Software Engineer, SatFab CubeSat GPS",
    where: "College Park",
    when: "Sep 2024 — Feb 2026",
    points: [
      "Built and documented the Python test framework for 26 Verilog modules in a CubeSat GPS receiver, trained 6 engineers on it, and it became the standard for every new module.",
      "Cut the full hardware regression from 4 hours to 95 minutes by running independent testbenches in parallel. What used to run overnight now runs before every merge.",
    ],
  },
  {
    company: "theconviction.ai",
    title: "Software Engineering Intern",
    where: "Remote",
    when: "May 2025 — Aug 2025",
    points: [
      "Replaced 12 hours a week of analyst hand-collection with a Dockerized FastAPI and PostgreSQL pipeline pulling SEC filings, earnings transcripts and news for 50+ companies into one queryable record.",
      "Shipped a Next.js research tool the 4-person research team used daily, putting each company on a timeline and linking every finding back to its source filing.",
    ],
  },
];

/** Hand-written skills, used when the GitHub language data is unavailable. */
export const skills: [string, string][] = [
  ["languages", "Go, Python, Java, C++, C, TypeScript, JavaScript, SQL, Verilog"],
  ["backend", "FastAPI, Node.js, PostgreSQL, Drizzle, SQLAlchemy, Supabase, Zod, WebSockets, concurrency"],
  ["infra", "AWS (S3, ECS, CloudWatch), Terraform, Docker, Linux, GitHub Actions, Vercel, pytest, Vitest"],
  ["frameworks", "React, Next.js, PyTorch, LLM extraction and evaluation"],
];

/** Edited by hand. The "currently" strip shows this beside live GitHub data. */
export const now = {
  trying: "getting Tape's replay to stream straight into a live strategy so a Tuesday bug reproduces on Wednesday",
  reading: "Designing Data-Intensive Applications, the replication chapters again",
};
