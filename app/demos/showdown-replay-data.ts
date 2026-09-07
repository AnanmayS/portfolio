/*
  One illustrative ShowdownRL battle, written in the shape the bench simulator
  (`showdownrl/simple_env.py`) produces: a 7-action space (4 moves + up to 3
  bench switches), a state-dependent action mask, and the 106-feature rich
  observation the MaskablePPO policy reads.

  This is NOT a recorded battle. It is hand-authored so that every number is
  internally consistent with the env's own arithmetic:

      normalised base power  bp = min(1, power / 140)
      multiplier             m  = (STAB ? 1.5 : 1) x type effectiveness
      raw score              s  = min(4, bp x accuracy x m)
      expected damage        d  = bp x accuracy x m x attack_boost x 0.25

  The mask rules are the env's:

      attack   legal when expected damage > 0
      recover  legal when own HP <= 0.85
      setup    legal when own boost < 1.8 and own HP >= 0.35
      status   legal when opponent boost > 0.45 and opponent HP >= 0.25
      switch   legal when that bench slot has HP > 0

  plus the one mask the live bridge adds from the page itself: a move slot the
  site has disabled (no PP, disabled, or locked into a multi-turn move).

  The measured numbers in the caption come from docs/benchmarks/current_evaluation.csv.
*/

export type MoveRole = "attack" | "recover" | "setup" | "status";
export type MoveCategory = "physical" | "special" | "status";

export interface Move {
  name: string;
  /** Lowercase Pokemon type, or "" for a typeless status move. */
  type: string;
  /** Real base power; 0 for a non-damaging move. */
  power: number;
  accuracy: number;
  category: MoveCategory;
  role: MoveRole;
  /** Same-type attack bonus against the current active Pokemon. */
  stab: boolean;
  /** Pure type effectiveness against the current opponent (0, 0.25 … 4). */
  effectiveness: number;
  legal: boolean;
  /** Why the mask removed it, when it did. */
  maskReason?: string;
}

export interface Combatant {
  name: string;
  types: string[];
  /** HP as a fraction, 0–1, at the START of the turn. */
  hp: number;
  status: string;
}

export interface BenchSlot {
  name: string;
  types: string[];
  hp: number;
  hasRecovery: boolean;
  legal: boolean;
  maskReason?: string;
}

export interface Turn {
  turn: number;
  agent: Combatant;
  opponent: Combatant;
  /** The opponent's attack multiplier; a burn takes it to 0.55. */
  opponentBoost: number;
  /** The agent's own attack multiplier; never boosted in this battle. */
  agentBoost: number;
  bench: BenchSlot[];
  moves: Move[];
  /** Masked softmax over the 7 actions; sums to 1 across legal actions. */
  probs: number[];
  chosen: number;
  log: string;
  why: string;
}

export const ACTION_COUNT = 7;
export const MOVE_ACTIONS = 4;
export const OBS_SIZE = 106;
export const TYPE_COUNT = 18;

/* ---------- env arithmetic, reused by the feature readout ---------- */

export function normalizedPower(power: number): number {
  return Math.min(1, power / 140);
}

export function multiplier(move: Move): number {
  if (move.role !== "attack") return 0;
  return (move.stab ? 1.5 : 1) * move.effectiveness;
}

export function rawScore(move: Move): number {
  if (move.role !== "attack") return 0;
  return Math.min(4, normalizedPower(move.power) * move.accuracy * multiplier(move));
}

export function expectedDamage(move: Move, boost = 1): number {
  if (move.role !== "attack") return 0;
  return normalizedPower(move.power) * move.accuracy * multiplier(move) * boost * 0.25;
}

export function actionLabel(turn: Turn, action: number): string {
  if (action < MOVE_ACTIONS) return turn.moves[action].name;
  return `switch → ${turn.bench[action - MOVE_ACTIONS].name}`;
}

export function actionMask(turn: Turn): boolean[] {
  return [...turn.moves.map((m) => m.legal), ...turn.bench.map((b) => b.legal)];
}

export function maskReason(turn: Turn, action: number): string {
  const item = action < MOVE_ACTIONS ? turn.moves[action] : turn.bench[action - MOVE_ACTIONS];
  return item.maskReason ?? "";
}

/* ---------- the 106-feature vector, grouped for a human ---------- */

export interface FeatureRow {
  label: string;
  value: string;
}

