import Link from "next/link";
import { AskTeaser } from "./ask-teaser";
import { Contact } from "./contact";
import { DegreeProgress } from "./degree-progress";
import { ArrowIcon } from "./icons";
import { Intro } from "./intro";
import { asset } from "./paths";
import { projects, roles, type Role } from "./content";

/* "2026 –" while ongoing, "2024 – 26" across years, "2025" within one. */
function when(role: Role) {
  if (role.end === null) return `${role.start} –`;
  if (role.end !== role.start) return `${role.start} – ${role.end.slice(2)}`;
  return role.start;
}

/*
  The front page, in two quiet columns. Left, you: a painting of a Maryland
  terrapin, a name and two sentences, the ways out, the degree. Right, what
  you've done: the roles, the work as one line per project (the demos hang
  on /work), and a way into "Ask about me".
*/
export default function Home() {
  return (
    <main className="split">
      <div className="side">
        <figure className="hang in" style={{ "--i": 0 } as React.CSSProperties}>
          <img
            className="hang-img"
            src={asset("/paintings/terrapin.webp")}
            alt="An impressionist painting of a diamondback terrapin sunning on a rock in a Maryland marsh, black-eyed Susans in the foreground."
          />
        </figure>

        <header className="in" style={{ "--i": 1 } as React.CSSProperties}>
          <Intro />
        </header>

        <div className="in" style={{ "--i": 2 } as React.CSSProperties}>
          <Contact resumeHref={asset("/resume.pdf")} />
        </div>

        <div className="in" style={{ "--i": 3 } as React.CSSProperties}>
          <DegreeProgress buildNow={Date.now()} />
        </div>
      </div>

      <div className="side">
        <section className="xp in" style={{ "--i": 2 } as React.CSSProperties}>
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

        <section className="picks in" style={{ "--i": 3 } as React.CSSProperties}>
          <div className="picks-head">
            <h2 className="section-title">Work</h2>
            <Link className="picks-all" href="/work">
              See the work
              <ArrowIcon size={12} />
            </Link>
          </div>
          <ul className="picks-list">
            {projects.map((item) => (
              <li key={item.slug}>
                <Link className="pick" href={`/work/${item.slug}`}>
                  <img className="pick-thumb" src={asset(`/paintings/${item.painting}`)} alt="" loading="lazy" />
                  <span className="pick-text">
                    <span className="pick-name">{item.name}</span>
                    <span className="pick-metric">
                      <b>{item.metric.value}</b> {item.metric.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="in" style={{ "--i": 4 } as React.CSSProperties}>
          <AskTeaser />
        </div>
      </div>
    </main>
  );
}
