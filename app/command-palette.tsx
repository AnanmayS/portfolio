"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { more, person, projects } from "./content";
import { THEME_KEY } from "./theme-toggle";

/*
  One keyboard surface for the whole page. Mounted once; opened with Cmd/Ctrl+K
  from anywhere, or by any number of `CommandPaletteTrigger` buttons. The two
  talk through a DOM event rather than context so the trigger can sit in the
  hero and in the fixed bar without either knowing about the other.
*/
export const PALETTE_OPEN_EVENT = "open-palette";
export const TERMINAL_OPEN_EVENT = "open-terminal";

type Section = "project" | "action";

type Item = {
  id: string;
  label: string;
  /** Shown dimmed after the label, and searched along with it. */
  detail: string;
  section: Section;
  /** Extra words the row should match on but does not display. */
  hint: string;
  run: () => void;
};

/** Lower is better; null means the query is not a subsequence of the haystack. */
function score(needle: string, hay: string): number | null {
  let i = 0;
  let first = -1;
  let last = -1;
  let gaps = 0;

  for (let j = 0; j < hay.length && i < needle.length; j += 1) {
    if (hay[j] === needle[i]) {
      if (first < 0) first = j;
      if (last >= 0 && j !== last + 1) gaps += 1;
      last = j;
      i += 1;
    }
  }

  return i === needle.length ? first + gaps * 2 : null;
}

function stillMotion() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function goTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({
    behavior: stillMotion() ? "auto" : "smooth",
    block: "start",
  });
}

function openTab(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

/*
  The same storage contract as theme-toggle.tsx: an explicit choice only, kept
  under `appearance`, applied as `data-appearance` on the root element.
*/
function flipAppearance() {
  const light = document.documentElement.dataset.appearance === "light";
  const next = light ? "dark" : "light";

  if (next === "light") {
    document.documentElement.dataset.appearance = "light";
  } else {
    delete document.documentElement.dataset.appearance;
  }

  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode, or storage is full: the page still switches */
  }
}

function copyText(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(value);
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();

  return copied ? Promise.resolve() : Promise.reject(new Error("copy failed"));
}

/** The "⌘K" button. Render as many as the page needs. */
export function CommandPaletteTrigger({ className = "" }: { className?: string }) {
  /* Starts on the mac label so the server HTML and first client render agree. */
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/mac|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  return (
    <button
      aria-haspopup="dialog"
      aria-label="Open the command palette"
      className={`cp-trigger ${className}`.trim()}
      onClick={() => window.dispatchEvent(new CustomEvent(PALETTE_OPEN_EVENT))}
      type="button"
    >
      {mac ? "⌘K" : "ctrl K"}
    </button>
  );
}

