import Link from "next/link";

/*
  The site's tabs, in the front page's order. The front page switches them in
  place (front.tsx); an inner page links back to the tab it belongs under.
*/
export const TABS = ["pond", "projects", "work"] as const;
export type Tab = (typeof TABS)[number];

export function SiteTabs({ current }: { current: Tab }) {
  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map((t) => (
        <Link key={t} href={`/#${t}`} aria-current={t === current ? "page" : undefined}>
          {t}
        </Link>
      ))}
    </nav>
  );
}
