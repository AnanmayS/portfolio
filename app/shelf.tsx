"use client";

import { useEffect, useState } from "react";
import type { Book } from "./content";

/*
  A shelf of books, drawn rather than photographed: each book is a spine in
  one of the page's inks with its title set down it in the serif, standing on
  a hairline shelf. Width comes from the page count, height from the format.
  The book being read leans at the end of the row with a ribbon hanging out
  of it. It fills the reading tab; a heading is optional. Tap a book and it stands proud of the row while the line under the
  shelf names it, with its note if it has one; tap it again, another book,
  or Escape, and it goes back. With nothing pulled out the line names what
  is being read.
*/
const tones = ["ink", "plate", "soft", "paper", "muted"] as const;

/* Two books can share a title; title and author together name one. */
const id = (b: Book) => `${b.title}|${b.author}`;

export function Shelf({ books, heading }: { books: Book[]; heading?: string }) {
  const [out, setOut] = useState<string | null>(null);
  const reading = books.filter((b) => b.status === "reading");
  const ordered = [...books.filter((b) => b.status === "read"), ...reading];
  const picked = ordered.find((b) => id(b) === out) ?? null;

  useEffect(() => {
    if (!out) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOut(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [out]);

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
    </section>
  );
}
