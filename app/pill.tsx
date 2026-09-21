import { ComposeTrigger } from "./compose";
import { BranchIcon, FileIcon, MailIcon, OutIcon } from "./icons";
import { person } from "./content";

/*
  The pill floats at the top of the page and holds the four things a
  recruiter needs in the first second: the résumé, and the three ways to
  reach out. Every item is drawn the same way so none of them reads as a
  "current page"; the résumé carries an outward arrow because it opens a
  PDF, and the envelope opens the email card on this page.
*/
export function Pill({ resumeHref }: { resumeHref: string }) {
  return (
    <nav className="pill in" aria-label="Résumé and contact">
      <a className="pill-item pill-wide" href={resumeHref} target="_blank" rel="noreferrer">
        <FileIcon />
        Résumé
        <OutIcon size={12} className="pill-out" />
      </a>
      <ComposeTrigger className="pill-item" ariaLabel="Email me" title={`Email ${person.email}`}>
        <MailIcon size={15} />
      </ComposeTrigger>
      <a
        className="pill-item"
        href={person.github}
        aria-label="GitHub"
        title="GitHub"
        rel="noreferrer"
        target="_blank"
      >
        <BranchIcon size={15} />
      </a>
      <a
        className="pill-item pill-in"
        href={person.linkedin}
        aria-label="LinkedIn"
        title="LinkedIn"
        rel="noreferrer"
        target="_blank"
      >
        in
      </a>
    </nav>
  );
}
