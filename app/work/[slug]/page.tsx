import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "../../back-link";
import { projects } from "../../content";
import { Framed } from "../../framed";
import { OutIcon } from "../../icons";

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
  A project on its own: the demo hung large in its painting, what it is in
  one sentence, the number that says it works, the stack, and the code.
  Previous and next walk the collection.
*/
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <main className="page">
      <BackLink href="/work" label="Work" />

      <Framed project={project} large />

      <div className="exhibit">
        <div className="exhibit-main">
          <span className="exhibit-year mono">{project.year}</span>
          <h1 className="page-title">{project.name}</h1>
          <p className="exhibit-lede">{project.lede}</p>
        </div>
        <aside className="exhibit-facts">
          <div className="exhibit-fact">
            <span className="exhibit-num">{project.metric.value}</span>
            <span className="exhibit-label">{project.metric.label}</span>
          </div>
          <div className="exhibit-fact">
            <span className="exhibit-key">Stack</span>
            <span>{project.stack}</span>
          </div>
          <a className="exhibit-link" href={project.href} target="_blank" rel="noreferrer">
            View on GitHub
            <OutIcon size={11} />
          </a>
        </aside>
      </div>

      <nav className="walk" aria-label="More projects">
        <Link className="walk-item" href={`/work/${prev.slug}`}>
          <span className="walk-key">← Previous</span>
          <span className="walk-name">{prev.name}</span>
        </Link>
        <Link className="walk-item walk-next" href={`/work/${next.slug}`}>
          <span className="walk-key">Next →</span>
          <span className="walk-name">{next.name}</span>
        </Link>
      </nav>
    </main>
  );
}