export interface FeatureGroup {
  name: string;
  /** Which indices of the 106-vector this group covers. */
  span: string;
  count: number;
  rows: FeatureRow[];
}

const n2 = (v: number) => v.toFixed(2);
const flag = (v: boolean) => (v ? "1" : "0");

/**
 * The same 106 numbers `_get_obs()` builds, in ten named groups. Counts add up
 * to 106; the tenth group is derived rather than stored, which is the point of
 * showing it.
 */
export function featureGroups(turn: Turn): FeatureGroup[] {
  const groups: FeatureGroup[] = [
    {
      name: "active HP",
      span: "obs[0–1]",
      count: 2,
      rows: [
        { label: `own HP · ${turn.agent.name}`, value: n2(turn.agent.hp) },
        { label: `opponent HP · ${turn.opponent.name}`, value: n2(turn.opponent.hp) },
      ],
    },
  ];

  turn.moves.forEach((move, i) => {
    const bp = move.role === "attack" ? normalizedPower(move.power) : 0;
    const mult = multiplier(move);
    const damage = expectedDamage(move, turn.agentBoost);
    groups.push({
      name: `move ${i + 1} damage context · ${move.name}`,
      span: `obs[${2 + i * 3}–${4 + i * 3}, ${14 + i * 8}–${18 + i * 8}]`,
      count: 8,
      rows: [
        { label: "base power (÷140)", value: n2(bp) },
        { label: "accuracy", value: n2(move.accuracy) },
        { label: "multiplier (STAB × eff)", value: n2(mult) },
        { label: "raw score (bp × acc × mult)", value: n2(rawScore(move)) },
        { label: "STAB flag", value: flag(move.role === "attack" && move.stab) },
        {
          label: "super-effective flag",
          value: flag(move.role === "attack" && move.effectiveness > 1),
        },
        {
          label: "resisted / immune flag",
          value: flag(move.role === "attack" && move.effectiveness < 1),
        },
        {
          label: "finish flag (dmg ≥ opp HP)",
          value: flag(move.role === "attack" && damage >= turn.opponent.hp),
        },
      ],
    });
  });

  groups.push({
    name: "support-move flags",
    span: "obs[19–21, 27–29, 35–37, 43–45]",
    count: 12,
    rows: turn.moves.map((move) => ({
      label: `${move.name} · rec / set / sta`,
      value: `${flag(move.role === "recover")} · ${flag(move.role === "setup")} · ${flag(
        move.role === "status",
      )}`,
    })),
  });

  turn.bench.forEach((slot, i) => {
    groups.push({
      name: `bench slot ${i + 1} · ${slot.name}`,
      span: `obs[${46 + i * 20}–${65 + i * 20}]`,
      count: 20,
      rows: [
        { label: "HP", value: n2(slot.hp) },
        { label: "type one-hot set", value: slot.types.join(", ") },
        { label: `type flags at 0`, value: `${TYPE_COUNT - slot.types.length} of 18` },
        { label: "knows a recovery move", value: flag(slot.hasRecovery) },
      ],
    });
  });

  groups.push({
    name: "opponent matchup (derived, not stored)",
    span: "derived",
    count: 0,
    rows: [
      { label: "opponent types", value: turn.opponent.types.join(", ") },
      { label: "opponent attack boost", value: n2(turn.opponentBoost) },
      { label: "reaches the policy as", value: "each move's multiplier" },
      { label: "opponent bench, moves", value: "not in the vector" },
    ],
  });

  return groups;
}

/* ---------- move sets, one per (active, opponent) matchup ---------- */

const SWORDS_DANCE = (legal: boolean, maskReason?: string): Move => ({
  name: "Swords Dance",
  type: "",
  power: 0,
  accuracy: 1,
  category: "status",
  role: "setup",
  stab: false,
  effectiveness: 0,
  legal,
  maskReason,
});

function garchompVsGyarados(locked: boolean): Move[] {
  return [
    {
      name: "Earthquake",
      type: "ground",
      power: 100,
      accuracy: 1,
      category: "physical",
      role: "attack",
      stab: true,
      effectiveness: 0,
      legal: false,
      maskReason: "0× — Ground does not affect a Flying type",
    },
    {
      name: "Outrage",
      type: "dragon",
      power: 120,
      accuracy: 1,
      category: "physical",
      role: "attack",
      stab: true,
      effectiveness: 1,
      legal: true,
    },
    {
      name: "Stone Edge",
      type: "rock",
      power: 100,
      accuracy: 0.8,
      category: "physical",
      role: "attack",
      stab: false,
      effectiveness: 2,
      legal: !locked,
      maskReason: locked ? LOCKED : undefined,
    },
    SWORDS_DANCE(!locked, locked ? LOCKED : undefined),
  ];
}

