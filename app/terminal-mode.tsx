"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { now, person, projects, roles, skills } from "./content";
import { THEME_KEY } from "./theme-toggle";

/*
  The same page, read as a filesystem. Hidden until the command palette
  dispatches "open-terminal" or the reader presses "~" twice in a second.
  Everything it prints comes from content.ts, so it can never disagree with
  the page behind it. No typing animation: the motion budget is spent on the
  demos, and reduced motion changes nothing here because nothing moves.
*/
export const TERMINAL_OPEN_EVENT = "open-terminal";

const PS1 = "ananmay@umd:~$ ";
const DOUBLE_TAP_MS = 1000;

type Tone = "dim" | "err" | "out";

type Block =
  | { id: number; kind: "cmd"; text: string }
  | { id: number; kind: "text"; tone: Tone; lines: string[] }
  | { id: number; kind: "table"; rows: [string, string][] };

type Draft =
  | { kind: "cmd"; text: string }
  | { kind: "text"; tone: Tone; lines: string[] }
  | { kind: "table"; rows: [string, string][] };

const out = (...lines: string[]): Draft => ({ kind: "text", tone: "out", lines });
const dim = (...lines: string[]): Draft => ({ kind: "text", tone: "dim", lines });
const err = (...lines: string[]): Draft => ({ kind: "text", tone: "err", lines });
const table = (rows: [string, string][]): Draft => ({ kind: "table", rows });

const COMMANDS = [
  "help",
  "ls",
  "cat",
  "open",
  "email",
  "theme",
  "whoami",
  "now",
  "clear",
  "exit",
];

const HELP: [string, string][] = [
  ["help", "this list"],
  ["ls [projects]", "what is here"],
  ["cat <slug>", "one project in full · also experience, skills"],
  ["open <slug>", "scroll the page to it · also `open resume`"],
  ["email", "print the address and copy it"],
  ["theme", "switch between light and dark"],
  ["whoami", "who this is"],
  ["now", "what he is working on this week"],
  ["clear", "empty the screen"],
  ["exit", "leave the terminal"],
];

const SLUGS = projects.map((project) => project.slug);
const SLUG_WIDTH = Math.max(...SLUGS.map((slug) => slug.length)) + 2;

function pad(value: string, width: number) {
  return value.length >= width ? `${value} ` : value.padEnd(width);
}

function stillMotion() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* The storage contract from theme-toggle.tsx, repeated exactly. */
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

  return next;
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

function catProject(slug: string): Draft[] {
  const project = projects.find((entry) => entry.slug === slug);

  if (!project) {
    return [err(`cat: ${slug}: no such file · try \`ls projects\``)];
  }

  const drafts: Draft[] = [
    out(`${project.name} · ${project.year}`),
    dim(project.question),
    out("", project.lede, ""),
    out(
      `${pad("stack", 8)}${project.stack.join(" · ")}`,
      `${pad("link", 8)}${project.href}`,
    ),
  ];

  for (const [claim, evidence] of Object.entries(project.evidence)) {
    drafts.push(dim("", `evidence · ${claim} — ${evidence.label}`));

    if (evidence.kind === "table" && evidence.rows) {
      drafts.push(table(evidence.rows));
    } else if (evidence.lines) {
      drafts.push(out(...evidence.lines.map((line) => `  ${line}`)));
    } else if (evidence.href) {
      drafts.push(out(`  ${evidence.href}`));
    }

    drafts.push(dim(`  ${evidence.source}`));
  }

  return drafts;
}

