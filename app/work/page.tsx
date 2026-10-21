import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "../back-link";
import { projects } from "../content";
import { Framed } from "../framed";

export const metadata: Metadata = {
  title: "Work — Ananmay Som Singh",
  description:
    "Beat the Bots, Pit Wall, Tape, Wildebeest and ShowdownRL: what each one does, as a short looping demo.",
};

/*
  The work: each project's demo on its plate of ink, one sentence, and its
  number. Each opens the project's page.
*/
export default function WorkPage() {
  return (
    <main className="page page-work">
      <BackLink />

      <header className="page-head">
        <h1 className="page-title">Work</h1>
        <p className="page-sub">
          Five things I built, and how each one works.
        </p>
      </header>

      <div className="projects">
        {projects.map((item) => (
          <Link key={item.slug} className="card project" id={item.slug} href={`/work/${item.slug}`}>
            <Framed project={item} />
            <div className="project-body">
              <div className="project-line">
                <span className="project-name">{item.name}</span>
                <span className="project-year">{item.year}</span>
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
    </main>
  );
}
