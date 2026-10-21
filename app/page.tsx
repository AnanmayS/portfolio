import Link from "next/link";
import { Clock } from "./clock";
import { ComposeTrigger } from "./compose";
import { Count } from "./count";
import { Deck } from "./deck";
import { home, languages, person, projects, roles } from "./content";
import { OutIcon } from "./icons";
import { asset } from "./paths";
import { Plate } from "./plate";

/*
  The front page. The engraved plate opens it with the name set in its sky;
  then the deck of mounted plates: About and Now, the five projects (each
  numbered like a plate in a book, with the number that says it works),
  Experience, and Elsewhere.
*/
const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const words = ["one", "two", "three", "four", "five", "six", "seven", "eight"];

/* The three narrow plates, then the two wide ones. */
const span = (i: number) => (i < 3 ? "c4" : "c6");

const [first, ...last] = person.name.split(" ");

export default function Home() {
  const current = roles[0];

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
              <span className="mast-where mono">
                {person.whereLong} · <Clock />
              </span>
            </nav>
          </div>

          <div className="hero">
            <p className="label hero-eyebrow rise">{home.subline}</p>
            <h1 className="hero-name rise">
              {first} <em>{last.join(" ")}</em>
            </h1>
            <p className="hero-lede rise">{home.tagline}</p>
            <div className="hero-links rise">
              <a className="u" href={person.github} target="_blank" rel="noreferrer">
                GitHub <span className="k">↗</span>
              </a>
              <a className="u" href={person.linkedin} target="_blank" rel="noreferrer">
                LinkedIn <span className="k">↗</span>
              </a>
              <ComposeTrigger className="u" title={`Email ${person.email}`}>
                {person.email} <span className="k">write</span>
              </ComposeTrigger>
            </div>
          </div>
        </div>
      </header>

      <Deck className="deck wrap">
        <div className="grid">
          <section className="card c7" id="about" aria-labelledby="h-about">
            <div className="card-lab label">
              <span id="h-about">About</span>
              <span>{person.whereLong}</span>
            </div>
            <p className="about-text">{home.about}</p>
            <div className="langs mono">
              {languages.map((lang) => (
                <span key={lang}>{lang}</span>
              ))}
            </div>
          </section>

          <section className="card c5" id="now" aria-labelledby="h-now">
            <div className="card-lab label">
              <span id="h-now">Now</span>
              <span>{person.timeZone}</span>
            </div>
            <div className="now-time mono">
              <Clock />
            </div>
            <p className="now-place mono">local time in {person.whereLong}</p>
            <ul className="now-list">
              <li>
                <span className="dot dot-pulse" aria-hidden="true" />
                <span>
                  {current.title} at {current.company}
                </span>
              </li>
              <li>
                <span className="dot dot-dim" aria-hidden="true" />
                <span>
                  {person.school} · class of {person.classOf}
                </span>
              </li>
            </ul>
          </section>

          <div className="strip" id="projects">
            <h2>Projects</h2>
            <span className="strip-note mono">
              {words[projects.length - 1] ?? projects.length} plates · each with the number that says it works
            </span>
          </div>

          {projects.map((project, i) => (
            <Link key={project.slug} className={`card ${span(i)}`} href={`/work/${project.slug}`}>
              <div className="card-lab label">
                <span>Plate {numerals[i]}</span>
                <span>{project.year}</span>
              </div>
              <h3 className="proj-name">{project.name}</h3>
              <p className="proj-lede">{project.lede}</p>
              <div className="metric">
                <Count className="metric-value" value={project.metric.value} />
                <span className="metric-label mono">{project.metric.label}</span>
              </div>
              <div className="proj-stack mono">
                <span>{project.stack}</span>
                <span className="proj-go" aria-hidden="true">
                  open →
                </span>
              </div>
            </Link>
          ))}

          <section className="card c7" id="experience" aria-labelledby="h-xp">
            <div className="card-lab label">
              <span id="h-xp">Experience</span>
              <span>
                {roles[roles.length - 1].start} – now
              </span>
            </div>
            {roles.map((role) => (
              <div key={role.company} className="xp-row">
                <div>
                  <div className="xp-co">{role.company}</div>
                  <div className="xp-title">{role.title}</div>
                  <div className="xp-when mono">{role.when}</div>
                </div>
                <div className="xp-result">{role.result}</div>
              </div>
            ))}
          </section>

          <section className="card c5" id="contact" aria-labelledby="h-find">
            <div className="card-lab label">
              <span id="h-find">Elsewhere</span>
              <span>{person.handle}</span>
            </div>
            <ul className="find-list">
              <li>
                <a className="u" href={person.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <span className="k mono">github.com/{person.handle.slice(1)}</span>
              </li>
              <li>
                <a className="u" href={person.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <span className="k mono">{person.linkedinShort}</span>
              </li>
              <li>
                <ComposeTrigger title={`Email ${person.email}`}>
                  <span className="u">Email</span>
                  <span className="k mono">{person.email}</span>
                </ComposeTrigger>
              </li>
              <li>
                <a className="u" href={asset("/resume.pdf")} target="_blank" rel="noreferrer">
                  Résumé
                </a>
                <span className="k mono">
                  pdf <OutIcon size={10} />
                </span>
              </li>
            </ul>
          </section>
        </div>
      </Deck>

      <footer className="foot wrap mono">
        <span>© 2026 {person.fullName}</span>
        <span>set in Newsreader and Geist · plate tinted in the browser</span>
      </footer>
    </main>
  );
}
