import Link from "next/link";
import { ArrowIcon } from "./icons";
import { person } from "./content";

/* The way back to the front page from an inner page. */
export function BackHome() {
  return (
    <Link className="back" href="/">
      <ArrowIcon size={12} className="back-icon" />
      {person.name}
    </Link>
  );
}
