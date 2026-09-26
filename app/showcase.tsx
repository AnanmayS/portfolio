"use client";

import { useRef, useState } from "react";
import { OutIcon } from "./icons";
import { Reveal } from "./reveal";
import type { Project } from "./content";

/*
  The work, one project at a time. The chosen project's illustration plays
  large, at the full width of the column, where its labels can be read; the
  three projects sit under it as short rows (name, the number that says it
  works, year) and choosing one swaps the picture. It is a tablist: arrow
  keys move between rows, and the panel is labelled by the chosen row.

  The illustrations are rendered on the server and handed in as nodes; each
  is keyed by project so switching restarts its loop from the top.
*/
export type ShowcaseItem = Project & { art: React.ReactNode };

export function Showcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = items[active];

  const choose = (index: number) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const onKey = (event: React.KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      choose(moves[event.key]);
    }
  };

  return (
    <div className="show">
      <div
        className="show-panel"
        role="tabpanel"
        id="show-panel"
        aria-labelledby={`show-tab-${item.slug}`}
      >
        <Reveal key={item.slug} className="show-art">
          {item.art}
        </Reveal>
        <div className="show-foot">
          <p className="show-lede">{item.lede}</p>
          <div className="show-meta">
            <span className="show-stack mono">{item.stack}</span>
            <a className="show-link" href={item.href} rel="noreferrer" target="_blank">
              GitHub
              <OutIcon size={11} />
            </a>
          </div>
        </div>
      </div>

      <div className="show-tabs" role="tablist" aria-label="Projects" aria-orientation="vertical">
        {items.map((entry, index) => (
          <button
            key={entry.slug}
            ref={(el) => {
              tabs.current[index] = el;
            }}
            className="show-tab"
            id={`show-tab-${entry.slug}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls="show-panel"
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={onKey}
          >
            <span className="show-name">{entry.name}</span>
            <span className="show-metric">
              <b>{entry.metric.value}</b> {entry.metric.label}
            </span>
            <span className="show-year mono">{entry.year}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
