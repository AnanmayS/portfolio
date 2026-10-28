import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "../content";
import { Framed } from "../framed";
import { SiteTabs } from "../tabs";
import "../plain.css";

export const metadata: Metadata = {
  title: "Work — Ananmay Som Singh",
  description:
    "Beat the Bots, Pit Wall, Tape, Wildebeest and ShowdownRL: what each one does, as a short looping demo.",
};

/*
  Every project with its demo playing above it: the name and year, one
  sentence, the number that says it works and the stack. Each name opens the
  project's page.
*/
export default function WorkPage() {
  return (
    <div className="plain">
      <main className="wide">
        <SiteTabs current="projects" />

        <ul className="exhibits">
          {projects.map((p) => (
            <li key={p.slug} id={p.slug}>
              <Framed project={p} />
              <div className="row-head">
                <Link href={`/work/${p.slug}`}>{p.name}</Link>
                <span className="meta">{p.year}</span>
              </div>
              <p>{p.lede}</p>
              <p className="meta">
                {p.metric.value} {p.metric.label} · {p.stack}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
