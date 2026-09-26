import { languages, person } from "./content";
import { BarsIcon, CapIcon, CodeIcon, LayersIcon } from "./icons";
import { RoleWord } from "./role-word";

/*
  A name and two sentences that sound like a person. The words that carry
  weight are set in ink with a small glyph beside them; the rest stays grey.
  The projects are not named here; they sit beside it, on the right.
*/
export function Intro() {
  const [a, b, c] = languages;

  return (
    <section className="intro" aria-label="Introduction">
      <h1 className="intro-name">{person.name}</h1>

      <p>
        I&rsquo;m a computer engineering student at{" "}
        <b className="hi">
          {person.school}
          <CapIcon />
        </b>{" "}
        who likes <RoleWord>{person.role}</RoleWord>.
      </p>

      <p>
        Backend, frontend, the tooling in between. I like{" "}
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
    </section>
  );
}
