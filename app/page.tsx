"use client";

import { useEffect, useMemo, useState } from "react";

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
    name: "daily delve",
    fullName: "Daily Delve",
    description:
      "Browser roguelike shooter with a deterministic daily dungeon, seeded treasure choices, weapon drops, boss phases, and local run history.",
    tech: ["TypeScript", "Vite", "Phaser 3", "LocalStorage"],
    github: "https://github.com/AnanmayS/Daily-Devele",
  },
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

type DrakeTrack = {
  artistName: string;
  artworkUrl100: string;
  collectionName: string;
  trackId: number;
  trackName: string;
  trackViewUrl: string;
};

const fallbackTrack: DrakeTrack = {
  artistName: "Drake",
  artworkUrl100:
    "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b6/5d/2f/b65d2f34-511c-c2f9-087e-5fd46afab93d/24UMGIM85348.rgb.jpg/300x300bb.jpg",
  collectionName: "100 GIGS",
  trackId: 1762404568,
  trackName: "It's Up",
  trackViewUrl:
    "https://music.apple.com/us/album/its-up-feat-young-thug-21-savage/1762404567?i=1762404568",
};

function getLargeArtworkUrl(url: string) {
  return url.replace(/\/\d+x\d+bb\.(jpg|png|webp)$/i, "/300x300bb.$1");
}

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

function DailyDelveShowcase() {
  const todaySeed = useMemo(
    () => new Intl.DateTimeFormat("en-CA").format(new Date()),
    [],
  );

  return (
    <article
      aria-label="Daily Delve animated gameplay preview"
      className="daily-delve-preview"
    >
      <div className="game-preview-head">
        <div>
          <span>animated project preview</span>
          <h3>Daily Delve</h3>
        </div>
        <strong>Phaser</strong>
      </div>

      <div
        aria-label="Looping gameplay recording of Daily Delve"
        className="delve-stage"
      >
        <video
          aria-label={`Daily Delve gameplay preview recorded from the ${todaySeed} build`}
          autoPlay
          className="delve-video"
          loop
          muted
          playsInline
          preload="metadata"
          src="/daily-delve-preview/gameplay-preview.mov"
        />
      </div>

      <p>Daily seeded top-down roguelike shooter with quick room fights, weapon drops, and boss runs.</p>

      <a
        className="game-source-link"
        href="https://github.com/AnanmayS/Daily-Devele"
        rel="noreferrer"
        target="_blank"
      >
        view project source
      </a>
    </article>
  );
}

export default function Home() {
  const [isLight, setIsLight] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drakeTrack, setDrakeTrack] = useState<DrakeTrack>(fallbackTrack);
  const [timeData, setTimeData] = useState({
    collegeParkTime: "--:--",
    collegeParkDate: "--- · -- ---",
    userTime: "--:--",
    userDate: "--- · -- ---",
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadRandomDrakeSong = async () => {
      try {
        const response = await fetch(
          "https://itunes.apple.com/search?term=drake&country=US&media=music&entity=song&attribute=artistTerm&limit=200",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to load Drake tracks");
        }

        const data = (await response.json()) as { results?: DrakeTrack[] };
        const tracks = (data.results ?? []).filter(
          (track) =>
            track.artistName === "Drake" &&
            track.artworkUrl100 &&
            track.trackName &&
            track.trackViewUrl,
        );

        if (tracks.length > 0) {
          const nextTrack = tracks[Math.floor(Math.random() * tracks.length)];
          setDrakeTrack({
            ...nextTrack,
            artworkUrl100: getLargeArtworkUrl(nextTrack.artworkUrl100),
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setDrakeTrack(fallbackTrack);
        }
      }
    };

    loadRandomDrakeSong();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
    } else {
      document.documentElement.classList.add("motion-ready");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
      );

      revealTargets.forEach((target) => observer.observe(target));

      return () => {
        observer.disconnect();
        document.documentElement.classList.remove("motion-ready");
      };
    }
  }, []);

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
        <header className="topbar" data-reveal="entry" id="top">
          <a className="wordmark" href="#top">
            {profile.name}
          </a>

          <div className="controls" aria-label="display controls">
            <button
              aria-label={`switch to ${isLight ? "dark" : "light"} mode`}
              className="control-pill icon-control"
              onClick={() => setIsLight((value) => !value)}
              type="button"
              title={`Switch to ${isLight ? "dark" : "light"} mode`}
            >
              <span
                aria-hidden="true"
                className={`theme-icon ${isLight ? "theme-icon-sun" : "theme-icon-moon"}`}
              />
              <span className="sr-only">
                {isLight ? "light mode" : "dark mode"}
              </span>
            </button>
            <button
              aria-label={`switch to ${largeText ? "regular" : "larger"} text`}
              className="control-pill icon-control text-control"
              onClick={() => setLargeText((value) => !value)}
              type="button"
              title={`Switch to ${largeText ? "regular" : "larger"} text`}
            >
              <span
                aria-hidden="true"
                className={`font-size-icon ${
                  largeText ? "font-size-icon-large" : "font-size-icon-regular"
                }`}
              >
                A
              </span>
              <span className="sr-only">
                {largeText ? "regular text" : "larger text"}
              </span>
            </button>
          </div>
        </header>

        <nav
          aria-label="primary navigation"
          className="mini-nav"
          data-reveal="entry"
        >
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <section className="intro" data-reveal="entry">
          <p className="kicker">i build things with data + systems</p>
          <h1>{profile.title}</h1>
          <p>{profile.intro}</p>
        </section>

        <section
          aria-label="quick facts"
          className="widget-grid"
          data-reveal="entry"
        >
          <div className="mini-card weather-widget widget-card-one">
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
          <div className="mini-card time-widget widget-card-two">
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
          <a
            aria-label={`Now playing ${drakeTrack.trackName} by ${drakeTrack.artistName}, from ${drakeTrack.collectionName}`}
            className="mini-card now-playing widget-card-three"
            href={drakeTrack.trackViewUrl}
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt={`${drakeTrack.collectionName} album artwork`}
              className="album-art"
              height="80"
              src={drakeTrack.artworkUrl100}
              width="80"
            />
            <span>
              <small>listening to</small>
              <strong>{drakeTrack.trackName}</strong>
              <em>{drakeTrack.collectionName}</em>
            </span>
          </a>
        </section>

        <div data-reveal="section">
          <Section id="about" title="about me">
            <ul className="dash-list">
              <li>raised in the bay area</li>
              <li>building ml products, games, and backend tools</li>
              <li>interested in ai agents and devops workflows</li>
              <li>like turning messy workflows into fast tools</li>
              <li>always trying to make projects feel useful</li>
            </ul>
          </Section>
        </div>

        <div data-reveal="section">
          <Section id="projects" title="work">
            <DailyDelveShowcase />

            <div className="folder-grid">
              {projects.map((project) => (
                <a
                  className="folder-link"
                  href={project.github}
                  key={project.name}
                >
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
        </div>

        <div data-reveal="section">
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
        </div>

        <div data-reveal="section">
          <Section id="skills" title="skills">
            <ul className="dash-list">
              {skills.map(([group, value]) => (
                <li key={group}>
                  <strong>{group}</strong>: {value}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div data-reveal="section">
          <Section id="contact" title="contact">
            <p className="contact-copy">
              Feel free to reach out if you want to connect, collaborate, or
              talk about software engineering opportunities.
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
      </div>
    </main>
  );
}