function rotomMoves(
  effectiveness: number,
  willOWisp: { legal: boolean; maskReason?: string },
  painSplit: { legal: boolean; maskReason?: string },
): Move[] {
  return [
    {
      name: "Thunderbolt",
      type: "electric",
      power: 90,
      accuracy: 1,
      category: "special",
      role: "attack",
      stab: true,
      effectiveness,
      legal: true,
    },
    {
      name: "Hydro Pump",
      type: "water",
      power: 110,
      accuracy: 0.8,
      category: "special",
      role: "attack",
      stab: true,
      effectiveness: 0.5,
      legal: true,
    },
    {
      name: "Will-O-Wisp",
      type: "fire",
      power: 0,
      accuracy: 0.85,
      category: "status",
      role: "status",
      stab: false,
      effectiveness: 0,
      ...willOWisp,
    },
    {
      name: "Pain Split",
      type: "normal",
      power: 0,
      accuracy: 1,
      category: "status",
      role: "recover",
      stab: false,
      effectiveness: 0,
      ...painSplit,
    },
  ];
}

function ferrothornMoves(
  steelEff: number,
  grassEff: number,
  leechSeed: { legal: boolean; maskReason?: string },
): Move[] {
  return [
    {
      name: "Gyro Ball",
      type: "steel",
      power: 150,
      accuracy: 1,
      category: "physical",
      role: "attack",
      stab: true,
      effectiveness: steelEff,
      legal: true,
    },
    {
      name: "Power Whip",
      type: "grass",
      power: 120,
      accuracy: 0.85,
      category: "physical",
      role: "attack",
      stab: true,
      effectiveness: grassEff,
      legal: true,
    },
    {
      name: "Leech Seed",
      type: "grass",
      power: 0,
      accuracy: 0.9,
      category: "status",
      role: "status",
      stab: false,
      effectiveness: 0,
      ...leechSeed,
    },
    {
      name: "Iron Defense",
      type: "steel",
      power: 0,
      accuracy: 1,
      category: "status",
      role: "setup",
      stab: false,
      effectiveness: 0,
      legal: true,
    },
  ];
}

function volcaronaMoves(
  fireEff: number,
  bugEff: number,
  morningSun: { legal: boolean; maskReason?: string },
  quiverDance: { legal: boolean; maskReason?: string },
): Move[] {
  return [
    {
      name: "Fiery Dance",
      type: "fire",
      power: 80,
      accuracy: 1,
      category: "special",
      role: "attack",
      stab: true,
      effectiveness: fireEff,
      legal: true,
    },
    {
      name: "Bug Buzz",
      type: "bug",
      power: 90,
      accuracy: 1,
      category: "special",
      role: "attack",
      stab: true,
      effectiveness: bugEff,
      legal: true,
    },
    {
      name: "Quiver Dance",
      type: "",
      power: 0,
      accuracy: 1,
      category: "status",
      role: "setup",
      stab: false,
      effectiveness: 0,
      ...quiverDance,
    },
    {
      name: "Morning Sun",
      type: "",
      power: 0,
      accuracy: 1,
      category: "status",
      role: "recover",
      stab: false,
      effectiveness: 0,
      ...morningSun,
    },
  ];
}

/* ---------- bench slots ---------- */

const FAINTED = "bench slot fainted";
const LOCKED = "locked into Outrage";

const garchompSlot = (hp: number, legal: boolean, maskReason?: string): BenchSlot => ({
  name: "Garchomp",
  types: ["dragon", "ground"],
  hp,
  hasRecovery: false,
  legal,
  maskReason,
});

const rotomSlot = (hp: number, legal: boolean, maskReason?: string): BenchSlot => ({
  name: "Rotom-Wash",
  types: ["electric", "water"],
  hp,
  hasRecovery: true,
  legal,
  maskReason,
});

const ferroSlot = (hp: number, legal: boolean, maskReason?: string): BenchSlot => ({
  name: "Ferrothorn",
  types: ["grass", "steel"],
  hp,
  hasRecovery: false,
  legal,
  maskReason,
});

