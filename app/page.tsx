import { Clock } from "./clock";
import { Compose } from "./compose";
import { Contact } from "./contact";
import { DegreeProgress } from "./degree-progress";
import { Intro } from "./intro";
import { Reveal } from "./reveal";
import { Showcase } from "./showcase";
import { ThemeToggle } from "./theme-toggle";
import { person, projects, roles, type Project, type Role } from "./content";

import { PondArt } from "./art/pond";
import { ShowdownArt } from "./art/showdown";
import { TapeArt } from "./art/tape";
import { WildebeestArt } from "./art/wildebeest";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const resumeHref = `${basePath}/resume.pdf`;

/* One looping illustration per project, keyed so content.ts stays free of React.
   Each gets the base path in case it serves an image. */
const art: Record<Project["slug"], (props: { basePath: string }) => React.ReactElement> = {
  wildebeest: WildebeestArt,
  tape: TapeArt,
  showdownrl: ShowdownArt,
};

/* "2026 –" while ongoing, "2024 – 26" across years, "2025" within one. */
function when(role: Role) {
  if (role.end === null) return `${role.start} –`;
  if (role.end !== role.start) return `${role.start} – ${role.end.slice(2)}`;
  return role.start;
}

export default function Home() {
  return (
    <>
      <main className="split">
        <div className="side">
          <div className="in" style={{ "--i": 0 } as React.CSSProperties}>
            <Reveal>
              <PondArt />
            </Reveal>
          </div>

          <header className="in" style={{ "--i": 1 } as React.CSSProperties}>
            <Intro />
          </header>

          <div className="in" style={{ "--i": 2 } as React.CSSProperties}>
            <Contact resumeHref={resumeHref} />
          </div>

          <div className="in" style={{ "--i": 3 } as React.CSSProperties}>
            <DegreeProgress buildNow={Date.now()} />
          </div>

          <section className="xp in" style={{ "--i": 4 } as React.CSSProperties}>
            <h2 className="section-title">Experience</h2>
            <ul className="xp-list">
              {roles.map((role) => (
                <li key={role.company} className="xp-row">
                  <div className="xp-line">
                    <span>
                      <b className="xp-company">{role.company}</b>
                      <span className="xp-title"> · {role.title}</span>
                    </span>
                    <span className="xp-when mono">{when(role)}</span>
                  </div>
                  <span className="xp-result">{role.result}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="work in" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="work-head">
            <h2 className="section-title">Work</h2>
            <div className="work-meta">
              <span>
                {person.where} · <Clock />
              </span>
              <ThemeToggle />
            </div>
          </div>

          <Showcase
            items={projects.map((item) => {
              const Art = art[item.slug];
              return { ...item, art: <Art basePath={basePath} /> };
            })}
          />
        </section>
      </main>

      <Compose />
    </>
  );
}
