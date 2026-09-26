/*
  The pond: a diamondback terrapin, the University of Maryland's mascot,
  paddling a slow lap through sunlit water between lily pads and pebbles.

  It is the one picture on the page that is not a diagram, so it is also the
  one place with colour. Sunlight is two layers of turbulence drifting against
  each other; the edges are feathered by a blurred mask so the water fades
  into the page in either theme; a film grain sits over everything.

  The lap is a sampled ellipse (pond.css, pd-swim), so it pauses and rests
  like every other illustration: CSS only, and only while on screen.
*/

const round = (v: number) => Math.round(v * 100) / 100;

/* Deterministic noise in [0, 1): the server and the browser must draw the
   same reeds. */
const noise = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};

const PEBBLES: readonly (readonly [number, number, number, number, number])[] = [
  [492, 132, 30, 24, 20],
  [520, 196, 14, 12, 0],
  [96, 300, 22, 16, -20],
  [300, 330, 12, 9, 10],
  [180, 90, 10, 8, 0],
  [560, 300, 18, 13, 30],
];

/* Lily pads: x, y, scale, rotation. Odd ones bob the other way. */
const PADS: readonly (readonly [number, number, number, number])[] = [
  [88, 110, 1.1, 20],
  [128, 150, 0.7, 140],
  [560, 348, 1, -60],
  [520, 360, 0.6, 200],
];

/* Reeds in the corners: each leaf is a tapered blade, rooted at the clump. */
const CLUMPS: readonly (readonly [number, number, number, number])[] = [
  [60, 56, 20, 100],
  [584, 360, 200, 290],
  [590, 70, 100, 190],
  [52, 350, -80, 10],
];

const LEAF_FILLS = ["#173826", "#24503a", "#2f6446"];
const SWAYS = ["pd-sway-a", "pd-sway-b", "pd-sway-c"];

const LEAVES = CLUMPS.flatMap(([x0, y0, a0, a1], c) =>
  Array.from({ length: 9 }, (_, i) => {
    const n = c * 40 + i * 4;
    const ang = ((a0 + (a1 - a0) * noise(n)) * Math.PI) / 180;
    const len = 50 + 70 * noise(n + 1);
    const wd = 3 + 3 * noise(n + 2);
    const bend = -18 + 36 * noise(n + 3);
    const x1 = x0 + Math.cos(ang) * len;
    const y1 = y0 + Math.sin(ang) * len;
    const nx = -Math.sin(ang) * wd;
    const ny = Math.cos(ang) * wd;
    const mx = (x0 + x1) / 2 - Math.sin(ang) * bend;
    const my = (y0 + y1) / 2 + Math.cos(ang) * bend;
    return {
      key: `${c}-${i}`,
      d:
        `M${round(x0 - nx)} ${round(y0 - ny)} Q${round(mx - nx)} ${round(my - ny)} ${round(x1)} ${round(y1)} ` +
        `Q${round(mx + nx)} ${round(my + ny)} ${round(x0 + nx)} ${round(y0 + ny)}Z`,
      fill: LEAF_FILLS[i % 3],
      sway: SWAYS[i % 3],
      origin: `${x0}px ${y0}px`,
      delay: `${-round(noise(n + 5) * 6)}s`,
    };
  }),
);

/* The terrapin, facing +x, drawn at unit scale; pd-swim moves and turns it. */
function Terrapin() {
  return (
    <g transform="scale(1.7)">
      <g className="pd-fl pd-fl-front">
        <ellipse cx="18" cy="-17" rx="11" ry="4.3" fill="#aaa99b" transform="rotate(-38 10 -15)" />
      </g>
      <g className="pd-fl pd-fl-front pd-fl-late">
        <ellipse cx="18" cy="17" rx="11" ry="4.3" fill="#aaa99b" transform="rotate(38 10 15)" />
      </g>
      <g className="pd-fl pd-fl-back pd-fl-late">
        <ellipse cx="-18" cy="-13" rx="7" ry="3.4" fill="#a3a294" transform="rotate(28 -14 -12)" />
      </g>
      <g className="pd-fl pd-fl-back">
        <ellipse cx="-18" cy="13" rx="7" ry="3.4" fill="#a3a294" transform="rotate(-28 -14 12)" />
      </g>
      <path d="M-23 -2 L-31 0.5 L-23 3 Z" fill="#9c9b8e" />
      <ellipse cx="27" cy="0" rx="8" ry="6" fill="#b8b7aa" />
      <g fill="#3a3a33">
        <circle cx="25.5" cy="-2" r="0.7" />
        <circle cx="28.5" cy="1.8" r="0.6" />
        <circle cx="24" cy="2.4" r="0.55" />
      </g>
      <circle cx="31" cy="-3.6" r="1.1" fill="#161612" />
      <circle cx="31" cy="3.6" r="1.1" fill="#161612" />
      <ellipse cx="0" cy="0" rx="24.5" ry="18.5" fill="url(#pd-shell)" stroke="#2e2c1b" strokeWidth="1" />
      <g fill="none" stroke="#2f2d1c" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M-16 0 L-8 -7 L2 -7 L10 0 L2 7 L-8 7 Z" />
        <path d="M-8 -7 L-11 -15 M2 -7 L4 -16 M10 0 L20 -6 M10 0 L20 6 M2 7 L4 16 M-8 7 L-11 15 M-16 0 L-23 0" />
        <path d="M-3 -7 L-3 7" opacity="0.7" />
      </g>
      {/* the diamondback's rings, one set per scute */}
      <g fill="none" stroke="#8c8660" strokeWidth="0.6" opacity="0.7">
        <ellipse cx="-3" cy="-3" rx="3.2" ry="2" />
        <ellipse cx="-3" cy="3" rx="3.2" ry="2" />
        <ellipse cx="4.5" cy="0" rx="2.6" ry="2.2" />
        <ellipse cx="-4" cy="-11.5" rx="3.6" ry="2" />
        <ellipse cx="-4" cy="11.5" rx="3.6" ry="2" />
        <ellipse cx="12" cy="-8" rx="3" ry="1.8" />
        <ellipse cx="12" cy="8" rx="3" ry="1.8" />
      </g>
      <ellipse cx="-6" cy="-7" rx="10" ry="5" fill="#fff" opacity="0.12" filter="url(#pd-soft)" />
    </g>
  );
}