const volcSlot = (hp: number, legal: boolean, maskReason?: string): BenchSlot => ({
  name: "Volcarona",
  types: ["bug", "fire"],
  hp,
  hasRecovery: true,
  legal,
  maskReason,
});

/* ---------- combatants ---------- */

const garchomp = (hp: number): Combatant => ({
  name: "Garchomp",
  types: ["dragon", "ground"],
  hp,
  status: "",
});
const rotom = (hp: number): Combatant => ({
  name: "Rotom-Wash",
  types: ["electric", "water"],
  hp,
  status: "",
});
const ferrothorn = (hp: number): Combatant => ({
  name: "Ferrothorn",
  types: ["grass", "steel"],
  hp,
  status: "",
});
const volcarona = (hp: number): Combatant => ({
  name: "Volcarona",
  types: ["bug", "fire"],
  hp,
  status: "",
});

const gyarados = (hp: number): Combatant => ({
  name: "Gyarados",
  types: ["water", "flying"],
  hp,
  status: "",
});
const dragapult = (hp: number, status: string): Combatant => ({
  name: "Dragapult",
  types: ["dragon", "ghost"],
  hp,
  status,
});
const kingambit = (hp: number): Combatant => ({
  name: "Kingambit",
  types: ["dark", "steel"],
  hp,
  status: "",
});
const tyranitar = (hp: number): Combatant => ({
  name: "Tyranitar",
  types: ["rock", "dark"],
  hp,
  status: "",
});

/* ---------- the battle ---------- */

