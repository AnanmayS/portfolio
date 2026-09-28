import { languages, person } from "./content";

/*
  A name and two sentences that sound like a person. The words that carry
  weight are set in ink; the rest stays grey. The role is set in the serif's
  italic, like a title card under a painting. The projects are not named
  here; they hang beside it, on the right.
*/
export function Intro() {
  const [a, b, c] = languages;

  return (
    <section className="intro" aria-label="Introduction">
      <h1 className="intro-name">{person.name}</h1>

      <p>
        I&rsquo;m a computer engineering student at <b>{person.school}</b> who likes{" "}
        <em className="intro-role">{person.role}</em>.
      </p>

      <p>
        Backend, frontend, the tooling in between. I like <b>shipping</b> things that work end to end, and{" "}
        <b>measuring</b> that they do. Mostly <b>{a}</b>, <b>{b}</b> and <b>{c}</b>.
      </p>
    </section>
  );
}
