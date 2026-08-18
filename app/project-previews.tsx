const MARK = "oklch(92% 0 0)";
const MARK_SOFT = "oklch(58% 0 0)";
const TRACK = "oklch(34% 0 0)";
const OUTLINE = "oklch(46% 0 0)";
const LABEL = "oklch(66% 0 0)";

type PreviewProps = { title: string };

function Frame({ title, children }: PreviewProps & { children: React.ReactNode }) {
  return (
    <svg
      className="preview-svg"
      viewBox="0 0 640 132"
      role="img"
      aria-label={title}
      fill="none"
    >
      {children}
    </svg>
  );
}

/* 7 build tasks packed across 3 workers, against the single-worker run. */
export function ForgeGridPreview() {
  const lanes = [
    [
      [86, 60],
      [148, 44],
      [194, 76],
    ],
    [
      [86, 88],
      [176, 72],
    ],
    [
      [86, 52],
      [140, 122],
    ],
  ];

  return (
    <Frame title="Seven build tasks packed across three workers, finishing in 1.0s versus 2.5s on a single worker">
      <text x="16" y="26" fill={LABEL}>
        1 worker
      </text>
      <rect x="86" y="15" width="470" height="14" rx="4" fill={TRACK} />
      <text x="566" y="26" fill={LABEL}>
        2.5s
      </text>

      <text x="16" y="60" fill={LABEL}>
        3 workers
      </text>
      {lanes.map((lane, row) =>
        lane.map(([x, width]) => (
          <rect
            key={`${row}-${x}`}
            x={x}
            y={49 + row * 23}
            width={width}
            height="14"
            rx="4"
            fill={MARK}
          />
        )),
      )}

      <path d="M272 42 L272 116" stroke={MARK_SOFT} strokeWidth="1" strokeDasharray="3 3" />
      <text x="280" y="60" fill={LABEL}>
        7 tasks across 3 workers
      </text>
      <text x="280" y="106" fill="oklch(80% 0 0)">
        1.0s
      </text>
    </Frame>
  );
}

/* Win rate against the 50% baseline. */
export function ShowdownPreview() {
  return (
    <Frame title="79 percent win rate over 2,000 or more evaluation matches, against a 50 percent baseline">
      <text x="16" y="52" className="pv-hero" fill="oklch(95% 0 0)">
        79%
      </text>
      <text x="160" y="52" fill={LABEL}>
        win rate over 2,000+ evaluation matches
      </text>
      <rect x="16" y="78" width="608" height="12" rx="6" fill={TRACK} />
      <rect x="16" y="78" width="480" height="12" rx="6" fill={MARK} />
      <path d="M320 71 L320 97" stroke={MARK_SOFT} strokeWidth="1" />
      <text x="310" y="112" fill={LABEL}>
        50% baseline
      </text>
    </Frame>
  );
}

/* Photo in, ranked outfit out. */
export function ClosetPreview() {
  const stages = [
    { x: 30, label: "input photo" },
    { x: 190, label: "segmented" },
    { x: 350, label: "10 attributes" },
    { x: 510, label: "ranked outfits" },
  ];

  return (
    <Frame title="Pipeline from an input photo through segmentation and attribute tagging to a ranked outfit">
      {stages.map(({ x, label }) => (
        <g key={x}>
          <rect x={x} y="24" width="100" height="56" rx="4" stroke="oklch(44% 0 0)" strokeWidth="1" />
          <text x={x + 50} y="102" fill={LABEL} textAnchor="middle">
            {label}
          </text>
        </g>
      ))}

      {[136, 296, 456].map((x) => (
        <path
          key={x}
          d={`M${x} 52 L${x + 46} 52 M${x + 40} 48 L${x + 46} 52 L${x + 40} 56`}
          stroke={MARK_SOFT}
          strokeWidth="1.2"
        />
      ))}

      {/* raw photo: framed shot with a subject in it */}
      <circle cx="52" cy="40" r="4" fill="oklch(50% 0 0)" />
      <path d="M38 68 L58 46 L72 62 L82 54 L96 68 Z" fill="oklch(50% 0 0)" />

      {/* segmented garment */}
      <path
        d="M223 40 L233 36 L247 36 L257 40 L253 50 L247 47 L247 68 L233 68 L233 47 L227 50 Z"
        fill={MARK}
      />

      {/* attribute tags */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="366" y={33 + i * 15} width="46" height="10" rx="5" fill="oklch(50% 0 0)" />
          <rect x="418" y={33 + i * 15} width="26" height="10" rx="5" fill="oklch(38% 0 0)" />
        </g>
      ))}

      {/* ranked results */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={522 + i * 26}
          y={i === 0 ? 34 : 40}
          width="20"
          height={i === 0 ? 34 : 28}
          rx="3"
          fill={i === 0 ? MARK : "oklch(42% 0 0)"}
        />
      ))}
      <text x="600" y="62" fill={LABEL}>
        top 3
      </text>
    </Frame>
  );
}

/* A lap resampled onto the track map, hugging the apex of each corner. */
export function GhostLinePreview() {
  const racingLine =
    "M16 60 L130 58 C190 54 200 110 268 112 L372 112 C430 110 442 52 500 50 L624 46";

  return (
    <Frame title="A driven lap resampled onto a 400-point track map, hugging the apex of each corner">
      <path
        d="M16 40 L140 40 C200 40 200 92 260 92 L380 92 C440 92 440 40 500 40 L624 40"
        stroke={OUTLINE}
        strokeWidth="1"
      />
      <path
        d="M16 66 L140 66 C176 66 176 118 260 118 L380 118 C416 118 416 66 500 66 L624 66"
        stroke={OUTLINE}
        strokeWidth="1"
      />

      <path d={racingLine} stroke="oklch(52% 0 0)" strokeWidth="1.4" />
      <path
        d={racingLine}
        stroke="oklch(96% 0 0)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="0.4 9"
      />

      <circle cx="268" cy="112" r="2.4" fill="oklch(96% 0 0)" />
      <circle cx="500" cy="50" r="2.4" fill="oklch(96% 0 0)" />
      <text x="486" y="34" fill={LABEL}>
        apex
      </text>
      <text x="16" y="26" fill={LABEL}>
        400 resample points per lap
      </text>
    </Frame>
  );
}
