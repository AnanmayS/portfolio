import { EmailAction } from "./email-action";
import { ContactForm } from "./contact-form";
import {
  ClosetPreview,
  ForgeGridPreview,
  GhostLinePreview,
  ShowdownPreview,
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
    note: "AI research platform for catalyst-driven swing trading",
    date: "May 2026 · Now",
  },
  {
    company: "SEDS @ UMD",
    role: "Software Engineer",
    note: "Python FPGA testing, 60% faster simulation",
    date: "2024 · 2026",
  },
  {
    company: "Marine Mammal Center",
    role: "Software Engineering Intern",
    note: "Docker CI, 75% faster release validation",
    date: "Jun 2025 · Jul 2025",
  },
  {
    company: "XR EDU",
    role: "Software Engineer & Technical Lead",
    note: "5+ Unity VR apps across 15+ workshops",
    date: "2023 · 2024",
  },
];

const projects: Project[] = [
  {
    name: "ForgeGrid",
    description:
      "Splits a game build into 7 independent tasks and schedules them across Node.js workers. Content-based caching skips unchanged tasks on rebuild, and a worker dying mid-build gets its task reassigned instead of failing the run.",
    metric: "2.5s → 1.0s",
    metricNote: "59% faster · benchmarked 1–8 workers",
    tools: "Node.js · Docker · JavaScript",
    preview: ForgeGridPreview,
    href: "https://github.com/AnanmayS/forgegrid",
  },
  {
    name: "ShowdownRL",
    description:
      "A PPO agent that plays live Pokémon Showdown battles through Playwright, learning from 100+ engineered battle features. The eval harness runs 2,000+ matches per policy version against opponents of known strength, so improvements are measurable rather than anecdotal.",
    metric: "79% win rate",
    metricNote: "vs. 50% baseline · 2,000+ matches",
    tools: "PyTorch · Gymnasium · Playwright · Python",
    preview: ShowdownPreview,
    href: "https://github.com/AnanmayS/ShowdownRL",
  },
  {
    name: "ClosetAI",
    description:
      "A computer-vision pipeline that cleans clothing photos and tags 10 attributes per item, feeding a recommender that scores 10,000+ outfit combinations against weather, occasion, and past feedback.",
    metric: "500+ items tagged",
    metricNote: "10,000+ combinations scored · under 2s",
    tools: "FastAPI · Next.js · PostgreSQL · TypeScript",
    preview: ClosetPreview,
    href: "https://github.com/AnanmayS/ClosetAI",
  },
  {
    name: "Ghost Line",
    description:
      "Reconstructs the line a car actually drove from FastF1 telemetry, resampling each lap onto a 400-point track map so two drivers' laps can be compared at the same point on the circuit instead of the same point in time.",
    metric: "400-point resampling",
    metricNote: "lap-over-lap delta by track position",
    tools: "FastF1 · SciPy · NumPy · Python",
    preview: GhostLinePreview,
    href: "https://github.com/AnanmayS/Formula-1-Telemetry-Analytics-Platform",
  },
];

const skills = [
  ["Languages", "Python, TypeScript, JavaScript, Java, C, SQL, Verilog"],
  ["Frameworks", "FastAPI, React, Next.js, Node.js, PyTorch"],
  ["Tools", "AWS, PostgreSQL, Supabase, Docker, GitHub Actions, GitHub Pages"],
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
              I build useful software across machine learning, backend systems,
              data, and games.
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
