import type { Project } from "./content";
import { asset, basePath } from "./paths";
import { Reveal } from "./reveal";

import { ShowdownArt } from "./art/showdown";
import { TapeArt } from "./art/tape";
import { WildebeestArt } from "./art/wildebeest";

/* One looping demo per project, keyed so content.ts stays free of React. */
const art: Record<Project["slug"], (props: { basePath: string }) => React.ReactElement> = {
  wildebeest: WildebeestArt,
  tape: TapeArt,
  showdownrl: ShowdownArt,
};

/*
  A project's demo, hung like a picture: its painting is the mat, and the
  demo sits on a dark plate in the middle of it. The demo starts playing
  once it scrolls into view.
*/
export function Framed({ project, large = false }: { project: Project; large?: boolean }) {
  const Art = art[project.slug];

  return (
    <div className={`frame${large ? " frame-large" : ""}`}>
      <img className="frame-mat" src={asset(`/paintings/${project.painting}`)} alt="" loading="lazy" />
      <Reveal className="frame-plate">
        <Art basePath={basePath} />
      </Reveal>
    </div>
  );
}
