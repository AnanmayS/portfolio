import { ContactForm } from "./contact-form";
import { DegreeProgress } from "./degree-progress";
import { EmailAction } from "./email-action";
import { Reveal } from "./reveal";
import { ThemeToggle } from "./theme-toggle";
import { person, projects, roles, stack, type Project } from "./content";

import { ForgeGridArt } from "./art/forgegrid";
import { ShowdownArt } from "./art/showdown";
import { TapeArt } from "./art/tape";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const resumeHref = `${basePath}/resume.pdf`;

/* One looping illustration per project, keyed so content.ts stays free of React. */
const art: Record<Project["slug"], () => React.ReactElement> = {
  tape: TapeArt,
  forgegrid: ForgeGridArt,
  showdownrl: ShowdownArt,
};

function Arrow() {
  return (
    <svg
      className="row-arrow"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="shell">
      <header className="intro in" style={{ "--i": 0 } as React.CSSProperties}>
        <h1>{person.name}</h1>
        <p className="intro-tagline">{person.tagline}</p>
        <DegreeProgress buildNow={Date.now()} />
      </header>

      <div className="sections">
        <section className="section in" style={{ "--i": 1 } as React.CSSProperties}>
          <h2 className="section-title">Work</h2>
          <div>
            {projects.map((item) => {
              const Art = art[item.slug];

              return (
                <article key={item.slug} className="project" id={item.slug}>
                  <a
                    className="row is-link"
                    href={item.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="row-lead">{item.name}</div>
                    <div className="row-body">
                      <div className="row-line">
                        <span className="row-title">{item.what}</span>
                        <span className="row-when">{item.year}</span>
                      </div>
                    </div>
                    <Arrow />
                  </a>
                  <p className="project-lede">{item.lede}</p>
                  <Reveal>
                    <figure className="project-figure">
                      <Art />
                    </figure>
                  </Reveal>
                  <p className="project-stack">{item.stack}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section in" style={{ "--i": 2 } as React.CSSProperties}>
          <h2 className="section-title">Experience</h2>
          <div>
            {roles.map((role) => (
              <article key={role.company} className="row">
                <div className="row-lead">{role.company}</div>
                <div className="row-body">
                  <div className="row-line">
                    <span className="row-title">
                      {role.title}
                      <span className="row-sub"> · {role.where}</span>
                    </span>
                    <span className="row-when">
                      {role.start}
                      {role.end === null
                        ? " –"
                        : role.end !== role.start
                          ? ` – ${role.end.slice(2)}`
                          : ""}
                    </span>
                  </div>
                  <ul className="row-points">
                    {role.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section in" style={{ "--i": 3 } as React.CSSProperties}>
          <h2 className="section-title">Stack</h2>
          <p className="stack-line">{stack}</p>
        </section>

        <footer className="foot in" style={{ "--i": 4 } as React.CSSProperties}>
          <nav className="foot-group" aria-label="Contact">
            <EmailAction label="email" />
            <a href={person.github} rel="noreferrer" target="_blank">
              github
            </a>
            <a href={person.linkedin} rel="noreferrer" target="_blank">
              linkedin
            </a>
            <ContactForm />
          </nav>
          <div className="foot-group">
            <span className="foot-where">{person.where}</span>
            <a href={resumeHref} target="_blank">
              résumé
            </a>
            <ThemeToggle />
          </div>
        </footer>
      </div>
    </main>
  );
}
