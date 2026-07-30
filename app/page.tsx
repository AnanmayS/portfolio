import { EmailAction } from "./email-action";

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
  tools: string;
  href?: string;
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
    description: "Distributed game builds across workers, cutting build time by 59%.",
    tools: "Node.js, JavaScript, Docker",
    href: "https://github.com/AnanmayS/forgegrid",
  },
  {
    name: "ClosetAI",
    description: "AI wardrobe and outfit recommendations across 500+ items.",
    tools: "FastAPI, React, PostgreSQL",
    href: "https://github.com/AnanmayS/ClosetAI",
  },
  {
    name: "ShowdownRL",
    description: "A PPO battle agent with a 79% win rate over 2,000+ matches.",
    tools: "PyTorch, Python",
    href: "https://github.com/AnanmayS/ShowdownRL",
  },
  {
    name: "Ghost Line",
    description: "Telemetry-derived racing lines built from 400-point track maps.",
    tools: "FastF1, SciPy, Python",
    href: "https://github.com/AnanmayS/Formula-1-Telemetry-Analytics-Platform",
  },
];

const skills = [
  ["Languages", "Python, TypeScript, JavaScript, Java, C, SQL, Verilog"],
  ["Frameworks", "FastAPI, React, Next.js, Node.js, PyTorch"],
  ["Tools", "PostgreSQL, Supabase, Docker, GitHub Actions, GitHub Pages"],
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
        const content = (
          <>
            <div className="project-name">
              <strong>{project.name}</strong>
              {project.href ? <Arrow /> : null}
            </div>
            <p>{project.description}</p>
            <span className="project-tools">{project.tools}</span>
          </>
        );

        return project.href ? (
          <a
            href={project.href}
            key={project.name}
            rel="noreferrer"
            target="_blank"
          >
            {content}
          </a>
        ) : (
          <div key={project.name}>{content}</div>
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

          <Section title="Projects">
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

        <footer className="footer">
          <span>College Park, MD</span>
          <EmailAction label="Get in touch" showArrow />
        </footer>
      </div>
    </main>
  );
}
