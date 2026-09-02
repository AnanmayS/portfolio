/*
  The record strip: a continuous-feed printout of the three roles on one time
  axis. Every project on this page is about making a system's behaviour
  replayable after the fact, so the page opens with the record itself rather
  than a headline. The sheet has tear-off sprocket margins, the year bands are
  the time axis, and the red head is now.
*/

const VIEW_W = 920;
const VIEW_H = 158;
const MARGIN = 26; /* tear-off sprocket strip */
const PLOT_X = 150;
const PLOT_W = 736;
const PRINT_TOP = 20;
const PRINT_BOTTOM = 124;
const SPAN_MONTHS = 36; /* Jan 2024 through Dec 2026 */
const LANE_H = 20;

/* Months elapsed since Jan 2024. */
function month(year: number, monthOfYear: number) {
  return (year - 2024) * 12 + (monthOfYear - 1);
}

function x(m: number) {
  return PLOT_X + (m / SPAN_MONTHS) * PLOT_W;
}

const NOW = month(2026, 9);

const lanes = [
  { tag: "GSALPHA", from: month(2026, 5), to: NOW },
  { tag: "SEDS", from: month(2024, 9), to: month(2026, 2) },
  { tag: "CONVICTION", from: month(2025, 5), to: month(2025, 8) },
];

const years = [2024, 2025, 2026];
const bandW = PLOT_W / years.length;
const holes = Array.from({ length: 8 }, (_, i) => 8 + i * 20);

export function RecordStrip() {
  const headX = x(NOW);

  return (
    <div className="tape-outer">
      <div className="tape">
      <svg
        className="tape-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="A continuous-feed printout showing three roles on one time axis: GSAlpha Labs from May 2026 to now, SEDS at UMD from September 2024 to February 2026, and theconviction.ai from May to August 2025."
        fill="none"
      >
        <defs>
          <clipPath id="record-plot">
            {/* opens above the print area so the head's marker is not clipped */}
            <rect x={PLOT_X} y={PRINT_TOP - 10} width={PLOT_W} height={PRINT_BOTTOM - PRINT_TOP + 10} />
          </clipPath>
        </defs>

        {/* the sheet */}
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="var(--paper-deep)" />

        {/* year bands: the time axis, printed onto the sheet */}
        <g clipPath="url(#record-plot)">
          {years.map((year, i) =>
            i % 2 === 0 ? (
              <rect
                key={year}
                x={x(month(year, 1))}
                y={PRINT_TOP}
                width={bandW}
                height={PRINT_BOTTOM - PRINT_TOP}
                fill="var(--bar)"
              />
            ) : null,
          )}

          {years.map((year) => (
            <text key={year} x={x(month(year, 1)) + 6} y="118" fill="var(--ink-faint)">
              {year}
            </text>
          ))}

          {lanes.map((lane, i) => (
            <rect
              key={lane.tag}
              x={x(lane.from)}
              y={30 + i * 28}
              width={x(lane.to) - x(lane.from)}
              height={LANE_H}
              fill="var(--ink)"
            />
          ))}

          {/* the live head: the one place the accent is spent. The cursor line
              stays solid; only the recording indicator blinks. */}
          <rect
            x={headX - 1}
            y={PRINT_TOP}
            width="2"
            height={PRINT_BOTTOM - PRINT_TOP}
            fill="var(--flag)"
          />
          <rect
            className="tape-head"
            x={headX - 3.5}
            y={PRINT_TOP - 6}
            width="7"
            height="7"
            fill="var(--flag)"
          />

          {/* paper still feeding out of the printer */}
          <rect
            className="tape-wipe"
            x={PLOT_X}
            y={PRINT_TOP - 10}
            width={PLOT_W}
            height={PRINT_BOTTOM - PRINT_TOP + 10}
            fill="var(--paper-deep)"
          />
        </g>

        {/* lane labels, printed in the left margin */}
        {lanes.map((lane, i) => (
          <text
            key={lane.tag}
            x={PLOT_X - 12}
            y={30 + i * 28 + 14}
            fill="var(--ink-soft)"
            textAnchor="end"
          >
            {lane.tag}
          </text>
        ))}

        {/* tear-off margins: perforations, then sprocket holes */}
        <path
          d={`M${MARGIN} 6 L${MARGIN} ${VIEW_H - 6} M${VIEW_W - MARGIN} 6 L${VIEW_W - MARGIN} ${VIEW_H - 6}`}
          stroke="var(--rule)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
        {holes.map((hy) => (
          <g key={hy}>
            <rect
              x="9"
              y={hy}
              width="8"
              height="8"
              rx="2"
              fill="var(--paper)"
              stroke="var(--rule)"
            />
            <rect
              x={VIEW_W - 17}
              y={hy}
              width="8"
              height="8"
              rx="2"
              fill="var(--paper)"
              stroke="var(--rule)"
            />
          </g>
        ))}
      </svg>
      </div>

      <p className="tape-caption">
        <span className="tape-live">still recording</span>
      </p>
    </div>
  );
}
