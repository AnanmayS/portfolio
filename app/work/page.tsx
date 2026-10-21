import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "../back-link";
import { Clock } from "../clock";
import { person, projects } from "../content";
import { Framed } from "../framed";

export const metadata: Metadata = {
  title: "Work — Ananmay Som Singh",
  description:
    "Beat the Bots, Pit Wall, Wildebeest, Tape and ShowdownRL: what each one does, shown as a short looping demo.",
};

/*
  The work, plate by plate: each project's demo on its plate of ink, with
  the number that says it works and one plain sentence. Each opens its
  project page.
*/
const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
export default function WorkPage() {
  return (
    <main className="page page-work">
      <BackLink />

      <header className="page-head">
        <h1 className="page-title">Work</h1>
        <p className="page-sub">
          Five plates, and how each one works. {person.whereLong} · <Clock />
        </p>
      </header>

      <div className="projects">
        {projects.map((item, i) => (
          <Link key={item.slug} className="card project" id={item.slug} href={`/work/${item.slug}`}>
            <div className="card-lab label">
              <span>Plate {numerals[i]}</span>
              <span>{item.year}</span>
            </div>
            <Framed project={item} />
            <div className="project-body">
              <div className="project-line">
                <span className="project-name">{item.name}</span>
                <span className="project-metric">
                  <b>{item.metric.value}</b> {item.metric.label}
                </span>
              </div>
              <p className="project-lede">{item.lede}</p>
              <p className="project-stack mono">
                <span>{item.stack}</span>
                <span className="project-go" aria-hidden="true">
                  open →
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
