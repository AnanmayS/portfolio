/*
  The koi the pond samples from. Each one is painted once, seen from above,
  into an offscreen canvas with alpha: opaque body, translucent fins, red or
  orange markings, shading across the back and a scale texture. The engine
  treats the result exactly like a cut-out photo: a bitmap plus a spine traced
  down its middle, head to tail, with how wide the fish is at each slice.

  To use real photos instead, load a PNG into an ImageData and trace its spine
  into the same shape.
*/

export type KoiPattern = "kohaku" | "sanke" | "ogon";

export type KoiSprite = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  /** The spine's y; it runs straight across the bitmap, head at the right. */
  mid: number;
  /** Per slice, head first: where along the spine it falls (0 to 1), its x, and the fish's half-width there. */
  t: Float32Array;
  sx: Float32Array;
  hw: Float32Array;
  /** Per slice, the half-width of the solid fish (body and tail, not the side fins): what another fish must not touch. */
  solid: Float32Array;
  /** The spine's length in bitmap pixels. */
  length: number;
  /** Where the rigid head ends and the bend begins. */
  shoulder: number;
};

export const SLICES = 40;

const W = 300;
const H = 150;
const MID = 75;
const HEAD = 290;
const TAIL = 10;
const SPAN = HEAD - TAIL;
const xAt = (t: number) => HEAD - t * SPAN;

const BODY_WHITE = "#f3ebdc";
const BODY_ORANGE = "#e88a3a";
const HI = "#d6432a";
const SUMI = "#34312e";

/* Half the body's width at t: a round head, broad shoulders, a long taper to the tail stalk. */
function bodyHalf(t: number) {
  if (t < 0.2) {
    const u = (0.2 - t) / 0.2;
    return Math.max(4, 31 * Math.sqrt(Math.max(0, 1 - u * u)));
  }
  if (t < 0.36) return 31 + 2 * Math.sin(((t - 0.2) / 0.16) * (Math.PI / 2));
  if (t < 0.8) return 6 + 27 * (0.5 + 0.5 * Math.cos((Math.PI * (t - 0.36)) / 0.44));
  return 6;
}

function bodyPath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  for (let t = 0; t <= 0.82; t += 0.01) ctx.lineTo(xAt(t), MID - bodyHalf(t));
  for (let t = 0.82; t >= 0; t -= 0.01) ctx.lineTo(xAt(t), MID + bodyHalf(t));
  ctx.closePath();
}

/* An organic patch: an ellipse with a wobbling edge. */
function blob(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
) {
  const n = 18;
  const rot = (rng() - 0.5) * 0.6;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (rng() - 0.5) * 0.36;
    const x = Math.cos(a) * rx * k;
    const y = Math.sin(a) * ry * k;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  ctx.beginPath();
  const mid = (i: number) => {
    const a = pts[i % n];
    const b = pts[(i + 1) % n];
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  };
  const m0 = mid(0);
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n];
    const m = mid(i);
    ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  ctx.fillStyle = color;
  ctx.fill();
}

function fins(ctx: CanvasRenderingContext2D, tint: string) {
  ctx.fillStyle = tint;
  ctx.strokeStyle = "rgba(255, 250, 240, 0.3)";
  ctx.lineWidth = 1.1;

  for (const s of [-1, 1]) {
    // Pectoral fins, broad fans behind the head.
    ctx.beginPath();
    ctx.moveTo(xAt(0.19), MID + s * 24);
    ctx.quadraticCurveTo(xAt(0.2), MID + s * 50, xAt(0.27), MID + s * 60);
    ctx.quadraticCurveTo(xAt(0.33), MID + s * 62, xAt(0.35), MID + s * 52);
    ctx.quadraticCurveTo(xAt(0.32), MID + s * 36, xAt(0.3), MID + s * 27);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    for (const [t, r] of [[0.23, 56], [0.27, 59], [0.31, 57], [0.34, 51]]) {
      ctx.moveTo(xAt(0.245), MID + s * 27);
      ctx.lineTo(xAt(t), MID + s * r);
    }
    ctx.stroke();

    // Pelvic fins, smaller, mid-body.
    ctx.beginPath();
    ctx.moveTo(xAt(0.5), MID + s * 20);
    ctx.quadraticCurveTo(xAt(0.52), MID + s * 34, xAt(0.58), MID + s * 39);
    ctx.quadraticCurveTo(xAt(0.62), MID + s * 34, xAt(0.62), MID + s * 29);
    ctx.lineTo(xAt(0.57), MID + s * 18);
    ctx.closePath();
    ctx.fill();
  }

  // The tail, two lobes and a notch, with rays.
  ctx.beginPath();
  ctx.moveTo(xAt(0.78), MID - 6);
  ctx.quadraticCurveTo(xAt(0.88), MID - 14, xAt(1), MID - 40);
  ctx.quadraticCurveTo(xAt(0.95), MID - 14, xAt(0.92), MID);
  ctx.quadraticCurveTo(xAt(0.95), MID + 14, xAt(1), MID + 40);
  ctx.quadraticCurveTo(xAt(0.88), MID + 14, xAt(0.78), MID + 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  for (let k = -4; k <= 4; k++) {
    if (!k) continue;
    ctx.moveTo(xAt(0.8), MID + k * 0.8);
    ctx.lineTo(xAt(k * k > 4 ? 0.985 : 0.95), MID + k * 8.6);
  }
  ctx.stroke();
}

function markings(ctx: CanvasRenderingContext2D, pattern: KoiPattern, rng: () => number) {
  if (pattern === "ogon") {
    blob(ctx, rng, xAt(0.07), MID, 26, 30, BODY_WHITE);
    for (let i = 0; i < 2; i++) {
      blob(ctx, rng, xAt(0.35 + i * 0.2), MID + (rng() - 0.5) * 10, 26, 8, "#f2ab62");
    }
    return;
  }

  if (rng() < 0.8) blob(ctx, rng, xAt(0.1), MID + (rng() - 0.5) * 8, 16 + rng() * 6, 17 + rng() * 6, HI);
  const n = pattern === "sanke" ? 2 : 2 + Math.floor(rng() * 2);
  for (let i = 0; i < n; i++) {
    const t = 0.27 + (i + rng() * 0.6) * (0.45 / n);
    const side = rng() < 0.5 ? 0 : (rng() < 0.5 ? -1 : 1) * 11;
    blob(ctx, rng, xAt(t), MID + side, SPAN * (0.06 + rng() * 0.05), 20 + rng() * 16, HI);
  }
  if (pattern === "sanke") {
    const spots = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < spots; i++) {
      const t = 0.25 + rng() * 0.45;
      blob(ctx, rng, xAt(t), MID + (rng() - 0.5) * 34, 4 + rng() * 5, 3 + rng() * 4, SUMI);
    }
  }
}

