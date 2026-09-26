/*
  Wildebeest: one photo's lease, lost to a crash, recovered two ways.

  Both lanes are the same moment: a worker holding a photo is SIGKILLed 0.4 s
  in. The top lane is the first version, which only noticed a dead worker by
  its silence: three missed 2 s heartbeats, so the photo sits leased to a
  corpse until the 6 s timeout and is re-claimed 5.6 s after the kill. The
  lane below is the current one, which listens for Docker's `die` event and has
  the photo back in someone's hands 0.16 s after the kill. Both gaps are to
  scale on one axis, and the sweep runs in real time, so the reader waits
  exactly as long as the photo did.

  Underneath, the reason a crash can't double-count: every lease carries an
  epoch. The replacement writes with epoch 2; a frozen worker that wakes late
  and still holds epoch 1 is refused at the write.

  Numbers: benchmarks/ceiling/results.md (recovery p50 5,562 ms before, 163 ms
  after) and benchmarks/faults/results.md (30 injected faults, 0 violations).

  Everything on the lanes is to scale on one axis: x = 86 + PPS * seconds.
*/

type Block = { x: number; w: number };

const X0 = 86; // 0 s
const AXIS = 6.5; // seconds the axis spans
const PPS = 480 / AXIS; // pixels per second, so the axis ends at x = 566
const H = 12; // bar height
const GAP = 2;

const round = (v: number) => Math.round(v * 100) / 100;
const at = (t: number) => round(X0 + PPS * t);
const block = (t: number, d: number): Block => ({
  x: at(t),
  w: round(Math.max(8, PPS * d - GAP)),
});

const KILL = 0.4; // the worker is killed
const HEARTBEAT = 2; // seconds between heartbeats; three missed is dead
const BEFORE = KILL + 5.6; // re-claimed after the heartbeat timeout
const AFTER = KILL + 0.16; // re-claimed on the Docker die event
const WORK = 0.5; // the photo, drawn running again on its new worker

const LANE_A = 24; // before
const LANE_B = 64; // after
const MID = H / 2;

/* The missed-heartbeat circle at 6 s sits where the re-claim starts, so the
   re-claimed bar starts just past its edge. */
const HB_R = 3;
const RAN = block(0, KILL);
const BEFORE_BLK = block(BEFORE + (HB_R + 1) / PPS, WORK);
const AFTER_BLK = block(AFTER, WORK);

