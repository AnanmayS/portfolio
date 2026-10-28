"use client";

import { useEffect, useState } from "react";
import { ComposeTrigger } from "./compose";
import { books, home, person, roles } from "./content";
import { Gallery } from "./gallery";
import { asset } from "./paths";
import { TABS, type Tab } from "./tabs";

/*
  The front page's tabs: pond (who I am), projects, work and reading, in a
  small row of lowercase mono at the top.
  They switch in place, so the koi keep swimming; the hash keeps the tab, so
  a link to #projects opens on projects.
*/

const fromHash = (): Tab => {
  const h = window.location.hash.slice(1);
  return (TABS as readonly string[]).includes(h) ? (h as Tab) : "pond";
};

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

      {tab === "reading" && (
        <ul>
          {books.map((b) => (
            <li key={b.title}>
              <i>{b.title}</i>, {b.author}
              {b.status === "reading" && <span className="meta"> reading now</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
