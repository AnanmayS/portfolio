const MARK = "oklch(92% 0 0)";
const MARK_SOFT = "oklch(58% 0 0)";
const TRACK = "oklch(34% 0 0)";
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

/* A captured feed window, its three dropped spans flagged, replayed compressed. */
export function TapePreview() {
  /* [x, width] spans of the live feed that actually made it to storage. */
  const captured = [
    [100, 118],
    [228, 146],
    [384, 96],
    [490, 134],
  ];
  /* The same spans on the replay timeline, 2.57x narrower. */
  const replayed = [
    [100, 46],
    [150, 57],
    [211, 37],
    [252, 52],
  ];
  const gaps = [223, 379, 485];

  return (
    <Frame title="A captured feed window with its three dropped spans flagged, replayed byte-identical at 2,580 times real time">
      <text x="16" y="30" fill={LABEL}>
        live feed
      </text>
      <rect x="100" y="19" width="524" height="14" rx="4" fill={TRACK} />
      {captured.map(([x, width]) => (
        <rect key={x} x={x} y="19" width={width} height="14" rx="4" fill={MARK} />
      ))}
      {gaps.map((x) => (
        <path
          key={x}
          d={`M${x} 11 L${x} 41`}
          stroke={MARK_SOFT}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}
      <text x="100" y="58" fill={LABEL}>
        3 gaps flagged · 3,240 messages lost under fault injection
      </text>

      <text x="16" y="96" fill={LABEL}>
        replay
      </text>
      <rect x="100" y="85" width="204" height="14" rx="4" fill={TRACK} />
      {replayed.map(([x, width]) => (
        <rect key={x} x={x} y="85" width={width} height="14" rx="4" fill={MARK} />
      ))}
      <path
        d="M316 92 L352 92 M346 88 L352 92 L346 96"
        stroke={MARK_SOFT}
        strokeWidth="1.2"
      />
      <text x="362" y="96" fill="oklch(80% 0 0)">
        2,580x real time
      </text>
      <text x="100" y="122" fill={LABEL}>
        byte-identical: same window in, same backtest out
      </text>
    </Frame>
  );
}

/* Dependent build tasks packed across 3 workers, against the single-worker run. */
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
    <Frame title="Dependent build tasks packed across three workers, finishing 59 percent faster than the single-worker run">
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
        each task starts as its dependencies finish
      </text>
      <text x="280" y="106" fill="oklch(80% 0 0)">
        59% faster
      </text>
    </Frame>
  );
}

/* Win rate across the logged live matches, read against an even split. */
export function ShowdownPreview() {
  return (
    <Frame title="79 percent win rate across 1,000 logged live matches against human opponents, read against an even 50 percent split">
      <text x="16" y="52" className="pv-hero" fill="oklch(95% 0 0)">
        79%
      </text>
      <text x="160" y="52" fill={LABEL}>
        of 1,000 live matches against humans
      </text>
      <rect x="16" y="78" width="608" height="12" rx="6" fill={TRACK} />
      <rect x="16" y="78" width="480" height="12" rx="6" fill={MARK} />
      <path d="M320 71 L320 97" stroke={MARK_SOFT} strokeWidth="1" />
      <text x="304" y="112" fill={LABEL}>
        50% even split
      </text>
    </Frame>
  );
}
