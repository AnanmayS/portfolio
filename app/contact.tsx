import { ComposeTrigger } from "./compose";
import { MailIcon, OutIcon } from "./icons";
import { person } from "./content";

/*
  The four ways out, on one line under the intro: the résumé, the email
  card, GitHub and LinkedIn. "Email me" is the one filled button, because it
  is the one that starts a conversation; it opens the compose card on this
  page, so nobody has to copy an address.
*/
export function Contact({ resumeHref }: { resumeHref: string }) {
  return (
    <nav className="contact" aria-label="Résumé and contact">
      <a className="contact-item" href={resumeHref} target="_blank" rel="noreferrer">
        Résumé
        <OutIcon size={11} />
      </a>
      <ComposeTrigger className="contact-item contact-mail" title={`Email ${person.email}`}>
        <MailIcon size={13} />
        Email me
      </ComposeTrigger>
      <a className="contact-item mono" href={person.github} rel="noreferrer" target="_blank">
        {person.handle}
      </a>
      <a
        className="contact-item mono"
        href={person.linkedin}
        aria-label="LinkedIn"
        rel="noreferrer"
        target="_blank"
      >
        in
      </a>
    </nav>
  );
}
