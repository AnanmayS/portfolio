import Link from "next/link";
import { ComposeTrigger } from "./compose";
import { Countdown } from "./countdown";
import { home, person, projects, roles } from "./content";
import { asset } from "./paths";
import { Plate } from "./plate";

/*
  The front page. The engraved plate opens it with the name, one line, two
  sentences and three links in its sky, and a flip clock counting down to
  graduation at the right. Then the five projects as mounted plates, each
  with its one number, and the work history as plain rows.
*/

/* The three narrow plates, then the two wide ones. */
const span = (i: number) => (i < 3 ? "c4" : "c6");

export default function Home() {
  return (
    <main className="home">
      <header className="plate" id="top">
        <Plate src={asset(`/plates/${home.plate}`)} alt={home.plateAlt} />
        <div className="plate-fog" aria-hidden="true" />

        <div className="wrap">
          <div className="mast">
            <Link className="mark" href="/" aria-label={`${person.name}, home`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
                <circle cx="12" cy="12" r="10.5" />
                <circle cx="12" cy="12" r="4" />
                <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4M4.6 4.6l2.8 2.8M16.6 16.6l2.8 2.8M4.6 19.4l2.8-2.8M16.6 7.4l2.8-2.8" />
                <path d="M12 8l1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2z" fill="currentColor" stroke="none" />
              </svg>
              <span>{person.name}</span>
            </Link>
            <nav className="mast-nav" aria-label="Site">
              <Link className="u" href="/work">
                Work
              </Link>
              <a className="u" href={asset("/resume.pdf")} target="_blank" rel="noreferrer">
                Résumé
              </a>
            </nav>
          </div>

          <div className="hero">
            <div className="hero-text">
              <h1 className="hero-name rise">{person.name}</h1>
              <p className="hero-lede rise">{home.tagline}</p>
              <p className="hero-about rise">{home.about}</p>
              <div className="hero-links rise">
                <a className="u" href={person.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a className="u" href={person.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <ComposeTrigger className="u" title={`Email ${person.email}`}>
                  {person.email} <span className="k">write</span>
                </ComposeTrigger>
              </div>
            </div>
            <div className="hero-clock rise">
              <Countdown to={person.graduation} label={person.graduationLabel} />
            </div>
          </div>
        </div>
      </header>

      <div className="deck wrap">
        <div className="grid" id="projects">
          {projects.map((project, i) => (
            <Link key={project.slug} className={`card ${span(i)}`} href={`/work/${project.slug}`}>
              <div className="proj-head">
                <h2 className="proj-name">{project.name}</h2>
                <span className="proj-year">{project.year}</span>
              </div>
              <p className="proj-lede">{project.lede}</p>
              <div className="metric">
                <b className="metric-value">{project.metric.value}</b>
                <span className="metric-label">{project.metric.label}</span>
              </div>
              <p className="proj-stack">{project.stack}</p>
            </Link>
          ))}
        </div>

        <section className="xp" id="experience" aria-labelledby="h-xp">
          <h2 id="h-xp">Where I&rsquo;ve worked</h2>
          {roles.map((role) => (
            <div key={role.company} className="xp-row">
              <div>
                <div className="xp-co">{role.company}</div>
                <div className="xp-title">{role.title}</div>
                <div className="xp-when">{role.when}</div>
              </div>
              <div className="xp-result">{role.result}</div>
            </div>
          ))}
        </section>
      </div>

      <footer className="foot wrap">
        <span>© 2026 {person.name}</span>
        <span>{person.whereLong}</span>
      </footer>
    </main>
  );
}
