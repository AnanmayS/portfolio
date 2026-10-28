"use client";

import { useEffect, useState } from "react";
import { ComposeTrigger } from "./compose";
import { books, home, person, roles } from "./content";
import { Gallery } from "./gallery";
import { Shelf } from "./shelf";
import { asset } from "./paths";
import { TABS, type Tab } from "./tabs";

/*
  The front page's tabs: pond (who I am, and the shelf of what I'm reading),
  projects and work, in a small lowercase row at the top.
  They switch in place, so the koi keep swimming; the hash keeps the tab, so
  a link to #projects opens on projects.
*/

const fromHash = (): Tab => {
  const h = window.location.hash.slice(1);
  return (TABS as readonly string[]).includes(h) ? (h as Tab) : "pond";
};

/* Today's quote: the same for everyone on a given day, the next one tomorrow.
   Chosen in the browser, since the page itself is built once; until then the
   line keeps its space so nothing jumps. */
function Quote() {
  const [quote, setQuote] = useState<(typeof home.quotes)[number] | null>(null);
  useEffect(() => {
    const now = new Date();
    const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
    setQuote(home.quotes[day % home.quotes.length]);
  }, []);
  return (
    <figure className="quote">
      {quote && (
        <>
          <blockquote>{quote.text}</blockquote>
          <figcaption>{quote.by}</figcaption>
        </>
      )}
    </figure>
  );
}

function Fact({ text, link }: (typeof home.facts)[number]) {
  if (!link) return <li>{text}</li>;
  const [before, after] = text.split(link.words);
  return (
    <li>
      {before}
      <a href={link.href} target="_blank" rel="noreferrer">
        {link.words}
      </a>
      {after}
    </li>
  );
}

export function Front() {
  const [tab, setTab] = useState<Tab>("pond");

  useEffect(() => {
    const sync = () => setTab(fromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <main>
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <a key={t} href={`#${t}`} aria-current={tab === t ? "page" : undefined}>
            {t}
          </a>
        ))}
      </nav>

      {tab === "pond" && (
        <>
          <Quote />
          <header>
            <h1>{person.name}</h1>
            <div className="links">
              <a href={person.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={person.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={asset("/resume.pdf")} target="_blank" rel="noreferrer">
                Résumé
              </a>
              <ComposeTrigger className="link" title={`Email ${person.email}`}>
                Email
              </ComposeTrigger>
            </div>
          </header>
          <ul>
            {home.facts.map((fact) => (
              <Fact key={fact.text} {...fact} />
            ))}
          </ul>
          <Shelf books={books} />
        </>
      )}

      {tab === "projects" && <Gallery />}

      {tab === "work" && (
        <ul className="rows">
          {roles.map((r) => (
            <li key={r.company}>
              <div className="row-head">
                <span className="name">{r.company}</span>
                <span className="meta">{r.when}</span>
              </div>
              <p>
                {r.title}. {r.result}
              </p>
            </li>
          ))}
        </ul>
      )}

    </main>
  );
}