function shade(ctx: CanvasRenderingContext2D) {
  // Round the back: darker toward both flanks, a little light down the ridge.
  const across = ctx.createLinearGradient(0, MID - 34, 0, MID + 34);
  across.addColorStop(0, "rgba(0, 0, 0, 0.24)");
  across.addColorStop(0.3, "rgba(0, 0, 0, 0.04)");
  across.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
  across.addColorStop(0.7, "rgba(0, 0, 0, 0.04)");
  across.addColorStop(1, "rgba(0, 0, 0, 0.24)");
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, W, H);

  const along = ctx.createLinearGradient(xAt(0.5), 0, xAt(0.82), 0);
  along.addColorStop(0, "rgba(0, 0, 0, 0)");
  along.addColorStop(1, "rgba(0, 0, 0, 0.16)");
  ctx.fillStyle = along;
  ctx.fillRect(0, 0, W, H);

  // Scales: rows of small arcs opening toward the tail.
  ctx.lineWidth = 1;
  let row = 0;
  for (let y = MID - 34; y <= MID + 34; y += 4.5, row++) {
    ctx.beginPath();
    for (let x = xAt(0.8) + (row % 2) * 3; x < xAt(0.18); x += 6) {
      ctx.moveTo(x + 3.6 * Math.cos(-Math.PI / 2), y + 3.6 * Math.sin(-Math.PI / 2));
      ctx.arc(x, y, 3.6, -Math.PI / 2, Math.PI / 2);
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.stroke();
  }

  // The dorsal ridge.
  ctx.beginPath();
  ctx.moveTo(xAt(0.3), MID);
  ctx.lineTo(xAt(0.68), MID);
  ctx.strokeStyle = "rgba(60, 40, 30, 0.26)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

export function makeSprite(pattern: KoiPattern, rng: () => number): KoiSprite {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  fins(ctx, pattern === "ogon" ? "rgba(236, 160, 92, 0.5)" : "rgba(232, 222, 206, 0.52)");

  bodyPath(ctx);
  ctx.fillStyle = pattern === "ogon" ? BODY_ORANGE : BODY_WHITE;
  ctx.fill();

  ctx.save();
  bodyPath(ctx);
  ctx.clip();
  markings(ctx, pattern, rng);
  shade(ctx);
  ctx.restore();

  ctx.fillStyle = "#1b1916";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(xAt(0.075), MID + s * 14, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  const data = ctx.getImageData(0, 0, W, H).data;

  // Trace the spine: how far the bitmap's alpha reaches from it at each slice.
  const t = new Float32Array(SLICES);
  const sx = new Float32Array(SLICES);
  const hw = new Float32Array(SLICES);
  const solid = new Float32Array(SLICES);
  for (let i = 0; i < SLICES; i++) {
    t[i] = i / (SLICES - 1);
    sx[i] = xAt(t[i]);
    let reach = 0;
    const x0 = Math.round(sx[i]);
    for (let x = x0 - 3; x <= x0 + 3; x++) {
      if (x < 0 || x >= W) continue;
      for (let y = 0; y < H; y++) {
        if (data[(y * W + x) * 4 + 3] > 8) reach = Math.max(reach, Math.abs(y - MID));
      }
    }
    hw[i] = Math.max(5, reach + 2);
    solid[i] = t[i] < 0.8 ? bodyHalf(t[i]) + 1 : 6 + ((t[i] - 0.8) / 0.2) * 30;
  }

  return { data, width: W, height: H, mid: MID, t, sx, hw, solid, length: SPAN, shoulder: 0.22 };
}
