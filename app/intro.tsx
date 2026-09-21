import { ComposeTrigger } from "./compose";
import { languages, person, projects } from "./content";
import { BarsIcon, CapIcon, CodeIcon, LayersIcon } from "./icons";
import { RoleWord } from "./role-word";

/*
  The page opens as a few sentences rather than a name and a tagline. The
  words that carry weight are set in ink with a small glyph beside them; the
  rest stays grey. The second paragraph names one number from each project
  so a reader who stops here still leaves with the three facts.
*/
export function Intro() {
  const [tape, forgegrid, showdown] = projects;
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
        who builds <RoleWord>{person.role}</RoleWord> in <b>{person.where}</b>.
      </p>

      <p>
        I like{" "}
        <b className="hi">
          building
          <LayersIcon />
        </b>{" "}
        systems you can{" "}
        <b className="hi">
          measure
          <BarsIcon />
        </b>
        {" "}&mdash; a recorder that replays markets at 2,790× (
        <a href={`#${tape.slug}`}>{tape.name}</a>), a build system that survives
        a dead worker (<a href={`#${forgegrid.slug}`}>{forgegrid.name}</a>), an
        agent that wins 79% of its games (
        <a href={`#${showdown.slug}`}>{showdown.name}</a>). Mostly <b>{a}</b>,{" "}
        <b>{b}</b> and{" "}
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
        . I&rsquo;m open to <b>{person.openTo}</b> SWE internships.
      </p>
    </section>
  );
}
