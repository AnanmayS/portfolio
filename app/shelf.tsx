"use client";

import { useEffect, useState } from "react";
import type { Book } from "./content";

/*
  A shelf of books, drawn rather than photographed: each book is a spine in
  one of the page's inks with its title set down it in the serif, standing on
  a hairline shelf. Width comes from the page count, height from the format.
  The book being read leans at the end of the row with a ribbon hanging out
  of it. Tap a book and it stands proud of the row while the line under the
  shelf names it, with its note if it has one; tap it again, another book,
  or Escape, and it goes back. With nothing pulled out the line names what
  is being read.
*/
const tones = ["ink", "plate", "soft", "paper", "muted"] as const;

export function Shelf({ books }: { books: Book[] }) {
  const [out, setOut] = useState<string | null>(null);
  const reading = books.filter((b) => b.status === "reading");
  const ordered = [...books.filter((b) => b.status === "read"), ...reading];
  const picked = ordered.find((b) => b.title === out) ?? null;

  useEffect(() => {
    if (!out) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOut(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [out]);

  return (
    <section className="shelf" aria-labelledby="h-shelf">
      <h2 id="h-shelf">On the shelf</h2>
      <ul className="shelf-row" aria-label="Books">
        {ordered.map((book, i) => {
          const width = Math.round(Math.min(44, Math.max(22, book.pages / 14)));
          const height = book.format === "l" ? 200 : book.format === "s" ? 156 : 176;
          const tone = book.tone ?? tones[i % tones.length];
          const isOut = out === book.title;
          return (
            <li
              key={book.title}
              className={`book book-${tone}${book.status === "reading" ? " book-reading" : ""}${isOut ? " is-out" : ""}`}
              style={{ width, height }}
            >
              <button
                type="button"
                className="book-btn"
                aria-pressed={isOut}
                aria-label={`${book.title} by ${book.author}`}
                onClick={() => setOut(isOut ? null : book.title)}
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
