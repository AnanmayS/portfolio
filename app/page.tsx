type WorkItem = {
  name: string;
  logo: string;
  logoClass?: string;
  logoImg?: string;
  href?: string;
  rows: Array<{
    title: string;
    note?: string;
    start: string;
    end?: string;
  }>;
};

type Mention = {
  year: string;
  title: string;
  note: string;
  href: string;
};

const latest: WorkItem[] = [
  {
    name: "SEDS @ UMD",
    logo: "SD",
    rows: [
      {
        title: "Software Engineer",
        note: "CI/CD, Docker, LLM automation",
        start: "2024",
        end: "26",
      },
    ],
  },
  {
    name: "Marine Mammal Center",
    logo: "MM",
    rows: [
      {
        title: "Software Engineering Intern",
        note: "CI/CD, Python, Node.js",
        start: "2025",
      },
    ],
  },
  {
    name: "XR EDU",
    logo: "XR",
    rows: [
      {
        title: "Software Engineer",
        note: "React, PostgreSQL",
        start: "2023",
        end: "24",
      },
    ],
  },
];

const earlier: WorkItem[] = [
  {
    name: "AI Equity",
    logo: "AI",
    logoImg: "/project-icons/ai-equity.png",
    href: "https://github.com/AnanmayS/AI-Equity-Research-Platform",
    rows: [
      {
        title: "Multi-agent research platform",
        note: "Next.js, Supabase, Claude API",
        start: "2026",
      },
    ],
  },
  {
    name: "Polymarket",
    logo: "PM",
    logoImg: "/project-icons/polymarket.png",
    href: "https://github.com/AnanmayS/polymarket-papertrade-agent",
    rows: [
      {
        title: "Event-driven trading engine",
        note: "Python, FastAPI, PostgreSQL",
        start: "2026",
      },
    ],
  },
  {
    name: "ShowdownRL",
    logo: "SR",
    logoImg: "/project-icons/showdownrl.png",
    href: "https://github.com/AnanmayS/ShowdownRL",
    rows: [
      {
        title: "PPO-trained Pokemon battle agent",
        note: "Python, PPO, Playwright, Gymnasium",
        start: "2026",
      },
    ],
  },
  {
    name: "Daily Delve",
    logo: "DD",
    logoImg: "/project-icons/daily-delve.png",
    href: "https://github.com/AnanmayS/Daily-Devele",
    rows: [
      {
        title: "Procedural dungeon crawler",
        note: "TypeScript, Phaser",
        start: "2025",
      },
    ],
  },
];

const skills = [
  ["Languages", "Python, TypeScript/JavaScript, Java, C++, C, SQL"],
  ["Frameworks", "React, Next.js, FastAPI, Node.js"],
  ["Cloud & Infra", "AWS, Docker, GitHub Actions, Terraform"],
  ["ML/Data", "PyTorch, XGBoost, scikit-learn, Pandas, PostgreSQL"],
];

const misc: Mention[] = [
  {
    year: "Coursework",
    title: "Computer Systems (C), Algorithms (Java), Programming Languages (OCaml, Rust), Computer Architecture, Digital Logic Design (Verilog), FPGA Lab",
    note: "",
    href: "https://umd.edu/",
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 11v5" />
      <path d="M8 8v.01" />
      <path d="M12 16v-5" />
      <path d="M16 16v-3a2 2 0 1 0-4 0" />
      <path d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3" />
      <path d="M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M9 13h6" />
      <path d="M9 17h3" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Logo({ children, className = "", img }: { children?: string; className?: string; img?: string }) {
  if (img) {
    return (
      <span className={`logo ${className}`}>
        <img src={img} alt="" className="logo-img" />
      </span>
    );
  }
  return <span className={`logo ${className}`}>{children}</span>;
}

function WorkEntry({ item }: { item: WorkItem }) {
  const content = (
    <>
      <div className="entry-company">
        <Logo className={item.logoClass} img={item.logoImg}>{item.logo}</Logo>
        <span>{item.name}</span>
      </div>
      <div className="entry-detail">
        {item.rows.map((row) => (
          <div className="entry-row" key={`${row.title}-${row.start}`}>
            <div className="entry-title-wrap">
              <span className={item.href ? "underline-title" : undefined}>{row.title}</span>
              {row.note ? <span className="entry-note">{row.note}</span> : null}
            </div>
            <div className="entry-years">
              <span>{row.start}</span>
              {row.end ? (
                <>
                  <span>–</span>
                  <span>{row.end}</span>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="entry-arrow">{item.href ? <ArrowIcon /> : null}</div>
    </>
  );

  if (!item.href) {
    return <div className="work-entry is-static">{content}</div>;
  }

  return (
    <a className="work-entry" href={item.href} rel="noreferrer" target="_blank">
      {content}
    </a>
  );
}

export default function Home() {
  return (
    <main className="site-main">
      <div className="page-shell">
        <header className="hero animate-in">
          <h1>Ananmay Som Singh</h1>
          <p>Computer Engineering @ UMD</p>
        </header>

        <div className="content-stack">
          <Section title="Education">
            <div className="work-entry is-static">
              <div className="entry-company">
                <span className="logo">
                  <img src="/umd-logo.png" alt="UMD" className="logo-img" />
                </span>
                <span>University of Maryland</span>
              </div>
              <div className="entry-detail">
                <div className="entry-row">
                  <div className="entry-title-wrap">
                    <span>B.S. Computer Engineering</span>
                    <span className="entry-note">College Park, MD</span>
                  </div>
                  <div className="entry-years">
                    <span>2024</span>
                    <span>–</span>
                    <span>28</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Experience">
            {latest.map((item) => (
              <WorkEntry item={item} key={item.name} />
            ))}
          </Section>

          <Section title="Projects">
            {earlier.map((item) => (
              <WorkEntry item={item} key={item.name} />
            ))}
          </Section>

          <Section title="Skills">
            <div className="license-list">
              {skills.map(([label, value]) => (
                <div className="license-row" key={label}>
                  <div>{label}</div>
                  <div>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Misc">
            <div className="mention-list">
              {misc.map((item) => (
                <a className="mention-row" href={item.href} key={item.title} rel="noreferrer" target="_blank">
                  <span className="mention-year">{item.year}</span>
                  <span className="mention-title">
                    <span className="underline-title">{item.title}</span>
                    <span className="mention-note">{item.note}</span>
                  </span>
                </a>
              ))}
            </div>
          </Section>
        </div>

        <footer className="footer-bar" aria-label="social links">
          <div className="footer-icons">
            <a aria-label="LinkedIn" href="https://www.linkedin.com/in/ananmaysingh" rel="noreferrer" target="_blank">
              <LinkedInIcon />
            </a>
            <a aria-label="GitHub" href="https://github.com/AnanmayS" rel="noreferrer" target="_blank">
              <GitHubIcon />
            </a>
            <a aria-label="Email" href="mailto:ananmays20@gmail.com">
              <MailIcon />
            </a>
          </div>
          <a className="resume-link" href="/resume.pdf" target="_blank">
            <ResumeIcon />
            <span>Resume</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
