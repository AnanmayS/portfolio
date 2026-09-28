/*
  Wildebeest, told so anyone can follow it at a glance.

  Three camera-trap photos go through the two AI models, two workers per
  model, so two photos are handled at once. MegaDetector asks "anything
  there?" and throws the empty one out; SpeciesNet names the animal. Midway,
  worker 3 crashes holding the zebra: worker 4 picks the photo up 0.16 s
  later, and when w3 wakes up late its old answer is refused (the fencing
  token), so nothing is counted twice. Underneath, the first version against
  now on the three numbers that changed.

  One 9 s loop, driven from app/art/wildebeest.css. The un-animated state is
  the finished frame: both photos sorted, w3 crossed out.

  Numbers: the Wildebeest README results table (recovery 5.6 s → 0.16 s,
  ~240 → ~4,500 tasks handed out a second, 156 ms → 15 ms wait) and its
  fault matrix (30 injected crashes, 0 photos lost or counted twice).
*/

type Photo = {
  stamp: string;
  subject: React.ReactNode;
  tags: { cls: string; text: string; tone: "ok" | "ink" | "bad" }[];
};

const INK = "#2a2622";

const PHOTOS: Record<"p1" | "p2" | "p3", Photo> = {
  p1: {
    stamp: "06:14",
    subject: (
      <>
        <path d="M22 23Q30 18 42 22L44 31Q33 33 23 31Z" fill={INK} />
        <path d="M23 24L15 29L14 34L18 34L23 30Z" fill={INK} />
        <path d="M16 29q-3-3 0-5M17 28q2-4 4-3" stroke={INK} strokeWidth="1.2" />
        <path d="M25 31V39M29 31V39M39 31V39M42 31V39" stroke={INK} strokeWidth="2" />
        <path d="M44 24q3 3 3 8" stroke={INK} strokeWidth="1.2" />
      </>
    ),
    tags: [
      { cls: "wb-t1a", text: "animal ✓", tone: "ok" },
      { cls: "wb-t1b", text: "wildebeest", tone: "ink" },
    ],
  },
  p2: {
    stamp: "02:47",
    subject: <path d="M10 31l2-5 1 5M30 33l2-6 2 6M50 30l1-4 2 4" stroke="#6f6040" strokeWidth="1.2" />,
    tags: [{ cls: "wb-t2", text: "empty, thrown out", tone: "bad" }],
  },
  p3: {
    stamp: "17:05",
    subject: (
      <>
        <path d="M20 22Q32 18 44 22L43 31Q32 33 21 31Z" fill="#e6e1d6" />
        <path d="M25 21V31M29 20V32M33 20V32M37 20V32M41 21V31" stroke={INK} strokeWidth="1.4" />
        <path d="M43 23L50 17L53 19L47 27Z" fill="#e6e1d6" />
        <path d="M43 22L49 16" stroke={INK} strokeWidth="1.4" />
        <path d="M23 31V39M26 31V39M38 31V39M41 31V39" stroke={INK} strokeWidth="2" />
        <path d="M20 23q-3 3-2 8" stroke={INK} strokeWidth="1.2" />
      </>
    ),
    tags: [
      { cls: "wb-t3a", text: "animal ✓", tone: "ok" },
      { cls: "wb-t3b", text: "zebra", tone: "ink" },
    ],
  },
};

/* A 64×48 camera-trap photo: sky, grass, the subject, the trap's clock,
   and its label underneath, which travels with it. */
function PhotoCard({ id }: { id: keyof typeof PHOTOS }) {
  const { stamp, subject, tags } = PHOTOS[id];
  return (
    <g transform="translate(12 77)">
      <g className={`wb-p wb-${id}`}>
        <path d="M4 0H60a4 4 0 0 1 4 4V28H0V4a4 4 0 0 1 4-4Z" fill="#7f8f8c" />
        <path d="M0 28H64V44a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4Z" fill="#9a8757" />
        {subject}
        <text className="mono" x="4" y="9" fill="#f4f3ee" fillOpacity="0.75" fontSize="6">
          {stamp}
        </text>
        <rect x="0.5" y="0.5" width="63" height="47" rx="4" stroke="rgba(255,255,255,0.3)" />
        {tags.map((tag) => (
          <text key={tag.cls} className={`art-tag art-tag-${tag.tone} ${tag.cls}`} x="32" y="61" textAnchor="middle">
            {tag.text}
          </text>
        ))}
      </g>
    </g>
  );
}

