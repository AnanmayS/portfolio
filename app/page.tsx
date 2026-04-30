"use client";

import { useEffect, useState } from "react";

const profile = {
  name: "Ananmay Som Singh",
  title: "computer engineering / software engineering / ml + devops",
  intro:
    "I’m a Computer Engineering student at the University of Maryland building software projects across machine learning, backend systems, DevOps, and data analytics.",
  about:
    "I’m interested in building real products that combine software engineering, machine learning, and infrastructure. I enjoy working on projects where I can turn data or automation into something useful, fast, and easy to use.",
  email: "ananmays20@gmail.com",
  github: "https://github.com/AnanmayS",
  linkedin: "https://www.linkedin.com/in/ananmaysingh",
};

const navItems = [
  { label: "about", href: "#about" },
  { label: "work", href: "#projects" },
  { label: "skills", href: "#skills" },
  { label: "contact", href: "#contact" },
];

const projects = [
  {
    name: "paper trading",
    fullName: "Polymarket Paper Trading Agent",
    description:
      "Paper trading agent for prediction markets that tracks simulated trades, strategy performance, and market signals.",
    tech: ["Python", "APIs", "React", "FastAPI"],
    github: "https://github.com/AnanmayS/polymarket-papertrade-agent",
  },
  {
    name: "ai equity",
    fullName: "AI Equity Research Platform",
    description:
      "AI-powered stock research platform that summarizes financial data, filings, and market signals for faster investment research.",
    tech: ["Python", "LLMs", "FastAPI", "React"],
    github: "https://github.com/AnanmayS/AI-Equity-Research-Platform",
  },
  {
    name: "f1 telemetry",
    fullName: "Formula 1 Telemetry Analytics Platform",
    description:
      "Analyzes historical F1 telemetry data, predicts race position changes, and visualizes real-time lap data.",
    tech: ["Python", "FastAPI", "React", "Docker", "XGBoost"],
    github:
      "https://github.com/AnanmayS/Formula-1-Telemetry-Analytics-Platform",
  },
  {
    name: "earnings ml",
    fullName: "Earnings Surprise Prediction Platform",
    description:
      "Machine learning system that predicts earnings beat or miss outcomes using financial statement and market-based features.",
    tech: ["Python", "XGBoost", "AWS", "React", "FastAPI"],
    github:
      "https://github.com/AnanmayS/Earnings-Surprise-Prediction-Platform",
  },
];

const skills = [
  ["languages", "Python, Java, JavaScript, TypeScript, OCaml, Verilog"],
  ["frontend", "React, Next.js, Tailwind CSS"],
  ["backend", "FastAPI, Node.js, REST APIs"],
  ["ml/data", "XGBoost, pandas, scikit-learn, data pipelines"],
  ["devops/cloud", "Docker, GitHub Actions, AWS S3, Lambda, API Gateway"],
];