export function CommandPalette({ resumeHref }: { resumeHref: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const close = useCallback(() => dialog.current?.close(), []);

  const items = useMemo<Item[]>(() => {
    const rows: Item[] = [];

    for (const project of projects) {
      rows.push({
        id: `project-${project.slug}`,
        label: `go to ${project.name}`,
        detail: project.question,
        section: "project",
        hint: `${project.slug} ${project.year} ${project.stack.join(" ")}`,
        run: () => {
          close();
          goTo(`project-${project.slug}`);
        },
      });
    }

    for (const item of more) {
      rows.push({
        id: `more-${item.href}`,
        label: `open ${item.name}`,
        detail: item.what,
        section: "project",
        hint: "github repo",
        run: () => {
          close();
          openTab(item.href);
        },
      });
    }

    rows.push(
      {
        id: "act-resume",
        label: "open résumé",
        detail: "pdf, new tab",
        section: "action",
        hint: "resume cv download",
        run: () => {
          close();
          openTab(resumeHref);
        },
      },
      {
        id: "act-copy",
        label: "copy email",
        detail: person.email,
        section: "action",
        hint: "clipboard address",
        run: () => {
          copyText(person.email)
            .then(() => setCopied(true))
            .catch(() => window.prompt("Copy this email address:", person.email));

          if (copyTimer.current) clearTimeout(copyTimer.current);
          copyTimer.current = setTimeout(() => setCopied(false), 1000);
        },
      },
      {
        id: "act-email",
        label: "email",
        detail: `mailto: ${person.email}`,
        section: "action",
        hint: "write message contact",
        run: () => {
          close();
          window.location.href = `mailto:${person.email}`;
        },
      },
      {
        id: "act-github",
        label: "github",
        detail: person.githubUser,
        section: "action",
        hint: "repositories code",
        run: () => {
          close();
          openTab(person.github);
        },
      },
      {
        id: "act-linkedin",
        label: "linkedin",
        detail: "profile",
        section: "action",
        hint: "connect work",
        run: () => {
          close();
          openTab(person.linkedin);
        },
      },
      {
        id: "act-theme",
        label: "toggle theme",
        detail: "light and dark",
        section: "action",
        hint: "appearance mode contrast",
        run: () => {
          close();
          flipAppearance();
        },
      },
      {
        id: "act-terminal",
        label: "terminal mode",
        detail: "browse this page as a shell",
        section: "action",
        hint: "console command line tilde",
        run: () => {
          close();
          window.dispatchEvent(new CustomEvent(TERMINAL_OPEN_EVENT));
        },
      },
      {
        id: "act-top",
        label: "top",
        detail: "back to the start of the page",
        section: "action",
        hint: "scroll up home hero",
        run: () => {
          close();
          window.scrollTo({ top: 0, behavior: stillMotion() ? "auto" : "smooth" });
        },
      },
    );

    return rows;
  }, [close, resumeHref]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    const scored: { item: Item; rank: number }[] = [];

    for (const item of items) {
      const label = score(needle, item.label.toLowerCase());
      const rest = score(
        needle,
        `${item.detail} ${item.hint} ${item.section}`.toLowerCase(),
      );

      const rank =
        label !== null
          ? label
          : rest !== null
            ? rest + 100
            : null;

      if (rank !== null) scored.push({ item, rank });
    }

    return scored.sort((a, b) => a.rank - b.rank).map((entry) => entry.item);
  }, [items, query]);

  const clamped = results.length === 0 ? 0 : Math.min(active, results.length - 1);
  const current = results[clamped];

  /* Open on Cmd/Ctrl+K, or on the event the trigger buttons dispatch. */
  useEffect(() => {
    const open = () => {
      const node = dialog.current;
      if (!node || node.open) return;
      setQuery("");
      setActive(0);
      setCopied(false);
      node.showModal();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "k" && event.key !== "K") return;
      if (!event.metaKey && !event.ctrlKey) return;
      /* The terminal owns the keyboard while it is up. */
      if (document.documentElement.dataset.terminal === "open") return;
      event.preventDefault();
      open();
    };

    window.addEventListener(PALETTE_OPEN_EVENT, open);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener(PALETTE_OPEN_EVENT, open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  /* Keep the highlighted row in view as the arrows walk the list. */
  useEffect(() => {
    list.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [clamped, query]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(results.length ? (clamped + 1) % results.length : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(results.length ? (clamped - 1 + results.length) % results.length : 0);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(results.length - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      current?.run();
    }
    /* Escape is left to the dialog, which closes and restores focus itself. */
  };

  return (
    <dialog
      aria-label="Command palette"
      className="cp-dialog"
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
      ref={dialog}
    >
      <div className="cp-panel">
        <div className="cp-field">
          <span aria-hidden="true" className="cp-caret">
            &gt;
          </span>
          <input
            aria-activedescendant={current ? `cp-opt-${current.id}` : undefined}
            aria-autocomplete="list"
            aria-controls="cp-list"
            aria-expanded="true"
            aria-label="Search projects and actions"
            autoComplete="off"
            autoFocus
            className="cp-input"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="search projects and actions"
            role="combobox"
            spellCheck={false}
            type="text"
            value={query}
          />
        </div>

        {results.length === 0 ? (
          <p className="cp-empty">no match for “{query.trim()}”</p>
        ) : (
          <ul aria-label="Projects and actions" className="cp-list" id="cp-list" ref={list} role="listbox">
            {results.map((item, index) => (
              <li
                aria-selected={index === clamped}
                className="cp-row"
                id={`cp-opt-${item.id}`}
                key={item.id}
                onClick={() => {
                  setActive(index);
                  item.run();
                }}
                onMouseMove={() => setActive(index)}
                role="option"
              >
                <span className="cp-label">
                  {item.id === "act-copy" && copied ? "copied" : item.label}
                </span>
                <span className="cp-detail">{item.detail}</span>
                <span className="cp-section">{item.section}</span>
              </li>
            ))}
          </ul>
        )}

        <footer className="cp-foot">
          <span>↑↓ move · ↵ run · esc close</span>
          <span aria-live="polite">{copied ? "copied" : ""}</span>
        </footer>
      </div>
    </dialog>
  );
}