export function TerminalMode({ resumeHref }: { resumeHref: string }) {
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [line, setLine] = useState("");

  const input = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const returnTo = useRef<HTMLElement | null>(null);

  const print = useCallback((drafts: Draft[]) => {
    setBlocks((current) => [
      ...current,
      ...drafts.map((draft) => {
        nextId.current += 1;
        return { ...draft, id: nextId.current } as Block;
      }),
    ]);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    delete document.documentElement.dataset.terminal;
    const target = returnTo.current;
    returnTo.current = null;
    if (target && target.isConnected) target.focus();
  }, []);

  /* Opened by the palette, or by "~" pressed twice while not in a field. */
  useEffect(() => {
    let lastTilde = 0;

    /* The root attribute is both the guard and the signal the palette reads. */
    const start = () => {
      if (document.documentElement.dataset.terminal === "open") return;

      returnTo.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      document.documentElement.dataset.terminal = "open";
      nextId.current = 0;
      cursor.current = -1;
      setBlocks([]);
      setLine("");
      setOpen(true);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "~") return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      const at = event.timeStamp;
      if (at - lastTilde < DOUBLE_TAP_MS) {
        lastTilde = 0;
        event.preventDefault();
        start();
      } else {
        lastTilde = at;
      }
    };

    window.addEventListener(TERMINAL_OPEN_EVENT, start);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener(TERMINAL_OPEN_EVENT, start);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  /* The banner is printed on open rather than held in state. */
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    print([
      out(`${person.name} · ${person.school}`),
      dim("type `help` for the commands · try `cat tape`"),
      out(""),
    ]);
  }, [open, print]);

  useEffect(() => {
    const node = screen.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [blocks]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.terminal;
    };
  }, []);

  const run = (raw: string) => {
    const text = raw.trim();
    print([{ kind: "cmd", text }]);

    if (!text) return;

    history.current = [...history.current, text];
    cursor.current = -1;

    const [name, ...rest] = text.split(/\s+/);
    const arg = rest[0] ?? "";

    switch (name) {
      case "help":
        print([out(...HELP.map(([cmd, what]) => `${pad(cmd, 16)}${what}`))]);
        return;

      case "ls": {
        if (!arg) {
          print([
            out(
              `${pad("projects/", 14)}${projects.length} entries`,
              `${pad("experience/", 14)}${roles.length} roles`,
              `${pad("skills/", 14)}${skills.length} rows`,
              "resume.pdf",
              "contact",
            ),
          ]);
          return;
        }

        if (arg === "projects" || arg === "projects/") {
          print([
            out(
              ...projects.map(
                (project) =>
                  `${pad(project.slug, SLUG_WIDTH)}${project.year}  ${project.question}`,
              ),
            ),
          ]);
          return;
        }

        print([err(`ls: ${arg}: no such directory · try \`ls projects\``)]);
        return;
      }

      case "cat": {
        if (!arg) {
          print([err("cat: needs a name · try `cat tape` or `cat experience`")]);
          return;
        }

        if (arg === "experience") {
          const drafts: Draft[] = [];
          for (const role of roles) {
            drafts.push(
              out(`${role.company} · ${role.title}`),
              dim(`${role.when} · ${role.where}`),
              out(...role.points.map((point) => `  - ${point}`), ""),
            );
          }
          print(drafts);
          return;
        }

        if (arg === "skills") {
          print([out(...skills.map(([label, value]) => `${pad(label, 12)}${value}`))]);
          return;
        }

        print(catProject(arg));
        return;
      }

      case "open": {
        if (arg === "resume" || arg === "resume.pdf") {
          window.open(resumeHref, "_blank", "noopener,noreferrer");
          print([out("opening resume.pdf in a new tab")]);
          return;
        }

        const project = projects.find((entry) => entry.slug === arg);

        if (!project) {
          print([err(`open: ${arg || "?"}: no such entry · try \`ls projects\``)]);
          return;
        }

        close();
        const target = document.getElementById(`project-${project.slug}`);
        target?.scrollIntoView({
          behavior: stillMotion() ? "auto" : "smooth",
          block: "start",
        });
        return;
      }

      case "email":
        print([out(person.email)]);
        copyText(person.email)
          .then(() => print([dim("copied to the clipboard")]))
          .catch(() => print([dim("clipboard unavailable · select the line above")]));
        return;

      case "theme":
        print([out(`appearance → ${flipAppearance()}`)]);
        return;

      case "whoami":
        print([out(person.name, person.school)]);
        return;

      case "now":
        print([
          out(`${pad("trying", 10)}${now.trying}`, `${pad("reading", 10)}${now.reading}`),
        ]);
        return;

      case "clear":
        setBlocks([]);
        return;

      case "exit":
        close();
        return;

      default:
        print([err(`command not found: ${name} · try \`help\``)]);
    }
  };

  const complete = () => {
    const parts = line.split(/\s+/);
    const head = parts[0] ?? "";

    let pool: string[] = [];
    let stem = "";

    if (parts.length <= 1) {
      pool = COMMANDS;
      stem = head;
    } else {
      stem = parts[parts.length - 1];
      if (head === "cat") pool = [...SLUGS, "experience", "skills"];
      else if (head === "open") pool = [...SLUGS, "resume"];
      else if (head === "ls") pool = ["projects"];
    }

    const hits = pool.filter((entry) => entry.startsWith(stem));
    if (hits.length === 0) return;

    let filled = hits[0];

    if (hits.length > 1) {
      /* Fill to the longest common prefix, then show what is left. */
      let i = stem.length;
      while (hits.every((hit) => hit[i] && hit[i] === hits[0][i])) i += 1;
      filled = hits[0].slice(0, i);
      print([{ kind: "cmd", text: line }, dim(hits.join("  "))]);
    }

    const before = parts.slice(0, parts.length - 1);
    setLine([...before, filled].join(" "));
  };

  const walk = (step: 1 | -1) => {
    const entries = history.current;
    if (entries.length === 0) return;

    if (cursor.current === -1) {
      if (step === 1) return;
      cursor.current = entries.length - 1;
    } else {
      const next = cursor.current + step;
      if (next >= entries.length) {
        cursor.current = -1;
        setLine("");
        return;
      }
      cursor.current = Math.max(next, 0);
    }

    setLine(entries[cursor.current]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = line;
      setLine("");
      run(value);
    } else if (event.key === "Tab") {
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      walk(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      walk(1);
    }
  };

  if (!open) return null;

  return (
    <div
      aria-label="Terminal mode"
      aria-modal="true"
      className="term-overlay"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      }}
      onMouseDown={(event) => {
        /* Clicking the empty screen puts the caret back where it belongs. */
        if (!(event.target instanceof HTMLButtonElement)) {
          event.preventDefault();
          input.current?.focus();
        }
      }}
      role="dialog"
    >
      <div className="term-inner">
        <div className="term-bar">
          <span>ananmay@umd · terminal</span>
          <button
            aria-label="Close terminal mode"
            className="term-close"
            onClick={close}
            onKeyDown={(event) => {
              /* Keeps Tab inside the overlay. */
              if (event.key === "Tab") {
                event.preventDefault();
                input.current?.focus();
              }
            }}
            type="button"
          >
            esc ×
          </button>
        </div>

        <div aria-live="polite" className="term-screen" ref={screen} role="log">
          {blocks.map((block) => {
            if (block.kind === "cmd") {
              return (
                <p className="term-line term-echo" key={block.id}>
                  <span className="term-ps1">{PS1}</span>
                  {block.text}
                </p>
              );
            }

            if (block.kind === "table") {
              return (
                <table className="term-table" key={block.id}>
                  <tbody>
                    {block.rows.map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            }

            return (
              <p className={`term-line term-${block.tone}`} key={block.id}>
                {block.lines.join("\n")}
              </p>
            );
          })}
        </div>

        <label className="term-prompt">
          <span className="term-ps1">{PS1}</span>
          <input
            aria-label="Terminal command"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="term-input"
            onChange={(event) => setLine(event.target.value)}
            onKeyDown={onKeyDown}
            ref={input}
            spellCheck={false}
            type="text"
            value={line}
          />
        </label>
      </div>
    </div>
  );
}
