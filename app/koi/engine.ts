/*
  Three koi swimming behind the front page, drawn in monospace characters.

  Each frame, every fish's sprite is bent along its body (a ribbon mesh of
  triangles down a traced spine), rasterised into a 2x-supersampled grid,
  averaged down to one character cell and hard-cut on coverage. Cells then
  get a glyph from a luminance ramp, or a stroke where there's a strong
  internal edge, and one of a few colours. Faint broken wake rings go down
  first, fish on top.

  Motion: the head is rigid, and the body behind the shoulders follows the
  path the shoulders actually swam, so the bend travels to the tail. Steering
  is car-like (curvature, never pivoting). A small beam search picks the
  steering every 0.3 s. The fish stay out of the text column, and on phones
  keep to the open water below it.
*/

import { makeSprite, SLICES, type KoiPattern, type KoiSprite } from "./sprite";

const RAMP = " .`,:;~-+=*#%$@";
const STEP = 1 / 60;
const FRAME_MS = 1000 / 30;
const PLAN_EVERY = 0.3;
const BEAM = 16;
const DEPTH = 7;
const PLAN_DT = 0.45;
const CHOICES = [-1, -0.5, 0, 0.5, 1];
const MIN_ISLAND = 24;
/* The closest a fish may swim to another, as a fraction of its length. */
const SAFE = 0.04;
const EDGE = 1.5;
/* Cells are about this much taller than wide. */
const Y_SCALE = 1.9;
const PHONE_BELOW = 880;

const WHITE = 0;
const CREAM = 1;
const ORANGE = 2;
const RED = 3;
const FIN = 4;
const FIN_DIM = 5;
const WAKE = 6;
const WAKE_FAINT = 7;
const PALETTE = ["#f4eee4", "#d9cbb1", "#e2772f", "#c4432c", "#8a8681", "#56534f", "#3b3b3b", "#282828"];
const BODY_RGB = [
  [244, 238, 228],
  [217, 203, 177],
  [226, 119, 47],
  [196, 67, 44],
];
const PATTERNS: KoiPattern[] = ["kohaku", "sanke", "ogon"];

type Rect = { x0: number; y0: number; x1: number; y1: number };

type Layout = {
  w: number;
  h: number;
  dpr: number;
  font: string;
  cw: number;
  ch: number;
  cols: number;
  rows: number;
  /** A fish's length in px; turns can't be tighter than 0.4 of it. */
  L: number;
  bounds: Rect;
  avoid: Rect;
  /** The text itself, in cells; nothing is drawn there. */
  clip: Rect;
};

type Ring = { x: number; y: number; age: number; life: number; r0: number; r1: number; p: number[] };

