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
  /** One plain sentence, shown under the demo on the card and the project page. */
  lede: string;
  /** The number that says the project works, and what it measures. */
  metric: { value: string; label: string };
  year: string;
  stack: string;
  /** The painting the demo hangs in, from public/paintings. */
  painting: string;
};

export const projects: Project[] = [
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

/** "Ask about me": the three questions on the front page, and the rest on /ask. */
export const askStarters = ["What's Wildebeest?", "What does he do at GSAlpha Labs?", "What's he best at?"] as const;
export const askMore = ["What's Tape?", "Tell me about ShowdownRL", "Where does he study?"] as const;
