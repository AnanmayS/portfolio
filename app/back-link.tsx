import Link from "next/link";
import { ArrowIcon } from "./icons";
import { person } from "./content";

/* The way back up from an inner page: to the front page by default, or to
   a named parent (a project page goes back to Work). */
export function BackLink({ href = "/", label = person.name }: { href?: string; label?: string }) {
  return (
    <Link className="back" href={href}>
      <ArrowIcon size={12} className="back-icon" />
      {label}
    </Link>
  );
}
