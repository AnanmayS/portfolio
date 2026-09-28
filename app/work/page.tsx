import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "../back-link";
import { Clock } from "../clock";
import { person, projects } from "../content";
import { Framed } from "../framed";

export const metadata: Metadata = {
  title: "Work — Ananmay Som Singh",
  description: "Wildebeest, Tape and ShowdownRL: what each one does, shown as a short looping demo.",
};

/*
  The work, on its own wall: each project's demo hangs in its own painting,
  with the number that says it works and one plain sentence. Each opens its
  project page.
*/
export default function WorkPage() {
  return (
    <main className="page page-work">
      <BackLink />

      <header className="page-head">
        <h1 className="page-title">Work</h1>
        <p className="page-sub">
          Three things I&rsquo;ve built, and how each one works. {person.where} · <Clock />
        </p>
      </header>

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
    </main>
  );
}