function FolderIcon() {
  return (
    <span aria-hidden="true" className="folder-icon">
      <span />
    </span>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="site-section" id={id}>
      <h2>{title}:</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [isLight, setIsLight] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeData, setTimeData] = useState({
    collegeParkTime: "--:--",
    collegeParkDate: "--- · -- ---",
    userTime: "--:--",
    userDate: "--- · -- ---",
  });

  useEffect(() => {
    const formatTime = (date: Date, timeZone?: string) =>
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }).format(date);

    const formatDate = (date: Date, timeZone?: string) =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        timeZone,
      })
        .format(date)
        .replace(",", " ·");

    const updateTime = () => {
      const now = new Date();

      setTimeData({
        collegeParkTime: formatTime(now, "America/New_York"),
        collegeParkDate: formatDate(now, "America/New_York"),
        userTime: formatTime(now),
        userDate: formatDate(now),
      });
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main
      className={`mini-site ${isLight ? "theme-light" : ""} ${
        largeText ? "large-text" : ""
      }`}
    >
      <div className="mini-shell">
        <header className="topbar" id="top">
          <a className="wordmark" href="#top">
            {profile.name}
          </a>

          <div className="controls" aria-label="display controls">
            <button
              aria-label="toggle color theme"
              className="control-pill"
              onClick={() => setIsLight((value) => !value)}
              type="button"
            >
              <span className="control-dot" />
              <span>{isLight ? "☾" : "☼"}</span>
            </button>
            <button
              aria-label="toggle larger text"
              className="control-pill text-control"
              onClick={() => setLargeText((value) => !value)}
              type="button"
            >
              <span>A</span>
              <span>A</span>
            </button>
          </div>
        </header>

        <nav className="mini-nav" aria-label="primary navigation">
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <section className="intro">
          <p className="kicker">i build things with data + systems</p>
          <h1>{profile.title}</h1>
          <p>{profile.intro}</p>
        </section>

        <section className="widget-grid" aria-label="quick facts">
          <div className="mini-card weather-widget">
            <div className="widget-heading">
              <span>COLLEGE PARK</span>
              <span>MAINLY CLEAR</span>
            </div>
            <strong className="pixel-number">77°F</strong>
            <div className="pixel-sun" aria-hidden="true" />
            <div className="weather-bottom" aria-label="high 84 low 52">
              <span>84° / 52°</span>
            </div>
          </div>
          <div className="mini-card time-widget">
            <div className="time-zone">
              <span>COLLEGE PARK</span>
              <strong className="pixel-number">
                {timeData.collegeParkTime}
              </strong>
              <em>{timeData.collegeParkDate}</em>
            </div>
            <div className="time-zone">
              <span>YOU</span>
              <strong className="pixel-number">{timeData.userTime}</strong>
              <em>{timeData.userDate}</em>
            </div>
          </div>
          <a className="mini-card now-playing" href="#projects">
            <div className="views-art" aria-hidden="true" />
            <span>
              <small>last played</small>
              <strong>Views</strong>
              <em>Drake</em>
            </span>
          </a>
        </section>

        <Section id="about" title="about me">
          <ul className="dash-list">
            <li>raised in the bay area</li>
            <li>building ml products, games, and backend tools</li>
            <li>interested in ai agents and devops workflows</li>
            <li>like turning messy workflows into fast tools</li>
            <li>always trying to make projects feel useful</li>
          </ul>
        </Section>

        <Section id="projects" title="work">
          <div className="folder-grid">
            {projects.map((project) => (
              <a className="folder-link" href={project.github} key={project.name}>
                <FolderIcon />
                <span>{project.name}</span>
              </a>
            ))}
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-note" key={project.fullName}>
                <a href={project.github} rel="noreferrer" target="_blank">
                  {project.fullName}
                </a>
                <p>{project.description}</p>
                <small>{project.tech.join(" / ")}</small>
              </article>
            ))}
          </div>
        </Section>

        <Section id="interests" title="interests">
          <ul className="dash-list">
            <li>love nutella and ruffles</li>
            <li>usually down to play catan</li>
            <li>play badminton</li>
            <li>love music</li>
            <li>building games for fun</li>
            <li>automating my life with ai agents</li>
          </ul>
        </Section>

        <Section id="skills" title="skills">
          <ul className="dash-list">
            {skills.map(([group, value]) => (
              <li key={group}>
                <strong>{group}</strong> — {value}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="contact" title="contact">
          <p className="contact-copy">
            Feel free to reach out if you want to connect, collaborate, or talk
            about software engineering opportunities.
          </p>

          <div className="availability">
            <span className="pulse-dot" />
            <span>available for internships / software work</span>
          </div>

          <button className="mail-link" onClick={copyEmail} type="button">
            <span className="mail-icon" aria-hidden="true" />
            <span>{copied ? "copied email" : "copy email"}</span>
          </button>

          <div className="socials">
            <a href={profile.github} rel="noreferrer" target="_blank">
              github
            </a>
            <a href={profile.linkedin} rel="noreferrer" target="_blank">
              linkedin
            </a>
            <a href={`mailto:${profile.email}`}>email</a>
          </div>
        </Section>
      </div>
    </main>
  );
}
