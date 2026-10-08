import Link from "next/link";
import { Clock } from "./clock";
import { ComposeTrigger } from "./compose";
import { home, person, picks, roles } from "./content";
import {
  ArrowIcon,
  BriefcaseIcon,
  CompassIcon,
  ForkIcon,
  GitHubIcon,
  LockIcon,
  OutIcon,
  PersonIcon,
} from "./icons";
import { asset } from "./paths";

/*
  The front page. A painting at the top with the name over it, then two
  columns of cards on a dark ground: About, Experience and Find me on the
  left; Projects on the right. The columns stretch to the same height, so
  the last card in each ends on the same line.
*/
export default function Home() {
  return (
    <main className="home">
      <section className="hero" id="top">
        <img className="hero-img" src={asset(`/paintings/${home.painting}`)} alt={home.paintingAlt} />
        <div className="hero-dim" aria-hidden="true" />
        <div className="hero-fade" aria-hidden="true" />

        <div className="topbar in" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="pill">
            <span className="dot dot-ok" aria-hidden="true" />
            {person.first.toLowerCase()}
            <span className="pill-clock mono">
              <Clock /> {person.where.toLowerCase()}
            </span>
          </span>
          <nav className="topnav" aria-label="Site">
            <Link href="/work">
              work
              <ArrowIcon size={11} />
            </Link>
            <a href={asset("/resume.pdf")} target="_blank" rel="noreferrer">
              résumé
              <OutIcon size={11} />
            </a>
            <a className="iconbtn" href={person.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GitHubIcon size={15} />
            </a>
          </nav>
        </div>

        <div className="hero-text in" style={{ "--i": 1 } as React.CSSProperties}>
          <p className="mono hero-eyebrow">{home.eyebrow}</p>
          <h1 className="hero-name">{person.name}</h1>
          <p className="hero-tagline">{home.tagline}</p>
          <p className="hero-sub">{home.subline}</p>
          <div className="hero-actions">
            <ComposeTrigger className="btn btn-primary" title={`Email ${person.email}`}>
              Get in touch
              <ArrowIcon size={13} />
            </ComposeTrigger>
          </div>
        </div>

        <p className="mono hero-credit">{home.paintingCredit}</p>
      </section>

      <div className="grid">
        <div className="col">
          <section className="card in" id="about" style={{ "--i": 2 } as React.CSSProperties}>
            <h2 className="card-title">
              <PersonIcon size={13} />
              About
            </h2>
            <p className="about">{home.about}</p>
          </section>

          <section className="card in" id="experience" style={{ "--i": 3 } as React.CSSProperties}>
            <h2 className="card-title">
              <BriefcaseIcon size={13} />
              Experience
            </h2>
            <ul className="rows">
              {roles.map((role, i) => (
                <li key={role.company} className="row">
                  <div className="row-line">
                    <span className={`dot ${i === 0 ? "dot-ok" : "dot-dim"}`} aria-hidden="true" />
                    <span className="row-name">{role.company}</span>
                    <span className="mono row-when">{role.when}</span>
                  </div>
                  <p className="row-text row-indent">
                    {role.title}. {role.result}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="card card-fill in" id="contact" style={{ "--i": 4 } as React.CSSProperties}>
            <h2 className="card-title">
              <CompassIcon size={13} />
              Find me
            </h2>
            <ul className="links">
              <li>
                <a className="link" href={person.linkedin} target="_blank" rel="noreferrer">
                  <span className="dot dot-ok" aria-hidden="true" />
                  <span className="mono link-key">linkedin</span>
                  <span className="link-val">{person.linkedinShort}</span>
                  <span className="link-end" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a className="link" href={person.github} target="_blank" rel="noreferrer">
                  <span className="dot dot-ok" aria-hidden="true" />
                  <span className="mono link-key">github</span>
                  <span className="link-val">{person.handle.slice(1)}</span>
                  <span className="link-end" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <ComposeTrigger className="link" title={`Email ${person.email}`}>
                  <span className="dot dot-ok" aria-hidden="true" />
                  <span className="mono link-key">email</span>
                  <span className="link-val">{person.email}</span>
                  <span className="link-end" aria-hidden="true">
                    write
                  </span>
                </ComposeTrigger>
              </li>
              <li>
                <a className="link" href={asset("/resume.pdf")} target="_blank" rel="noreferrer">
                  <span className="dot dot-ok" aria-hidden="true" />
                  <span className="mono link-key">resume</span>
                  <span className="link-val">resume.pdf</span>
                  <span className="link-end" aria-hidden="true">
                    ↓
                  </span>
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="col">
          <section className="card card-fill in" id="projects" style={{ "--i": 2 } as React.CSSProperties}>
            <h2 className="card-title">
              <ForkIcon size={13} />
              Projects <span className="card-count">{picks.length}</span>
            </h2>
            <ul className="rows">
              {picks.map((pick) => (
                <li key={pick.name} className="row">
                  <div className="row-line">
                    {pick.slug ? (
                      <Link className="row-name" href={`/work/${pick.slug}`}>
                        {pick.name}
                      </Link>
                    ) : (
                      <span className="row-name">{pick.name}</span>
                    )}
                    <span className="mono row-stack">{pick.stack}</span>
                    {pick.href ? (
                      <a className="mono row-repo" href={pick.href} target="_blank" rel="noreferrer">
                        github <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <span className="mono row-repo">
                        <LockIcon size={11} />
                        private
                      </span>
                    )}
                  </div>
                  <p className="row-text">{pick.blurb}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="foot mono">
        <span>© 2026 {person.fullName.toLowerCase()}</span>
        <span>{person.whereLong.toLowerCase()}</span>
      </footer>
    </main>
  );
}
