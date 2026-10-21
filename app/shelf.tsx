import type { Book } from "./content";

/*
  A shelf of books, drawn rather than photographed: each book is a spine in
  one of the page's inks with its title set down it in the serif, standing on
  a hairline shelf. Width comes from the page count, height from the format.
  The book being read leans at the end of the row with a ribbon hanging out
  of it, and is named under the shelf.
*/
const tones = ["ink", "plate", "soft", "paper", "muted"] as const;

export function Shelf({ books }: { books: Book[] }) {
  const reading = books.filter((b) => b.status === "reading");
  const read = books.filter((b) => b.status === "read");
  const ordered = [...read, ...reading];

  return (
    <section className="shelf" aria-labelledby="h-shelf">
      <h2 id="h-shelf">On the shelf</h2>
      <ul className="shelf-row" aria-label="Books">
        {ordered.map((book, i) => {
          const width = Math.round(Math.min(44, Math.max(22, book.pages / 14)));
          const height = book.format === "l" ? 200 : book.format === "s" ? 156 : 176;
          const tone = book.tone ?? tones[i % tones.length];
          return (
            <li
              key={book.title}
              className={`book book-${tone}${book.status === "reading" ? " book-reading" : ""}`}
              style={{ width, height }}
              title={`${book.title}, ${book.author}`}
            >
              <span className="book-spine" aria-hidden="true">
                {book.spine ?? book.title}
              </span>
              <span className="sr-only">
                {book.title} by {book.author}, {book.status === "reading" ? "reading now" : "read"}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="shelf-plank" aria-hidden="true" />
      {reading.length > 0 && (
        <p className="shelf-now">
          Reading now: {reading.map((b) => `${b.title}, ${b.author}`).join("; ")}
        </p>
      )}
    </section>
  );
}
