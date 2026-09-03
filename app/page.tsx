import { ContactForm } from "./contact-form";
import { EmailAction } from "./email-action";
import { DegreeProgress } from "./degree-progress";
import { Reveal } from "./reveal";
import { SiteHeader } from "./site-header";
import { ThemeToggle } from "./theme-toggle";
import {
  ForgeGridDiagram,
  ShowdownDiagram,
  TapeDiagram,
} from "./diagrams";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const resumeHref = `${basePath}/resume.pdf`;

type Role = {
  company: string;
  title: string;
  where: string;
  when: string;
  points: string[];
};

type Work = {
  name: string;
  href: string;
  lede: string;
  stack: string;
  diagram: () => React.ReactElement;
};

const roles: Role[] = [
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

const work: Work[] = [
  {
    name: "Tape",
    href: "https://github.com/AnanmayS/tape",
    lede: "Records live exchange feeds to S3 and replays them byte-identical, so a backtest run twice over the same window answers the same way twice. Fault-injection tests severed the feed every 25 seconds; Tape caught all three gaps and flags those windows, so nothing silently backtests on missing data.",
    stack: "Go · AWS S3 · ECS · CloudWatch · Terraform · Docker",
    diagram: TapeDiagram,
  },
  {
    name: "ForgeGrid",
    href: "https://github.com/AnanmayS/forgegrid",
    lede: "Spreads a build across worker machines and starts each task the moment its dependencies finish. A content-addressed cache skips any task whose inputs have not changed, and a worker dying mid-build gets its tasks reassigned instead of failing the run. Past three workers the longest dependency chain sets the floor.",
    stack: "Node.js · JavaScript · Docker · Linux",
    diagram: ForgeGridDiagram,
  },
  {
    name: "ShowdownRL",
    href: "https://github.com/AnanmayS/ShowdownRL",
    lede: "A PPO agent that plays live Pokémon Showdown battles through Playwright, reading a 106-feature view of the board and masked out of illegal moves so it never wastes a turn. Every battle log is saved, so a reported win rate traces back to the games behind it.",
    stack: "Python · PyTorch · Gymnasium · Playwright",
    diagram: ShowdownDiagram,
  },
];

const skills: [string, string][] = [
  ["languages", "Go, Python, Java, C++, C, TypeScript, JavaScript, SQL, Verilog"],
  [
    "backend",
    "FastAPI, Node.js, PostgreSQL, Drizzle, SQLAlchemy, Supabase, Zod, WebSockets, concurrency",
  ],
  [
    "infra",
    "AWS (S3, ECS, CloudWatch), Terraform, Docker, Linux, GitHub Actions, Vercel, pytest, Vitest",
  ],
  ["frameworks", "React, Next.js, PyTorch, LLM extraction and evaluation"],
];

export default function Home() {
  return (
    <>
      <SiteHeader resumeHref={resumeHref} />

      <main className="shell">
        <header className="hero">
          <h1>Ananmay Som Singh</h1>
          <p className="hero-meta">
            computer engineering · umd 2028 · college park, md
          </p>
          <p className="hero-lead">
            Hey, I&apos;m Ananmay. I build backend and infrastructure things,
            and I keep the receipts — every number on this page came from a run
            I still have the logs for.
          </p>
          <nav className="hero-actions" aria-label="Links">
            <a className="action-primary" href={resumeHref} target="_blank">
              résumé (pdf)
            </a>
            <EmailAction label="email" />
            <a href="https://github.com/AnanmayS" rel="noreferrer" target="_blank">
              github
            </a>
            <a
              href="https://www.linkedin.com/in/ananmaysingh"
              rel="noreferrer"
              target="_blank"
            >
              linkedin
            </a>
            <ThemeToggle />
          </nav>
          <DegreeProgress buildNow={Date.now()} />
        </header>

        <section className="block">
          <h2 className="block-title">Experience</h2>
          <div className="stack">
            {roles.map((role) => (
              <article key={role.company}>
                <div className="role-head">
                  <h3>{role.company}</h3>
                  <span className="role-when">{role.when}</span>
                </div>
                <p className="role-what">
                  {role.title} · {role.where}
                </p>
                <ul className="role-points">
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="block">
          <h2 className="block-title">Selected work</h2>
          <div className="stack">
            {work.map((item) => {
              const Diagram = item.diagram;

              return (
                <article key={item.name}>
                  <div className="work-head">
                    <h3>{item.name}</h3>
                    <a
                      className="work-link"
                      href={item.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      repo ↗
                    </a>
                  </div>
                  <p className="work-lede">{item.lede}</p>
                  <Reveal className="work-figure">
                    <Diagram />
                  </Reveal>
                  <p className="work-stack">{item.stack}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="block">
          <h2 className="block-title">Skills</h2>
          <dl className="skills">
            {skills.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <p>{value}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="close">
          <h2>Happy to talk about any of this.</h2>
          <div className="close-actions">
            <EmailAction label="ananmays20@gmail.com" />
            <ContactForm />
            <a href="https://github.com/AnanmayS" rel="noreferrer" target="_blank">
              github
            </a>
            <a
              href="https://www.linkedin.com/in/ananmaysingh"
              rel="noreferrer"
              target="_blank"
            >
              linkedin
            </a>
          </div>
          <p className="close-where">College Park, MD</p>
        </section>
      </main>
    </>
  );
}
