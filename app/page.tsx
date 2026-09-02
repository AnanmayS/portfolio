import { EmailAction } from "./email-action";
import { ContactForm } from "./contact-form";
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
  date: string;
};

type Project = {
  name: string;
  description: string;
  metric: string;
  metricNote: string;
  tools: string;
  preview: () => React.ReactElement;
  href?: string;
  notes?: string;
};

const experience: Experience[] = [
  {
    company: "GSAlpha Labs",
    role: "Software Engineering Intern",
    note: "HomeFlow AI — 52-field contract intake at 96% accuracy",
    date: "May 2026 · Now",
  },
  {
    company: "SEDS @ UMD",
    role: "Software Engineer",
    note: "CubeSat GPS test framework, 4h regression down to 95min",
    date: "2024 · 2026",
  },
  {
    company: "theconviction.ai",
    role: "Software Engineering Intern",
    note: "SEC filings and transcripts for 50+ companies, one record",
    date: "May 2025 · Aug 2025",
  },
];

const projects: Project[] = [
  {
    name: "Tape",
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
  ["Languages", "Go, Python, Java, C++, C, TypeScript, JavaScript, SQL, Verilog"],
  [
    "Backend & data",
    "FastAPI, Node.js, PostgreSQL, Drizzle, SQLAlchemy, Supabase, Zod, WebSockets",
  ],
  [
    "Infrastructure",
    "AWS (S3, ECS, CloudWatch), Terraform, Docker, Linux, GitHub Actions, Vercel",
  ],
  ["Frameworks & ML", "React, Next.js, PyTorch, LLM extraction and evaluation"],
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
        <div className="experience-row" key={item.company}>
          <div className="row-company">{item.company}</div>
          <div className="row-detail">
            <span>{item.role}</span>
            <small>{item.note}</small>
          </div>
          <time>{item.date}</time>
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
          <article className="project" key={project.name}>
            <div className="project-head">
              <h3>{project.name}</h3>
              <div className="project-links">
                {project.notes ? (
                  <a href={project.notes} rel="noreferrer" target="_blank">
                    notes <Arrow />
                  </a>
                ) : null}
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
          <div>
            <h1>Ananmay Som Singh</h1>
            <p>Computer Engineering @ UMD</p>
            <p className="hero-note">
              I build backend and infrastructure software — market data
              capture, distributed build systems, and LLM pipelines that get
              measured before they ship.
            </p>
          </div>

          <nav className="contact-links" aria-label="Contact links">
            <EmailAction label="Email" />
            <a
              href="https://github.com/AnanmayS"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ananmaysingh"
              rel="noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
            <a href={`${basePath}/resume.pdf`} target="_blank">
              Résumé
            </a>
          </nav>
        </header>

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
