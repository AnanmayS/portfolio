import Link from "next/link";
import { AskTeaser } from "./ask-teaser";
import { Clock } from "./clock";
import { Contact } from "./contact";
import { DegreeProgress } from "./degree-progress";
import { Framed } from "./framed";
import { Intro } from "./intro";
import { asset } from "./paths";
import { person, projects, roles, type Role } from "./content";

/* "2026 –" while ongoing, "2024 – 26" across years, "2025" within one. */
function when(role: Role) {
  if (role.end === null) return `${role.start} –`;
  if (role.end !== role.start) return `${role.start} – ${role.end.slice(2)}`;
  return role.start;
}

/*
  The front page, hung like a small gallery in two equal columns. Left, you:
  a painting of a Maryland terrapin, a name and two sentences, the ways out,
  the degree, the roles and a way into "Ask about me". Right, the work: each
  project's demo hangs in its own painting and opens its page.
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

        <div className="in" style={{ "--i": 5 } as React.CSSProperties}>
          <AskTeaser />
        </div>
      </div>

      <section className="work in" style={{ "--i": 2 } as React.CSSProperties}>
        <div className="work-head">
          <h2 className="section-title">Work</h2>
          <span className="work-meta">
            {person.where} · <Clock />
          </span>
        </div>

        <div className="projects">
          {projects.map((item) => (
            <Link key={item.slug} className="project" id={item.slug} href={`/work/${item.slug}`}>
              <Framed project={item} />
              <div className="project-body">
                <div className="project-line">
                  <span className="project-name">{item.name}</span>
                  <span className="project-year mono">{item.year}</span>
                  <span className="project-metric">
                    <b>{item.metric.value}</b> {item.metric.label}
                  </span>
                </div>
                <p className="project-lede">{item.lede}</p>
                <p className="project-stack">{item.stack}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