type Fish = {
  rng: () => number;
  sprite: KoiSprite;
  x: number;
  y: number;
  th: number;
  v: number;
  k: number;
  kTarget: number;
  /** Where the shoulders have been, oldest first. */
  tx: number[];
  ty: number[];
  bursting: boolean;
  burst: number;
  modeLeft: number;
  phase: number;
  /** Decaying memory of recent turning, signed. */
  memory: number;
  gx: number;
  gy: number;
  goalLeft: number;
  planLeft: number;
  ringLeft: number;
  rings: Ring[];
  /** Where each slice of the body is, refreshed every step for the others to steer around. */
  bx: Float32Array;
  by: Float32Array;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* Scratch arrays, grown as needed. */
class Scratch {
  f = new Float32Array(0);
  u = new Uint8Array(0);
  i = new Int32Array(0);
}
const grow = (s: Scratch, n: number) => {
  if (s.f.length < n) {
    s.f = new Float32Array(n * 2);
    s.u = new Uint8Array(n * 2);
    s.i = new Int32Array(n * 2);
  }
  return s;
};

export function startKoi(host: HTMLElement, avoidEl: HTMLElement): () => void {
  const canvas = host.querySelector("canvas");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return () => {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  let lay: Layout | null = null;
  let fish: Fish[] = [];
  let gch = new Uint16Array(0);
  let gcol = new Uint8Array(0);
  const buckets: number[][] = PALETTE.map(() => []);

  // Per-fish raster scratch.
  const subA = new Scratch(), subR = new Scratch(), subG = new Scratch(), subB = new Scratch();
  const cA = new Scratch(), cR = new Scratch(), cG = new Scratch(), cB = new Scratch();
  const cLum = new Scratch(), cD = new Scratch(), cOut = new Scratch();
  const mask = new Scratch(), tmp = new Scratch(), stack = new Scratch(), label = new Scratch();
  const px = new Float32Array(SLICES), py = new Float32Array(SLICES);
  const lx = new Float32Array(SLICES), ly = new Float32Array(SLICES);
  const rx = new Float32Array(SLICES), ry = new Float32Array(SLICES);

  /* ---------- layout ---------- */

  function measure(): Layout | null {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return null;
    const phone = w < PHONE_BELOW;
    const font = `${phone ? 7 : 9}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
    ctx!.font = font;
    const cw = ctx!.measureText("M").width;
    const ch = cw * Y_SCALE;
    const hr = host.getBoundingClientRect();
    const tr = avoidEl.getBoundingClientRect();
    const text = { x0: tr.left - hr.left, y0: tr.top - hr.top, x1: tr.right - hr.left, y1: tr.bottom - hr.top };
    const side = Math.min(text.x0, w - text.x1);
    const L = phone ? clamp(w * 0.4, 130, 190) : clamp(side * 0.6, 150, 300);
    const pad = 0.3 * L;
    const avoid = phone
      ? { x0: -1e5, y0: -1e5, x1: 1e5, y1: text.y1 + pad }
      : { x0: text.x0 - pad, y0: text.y0 - pad, x1: text.x1 + pad, y1: text.y1 + pad };
    const m = 0.18 * L;
    return {
      w,
      h,
      dpr: Math.min(2, window.devicePixelRatio || 1),
      font,
      cw,
      ch,
      cols: Math.ceil(w / cw),
      rows: Math.ceil(h / ch),
      L,
      bounds: { x0: m, y0: m, x1: w - m, y1: h - m },
      avoid,
      clip: {
        x0: Math.floor((text.x0 - 6) / cw),
        y0: Math.floor((text.y0 - 6) / ch),
        x1: Math.ceil((text.x1 + 6) / cw),
        y1: Math.ceil((text.y1 + 6) / ch),
      },
    };
  }

  function relayout() {
    if (disposed) return;
    const prev = lay;
    lay = measure();
    if (!lay) return;
    canvas!.width = Math.round(lay.w * lay.dpr);
    canvas!.height = Math.round(lay.h * lay.dpr);
    gch = new Uint16Array(lay.cols * lay.rows);
    gcol = new Uint8Array(lay.cols * lay.rows);

    if (!fish.length) {
      for (let i = 0; i < 3; i++) fish.push(spawn(PATTERNS[i]));
    } else {
      for (const f of fish) {
        if (prev && prev.L !== lay.L) f.v *= lay.L / prev.L;
        if (zone(f.x, f.y) > 0) {
          const p = freePoint(f.rng, f);
          f.x = p[0];
          f.y = p[1];
        }
        resetTrail(f);
        pickGoal(f);
      }
    }
    sync();
    if (reduced.matches && active()) render();
  }

  /* ---------- the world ---------- */

  /* How bad it is for a shoulder to be at (x, y): outside the pond or near the text. */
  function zone(x: number, y: number) {
    const { bounds: b, avoid: a, L } = lay!;
    let c = 0;
    const ox = Math.max(b.x0 - x, 0, x - b.x1);
    const oy = Math.max(b.y0 - y, 0, y - b.y1);
    if (ox || oy) c += 3 + (8 * Math.hypot(ox, oy)) / L;
    const depth = Math.min(x - a.x0, a.x1 - x, y - a.y0, a.y1 - y);
    if (depth > 0) c += 6 + (12 * depth) / L;
    return c;
  }

  function freePoint(rng: () => number, self?: Fish): [number, number] {
    const { bounds: b, L } = lay!;
    let best: [number, number] = [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
    let bestScore = -Infinity;
    for (let i = 0; i < 80; i++) {
      const x = b.x0 + rng() * (b.x1 - b.x0);
      const y = b.y0 + rng() * (b.y1 - b.y0);
      let score = -zone(x, y) * 10;
      for (const o of fish) if (o !== self) score += Math.min(1, Math.hypot(o.x - x, o.y - y) / L);
      score += rng() * 0.3;
      if (score > bestScore) {
        bestScore = score;
        best = [x, y];
      }
    }
    return best;
  }

  function pickGoal(f: Fish) {
    const p = freePoint(f.rng, f);
    f.gx = p[0];
    f.gy = p[1];
    f.goalLeft = 9 + f.rng() * 12;
  }

  function resetTrail(f: Fish) {
    const back = lay!.L * (1 - f.sprite.shoulder) + 20;
    f.tx = [];
    f.ty = [];
    for (let d = back; d >= 0; d -= 2) {
      f.tx.push(f.x - Math.cos(f.th) * d);
      f.ty.push(f.y - Math.sin(f.th) * d);
    }
  }

  function spawn(pattern: KoiPattern): Fish {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const rng = mulberry32(seed);
    const sprite = makeSprite(pattern, rng);
    const [x, y] = freePoint(rng);
    const f: Fish = {
      rng,
      sprite,
      x,
      y,
      th: rng() * Math.PI * 2,
      v: lay!.L * 0.1,
      k: 0,
      kTarget: 0,
      tx: [],
      ty: [],
      bursting: false,
      burst: 0,
      modeLeft: 1 + rng() * 4,
      phase: rng() * Math.PI * 2,
      memory: 0,
      gx: x,
      gy: y,
      goalLeft: 0,
      planLeft: rng() * PLAN_EVERY,
      ringLeft: rng() * 2,
      rings: [],
      bx: new Float32Array(SLICES),
      by: new Float32Array(SLICES),
    };
    fish.push(f);
    pickGoal(f);
    fish.pop();
    // Start facing open water, toward the first goal, so nobody begins nose-first into a wall.
    f.th = Math.atan2(f.gy - f.y, f.gx - f.x);
    resetTrail(f);
    return f;
  }

  /* A point on the shoulders' path, d px behind them. */
  function trailAt(f: Fish, d: number): [number, number] {
    let qx = f.x, qy = f.y, acc = 0;
    for (let n = f.tx.length - 1; n >= 0; n--) {
      const dx = f.tx[n] - qx, dy = f.ty[n] - qy;
      const dl = Math.hypot(dx, dy);
      if (!dl) continue;
      if (acc + dl >= d) {
        const u = (d - acc) / dl;
        return [qx + dx * u, qy + dy * u];
      }
      acc += dl;
      qx = f.tx[n];
      qy = f.ty[n];
    }
    return [qx - Math.cos(f.th) * (d - acc), qy - Math.sin(f.th) * (d - acc)];
  }

  function plan(f: Fish) {
    const L = lay!.L;
    const kmax = 1 / (0.4 * L);
    // Plan at the speed the fish could be doing soon, so a burst never outruns the plan.
    const vp = Math.max(f.v, f.bursting ? L * 0.4 : L * 0.16);
    const sub = 3;
    const h = PLAN_DT / sub;
    const others = fish.filter((o) => o !== f).map((o) => [o.x, o.y, Math.cos(o.th) * o.v, Math.sin(o.th) * o.v]);
    // The others' bodies as they lie now: bodies only move along their own paths, so this holds for a while.
    const bodies: number[] = [];
    for (const o of fish) if (o !== f) for (let j = 0; j < SLICES; j += 3) bodies.push(o.bx[j], o.by[j]);
    type Cand = { x: number; y: number; th: number; cost: number; first: number; last: number };
    let beam: Cand[] = [{ x: f.x, y: f.y, th: f.th, cost: 0, first: 2, last: f.kTarget / kmax }];

    for (let s = 0; s < DEPTH; s++) {
      const next: Cand[] = [];
      const tau = (s + 1) * PLAN_DT;
      for (const c of beam) {
        for (let ci = 0; ci < CHOICES.length; ci++) {
          const u = CHOICES[ci];
          const k = u * kmax;
          let { x, y, th, cost } = c;
          for (let q = 0; q < sub; q++) {
            th += vp * k * h;
            x += Math.cos(th) * vp * h;
            y += Math.sin(th) * vp * h;
            cost += zone(x, y) / sub;
          }
          for (const o of others) {
            const d = Math.hypot(o[0] + o[2] * tau - x, o[1] + o[3] * tau - y);
            if (d < 0.9 * L) cost += 8 * (1 - d / (0.9 * L)) ** 2;
          }
          const hx = x + Math.cos(th) * L * 0.22, hy = y + Math.sin(th) * L * 0.22;
          for (let b = 0; b < bodies.length; b += 2) {
            const d = Math.min(Math.hypot(bodies[b] - x, bodies[b + 1] - y), Math.hypot(bodies[b] - hx, bodies[b + 1] - hy));
            if (d < 0.5 * L) cost += 20 * (1 - d / (0.5 * L)) ** 2;
          }
          cost += 0.5 * room(x, y, th);
          cost += 0.12 * Math.abs(u - c.last);
          if (u) cost += 0.35 * Math.max(0, f.memory * u);
          cost += f.rng() * 0.02;
          next.push({ x, y, th, cost, first: s === 0 ? ci : c.first, last: u });
        }
      }
      next.sort((a, b) => a.cost - b.cost);
      beam = next.slice(0, BEAM);
    }

    let best = beam[0];
    let bestCost = Infinity;
    for (const c of beam) {
      const total = c.cost + (0.7 * Math.hypot(c.x - f.gx, c.y - f.gy)) / L + room(c.x, c.y, c.th);
      if (total < bestCost) {
        bestCost = total;
        best = c;
      }
    }
    f.kTarget = CHOICES[best.first] * kmax;
    // Even the best route is tight: stop bursting and glide through it.
    if (f.bursting && bestCost > 1) {
      f.bursting = false;
      f.modeLeft = 2 + 3 * f.rng();
    }
  }

  /* Whether the fish could still turn back from here: are its tightest turning circles clear? */
  function room(x: number, y: number, th: number) {
    const R = 0.42 * lay!.L;
    let blocked = 0;
    for (const side of [-1, 1]) {
      const cx = x - Math.sin(th) * R * side;
      const cy = y + Math.cos(th) * R * side;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        if (zone(cx + Math.cos(a) * R, cy + Math.sin(a) * R) > 0) {
          blocked++;
          break;
        }
      }
    }
    return blocked === 2 ? 6 : blocked * 0.6;
  }

  function stepFish(f: Fish, dt: number) {
    const L = lay!.L;
    const kmax = 1 / (0.4 * L);

    f.modeLeft -= dt;
    if (f.modeLeft <= 0) {
      // Burst only with room to turn ahead; otherwise keep gliding a little longer.
      f.bursting = !f.bursting && room(f.x + Math.cos(f.th) * L * 0.3, f.y + Math.sin(f.th) * L * 0.3, f.th) < 6;
      f.modeLeft = f.bursting ? 0.5 + 0.7 * f.rng() : 2.5 + 5 * f.rng();
    }
    f.burst += ((f.bursting ? 1 : 0) - f.burst) * Math.min(1, dt * (f.bursting ? 5 : 1.2));
    const vTarget = L * (0.09 + 0.33 * f.burst);
    f.v += (vTarget - f.v) * Math.min(1, dt * (f.bursting ? 4 : 1.5));

    // Another fish's body close ahead: ease off and steer away from it.
    const near = headGap(f, f.x, f.y, f.th, true);
    if (near.gap < 0.5 * L) {
      const ease = clamp(near.gap / (0.5 * L), 0, 1);
      f.v = Math.min(f.v, L * (0.02 + 0.1 * ease));
      f.bursting = false;
      f.kTarget = -near.side * kmax;
    }

    const rate = kmax * 1.5 * dt;
    f.k += clamp(f.kTarget - f.k, -rate, rate);
    const th1 = f.th + f.v * f.k * dt;
    const x1 = f.x + Math.cos(th1) * f.v * dt;
    const y1 = f.y + Math.sin(th1) * f.v * dt;
    const before = headGap(f, f.x, f.y, f.th, false).gap;
    const after = headGap(f, x1, y1, th1, false);
    if (after.gap < SAFE * L && after.gap < before) {
      // Swimming on would touch another fish. Hold still and turn the head away instead;
      // the only time a koi turns without moving forward.
      f.v = 0;
      const thTurn = f.th - after.side * 0.6 * dt;
      if (headGap(f, f.x, f.y, thTurn, false).gap >= Math.min(before, SAFE * L)) f.th = thTurn;
    } else {
      f.th = th1;
      f.x = x1;
      f.y = y1;
    }
    f.phase += dt * Math.PI * 2 * (0.6 + 2.2 * f.burst);
    f.memory = f.memory * Math.exp(-dt / 7) + (f.k / kmax) * ((f.v * dt) / L);

    const n = f.tx.length - 1;
    if (n < 0 || Math.hypot(f.x - f.tx[n], f.y - f.ty[n]) >= 1.5) {
      f.tx.push(f.x);
      f.ty.push(f.y);
      const keep = L * (1 - f.sprite.shoulder) + 30;
      let acc = 0;
      let cut = 0;
      for (let i = f.tx.length - 1; i > 0; i--) {
        acc += Math.hypot(f.tx[i] - f.tx[i - 1], f.ty[i] - f.ty[i - 1]);
        if (acc > keep) {
          cut = i - 1;
          break;
        }
      }
      if (cut > 0) {
        f.tx.splice(0, cut);
        f.ty.splice(0, cut);
      }
    }

    f.goalLeft -= dt;
    if (f.goalLeft <= 0 || Math.hypot(f.gx - f.x, f.gy - f.y) < 0.6 * L) pickGoal(f);

    for (const r of f.rings) r.age += dt;
    f.rings = f.rings.filter((r) => r.age < r.life);
    f.ringLeft -= dt * (1 + 2.5 * f.burst);
    if (f.ringLeft <= 0) {
      const [x, y] = trailAt(f, L * 0.25);
      f.rings.push({
        x,
        y,
        age: 0,
        life: 3.5 + f.rng() * 1.5,
        r0: L * 0.08,
        r1: L * (0.26 + f.rng() * 0.14),
        p: [0, 1, 2, 3, 4].map(() => f.rng() * Math.PI * 2),
      });
      f.ringLeft = 1.4 + f.rng() * 1.6;
    }

    f.planLeft -= dt;
    if (f.planLeft <= 0) {
      plan(f);
      f.planLeft += PLAN_EVERY;
    }
  }

  /* The smallest gap between this fish's head, placed at (x, y, th), and any other fish's body;
     with `ahead`, only bodies in front of the head count. `side` is which side the nearest point is on. */
  function headGap(f: Fish, x: number, y: number, th: number, ahead: boolean) {
    const L = lay!.L, sp = f.sprite, tsh = sp.shoulder;
    const c = Math.cos(th), s = Math.sin(th);
    let gap = Infinity, side = 1;
    for (const o of fish) {
      if (o === f) continue;
      const os = L / o.sprite.length;
      for (let i = 0; sp.t[i] <= tsh; i++) {
        const d = (tsh - sp.t[i]) * L;
        const hx = x + c * d, hy = y + s * d;
        const wf = sp.solid[i] * (L / sp.length);
        for (let j = 0; j < SLICES; j++) {
          const dx = o.bx[j] - hx, dy = o.by[j] - hy;
          if (ahead && dx * c + dy * s < 0) continue;
          const g = Math.hypot(dx, dy) - wf - o.sprite.solid[j] * os;
          if (g < gap) {
            gap = g;
            side = c * dy - s * dx >= 0 ? 1 : -1;
          }
        }
      }
    }
    return { gap, side };
  }

  function refreshBodies() {
    for (const f of fish) {
      body(f);
      f.bx.set(px);
      f.by.set(py);
    }
  }

  function world(dt: number) {
    refreshBodies();
    for (const f of fish) stepFish(f, dt);
  }

  /* ---------- drawing ---------- */

  function put(c: number, r: number, code: number, color: number) {
    const { cols, rows, clip } = lay!;
    if (c < 0 || r < 0 || c >= cols || r >= rows) return;
    if (c >= clip.x0 && c <= clip.x1 && r >= clip.y0 && r <= clip.y1) return;
    const k = r * cols + c;
    gch[k] = code;
    gcol[k] = color;
  }

  function paintRing(ring: Ring) {
    const { cw, ch } = lay!;
    const u = ring.age / ring.life;
    const ry = ring.r0 + (ring.r1 - ring.r0) * (1 - (1 - u) * (1 - u));
    const rxx = ry * Y_SCALE;
    const [p1, p2, p3, p4, p5] = ring.p;
    const broken = -0.35 + 0.95 * u;
    const steps = Math.ceil((Math.PI * (rxx + ry)) / (cw * 0.7));
    const color = u < 0.5 ? WAKE : WAKE_FAINT;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const gap = Math.sin(3 * a + p4) * 0.6 + Math.sin(7 * a + p5) * 0.4;
      if (gap < broken) continue;
      const wob = 1 + 0.1 * Math.sin(3 * a + p1) + 0.06 * Math.sin(5 * a + p2) + 0.04 * Math.sin(9 * a + p3);
      const x = ring.x + Math.cos(a) * rxx * wob;
      const y = ring.y + Math.sin(a) * ry * wob;
      let g: string;
      if (u > 0.75) g = gap > 0.5 ? "`" : ".";
      else {
        const dx = (-Math.sin(a) * rxx) / cw;
        const dy = (Math.cos(a) * ry) / ch;
        let deg = (Math.atan2(-dy, dx) * 180) / Math.PI;
        if (deg < 0) deg += 180;
        if (deg < 25 || deg >= 155) g = gap > 0.3 ? "~" : "-";
        else if (deg < 65) g = "/";
        else if (deg < 115) g = Math.cos(a) < 0 ? "(" : ")";
        else g = "\\";
      }
      put(Math.floor(x / cw), Math.floor(y / ch), g.charCodeAt(0), color);
    }
  }

  /* Where each spine slice is this frame. */
  function body(f: Fish) {
    const L = lay!.L, sp = f.sprite, tsh = sp.shoulder;
    const c = Math.cos(f.th), s = Math.sin(f.th);
    const amp = L * (0.03 + 0.05 * f.burst);
    let qx = f.x, qy = f.y, acc = 0, n = f.tx.length - 1;
    let dirx = -c, diry = -s;
    for (let i = 0; i < SLICES; i++) {
      const t = sp.t[i];
      if (t <= tsh) {
        const d = (tsh - t) * L;
        px[i] = f.x + c * d;
        py[i] = f.y + s * d;
        continue;
      }
      const d = (t - tsh) * L;
      let bx = 0, by = 0, found = false;
      while (n >= 0) {
        const dx = f.tx[n] - qx, dy = f.ty[n] - qy;
        const dl = Math.hypot(dx, dy);
        if (dl < 1e-6) {
          n--;
          continue;
        }
        if (acc + dl >= d) {
          const u = (d - acc) / dl;
          bx = qx + dx * u;
          by = qy + dy * u;
          dirx = dx / dl;
          diry = dy / dl;
          found = true;
          break;
        }
        acc += dl;
        qx = f.tx[n];
        qy = f.ty[n];
        n--;
      }
      if (!found) {
        bx = qx + dirx * (d - acc);
        by = qy + diry * (d - acc);
      }
      const along = (t - tsh) / (1 - tsh);
      const off = amp * along ** 1.6 * Math.sin(f.phase - (Math.PI * 2 * along) / 0.85);
      px[i] = bx - diry * off;
      py[i] = by + dirx * off;
    }
  }

  function paintFish(f: Fish) {
    const { cw, ch, cols, rows, L } = lay!;
    const sp = f.sprite;
    body(f);

    // The ribbon: each slice's left and right edge, sprite half-width scaled to the fish.
    const scale = L / sp.length;
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (let i = 0; i < SLICES; i++) {
      const a = Math.max(0, i - 1), b = Math.min(SLICES - 1, i + 1);
      let tx = px[a] - px[b], ty = py[a] - py[b];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const w = sp.hw[i] * scale;
      lx[i] = px[i] + ty * w;
      ly[i] = py[i] - tx * w;
      rx[i] = px[i] - ty * w;
      ry[i] = py[i] + tx * w;
      minx = Math.min(minx, lx[i], rx[i]);
      maxx = Math.max(maxx, lx[i], rx[i]);
      miny = Math.min(miny, ly[i], ry[i]);
      maxy = Math.max(maxy, ly[i], ry[i]);
    }
    const c0 = Math.max(0, Math.floor(minx / cw)), c1 = Math.min(cols - 1, Math.floor(maxx / cw));
    const r0 = Math.max(0, Math.floor(miny / ch)), r1 = Math.min(rows - 1, Math.floor(maxy / ch));
    if (c0 > c1 || r0 > r1) return;
    const CW = c1 - c0 + 1, CH = r1 - r0 + 1, SW = CW * 2, SH = CH * 2;
    const sa = grow(subA, SW * SH).f, sr = grow(subR, SW * SH).f, sg = grow(subG, SW * SH).f, sb = grow(subB, SW * SH).f;
    sa.fill(0, 0, SW * SH);

    // Rasterise the mesh into the supersampled grid, mapping each sample back into the sprite.
    const data = sp.data, SWD = sp.width, SHD = sp.height;
    const hx = cw / 2, hy = ch / 2, ox = c0 * cw, oy = r0 * ch;
    const tri = (
      ax: number, ay: number, bx: number, by: number, cx: number, cy: number,
      sax: number, say: number, sbx: number, sby: number, scx: number, scy: number,
    ) => {
      const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(den) < 1e-9) return;
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx, cx) - ox) / hx - 0.5));
      const i1 = Math.min(SW - 1, Math.ceil((Math.max(ax, bx, cx) - ox) / hx - 0.5));
      const j0 = Math.max(0, Math.floor((Math.min(ay, by, cy) - oy) / hy - 0.5));
      const j1 = Math.min(SH - 1, Math.ceil((Math.max(ay, by, cy) - oy) / hy - 0.5));
      for (let j = j0; j <= j1; j++) {
        const sy0 = oy + (j + 0.5) * hy;
        for (let i = i0; i <= i1; i++) {
          const sx0 = ox + (i + 0.5) * hx;
          const w1 = ((by - cy) * (sx0 - cx) + (cx - bx) * (sy0 - cy)) / den;
          if (w1 < -1e-6) continue;
          const w2 = ((cy - ay) * (sx0 - cx) + (ax - cx) * (sy0 - cy)) / den;
          if (w2 < -1e-6) continue;
          const w3 = 1 - w1 - w2;
          if (w3 < -1e-6) continue;
          const ix = (w1 * sax + w2 * sbx + w3 * scx) | 0;
          const iy = (w1 * say + w2 * sby + w3 * scy) | 0;
          if (ix < 0 || iy < 0 || ix >= SWD || iy >= SHD) continue;
          const k = (iy * SWD + ix) * 4;
          const a = data[k + 3];
          if (!a) continue;
          const q = j * SW + i;
          const af = a / 255;
          sa[q] = af;
          sr[q] = data[k] * af;
          sg[q] = data[k + 1] * af;
          sb[q] = data[k + 2] * af;
        }
      }
    };
    const mid = sp.mid;
    for (let i = 0; i < SLICES - 1; i++) {
      const sxa = sp.sx[i], sxb = sp.sx[i + 1];
      const la = mid - sp.hw[i], ra = mid + sp.hw[i], lb = mid - sp.hw[i + 1], rb = mid + sp.hw[i + 1];
      tri(lx[i], ly[i], rx[i], ry[i], lx[i + 1], ly[i + 1], sxa, la, sxa, ra, sxb, lb);
      tri(rx[i], ry[i], rx[i + 1], ry[i + 1], lx[i + 1], ly[i + 1], sxa, ra, sxb, rb, sxb, lb);
    }

    // Down to cells: hard cut on coverage (two of four samples), colour and alpha from what's covered.
    const N = CW * CH;
    const m = grow(mask, N).u, ca = grow(cA, N).f, cr = grow(cR, N).f, cg = grow(cG, N).f, cb = grow(cB, N).f;
    for (let r = 0; r < CH; r++) {
      for (let c = 0; c < CW; c++) {
        const k = r * CW + c;
        const q = r * 2 * SW + c * 2;
        let cnt = 0, A = 0, R = 0, G = 0, B = 0;
        for (const s of [q, q + 1, q + SW, q + SW + 1]) {
          const a = sa[s];
          if (a > 0.05) {
            cnt++;
            A += a;
            R += sr[s];
            G += sg[s];
            B += sb[s];
          }
        }
        m[k] = cnt >= 2 ? 1 : 0;
        if (cnt) {
          ca[k] = A / cnt;
          cr[k] = R / A;
          cg[k] = G / A;
          cb[k] = B / A;
        }
      }
    }

    cleanup(m, ca, cr, cg, cb, CW, CH);

    // Tone: luminance, lighter where the material is translucent, then local contrast.
    const lum = grow(cLum, N).f, d = grow(cD, N).f, out = grow(cOut, N).f;
    for (let k = 0; k < N; k++) {
      if (!m[k]) continue;
      lum[k] = (0.2126 * cr[k] + 0.7152 * cg[k] + 0.0722 * cb[k]) / 255;
      d[k] = lum[k] ** 0.7 * ca[k];
    }
    for (let r = 0; r < CH; r++) {
      for (let c = 0; c < CW; c++) {
        const k = r * CW + c;
        if (!m[k]) continue;
        let sum = 0, cnt = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= CH || cc >= CW) continue;
            const kk = rr * CW + cc;
            if (m[kk]) {
              sum += d[kk];
              cnt++;
            }
          }
        }
        const mean = sum / cnt;
        out[k] = clamp(mean + 1.5 * (d[k] - mean), 0.03, 1);
      }
    }

    for (let r = 0; r < CH; r++) {
      for (let c = 0; c < CW; c++) {
        const k = r * CW + c;
        if (!m[k]) continue;
        let glyph = RAMP.charCodeAt(1 + Math.min(RAMP.length - 2, Math.floor(out[k] * (RAMP.length - 1))));

        // A strong edge inside the fish becomes a stroke along it.
        if (r > 0 && c > 0 && r < CH - 1 && c < CW - 1) {
          const at = (dr: number, dc: number) => (r + dr) * CW + c + dc;
          let interior = true;
          for (let dr = -1; dr <= 1 && interior; dr++) for (let dc = -1; dc <= 1; dc++) if (!m[at(dr, dc)]) interior = false;
          if (interior) {
            const l = (dr: number, dc: number) => lum[at(dr, dc)];
            const gx = l(-1, 1) + 2 * l(0, 1) + l(1, 1) - l(-1, -1) - 2 * l(0, -1) - l(1, -1);
            const gy = (l(1, -1) + 2 * l(1, 0) + l(1, 1) - l(-1, -1) - 2 * l(-1, 0) - l(-1, 1)) * Y_SCALE;
            if (Math.hypot(gx, gy) > EDGE) {
              let deg = (Math.atan2(-gx, -gy) * 180) / Math.PI;
              if (deg < 0) deg += 180;
              glyph = (deg < 22.5 || deg >= 157.5 ? "-" : deg < 67.5 ? "/" : deg < 112.5 ? "|" : "\\").charCodeAt(0);
            }
          }
        }

        let color: number;
        if (ca[k] < 0.72) color = lum[k] > 0.55 ? FIN : FIN_DIM;
        else if (lum[k] < 0.3) color = FIN_DIM;
        else {
          color = WHITE;
          let bestD = Infinity;
          for (let p = 0; p < BODY_RGB.length; p++) {
            const [R, G, B] = BODY_RGB[p];
            const dd = (cr[k] - R) ** 2 + (cg[k] - G) ** 2 + (cb[k] - B) ** 2;
            if (dd < bestD) {
              bestD = dd;
              color = p === 0 ? WHITE : p === 1 ? CREAM : p === 2 ? ORANGE : RED;
            }
          }
        }
        put(c0 + c, r0 + r, glyph, color);
      }
    }
  }

  /* Fill one-cell gaps, drop specks, one-row hairlines and small islands. */
  function cleanup(m: Uint8Array, ca: Float32Array, cr: Float32Array, cg: Float32Array, cb: Float32Array, CW: number, CH: number) {
    const N = CW * CH;
    const t = grow(tmp, N).u;

    t.set(m.subarray(0, N));
    for (let r = 0; r < CH; r++) {
      for (let c = 0; c < CW; c++) {
        const k = r * CW + c;
        if (t[k]) continue;
        let a = -1, b = -1;
        if (c > 0 && c < CW - 1 && t[k - 1] && t[k + 1]) {
          a = k - 1;
          b = k + 1;
        } else if (r > 0 && r < CH - 1 && t[k - CW] && t[k + CW]) {
          a = k - CW;
          b = k + CW;
        }
        if (a < 0) continue;
        m[k] = 1;
        ca[k] = (ca[a] + ca[b]) / 2;
        cr[k] = (cr[a] + cr[b]) / 2;
        cg[k] = (cg[a] + cg[b]) / 2;
        cb[k] = (cb[a] + cb[b]) / 2;
      }
    }

    t.set(m.subarray(0, N));
    for (let r = 0; r < CH; r++) {
      for (let c = 0; c < CW; c++) {
        const k = r * CW + c;
        if (!t[k]) continue;
        let near = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const rr = r + dr, cc = c + dc;
            if (rr >= 0 && cc >= 0 && rr < CH && cc < CW && t[rr * CW + cc]) near++;
          }
        }
        const hairline = (r === 0 || !t[k - CW]) && (r === CH - 1 || !t[k + CW]);
        if (near <= 1 || hairline) m[k] = 0;
      }
    }

    const lab = grow(label, N).i, st = grow(stack, N).i;
    lab.fill(0, 0, N);
    let id = 0;
    for (let s = 0; s < N; s++) {
      if (!m[s] || lab[s]) continue;
      id++;
      let top = 0, size = 0;
      st[top++] = s;
      lab[s] = id;
      const members: number[] = [];
      while (top) {
        const k = st[--top];
        members.push(k);
        size++;
        const r = (k / CW) | 0, c = k - r * CW;
        if (c > 0 && m[k - 1] && !lab[k - 1]) { lab[k - 1] = id; st[top++] = k - 1; }
        if (c < CW - 1 && m[k + 1] && !lab[k + 1]) { lab[k + 1] = id; st[top++] = k + 1; }
        if (r > 0 && m[k - CW] && !lab[k - CW]) { lab[k - CW] = id; st[top++] = k - CW; }
        if (r < CH - 1 && m[k + CW] && !lab[k + CW]) { lab[k + CW] = id; st[top++] = k + CW; }
      }
      if (size < MIN_ISLAND) for (const k of members) m[k] = 0;
    }
  }

  function render() {
    if (!lay) return;
    const { cols, rows, cw, ch, dpr, font } = lay;
    gch.fill(0);
    for (const f of fish) for (const r of f.rings) paintRing(r);
    for (const f of fish) paintFish(f);

    for (const b of buckets) b.length = 0;
    for (let k = 0; k < cols * rows; k++) if (gch[k]) buckets[gcol[k]].push(k);

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, lay.w, lay.h);
    ctx!.font = font;
    ctx!.textBaseline = "top";
    for (let p = 0; p < PALETTE.length; p++) {
      const b = buckets[p];
      if (!b.length) continue;
      ctx!.fillStyle = PALETTE[p];
      for (const k of b) {
        const r = (k / cols) | 0;
        ctx!.fillText(String.fromCharCode(gch[k]), (k - r * cols) * cw, r * ch);
      }
    }
  }

  /* ---------- running ---------- */

  let raf = 0;
  let last = 0;
  let acc = 0;
  let lastDraw = -Infinity;
  let settled = false;
  let disposed = false;

  const active = () => lay !== null;

  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    acc += Math.min(0.25, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      world(STEP);
      acc -= STEP;
    }
    if (now - lastDraw >= FRAME_MS - 1) {
      lastDraw = now;
      render();
    }
  }

  function sync() {
    if (disposed) return;
    const run = active() && !reduced.matches && !document.hidden;
    if (run && !raf) {
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(loop);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (active() && reduced.matches) {
      // One still frame, after the fish have swum long enough to take a natural pose.
      if (!settled) {
        for (let t = 0; t < 4; t += STEP) world(STEP);
        settled = true;
      }
      render();
    }
  }

  const ro = new ResizeObserver(() => relayout());
  ro.observe(host);
  ro.observe(avoidEl);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  relayout();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    raf = 0;
    ro.disconnect();
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
  };
}
