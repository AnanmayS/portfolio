/*
  Every strong line on this resume is a measured delta, so the page draws them
  rather than only stating them. Each mark is to scale, and the accent is only
  ever the measured result.
*/

/* ---- project marks ---- */

type Seg = [number, number];

function Grow({
  x,
  y,
  width,
  height,
  delay = 0,
  fill = "var(--ink)",
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  delay?: number;
  fill?: string;
}) {
  return (
    <rect
      className="d-grow"
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

/* Captured feed, three severed spans, and the same window replayed compressed. */
export function TapeDiagram() {
  const captured: Seg[] = [
    [96, 150],
    [260, 158],
    [432, 116],
    [562, 158],
  ];
  const gaps = [253, 425, 555];
  const replayed: Seg[] = [
    [96, 51],
    [152, 54],
    [211, 39],
    [255, 54],
  ];

  return (
    <svg
      className="diagram"
      viewBox="0 0 720 104"
      role="img"
      aria-label="A captured feed window with three severed spans flagged, and the same window replayed compressed at 2,580 times real time."
      fill="none"
    >
      <text x="0" y="35" className="d-label">
        capture
      </text>
      {captured.map(([x, w], i) => (
        <Grow key={x} x={x} y={24} width={w} height={14} delay={i * 90} />
      ))}
      {gaps.map((x, i) => (
        <rect
          key={x}
          className="d-fade"
          x={x - 1}
          y={17}
          width="2"
          height="28"
          fill="var(--accent)"
          style={{ animationDelay: `${420 + i * 90}ms` }}
        />
      ))}
      <text x="96" y="60" className="d-note">
        3 gaps flagged · 3,240 messages lost under fault injection
      </text>

      <text x="0" y="87" className="d-label">
        replay
      </text>
      {replayed.map(([x, w], i) => (
        <Grow key={x} x={x} y={76} width={w} height={14} delay={700 + i * 70} />
      ))}
      <text x="325" y="87" className="d-label">
        2,580× real time, byte-identical
      </text>
    </svg>
  );
}

/* One worker against three, with the critical path setting the floor. */
export function ForgeGridDiagram() {
  const lanes: Seg[][] = [
    [
      [96, 64],
      [164, 48],
      [216, 110],
    ],
    [
      [96, 92],
      [192, 80],
    ],
    [
      [96, 56],
      [156, 104],
    ],
  ];

  return (
    <svg
      className="diagram"
      viewBox="0 0 720 108"
      role="img"
      aria-label="A build on one worker against the same build spread over three workers, finishing 59 percent sooner, with the longest dependency chain setting the floor."
      fill="none"
    >
      <text x="0" y="29" className="d-label">
        1 worker
      </text>
      <Grow x={96} y={18} width={560} height={14} fill="var(--slow)" />
      <text x="720" y="29" className="d-label" textAnchor="end">
        2.5s
      </text>

      <text x="0" y="69" className="d-label">
        3 workers
      </text>
      {lanes.map((lane, row) =>
        lane.map(([x, w], i) => (
          <Grow
            key={`${row}-${x}`}
            x={x}
            y={46 + row * 18}
            width={w}
            height={14}
            delay={120 + (row * 3 + i) * 70}
          />
        )),
      )}

      <rect
        className="d-fade"
        x="326"
        y="42"
        width="2"
        height="54"
        fill="var(--accent)"
        style={{ animationDelay: "620ms" }}
      />
      <text x="338" y="73" className="d-note">
        59% faster
      </text>
    </svg>
  );
}

/* Win rate over the logged matches, read against an even split. */
export function ShowdownDiagram() {
  const width = 720 * 0.79;

  return (
    <svg
      className="diagram"
      viewBox="0 0 720 72"
      role="img"
      aria-label="A 79 percent win rate across 1,000 logged live matches against human opponents, read against an even 50 percent split."
      fill="none"
    >
      <text x="0" y="14" className="d-label">
        1,000 live matches against humans
      </text>
      <rect x="0" y="24" width="720" height="16" fill="var(--rule)" />
      <Grow x={0} y={24} width={width} height={16} fill="var(--accent)" />
      <rect x="359" y="18" width="1" height="28" fill="var(--muted)" />
      <text x="360" y="62" className="d-label" textAnchor="middle">
        50%
      </text>
      <text x={width + 12} y="37" className="d-note">
        79%
      </text>
    </svg>
  );
}
