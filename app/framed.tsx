import type { Project } from "./content";
import { basePath } from "./paths";
import { Reveal } from "./reveal";

import { ArenaArt } from "./art/arena";
import { PitwallArt } from "./art/pitwall";
import { ShowdownArt } from "./art/showdown";
import { TapeArt } from "./art/tape";
import { WildebeestArt } from "./art/wildebeest";

/* One looping demo per project, keyed so content.ts stays free of React. */
const art: Record<Project["slug"], (props: { basePath: string }) => React.ReactElement> = {
  "beat-the-bots": ArenaArt,
  pitwall: PitwallArt,
  wildebeest: WildebeestArt,
  tape: TapeArt,
  showdownrl: ShowdownArt,
};

/*
  A project's demo on a plate of solid ink. The demo starts playing once it
  scrolls into view.
*/
export function Framed({ project, large = false }: { project: Project; large?: boolean }) {
  const Art = art[project.slug];

  return (
    <div className={`frame${large ? " frame-large" : ""}`}>
      <Reveal className="frame-plate">
        <Art basePath={basePath} />
      </Reveal>
    </div>
  );
}