export function PondArt() {
  return (
    <svg
      className="art art-pond"
      viewBox="0 0 640 400"
      role="img"
      aria-label="A diamondback terrapin, the University of Maryland's mascot, paddling through a sunlit pond between lily pads."
    >
      <defs>
        <radialGradient id="pd-water" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#3a7258" />
          <stop offset="0.6" stopColor="#22503d" />
          <stop offset="1" stopColor="#123126" />
        </radialGradient>
        <radialGradient id="pd-pebble" cx="0.35" cy="0.3">
          <stop offset="0" stopColor="#7c8a7a" />
          <stop offset="0.5" stopColor="#3c4a40" />
          <stop offset="1" stopColor="#1e2822" />
        </radialGradient>
        <radialGradient id="pd-shell" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#7b7650" />
          <stop offset="0.7" stopColor="#4f4b31" />
          <stop offset="1" stopColor="#34321f" />
        </radialGradient>

        <filter id="pd-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="pd-softer" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="pd-feather-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
        <mask id="pd-feather" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="400">
          <rect x="34" y="34" width="572" height="332" rx="34" fill="#fff" filter="url(#pd-feather-blur)" />
        </mask>

        {/* Sunlight: the creases of turbulence noise, kept as bright lines. */}
        <filter id="pd-light-a" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.011 0.015" numOctaves="2" seed="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.92  0 0 0 0 1  0 0 0 0 0.9  -6 0 0 0 1.02" />
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <filter id="pd-light-b" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.019 0.024" numOctaves="1" seed="9" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.9  0 0 0 0 1  0 0 0 0 0.9  -7 0 0 0 1" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <filter id="pd-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.6" intercept="-0.3" />
            <feFuncG type="linear" slope="1.6" intercept="-0.3" />
            <feFuncB type="linear" slope="1.6" intercept="-0.3" />
          </feComponentTransfer>
        </filter>
      </defs>

      <g mask="url(#pd-feather)">
        <rect width="640" height="400" fill="url(#pd-water)" />

        {PEBBLES.map(([x, y, rx, ry, a]) => (
          <g key={`${x}-${y}`}>
            <ellipse cx={x + 5} cy={y + 7} rx={rx} ry={ry} fill="#0b1a16" opacity="0.5" filter="url(#pd-soft)" />
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#pd-pebble)" transform={`rotate(${a} ${x} ${y})`} />
          </g>
        ))}

        {/* the terrapin's shadow on the bottom, then the terrapin */}
        <g opacity="0.45" filter="url(#pd-softer)">
          <g transform="translate(10 15)">
            <g className="pd-swim">
              <ellipse rx="50" ry="36" fill="#07120f" />
            </g>
          </g>
        </g>
        <g className="pd-swim">
          <Terrapin />
        </g>

        {PADS.map(([x, y, s, r], i) => (
          <g
            key={`${x}-${y}`}
            className={i % 2 ? "pd-pad pd-pad-alt" : "pd-pad"}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
              <circle cx="4" cy="6" r="24" fill="#07120f" opacity="0.35" filter="url(#pd-soft)" />
              <path d="M0 0 L23.6 -4.2 A24 24 0 1 0 23.6 4.2 Z" fill="#5c8c4e" />
              <path
                d="M0 0 L-17 -15 M0 0 L-22 3 M0 0 L-9 20 M0 0 L9 -21 M0 0 L13 18"
                stroke="#86b571"
                strokeWidth="0.7"
                opacity="0.7"
              />
            </g>
          </g>
        ))}
        <g transform="translate(92 106)">
          <circle r="6" fill="#f4e9ec" />
          <circle r="2.4" fill="#f2d27a" />
        </g>

        {LEAVES.map((leaf) => (
          <path
            key={leaf.key}
            className={`pd-leaf ${leaf.sway}`}
            d={leaf.d}
            fill={leaf.fill}
            style={{ transformOrigin: leaf.origin, animationDelay: leaf.delay }}
          />
        ))}

        <g className="pd-light pd-light-a">
          <rect x="-40" y="-40" width="720" height="480" filter="url(#pd-light-a)" />
        </g>
        <g className="pd-light pd-light-b">
          <rect x="-40" y="-40" width="720" height="480" filter="url(#pd-light-b)" />
        </g>

        <rect className="pd-grain" width="640" height="400" filter="url(#pd-grain)" />
      </g>
    </svg>
  );
}
