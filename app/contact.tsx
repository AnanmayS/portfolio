import Link from "next/link";
import { ComposeTrigger } from "./compose";
import { OutIcon } from "./icons";
import { person } from "./content";

/*
  The ways out, on one line under the intro: the résumé, the email card,
  GitHub, LinkedIn, and the Ask page. "Email me" opens the compose card on
  this page, so nobody has to copy an address.
*/
export function Contact({ resumeHref }: { resumeHref: string }) {
  return (
    <nav className="contact" aria-label="Résumé and contact">
      <a className="contact-item contact-strong" href={resumeHref} target="_blank" rel="noreferrer">
        Résumé
        <OutIcon size={11} />
      </a>
      <ComposeTrigger className="contact-item" title={`Email ${person.email}`}>
        Email me
      </ComposeTrigger>
      <a className="contact-item" href={person.github} rel="noreferrer" target="_blank">
        GitHub
        <OutIcon size={11} />
      </a>
      <a className="contact-item" href={person.linkedin} rel="noreferrer" target="_blank">
        LinkedIn
        <OutIcon size={11} />
      </a>
      <Link className="contact-item contact-ask" href="/ask">
        Ask about me
      </Link>
    </nav>
  );
}
