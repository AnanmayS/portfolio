import { ComposeTrigger } from "./compose";
import { languages, person } from "./content";
import { BarsIcon, CapIcon, CodeIcon, LayersIcon } from "./icons";
import { RoleWord } from "./role-word";

/*
  The page opens as a few sentences rather than a name and a tagline. The
  words that carry weight are set in ink with a small glyph beside them; the
  rest stays grey. The projects are not named here; they are two scrolls
  down, and the intro only has to sound like a person.
*/
export function Intro() {
  const [a, b, c] = languages;

  return (
    <section className="intro" aria-label="Introduction">
      <p>Hey,</p>

      <p>
        I&rsquo;m <b>{person.first}</b>, a computer engineering student at{" "}
        <b className="hi">
          {person.school}
          <CapIcon />
        </b>{" "}
        who likes <RoleWord>{person.role}</RoleWord>.
      </p>

      <p>
        Backend, frontend, the tooling in between &mdash; I like{" "}
        <b className="hi">
          shipping
          <LayersIcon />
        </b>{" "}
        things that work end to end, and{" "}
        <b className="hi">
          measuring
          <BarsIcon />
        </b>{" "}
        that they do. Mostly <b>{a}</b>, <b>{b}</b> and{" "}
        <b className="hi">
          {c}
          <CodeIcon />
        </b>
        .
      </p>

      <p>
        Reach out at{" "}
        <ComposeTrigger className="chip" title="Opens an email card">
          {person.email}
        </ComposeTrigger>{" "}
        or{" "}
        <a className="chip" href={person.github} rel="noreferrer" target="_blank">
          {person.handle}
        </a>
        .
      </p>
    </section>
  );
}