export function WildebeestArt() {
  return (
    <svg
      className="art art-wb"
      viewBox="0 0 720 208"
      role="img"
      aria-label="A worker holding a photo is killed 0.4 seconds in. In the first version the photo waits for three missed heartbeats and is re-claimed 5.6 seconds later; in the current version a Docker die event hands it to another worker 0.16 seconds later. Below, the replacement writes its result with lease epoch 2 and is accepted, while a frozen worker that wakes late with epoch 1 is refused with 409 stale lease. Over 30 injected faults, no photo was lost or counted twice."
      fill="none"
    >
      {/* ---- lane labels ---- */}
      <text className="wb-label" x="64" y={LANE_A + 10} textAnchor="end">
        before
      </text>
      <text className="wb-label" x="64" y={LANE_B + 10} textAnchor="end">
        after
      </text>

      {/* ---- the kill, through both lanes ---- */}
      <g className="wb-kill">
        <text className="wb-label" x={at(KILL)} y="14" textAnchor="middle">
          kill
        </text>
        <line
          className="wb-kill-line"
          x1={at(KILL)}
          y1="20"
          x2={at(KILL)}
          y2={LANE_B + H + 4}
        />
      </g>

      {/* ---- both lanes, drawn left to right in real time ---- */}
      <g className="wb-sweep">
        {/* pins the group's box to the whole axis, so the sweep's inset is in
            axis fractions */}
        <rect x={X0} y={LANE_A} width={480} height={LANE_B + H - LANE_A} />

        {/* before: silence, three missed heartbeats, then re-claimed */}
        <rect
          className="wb-dead wb-dead-base"
          x={RAN.x}
          y={LANE_A}
          width={RAN.w}
          height={H}
          rx="2"
        />
        <line
          className="wb-wait"
          x1={at(KILL)}
          y1={LANE_A + MID}
          x2={at(BEFORE)}
          y2={LANE_A + MID}
        />
        {[1, 2, 3].map((n) => (
          <circle
            key={n}
            className="wb-miss"
            cx={at(n * HEARTBEAT)}
            cy={LANE_A + MID}
            r={HB_R}
          />
        ))}
        <rect
          className="wb-blk wb-base"
          x={BEFORE_BLK.x}
          y={LANE_A}
          width={BEFORE_BLK.w}
          height={H}
          rx="2"
        />

        {/* after: a sliver of a gap, then re-claimed */}
        <rect
          className="wb-dead"
          x={RAN.x}
          y={LANE_B}
          width={RAN.w}
          height={H}
          rx="2"
        />
        <line
          className="wb-wait"
          x1={at(KILL)}
          y1={LANE_B + MID}
          x2={at(AFTER)}
          y2={LANE_B + MID}
        />
        <rect
          className="wb-blk"
          x={AFTER_BLK.x}
          y={LANE_B}
          width={AFTER_BLK.w}
          height={H}
          rx="2"
        />
      </g>

      {/* the photo running on the worker that dies: solid until the kill */}
      <rect
        className="wb-blk wb-base wb-run"
        x={RAN.x}
        y={LANE_A}
        width={RAN.w}
        height={H}
        rx="2"
      />
      <rect
        className="wb-blk wb-run"
        x={RAN.x}
        y={LANE_B}
        width={RAN.w}
        height={H}
        rx="2"
      />

      {/* the playhead, one real second per second */}
      <line
        className="wb-head"
        x1={X0}
        y1="20"
        x2={X0}
        y2={LANE_B + H + 4}
      />

      {/* ---- how each version noticed ---- */}
      <text className="wb-label wb-in-hb" x={at(HEARTBEAT) - HB_R} y="52">
        missed heartbeats
      </text>
      <text className="wb-label wb-in-a" x={at(AFTER) + 8} y="92">
        docker die event
      </text>

      {/* ---- re-claim marks ---- */}
      <line className="wb-mark wb-in-a" x1={at(AFTER)} y1="60" x2={at(AFTER)} y2="108" />
      <line className="wb-mark wb-in-b" x1={at(BEFORE)} y1="20" x2={at(BEFORE)} y2="108" />

      {/* ---- axis ---- */}
      <line className="wb-rule" x1={X0} y1="104" x2={at(AXIS)} y2="104" />
      {[0, 2, 4, 6].map((t) => (
        <line key={t} className="wb-rule" x1={at(t)} y1="104" x2={at(t)} y2="109" />
      ))}
      <text className="wb-label" x={X0} y="124">
        0 s
      </text>
      <text className="wb-label" x={at(2)} y="124" textAnchor="middle">
        2
      </text>
      <text className="wb-label" x={at(4)} y="124" textAnchor="middle">
        4
      </text>
      <text className="wb-label" x={at(6)} y="124" textAnchor="middle">
        6 s
      </text>

      {/* ---- readout: kill to re-claimed ---- */}
      <text className="wb-label wb-in-b" x="580" y={LANE_A + 10}>
        5.6 s
      </text>
      <text className="wb-num wb-in-a" x="580" y={LANE_B + 10}>
        0.16 s
      </text>
      <text className="wb-label wb-in-a" x="580" y="92">
        to re-claim
      </text>

      {/* ---- fencing: the late writer is refused at the write ---- */}
      <g className="wb-fa">
        <text className="wb-ink" x="86" y="152">
          new lease · epoch 2
        </text>
        <path className="wb-arrow" d="M300 148H340M335 144L340 148L335 152" />
        <rect className="wb-store" x="346" y="136" width="76" height="42" rx="4" />
        <text className="wb-label" x="384" y="161" textAnchor="middle">
          result
        </text>
        <text className="wb-ink" x="434" y="152">
          written once
        </text>
      </g>

      <g className="wb-fb">
        <text className="wb-label" x="86" y="174">
          late write · epoch 1
        </text>
        <path className="wb-arrow wb-refused" d="M300 170H334" />
      </g>

      <g className="wb-fc">
        <path className="wb-arrow" d="M340 165V175" />
        <text className="wb-label" x="434" y="174">
          409 stale lease
        </text>
      </g>

      {/* ---- the whole fault matrix, in one line ---- */}
      <text className="wb-label wb-fin" x="86" y="202">
        30 injected faults · 0 photos lost or counted twice
      </text>
    </svg>
  );
}
