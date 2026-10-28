import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../content";
import { Framed } from "../../framed";
import { SiteTabs } from "../../tabs";
import { Arrived } from "../../transition";
import "../../plain.css";

type Params = { params: Promise<{ slug: string }> };

/* One static page per project; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: `${project.name} — Ananmay Som Singh`, description: project.lede } : {};
}

/*
  A project on its own: the demo, the name and year, what it is in one
  sentence, then plain bullets for the number, the stack, where to play it
  and the code. Previous and next walk the five.
*/
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <div className="plain">
      <main className="wide">
        <SiteTabs current="projects" />

        <Link className="crumb" href="/#projects">
          ← all projects
        </Link>

        <Framed project={project} large />
        <Arrived />

        <div className="lede">
          <div className="row-head">
            <h1>{project.name}</h1>
            <span className="meta">{project.year}</span>
          </div>
          <p>{project.lede}</p>
        </div>

        <ul>
          <li>
            <span className="figure">{project.metric.value}</span> {project.metric.label}
          </li>
          <li>Built with {project.stack}</li>
          {project.live && (
            <li>
              <a href={project.live} target="_blank" rel="noreferrer">
                Play it in your browser
              </a>
            </li>
          )}
          <li>
            {project.href ? (
              <a href={project.href} target="_blank" rel="noreferrer">
                The code, on GitHub
              </a>
            ) : (
              "The code is private"
            )}
          </li>
        </ul>

        <nav className="walk" aria-label="More projects">
          <Link href={`/work/${prev.slug}`}>← {prev.name}</Link>
          <Link href={`/work/${next.slug}`}>{next.name} →</Link>
        </nav>
      </main>
    </div>
  );
}
