import Link from "next/link";
import { ArrowIcon } from "./icons";
import { askStarters } from "./content";

/*
  The front page's way into "Ask about me": the three starter questions,
  each a link that opens /ask and asks it there, and a link to the chat
  itself. The conversation lives on its own page so this column stays calm.
*/
export function AskTeaser() {
  return (
    <section className="ask-teaser" aria-label="Ask about me">
      <div className="ask-head">
        <h2 className="section-title">Ask about me</h2>
        <span className="ask-note">answers come from my résumé and projects</span>
      </div>
      <p className="ask-me">
        Hi, I can answer questions about Ananmay&rsquo;s projects, experience and what he&rsquo;s good at.
      </p>
      <div className="ask-starters">
        {askStarters.map((q) => (
          <Link key={q} className="ask-starter" href={{ pathname: "/ask", query: { q } }}>
            {q}
          </Link>
        ))}
      </div>
      <Link className="ask-open" href="/ask">
        Open the chat
        <ArrowIcon size={12} />
      </Link>
    </section>
  );
}
