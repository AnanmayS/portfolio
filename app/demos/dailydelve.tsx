/*
  Daily Delve preview. A server component on purpose: there is no play-on-view
  behaviour and no autoplay, so nothing here needs to run on the client. The
  reader presses play or the clip never loads.

  ffmpeg is not on PATH in this environment (the only build present is
  Playwright's, compiled with --disable-everything: no mov demuxer, no
  libx264, no VP9), so the repo's 2870x1578 H.264 QuickTime recording is
  shipped as-is and is the only source. To add the smaller sources later:

    ffmpeg -i public/daily-delve-preview/gameplay-preview.mov -an \
      -vf "scale='min(960,iw)':-2" -c:v libx264 -pix_fmt yuv420p -crf 28 \
      -movflags +faststart public/daily-delve-preview/gameplay-preview.mp4
    ffmpeg -i public/daily-delve-preview/gameplay-preview.mov -an \
      -vf "scale='min(960,iw)':-2" -c:v libvpx-vp9 -crf 36 -b:v 0 \
      public/daily-delve-preview/gameplay-preview.webm
    ffmpeg -ss 2 -i public/daily-delve-preview/gameplay-preview.mov \
      -frames:v 1 -vf "scale='min(960,iw)':-2" -q:v 4 \
      public/daily-delve-preview/gameplay-preview.jpg

  then uncomment the two SOURCES entries and set POSTER. webm goes first so a
  browser that can decode it never touches the QuickTime file.
*/

const basePath = process.env.PAGES_BASE_PATH ?? "";
const clips = `${basePath}/daily-delve-preview`;

type Source = { src: string; type: string };

const SOURCES: Source[] = [
  /* { src: `${clips}/gameplay-preview.webm`, type: "video/webm" }, */
  /* { src: `${clips}/gameplay-preview.mp4`, type: "video/mp4" }, */
  { src: `${clips}/gameplay-preview.mov`, type: "video/quicktime" },
];

/* Set to `${clips}/gameplay-preview.jpg` once the poster frame exists. */
const POSTER: string | undefined = undefined;

const DOWNLOAD = `${clips}/gameplay-preview.mov`;

export function DailyDelve() {
  return (
    <div className="dd">
      <div className="dd-frame">
        <video
          aria-label="Screen recording of a Daily Delve run: the daily dungeon crawl being played from the seeded start"
          className="dd-video"
          controls
          muted
          playsInline
          poster={POSTER}
          preload="metadata"
        >
          {SOURCES.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
          <p className="dd-fallback">
            This browser cannot play the recording.{" "}
            <a href={DOWNLOAD} rel="noreferrer" target="_blank">
              Download the clip ↗
            </a>
          </p>
        </video>
      </div>
      <p className="dd-caption">
        Gameplay from the repo. Autoplay is off; press play.
      </p>
    </div>
  );
}