const TURNS: Turn[] = [
  {
    turn: 1,
    agent: garchomp(1.0),
    opponent: gyarados(1.0),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [rotomSlot(1.0, true), ferroSlot(1.0, true), volcSlot(1.0, true)],
    moves: garchompVsGyarados(false),
    probs: [0, 0.58, 0.22, 0.06, 0.08, 0.04, 0.02],
    chosen: 1,
    log: "Garchomp used Outrage · 32% damage · Gyarados used Waterfall · 43% damage",
    why: "Earthquake is masked out — Ground is 0× into a Flying type — and Outrage's raw score of 1.29 edges Stone Edge's 1.14 once 80% accuracy is priced in, even though Stone Edge is the super-effective one.",
  },
  {
    turn: 2,
    agent: garchomp(0.57),
    opponent: gyarados(0.68),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [rotomSlot(1.0, false, LOCKED), ferroSlot(1.0, false, LOCKED), volcSlot(1.0, false, LOCKED)],
    moves: garchompVsGyarados(true),
    probs: [0, 1, 0, 0, 0, 0, 0],
    chosen: 1,
    log: "Garchomp used Outrage · 32% damage · Gyarados used Waterfall · 43% damage",
    why: "Outrage locks the menu for its duration. The live bridge builds the mask from the page, so six of seven actions vanish and the masked softmax is forced onto a single option.",
  },
  {
    turn: 3,
    agent: garchomp(0.14),
    opponent: gyarados(0.36),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [rotomSlot(1.0, false, LOCKED), ferroSlot(1.0, false, LOCKED), volcSlot(1.0, false, LOCKED)],
    moves: garchompVsGyarados(true),
    probs: [0, 1, 0, 0, 0, 0, 0],
    chosen: 1,
    log: "Garchomp used Outrage · 32% damage · Gyarados used Waterfall · 43% damage · Garchomp fainted",
    why: "Still locked, and 14% HP is below the 35% setup floor anyway. Garchomp trades its last turn for another 32% — the mask made this call, not the policy.",
  },
  {
    turn: 4,
    agent: rotom(1.0),
    opponent: gyarados(0.04),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), ferroSlot(1.0, true), volcSlot(1.0, true)],
    moves: rotomMoves(
      4,
      { legal: false, maskReason: "opponent at 4% — under the 25% status floor" },
      { legal: false, maskReason: "HP 100% — over the 85% recovery ceiling" },
    ),
    probs: [0.95, 0.02, 0, 0, 0, 0.02, 0.01],
    chosen: 0,
    log: "Rotom-Wash used Thunderbolt · 96% damage · Gyarados fainted · Dragapult was sent out",
    why: "Three of seven actions go at once: Garchomp's slot is fainted, Pain Split is over the recovery ceiling, Will-O-Wisp under the status floor. Thunderbolt is 4× on Water/Flying and its finish flag is set.",
  },
  {
    turn: 5,
    agent: rotom(1.0),
    opponent: dragapult(1.0, ""),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), ferroSlot(1.0, true), volcSlot(1.0, true)],
    moves: rotomMoves(
      0.5,
      { legal: true },
      { legal: false, maskReason: "HP 100% — over the 85% recovery ceiling" },
    ),
    probs: [0.17, 0.13, 0.49, 0, 0, 0.16, 0.05],
    chosen: 2,
    log: "Rotom-Wash used Will-O-Wisp · Dragapult was burned · attack ×0.55 · Dragapult used Shadow Ball · 12% damage",
    why: "Both STABs are resisted down to a 0.75× multiplier, so no move carries a super-effective flag. The status flag is the only feature left with headroom, and the burn cuts every incoming hit to 55%.",
  },
  {
    turn: 6,
    agent: rotom(0.88),
    opponent: dragapult(1.0, "brn"),
    opponentBoost: 0.55,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), ferroSlot(1.0, true), volcSlot(1.0, true)],
    moves: rotomMoves(
      0.5,
      { legal: true },
      { legal: false, maskReason: "HP 88% — over the 85% recovery ceiling" },
    ),
    probs: [0.16, 0.12, 0.03, 0, 0, 0.52, 0.17],
    chosen: 5,
    log: "Ananmay withdrew Rotom-Wash · Ferrothorn was sent out · Dragapult used Dragon Darts · 7% damage",
    why: "The top choice is a switch. Bench slot 2's type flags read Grass/Steel, which halves Dragon; the policy pays the −0.01 switch cost to turn a 15% incoming hit into a 7% one.",
  },
  {
    turn: 7,
    agent: ferrothorn(0.93),
    opponent: dragapult(1.0, "brn"),
    opponentBoost: 0.55,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), volcSlot(1.0, true)],
    moves: ferrothornMoves(1, 0.5, { legal: true }),
    probs: [0.71, 0.06, 0.09, 0.05, 0, 0.04, 0.05],
    chosen: 0,
    log: "Ferrothorn used Gyro Ball · 38% damage · Dragapult used Dragon Darts · 7% damage",
    why: "Gyro Ball's raw score is 1.50 against Power Whip's 0.55, and with the burn holding Dragapult to 7% a turn the policy simply out-trades it.",
  },
  {
    turn: 8,
    agent: ferrothorn(0.86),
    opponent: dragapult(0.62, "brn"),
    opponentBoost: 0.55,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), volcSlot(1.0, true)],
    moves: ferrothornMoves(1, 0.5, { legal: true }),
    probs: [0.8, 0.06, 0.05, 0.04, 0, 0.02, 0.03],
    chosen: 0,
    log: "Ferrothorn used Gyro Ball · 38% damage · Dragapult used Dragon Darts · 7% damage",
    why: "Nothing in the matchup changed, and the distribution sharpens on its own: 0.71 → 0.80 on Gyro Ball as Dragapult's HP falls toward finish range.",
  },
  {
    turn: 9,
    agent: ferrothorn(0.79),
    opponent: dragapult(0.24, "brn"),
    opponentBoost: 0.55,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), volcSlot(1.0, true)],
    moves: ferrothornMoves(1, 0.5, {
      legal: false,
      maskReason: "opponent at 24% — under the 25% status floor",
    }),
    probs: [0.92, 0.03, 0, 0.02, 0, 0.01, 0.02],
    chosen: 0,
    log: "Ferrothorn used Gyro Ball · 38% damage · Dragapult fainted · Kingambit was sent out",
    why: "Leech Seed drops out the moment Dragapult crosses under 25%, and Gyro Ball's finish flag flips to 1 — 38% expected damage into 24% remaining.",
  },
  {
    turn: 10,
    agent: ferrothorn(0.79),
    opponent: kingambit(1.0),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), volcSlot(1.0, true)],
    moves: ferrothornMoves(0.5, 0.5, { legal: true }),
    probs: [0.15, 0.06, 0.11, 0.05, 0, 0.07, 0.56],
    chosen: 6,
    log: "Ananmay withdrew Ferrothorn · Volcarona was sent out · Kingambit used Iron Head · 11% damage",
    why: "Steel halves both of Ferrothorn's STABs to 0.75×. Bench slot 3's type flags carry Fire, which is 2× into Steel, so the switch buys a 3.0× multiplier for one 11% hit.",
  },
  {
    turn: 11,
    agent: volcarona(0.89),
    opponent: kingambit(1.0),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), ferroSlot(0.79, true)],
    moves: volcaronaMoves(
      2,
      1,
      { legal: false, maskReason: "HP 89% — over the 85% recovery ceiling" },
      { legal: true },
    ),
    probs: [0.66, 0.13, 0.14, 0, 0, 0.03, 0.04],
    chosen: 0,
    log: "Volcarona used Fiery Dance · 43% damage · Kingambit used Sucker Punch · 19% damage",
    why: "Morning Sun sits over the 85% recovery ceiling and is masked. Fiery Dance carries the super-effective flag at 2× into Steel; Bug Buzz's 2× on Dark is cancelled out by Steel's 0.5×.",
  },
  {
    turn: 12,
    agent: volcarona(0.7),
    opponent: kingambit(0.57),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), ferroSlot(0.79, true)],
    moves: volcaronaMoves(2, 1, { legal: true }, { legal: true }),
    probs: [0.74, 0.09, 0.08, 0.04, 0, 0.02, 0.03],
    chosen: 0,
    log: "Volcarona used Fiery Dance · 43% damage · Kingambit used Sucker Punch · 19% damage",
    why: "Morning Sun is legal again below 85%, but the shaped reward only pays for recovery under 55% HP — at 70% the policy keeps hitting.",
  },
  {
    turn: 13,
    agent: volcarona(0.51),
    opponent: kingambit(0.14),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), ferroSlot(0.79, true)],
    moves: volcaronaMoves(2, 1, { legal: true }, { legal: true }),
    probs: [0.89, 0.03, 0.02, 0.03, 0, 0.01, 0.02],
    chosen: 0,
    log: "Volcarona used Fiery Dance · 43% damage · Kingambit fainted · Tyranitar was sent out",
    why: "The finish flag is the most load-bearing feature in the vector: 43% expected damage into 14% remaining, and the distribution collapses onto one action.",
  },
  {
    turn: 14,
    agent: volcarona(0.51),
    opponent: tyranitar(1.0),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), ferroSlot(0.79, true)],
    moves: volcaronaMoves(0.5, 2, { legal: true }, { legal: true }),
    probs: [0.02, 0.51, 0.08, 0.12, 0, 0.08, 0.19],
    chosen: 1,
    log: "Volcarona used Bug Buzz · 48% damage · Tyranitar used Stone Edge · 86% damage · Volcarona fainted",
    why: "The observation has no opponent-move features, so a 4× Rock hit is invisible to the policy: it reads a 3.0× Bug Buzz and takes it. Ferrothorn at 0.19 was the safe line the value head did not price high enough.",
  },
  {
    turn: 15,
    agent: ferrothorn(0.79),
    opponent: tyranitar(0.52),
    opponentBoost: 1,
    agentBoost: 1,
    bench: [garchompSlot(0, false, FAINTED), rotomSlot(0.88, true), volcSlot(0, false, FAINTED)],
    moves: ferrothornMoves(2, 2, { legal: true }),
    probs: [0.86, 0.09, 0.02, 0.02, 0, 0.01, 0],
    chosen: 0,
    log: "Ferrothorn used Gyro Ball · 75% damage · Tyranitar fainted · agent wins with 2 Pokémon left",
    why: "Two bench slots are masked now — Garchomp and Volcarona are both fainted — and Steel is 2× into Rock. Gyro Ball's finish flag is set at 75% expected damage into 52% remaining.",
  },
];

export interface Battle {
  label: string;
  result: string;
  turns: Turn[];
}

export const BATTLE: Battle = {
  label: "rich / type_aware · MaskablePPO v11 · bench simulator",
  result: "win",
  turns: TURNS,
};

/* ---------- the measured benchmark, from current_evaluation.csv ---------- */

export interface Benchmark {
  name: string;
  winRate: number;
  record: string;
  tone: "ppo" | "baseline";
}

export const BENCHMARKS: Benchmark[] = [
  { name: "maskable ppo v11", winRate: 79.0, record: "790-41-169", tone: "ppo" },
  { name: "type-aware baseline", winRate: 75.2, record: "752-26-222", tone: "baseline" },
];

export const EPISODES = 1000;
