/*
  Everything the page says, in one place. Components read from here; nothing
  here renders.
*/

export const person = {
  name: "Ananmay Som Singh",
  first: "Ananmay",
  /** The handwritten phrase in the intro; follows "who likes". */
  role: "building software",
  school: "UMD",
  email: "ananmaysom@gmail.com",
  /** Shown beside the clock above the work; the intro does not say where. */
  where: "College Park",
  timeZone: "America/New_York",
  github: "https://github.com/AnanmayS",
  handle: "@AnanmayS",
  linkedin: "https://www.linkedin.com/in/ananmaysingh",
} as const;

export type Project = {
  slug: string;
  name: string;
  href: string;
  /** One sentence, shown on the card beside the illustration. */
  lede: string;
  /** The number that says the project works, and what it measures. */
  metric: { value: string; label: string };
  year: string;
  stack: string;
};

export const projects: Project[] = [
  {
    slug: "wildebeest",
    name: "Wildebeest",
    href: "https://github.com/AnanmayS/wildebeest",
    lede:
      "A fault-tolerant camera-trap pipeline: two vision models, a scheduler built from scratch on Postgres and Redis.",
    metric: { value: "0.16 s", label: "to recover a crashed worker, was 5.6 s" },
    year: "2026",
    stack: "TypeScript · Python · PostgreSQL · Redis · Docker",
  },
  {
    slug: "tape",
    name: "Tape",
    href: "https://github.com/AnanmayS/tape",
    lede:
      "Records live exchange feeds to S3 and replays them byte for byte, with every gap written into the data.",
    metric: { value: "2,790×", label: "real-time replay, byte-identical" },
    year: "2026",
    stack: "Go · AWS S3 · ECS · Terraform",
  },
  {
    slug: "showdownrl",
    name: "ShowdownRL",
    href: "https://github.com/AnanmayS/ShowdownRL",
    lede:
      "A MaskablePPO agent that plays live Pokémon Showdown battles through a real browser.",
    metric: { value: "79%", label: "win rate over 1,000 battles" },
    year: "2026",
    stack: "Python · PyTorch · Gymnasium · Playwright",
  },
];

export type Role = {
  company: string;
  /** Short enough to share a line with the company. */
  title: string;
  /** What came of it, in one line. */
  result: string;
  start: string;
  end: string | null;
};

export const roles: Role[] = [
  {
    company: "GSAlpha Labs",
    title: "SWE Intern",
    result: "HomeFlow AI, 30 s contract intake at 96% accuracy",
    start: "2026",
    end: null,
  },
  {
    company: "SEDS @ UMD",
    title: "CubeSat GPS",
    result: "Regression cut from 4 h to 95 min",
    start: "2024",
    end: "2026",
  },
  {
    company: "theconviction.ai",
    title: "SWE Intern",
    result: "Research pipeline for 50+ companies",
    start: "2025",
    end: "2025",
  },
];

/** The three named in the intro; everything else is on the project stack lines. */
export const languages = ["Go", "Python", "TypeScript"] as const;
