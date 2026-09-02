import { EmailAction } from "./email-action";
import { ContactForm } from "./contact-form";
import { RecordStrip } from "./record-strip";
import {
  ForgeGridPreview,
  ShowdownPreview,
  TapePreview,
} from "./project-previews";

const basePath = process.env.PAGES_BASE_PATH ?? "";

type Experience = {
  company: string;
  role: string;
  note: string;
  year: string;
  span: string;
};

type Project = {
  name: string;
  lang: string;
  description: string;
  metric: string;
  metricNote: string;
  tools: string;
  preview: () => React.ReactElement;
  href?: string;
};

const experience: Experience[] = [
  {
    company: "GSAlpha Labs",
    role: "Software Engineering Intern",
    note: "HomeFlow AI — 52-field contract intake at 96% accuracy, every date showing the rule that produced it",
    year: "2026",
    span: "may — now",
  },
  {
    company: "SEDS @ UMD",
    role: "Software Engineer",
    note: "CubeSat GPS test framework for 26 Verilog modules, 4h regression down to 95min",
    year: "2024",
    span: "sep — feb 26",
  },
  {
    company: "theconviction.ai",
    role: "Software Engineering Intern",
    note: "SEC filings, transcripts, and news for 50+ companies collapsed into one clean record",
    year: "2025",
    span: "may — aug",
  },
];

const projects: Project[] = [
  {
    name: "Tape",
    lang: "go",
    description:
      "Records live exchange feeds to S3 and replays them byte-identical, so a backtest run twice over the same window answers the same way twice. Fault-injection tests severed the feed every 25s; Tape caught all 3 gaps and flags those windows, so nothing silently backtests on missing data.",
    metric: "2,580× replay",
    metricNote: "49.8k msg/s sustained · 5.2× smaller on disk",
    tools: "Go · AWS S3 · ECS · Terraform · Docker",
    preview: TapePreview,
    href: "https://github.com/AnanmayS/tape",
  },
  {
    name: "ForgeGrid",
    lang: "node",
    description:
      "Spreads a build across worker machines and starts each task the moment its dependencies finish. A content-addressed cache skips any task whose inputs have not changed, and a worker dying mid-build gets its tasks reassigned instead of failing the run.",
    metric: "59% faster",
    metricNote: "benchmarked 1–8 workers · plateaus past 3",
    tools: "Node.js · Docker · Linux · JavaScript",
    preview: ForgeGridPreview,
    href: "https://github.com/AnanmayS/forgegrid",
  },
  {
    name: "ShowdownRL",
    lang: "python",
    description:
      "A PPO agent that plays live Pokémon Showdown battles through Playwright, reading a 106-feature view of the board and masked out of illegal moves so it never wastes a turn. Every battle log is saved, so a reported win rate traces back to the games behind it.",
    metric: "79% win rate",
    metricNote: "1,000 live matches · human opponents",
    tools: "PyTorch · Gymnasium · Playwright · Python",
    preview: ShowdownPreview,
    href: "https://github.com/AnanmayS/ShowdownRL",
  },
];

const skills = [
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

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ExperienceRows() {
  return (
    <div className="rows">
      {experience.map((item) => (
        <div className="entry" key={item.company}>
          <div className="entry-rail">
            <b>{item.year}</b>
            {item.span}
          </div>
          <div>
            <h3 className="entry-title">{item.company}</h3>
            <p className="entry-role">{item.role}</p>
            <p className="entry-note">{item.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectRows() {
  return (
    <div className="project-rows">
      {projects.map((project) => {
        const Preview = project.preview;

        return (
          <article className="entry" key={project.name}>
            <div className="entry-rail">
              <b>{project.lang}</b>
            </div>

            <div>
              <div className="project-head">
                <h3 className="entry-title">{project.name}</h3>
                <div className="project-links">
                  {project.href ? (
                    <a href={project.href} rel="noreferrer" target="_blank">
                      repo <Arrow />
                    </a>
                  ) : null}
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-preview">
                <Preview />
              </div>

              <div className="project-foot">
                <span className="project-metric">
                  {project.metric} <span>· {project.metricNote}</span>
                </span>
                <span className="project-tools">{project.tools}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <main className="site-main">
      <div className="page-shell">
        <header className="hero">
          <h1>Ananmay Som Singh</h1>
          <p className="hero-role">
            computer engineering @ umd · class of 2028
          </p>
          <p className="hero-note">
            I build systems that keep a record of themselves: feeds you can
            replay byte-for-byte, builds that prove what they skipped, and
            agents whose win rate traces back to the logs.
          </p>

          <nav className="contact-links" aria-label="Contact links">
            <EmailAction label="email" />
            <a
              href="https://github.com/AnanmayS"
              rel="noreferrer"
              target="_blank"
            >
              github
            </a>
            <a
              href="https://www.linkedin.com/in/ananmaysingh"
              rel="noreferrer"
              target="_blank"
            >
              linkedin
            </a>
            <a href={`${basePath}/resume.pdf`} target="_blank">
              résumé
            </a>
          </nav>
        </header>

        <RecordStrip />

        <div className="content">
          <Section title="Experience">
            <ExperienceRows />
          </Section>

          <Section title="Selected work">
            <ProjectRows />
          </Section>

          <Section title="Skills">
            <div className="skill-rows">
              {skills.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
