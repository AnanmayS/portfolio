"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Book } from "./content";

/*
  A shelf of books, drawn rather than photographed: each book is a spine in
  one of the page's inks with its title set down it in the serif, standing on
  a hairline shelf. Width comes from the page count, height from the format.
  The book being read leans at the end of the row with a ribbon hanging out
  of it. A heading is optional. Tap a book and it stands proud of the row
  while the line under the shelf names it, with its note if it has one; tap
  it again, another book, or Escape, and it goes back. With nothing pulled out
  the line names what is being read.

  Under it, "send me a rec" opens a small box for a book title. Sending it
  doesn't go anywhere: the words whoosh off to the right and the box says
  "sent", then folds back into the button.
*/
const tones = ["ink", "plate", "soft", "paper", "muted"] as const;

/* Two books can share a title; title and author together name one. */
const id = (b: Book) => `${b.title}|${b.author}`;

/* How long "sent" stays before the button comes back. */
const SENT_MS = 2200;

export function Shelf({ books, heading }: { books: Book[]; heading?: string }) {
  const [out, setOut] = useState<string | null>(null);
  const reading = books.filter((b) => b.status === "reading");
  const ordered = [...books.filter((b) => b.status === "read"), ...reading];
  const picked = ordered.find((b) => id(b) === out) ?? null;

  const [rec, setRec] = useState<"closed" | "asking" | "sending" | "sent">("closed");
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const flyer = useRef<HTMLSpanElement>(null);
  const asking = rec === "asking";

  useEffect(() => {
    if (!out && !asking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOut(null);
      if (asking) setRec("closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [out, asking]);

  useEffect(() => {
    if (asking) input.current?.focus();
  }, [asking]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return input.current?.focus();
    setRec(matchMedia("(prefers-reduced-motion: reduce)").matches ? "sent" : "sending");
  };

  // The whoosh: the words streak off to the right, stretching and fading, then "sent".
  useLayoutEffect(() => {
    if (rec !== "sending" || !flyer.current) return;
    const whoosh = flyer.current.animate(
      [
        { transform: "translateX(0) scaleX(1)", opacity: 1, filter: "blur(0)" },
        { offset: 0.25, transform: "translateX(-6px) scaleX(0.96)", opacity: 1, filter: "blur(0)" },
        { transform: "translate(320px, -10px) scaleX(1.6)", opacity: 0, filter: "blur(3px)" },
      ],
      { duration: 650, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" },
    );
    whoosh.onfinish = () => setRec("sent");
    return () => whoosh.cancel();
  }, [rec]);

  // "sent" for a moment, then back to the button.
  useEffect(() => {
    if (rec !== "sent") return;
    setDraft("");
    const t = setTimeout(() => setRec("closed"), SENT_MS);
    return () => clearTimeout(t);
  }, [rec]);

  return (
    <section className="shelf" aria-label={heading ?? "Bookshelf"}>
      {heading && <h2>{heading}</h2>}
      <ul className="shelf-row" aria-label="Books">
        {ordered.map((book, i) => {
          const width = Math.round(Math.min(34, Math.max(18, book.pages / 18)));
          const height = book.format === "l" ? 148 : book.format === "s" ? 116 : 132;
          const tone = book.tone ?? tones[i % tones.length];
          const isOut = out === id(book);
          return (
            <li
              key={id(book)}
              className={`book book-${tone}${book.status === "reading" ? " book-reading" : ""}${isOut ? " is-out" : ""}`}
              style={{ width, height }}
            >
              <button
                type="button"
                className="book-btn"
                aria-pressed={isOut}
                aria-label={`${book.title} by ${book.author}`}
                onClick={() => setOut(isOut ? null : id(book))}
              >
                <span className="book-spine" aria-hidden="true">
                  {book.spine ?? book.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="shelf-plank" aria-hidden="true" />
      <p className="shelf-now" aria-live="polite">
        {picked ? (
          <>
            <b>{picked.title}</b> by {picked.author}, {picked.status === "reading" ? "reading now" : "read"}.
            {picked.note ? ` ${picked.note}` : ""}
          </>
        ) : reading.length > 0 ? (
          <>Reading now: {reading.map((b) => `${b.title}, ${b.author}`).join("; ")}</>
        ) : null}
      </p>

      {rec === "closed" ? (
        <button type="button" className="link rec-open" onClick={() => setRec("asking")}>
          send me a rec
        </button>
      ) : rec === "sent" ? (
        <p className="rec-sent" role="status">
          sent
        </p>
      ) : (
        <form className={`rec${rec === "sending" ? " is-sending" : ""}`} onSubmit={send}>
          <label htmlFor="rec-title" className="sr-only">
            A book you think I’d like
          </label>
          <span className="rec-field">
            <input
              id="rec-title"
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="a book you think i’d like"
              maxLength={80}
              autoComplete="off"
              readOnly={rec === "sending"}
            />
            {rec === "sending" && (
              <span ref={flyer} className="rec-flyer" aria-hidden="true">
                {draft}
              </span>
            )}
          </span>
          <button type="submit" className="link" disabled={rec === "sending"}>
            send
          </button>
        </form>
      )}
    </section>
  );
}
