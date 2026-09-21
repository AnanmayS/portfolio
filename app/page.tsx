import { Clock } from "./clock";
import { Compose, ComposeTrigger } from "./compose";
import { DegreeProgress } from "./degree-progress";
import { ArrowIcon } from "./icons";
import { Intro } from "./intro";
import { Pill } from "./pill";
import { Reveal } from "./reveal";
import { ThemeToggle } from "./theme-toggle";
import { person, projects, roles, type Project } from "./content";

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

export default function Home() {
  return (
    <>
      <Pill resumeHref={resumeHref} />

      <main className="shell">
        <header className="in" style={{ "--i": 0 } as React.CSSProperties}>
          <Intro />
        </header>

        <div className="in" style={{ "--i": 1 } as React.CSSProperties}>
          <DegreeProgress buildNow={Date.now()} />
        </div>

        <div className="sections">
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
                      <span className="row-when mono">
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
                          <span className="row-when mono">{item.year}</span>
                        </div>
                      </div>
                      <ArrowIcon className="row-arrow" />
                    </a>
                    <p className="project-lede">{item.lede}</p>
                    <Reveal>
                      <figure className="project-figure">
                        <Art />
                        <figcaption className="project-stack mono">{item.stack}</figcaption>
                      </figure>
                    </Reveal>
                  </article>
                );
              })}
            </div>
          </section>

          <footer className="foot in" style={{ "--i": 4 } as React.CSSProperties}>
            <nav className="foot-group" aria-label="Contact">
              <ComposeTrigger>email</ComposeTrigger>
              <a href={person.github} rel="noreferrer" target="_blank">
                github
              </a>
              <a href={person.linkedin} rel="noreferrer" target="_blank">
                linkedin
              </a>
              <a href={resumeHref} target="_blank">
                résumé
              </a>
            </nav>
            <div className="foot-group">
              <span className="foot-where">
                {person.where} · <Clock />
              </span>
              <ThemeToggle />
            </div>
          </footer>
        </div>
      </main>

      <Compose />
    </>
  );
}