/* First version against now: a grey bar and a green one, each with its value. */
const COMPARE = [
  { x: 0, label: "time to recover from a crash", before: [140, "5.6 s before"], after: [4, "0.16 s now"] },
  { x: 245, label: "tasks handed out per second", before: [7.5, "~240 before"], after: [140, "~4,500 now"] },
  { x: 490, label: "wait for a task", before: [140, "156 ms before"], after: [13.5, "15 ms now"] },
] as const;

export function WildebeestArt() {
  return (
    <svg
      className="art art-wb"
      viewBox="0 0 720 302"
      role="img"
      aria-label="Camera-trap photos are shared out across several workers. MegaDetector throws out empty photos and SpeciesNet names the animal, a wildebeest and then a zebra, two photos at a time. Midway, worker 3 crashes while holding the zebra photo; worker 4 picks it up 0.16 seconds later, and a late answer from worker 3 is refused. Compared with the first version: crash recovery went from 5.6 seconds to 0.16, tasks handed out per second from about 240 to about 4,500, and wait for a task from 156 milliseconds to 15. Over 1,000 real photos, 0 failures; over 30 injected crashes, no photo lost or counted twice."
      fill="none"
    >
      {/* ---- the four stages ---- */}
      <text className="art-label" x="44" y="22" textAnchor="middle">
        camera trap
      </text>
      <text className="art-label" x="230" y="22" textAnchor="middle">
        <tspan className="art-strong">MegaDetector</tspan> · anything there?
      </text>
      <text className="art-label" x="450" y="22" textAnchor="middle">
        <tspan className="art-strong">SpeciesNet</tspan> · what animal?
      </text>
      <text className="art-label" x="640" y="22" textAnchor="middle">
        sorted
      </text>

      <rect className="art-tray" x="6" y="70" width="76" height="62" rx="6" />
      <rect className="art-box" x="160" y="34" width="140" height="148" rx="8" />
      <rect className="art-box" x="380" y="34" width="140" height="148" rx="8" />
      <line className="art-hair" x1="164" y1="108" x2="296" y2="108" />
      <line className="art-hair" x1="384" y1="108" x2="516" y2="108" />
      <rect className="wb-w3box" x="384" y="38" width="132" height="68" rx="6" stroke="none" />
      <rect className="art-tray" x="564" y="34" width="152" height="86" rx="6" />
      <path
        className="art-arrow"
        d="M88 101H152M147 97l5 4-5 4M306 101H372M367 97l5 4-5 4M526 76H556M551 72l5 4-5 4"
      />

      {/* ---- the workers ---- */}
      <text className="art-small" x="172" y="72">
        w1
      </text>
      <text className="art-small" x="172" y="138">
        w2
      </text>
      <text className="art-small wb-w3ok" x="392" y="72">
        w3
      </text>
      <text className="art-small art-bad wb-w3x" x="392" y="72">
        w3 ✕
      </text>
      <text className="art-small" x="392" y="138">
        w4
      </text>

      {/* ---- the photos, zebra first so the wildebeest rides on top ---- */}
      <PhotoCard id="p3" />
      <PhotoCard id="p2" />
      <PhotoCard id="p1" />

      <text className="art-label art-ok wb-rec" x="450" y="200" textAnchor="middle">
        w3 crashed · w4 picked the photo up in 0.16 s
      </text>
      <text className="art-label art-bad wb-late" x="450" y="200" textAnchor="middle">
        w3 woke up late · its old answer was refused
      </text>

      {/* ---- first version against now ---- */}
      <line className="art-rule" x1="0" y1="214" x2="720" y2="214" />
      {COMPARE.map(({ x, label, before, after }) => (
        <g key={label}>
          <text className="art-label art-soft" x={x} y="234">
            {label}
          </text>
          <rect className="art-bar-before" x={x} y="243" width={before[0]} height="8" rx="2" />
          <text className="art-small" x={x + before[0] + 6} y="251">
            {before[1]}
          </text>
          <rect className="art-bar-after" x={x} y="258" width={after[0]} height="8" rx="2" />
          <text className="art-small art-ok art-bold" x={x + after[0] + 6} y="266">
            {after[1]}
          </text>
        </g>
      ))}
      <text className="art-small" x="0" y="294">
        scheduler written from scratch on Postgres + Redis · 1,000 real photos, 0 failures · 0 photos lost over 30
        crashes
      </text>
    </svg>
  );
}
