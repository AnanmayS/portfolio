/*
  Everything the page says, in one place. Components read from here; nothing
  here renders.
*/

export const person = {
  name: "Ananmay Som Singh",
  tagline: "Computer engineering student, backend and infrastructure engineer",
  email: "ananmaysom@gmail.com",
  where: "College Park, MD",
  github: "https://github.com/AnanmayS",
  linkedin: "https://www.linkedin.com/in/ananmaysingh",
} as const;

export type Project = {
  slug: string;
  name: string;
  href: string;
  /** One line, shown beside the name. */
  what: string;
  /** Two sentences at most, shown under the row. */
  lede: string;
  year: string;
  stack: string;
};

export const projects: Project[] = [
  {
    slug: "tape",
    name: "Tape",
    href: "https://github.com/AnanmayS/tape",
    what: "Market data capture and deterministic replay",
    lede:
      "Records live exchange feeds to S3 and replays them byte for byte, at 2,790× real time. Every hole the recorder finds is written into the data where replay stops, so a backtest never quietly runs on missing trades.",
    year: "2026",
    stack: "Go · AWS S3 · ECS · Terraform",
  },
  {
    slug: "forgegrid",
    name: "ForgeGrid",
    href: "https://github.com/AnanmayS/forgegrid",
    what: "A playable distributed build system",
    lede:
      "Spreads a seven-task game build across workers and starts each task the moment its inputs are ready: 2.5 s on one worker, 1.0 s on three. A worker dying mid-build has its work reassigned, and an unchanged rebuild is served entirely from cache.",
    year: "2026",
    stack: "Node.js · Docker",
  },
  {
    slug: "showdownrl",
    name: "ShowdownRL",
    href: "https://github.com/AnanmayS/ShowdownRL",
    what: "A reinforcement learning agent for Pokémon Showdown",
    lede:
      "A MaskablePPO policy that plays live battles through a real browser, reading a 106-feature view of the board and masked out of illegal moves. It wins 79% of 1,000 simulator episodes against the type-aware heuristic, which alone wins 75%.",
    year: "2026",
    stack: "Python · PyTorch · Gymnasium · Playwright",
  },
];

export type Role = {
  company: string;
  title: string;
  where: string;
  start: string;
  end: string | null;
  points: string[];
};

export const roles: Role[] = [
  {
    company: "GSAlpha Labs",
    title: "Software Engineering Intern",
    where: "San Francisco",
    start: "2026",
    end: null,
    points: [
      "Built HomeFlow AI, a Next.js platform that does the transaction-coordinator work California brokerages outsource at $400–600 a file.",
      "Cut purchase-agreement intake to under 30 seconds with an LLM pipeline validated against a 52-field schema, at 96% field accuracy on real closed transactions.",
    ],
  },
  {
    company: "SEDS @ UMD",
    title: "Software Engineer, CubeSat GPS",
    where: "College Park",
    start: "2024",
    end: "2026",
    points: [
      "Built the Python test framework for 26 Verilog modules in a GPS receiver; it became the standard for every new module.",
      "Cut the full hardware regression from 4 hours to 95 minutes by running independent testbenches in parallel.",
    ],
  },
  {
    company: "theconviction.ai",
    title: "Software Engineering Intern",
    where: "Remote",
    start: "2025",
    end: "2025",
    points: [
      "Replaced 12 hours a week of hand-collection with a FastAPI and PostgreSQL pipeline pulling filings, transcripts and news for 50+ companies into one record.",
      "Shipped the Next.js research tool the team used daily, linking every finding back to its source filing.",
    ],
  },
];

export const stack =
  "Go · Python · TypeScript · C · PostgreSQL · AWS · Terraform · Docker · PyTorch";
