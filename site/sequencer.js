"use strict";
// clockbox screen: the 4-track sequencer (firmware 2.5+). Uses the globals of screen.js.

const SEQ_T = {
  fr: {
    seqTitle: "Séquenceur",
    seqHelp: "4 pistes qui jouent tes synthés en MIDI (et les jacks en mode « Piste »). Choisis une piste, allume ses pas d'un clic, puis dessine les notes et les variations à la souris.",
    track: "Piste", tModes: ["Éteinte", "Pas à pas", "Euclidien"],
    midiPill: "MIDI · canal {c}", midiPillAll: "MIDI · ALL", midiPillOff: "MIDI coupé",
    midiOffHelp: "Cette piste ne joue pas en MIDI : clique « MIDI coupé » pour l'activer.",
    tLength: "Pas", tHits: "Coups", tRot: "Rotation", tChannel: "Canal", tAll: "ALL", tScale: "Gamme", tRoot: "Tonique",
    tDiv: "Durée d'un pas", tDivs: ["1/16", "1/8", "1/16 triolet", "1/4", "1/32"],
    tDir: "Sens de lecture", tDirs: ["Avant", "Arrière", "Aller-retour", "Hasard"],
    tTranspose: "Transposition", tProb: "Probabilité de la piste", tRandNote: "Notes aléatoires",
    tRandRange: "Étendue de l'aléatoire", tHumanize: "Humanisation (vélocité)", tAccent: "Accent (1er coup)",
    more: "Plus de réglages de la piste",
    ovHelp: "Les 4 pistes : clique une ligne pour la modifier, et sa pastille pour couper ou activer son MIDI.",
    stepsHelp: "Clique un pas pour l'allumer ou l'éteindre.", stepsHelpEu: "En euclidien, les coups se règlent avec « Coups » et « Rotation ».",
    lanes: { note: "Note", vel: "Vélocité", prob: "Probabilité", sub: "Sous-pas", len: "Longueur", ch: "Canal", rand: "Aléatoire", cc: "CC" },
    laneHelp: {
      note: "Glisse vers le haut ou le bas sur un pas pour changer sa note : seules les notes de la gamme sont possibles. Tu peux balayer plusieurs pas d'un coup.",
      vel: "Hauteur = force de la note.", prob: "Hauteur = chance que le pas joue (100 % en haut).",
      sub: "1 à 4 notes rapides dans le pas (roulements).", len: "Durée de la note : 25, 50, 75 ou 95 % du pas.",
      ch: "Canal MIDI du pas : P = celui de la piste, 1 à 16, A = ALL.", rand: "Clique pour qu'un pas joue une note au hasard dans la gamme.",
      cc: "Une valeur de contrôle (0 à 127) envoyée à chaque pas : par exemple le filtre (CC 74) ou la résonance (CC 71). Le synthé doit accepter ce CC."
    },
    octDown: "▼ octave", octUp: "▲ octave",
    mute: "Couper", solo: "Solo", undo: "↶ Annuler", undoNone: "Rien à annuler",
    invNotes: "Inventer des notes", invRhythm: "Inventer un rythme", toSteps: "Euclidien → pas à pas",
    copyTo: "Copier cette piste vers", copyGo: "Copier", copied: "Piste {a} copiée vers la piste {b}",
    ccNum: "CC n°", ccOn: "Envoyer ce CC", ccOff: "Coche « Envoyer ce CC » pour que la boîte l'envoie.",
    tLow: "Note la plus basse",
    gen: "Génératif", genAmount: "Notes changées à chaque cycle", genRange: "Étendue", genOct: ["1 octave", "2 octaves", "3 octaves"],
    genRhythm: "Le rythme varie aussi", genKeep: "Garder ces notes", genKept: "Notes de la piste {n} enregistrées dans la boîte",
    sFill: "Tout allumer", sClear: "Tout éteindre", sCopyHalf: "Copier la 1re moitié sur la 2e",
    custom: "Gamme CUSTOM : clique les notes à garder",
    micro: "Gamme microtonale : la boîte envoie un pitch bend (règle ton synthé sur ±2 demi-tons).",
    seqOld: "Le séquenceur demande le firmware 2.5 : mets ta boîte à jour plus bas.",
    loading: "Lecture de la séquence…",
  },
  en: {
    seqTitle: "Sequencer",
    seqHelp: "4 tracks that play your synths over MIDI (and the jacks in “Track” mode). Pick a track, turn its steps on with a click, then draw the notes and variations with the mouse.",
    track: "Track", tModes: ["Off", "Steps", "Euclidean"],
    midiPill: "MIDI · channel {c}", midiPillAll: "MIDI · ALL", midiPillOff: "MIDI muted",
    midiOffHelp: "This track does not play MIDI: click “MIDI muted” to turn it on.",
    tLength: "Steps", tHits: "Hits", tRot: "Rotation", tChannel: "Channel", tAll: "ALL", tScale: "Scale", tRoot: "Root",
    tDiv: "Step length", tDivs: ["1/16", "1/8", "1/16 triplet", "1/4", "1/32"],
    tDir: "Direction", tDirs: ["Forward", "Backward", "Ping-pong", "Random"],
    tTranspose: "Transpose", tProb: "Track probability", tRandNote: "Random notes",
    tRandRange: "Random range", tHumanize: "Humanize (velocity)", tAccent: "Accent (first hit)",
    more: "More track settings",
    ovHelp: "The 4 tracks: click a row to edit it, and its pill to mute or unmute its MIDI.",
    stepsHelp: "Click a step to turn it on or off.", stepsHelpEu: "In Euclidean mode, hits are set with “Hits” and “Rotation”.",
    lanes: { note: "Note", vel: "Velocity", prob: "Probability", sub: "Substeps", len: "Length", ch: "Channel", rand: "Random", cc: "CC" },
    laneHelp: {
      note: "Drag up or down on a step to change its note: only the notes of the scale are possible. Sweep across several steps at once.",
      vel: "Height = how hard the note plays.", prob: "Height = chance that the step plays (100 % at the top).",
      sub: "1 to 4 fast notes within the step (rolls).", len: "Note length: 25, 50, 75 or 95 % of the step.",
      ch: "MIDI channel of the step: P = the track's, 1 to 16, A = ALL.", rand: "Click so that a step plays a random note of the scale.",
      cc: "A control value (0 to 127) sent on each step: for example the filter (CC 74) or resonance (CC 71). The synth must accept this CC."
    },
    octDown: "▼ octave", octUp: "▲ octave",
    mute: "Mute", solo: "Solo", undo: "↶ Undo", undoNone: "Nothing to undo",
    invNotes: "Invent notes", invRhythm: "Invent a rhythm", toSteps: "Euclidean → steps",
    copyTo: "Copy this track to", copyGo: "Copy", copied: "Track {a} copied to track {b}",
    ccNum: "CC #", ccOn: "Send this CC", ccOff: "Tick “Send this CC” so that the box sends it.",
    tLow: "Lowest note",
    gen: "Generative", genAmount: "Notes changed each cycle", genRange: "Range", genOct: ["1 octave", "2 octaves", "3 octaves"],
    genRhythm: "The rhythm varies too", genKeep: "Keep these notes", genKept: "Notes of track {n} saved in the box",
    sFill: "All on", sClear: "All off", sCopyHalf: "Copy the 1st half onto the 2nd",
    custom: "CUSTOM scale: click the notes to keep",
    micro: "Microtonal scale: the box sends a pitch bend (set your synth to ±2 semitones).",
    seqOld: "The sequencer needs firmware 2.5: update your box below.",
    loading: "Reading the sequence…",
  }
};
for (const l in SEQ_T) Object.assign(T[l], SEQ_T[l]);

const TRACK_KEYS = ["mode", "length", "hits", "rotation", "division", "channel", "midi", "scale", "root",
  "transpose", "direction", "prob", "randNote", "randRange", "humanize", "accent"];
const TRACK_DIV24 = [6, 12, 4, 24, 3];
const PROB_LEVELS = [100, 88, 75, 63, 50, 38, 25, 13];
const LEN_PCT = [25, 50, 75, 95];
const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES = window.CLOCKBOX_SCALES;

const SEQ = {
  tracks: null,          // [{mode, length, ...}] x4, null until read from the box
  steps: null,           // [track][step] = [b0, b1, b2, b3]
  custom: 0xFFF,
  heads: [127, 127, 127, 127],
  playedAt: [0, 0, 0, 0],
  sel: 0, step: 0,
  timers: {},
  loaded: false,
  cc: null,              // [{num, on, vals[32]}] x4
  mute: 0, solo: 0,      // live masks
  low: [48, 48, 48, 48],  // lowest note of each track (firmware 2.7+)
  gen: [0, 1, 2, 3].map(() => ({ amount: 0, range: 2, rhythm: 0 })),   // generative (firmware 2.8+)
  undo: [],
};

function defaultSequence() {
  const tr = [
    [2, 16, 5, 0, 0, 0, 1, 0, 0, 24, 0, 100, 0, 12, 0, 20],
    [2, 8, 3, 0, 0, 1, 1, 0, 0, 24, 0, 100, 0, 12, 0, 20],
    [2, 16, 7, 0, 0, 2, 1, 0, 0, 24, 0, 80, 0, 12, 10, 20],
    [1, 16, 4, 0, 0, 3, 1, 1, 0, 24, 0, 100, 0, 12, 0, 0]];
  const line = [36, 0, 0, 39, 0, 0, 43, 0, 46, 0, 0, 43, 0, 39, 0, 0];
  SEQ.tracks = tr.map((a, t) => Object.assign(Object.fromEntries(TRACK_KEYS.map((k, i) => [k, a[i]])), { low: SEQ.low[t] }));
  SEQ.steps = [36, 38, 42, 48].map((n, t) => Array.from({ length: 32 }, (_, s) => {
    if (t < 3) return [n, [110, 100, 80][t], 0, 4];
    const v = line[s % 16];
    return [(v ? 0x80 : 0) | (v || 48), 100, 0, 4];
  }));
  SEQ.custom = 0xFFF;
  SEQ.cc = [0, 1, 2, 3].map(() => ({ num: 74, on: 0, vals: Array.from({ length: 32 }, (_, s) => 32 + ((s * 6) % 64)) }));
}

// ------------------------------------------------------------------ model --
const stepObj = b => ({ on: !!(b[0] & 0x80), note: b[0] & 0x7F, vel: b[1] & 0x7F, ch: b[2] & 0x1F,
  prob: b[2] >> 5, sub: (b[3] & 3) + 1, len: (b[3] >> 2) & 3, rand: !!(b[3] & 0x10) });
const stepBytes = o => [(o.on ? 0x80 : 0) | o.note, o.vel, o.ch | (o.prob << 5), (o.sub - 1) | (o.len << 2) | (o.rand ? 0x10 : 0)];
const isMicro = sc => sc >= 79;
function hitOf(t, s) {
  const k = SEQ.tracks[t];
  if (k.mode === 1) return !!(SEQ.steps[t][s][0] & 0x80);
  if (k.mode === 2) return euHit({ steps: k.length, hits: k.hits, rotation: k.rotation }, s);
  return false;
}
function noteLabel12(n) { return ROOTS[n % 12] + (Math.floor(n / 12) - 2); }

// The note the box really plays for a raw step note (same rules as quantize() in the firmware).
function playedNote(k, raw, down = false) {
  let n = Math.max(0, Math.min(127, raw + k.transpose - 24));
  const sc = SCALES.scales[k.scale];
  if (!sc.cents) {
    let mask = k.scale === SCALES.custom ? (SEQ.custom || 0xFFF) : (down ? sc.down : sc.up);
    let deg = (((n - k.root) % 12) + 12) % 12;
    for (let i = 0; i < 12 && !(mask & (1 << deg)); i++) { n--; deg = (deg + 11) % 12; }
    n = Math.max(0, n);
    while (n < (k.low || 0) && n + 12 <= 127) n += 12;   // same as the firmware: no note below the track's lowest
    return { note: n, cents: 0 };
  }
  const period = Math.round(sc.period * 10), base = (60 + k.root) * 1000, t = n * 1000 - base;
  const oct = Math.floor(t / period), rem = t - oct * period;
  let best = 0, dist = rem;
  if (period - rem < dist) { best = period; dist = period - rem; }
  for (const c of sc.cents) { const d = Math.round(c * 10), x = Math.abs(d - rem); if (x < dist) { best = d; dist = x; } }
  const pitch = base + oct * period + best;
  let out = Math.max(0, Math.min(127, Math.floor((pitch + 500) / 1000)));
  const cents = Math.round((pitch - out * 1000) / 10);
  while (out < (k.low || 0) && out + 12 <= 127) out += 12;
  return { note: out, cents };
}
const playedLabel = p => noteLabel12(p.note) + (p.cents ? (p.cents > 0 ? " +" : " ") + p.cents + "¢" : "");

// Distinct notes of the track's scale between C0 and C7, with a raw value that produces each.
function scaleChoices(k) {
  const seen = new Map();
  for (let raw = 0; raw < 128; raw++) {
    const p = playedNote(k, raw);
    if (p.note < Math.max(12, k.low || 0) || p.note > 108) continue;
    const key = p.note * 1000 + p.cents;
    if (!seen.has(key)) seen.set(key, { raw, p });
  }
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1]);
}

// ------------------------------------------------------------ protocol in --
function seqOnTrack(d) {
  if (!SEQ.tracks) defaultSequence();
  const t = d[0];
  if (t > 3 || d.length < 17 || SEQ.timers["t" + t]) return;
  SEQ.tracks[t] = Object.assign(Object.fromEntries(TRACK_KEYS.map((k, i) => [k, d[1 + i]])), { low: SEQ.low[t] });
  seqRender();
}
function seqOnStep(d) {
  if (!SEQ.steps) defaultSequence();
  const [t, s] = d;
  if (t > 3 || s > 31 || SEQ.timers[`s${t}.${s}`]) return;
  const b = [0, 1, 2, 3].map(i => d[2 + i] | (((d[6] >> i) & 1) << 7));
  if (SEQ.loaded && b.join() !== SEQ.steps[t][s].join()) (SEQ.fresh = SEQ.fresh || new Set()).add(`${t}.${s}`);
  SEQ.steps[t][s] = b;
  if (t === 3 && s === 31) { SEQ.loaded = true; log("séquence lue"); seqRenderSoon(); return; }
  if (SEQ.loaded) seqSoftSoon(); else seqRenderSoon();
}
function seqOnCustom(d) { SEQ.custom = (d[0] | (d[1] << 7)) & 0xFFF; seqRenderSoon(); }
function seqOnCC(d) {
  if (!SEQ.cc) defaultSequence();
  const t = d[0];
  if (t > 3 || d.length < 35 || SEQ.timers["c" + t]) return;
  SEQ.cc[t] = { num: d[1], on: d[2], vals: d.slice(3, 35) };
  if (d.length >= 36 && !SEQ.timers["l" + t]) { SEQ.low[t] = d[35]; if (SEQ.tracks) SEQ.tracks[t].low = d[35]; SEQ.win[t] = null; }
  if (d.length >= 39 && !SEQ.timers["g" + t]) SEQ.gen[t] = { amount: d[36], range: d[37], rhythm: d[38] };
  seqRenderSoon();
}
function seqOnPlayhead(d, now) {
  if (d.length >= 7) { SEQ.mute = d[5]; SEQ.solo = d[6]; }
  SEQ.heads = d.slice(0, 4);
  for (let t = 0; t < 4; t++) if (d[4] & (1 << t)) SEQ.playedAt[t] = now;
  seqRenderHeads();
}
function seqRequest() { SEQ.loaded = false; send(enc(0x1A)); }

// ----------------------------------------------------------- protocol out --
function seqSendTrack(t) {
  clearTimeout(SEQ.timers["t" + t]);
  SEQ.timers["t" + t] = setTimeout(() => {
    delete SEQ.timers["t" + t];
    send(enc(0x19, t, ...TRACK_KEYS.map(k => SEQ.tracks[t][k])));
  }, 200);
}
function seqSendStep(t, s) {
  const key = `s${t}.${s}`;
  clearTimeout(SEQ.timers[key]);
  SEQ.timers[key] = setTimeout(() => {
    delete SEQ.timers[key];
    const b = SEQ.steps[t][s], hi = b.reduce((h, x, i) => h | ((x >> 7) << i), 0);
    send(enc(0x18, t, s, ...b.map(x => x & 0x7F), hi));
  }, 150);
}
function seqSendCCStep(t, s) {
  const key = `c${t}.${s}`;
  clearTimeout(SEQ.timers[key]);
  SEQ.timers[key] = setTimeout(() => { delete SEQ.timers[key]; send(enc(0x1D, t, s, SEQ.cc[t].vals[s])); }, 150);
}
function seqSendCCTrack(t) {
  clearTimeout(SEQ.timers["c" + t]);
  SEQ.timers["c" + t] = setTimeout(() => { delete SEQ.timers["c" + t]; send(enc(0x1E, t, SEQ.cc[t].num, SEQ.cc[t].on)); }, 200);
}
function seqSendMute() { send(enc(0x1C, SEQ.mute, SEQ.solo)); }
function seqSendLow(t) {
  clearTimeout(SEQ.timers["l" + t]);
  SEQ.timers["l" + t] = setTimeout(() => { delete SEQ.timers["l" + t]; send(enc(0x1F, t, SEQ.low[t])); }, 150);
}

// ------------------------------------------------------------------- undo --
const seqState = () => JSON.stringify({ tracks: SEQ.tracks, steps: SEQ.steps, cc: SEQ.cc, custom: SEQ.custom, gen: SEQ.gen });
function seqSendGen(t) {
  clearTimeout(SEQ.timers["g" + t]);
  SEQ.timers["g" + t] = setTimeout(() => { delete SEQ.timers["g" + t]; const g = SEQ.gen[t]; send(enc(0x20, t, g.amount, g.range, g.rhythm)); }, 200);
}
function pushUndo() {
  if (!SEQ.tracks) return;
  SEQ.undo.push(seqState());
  if (SEQ.undo.length > 40) SEQ.undo.shift();
}
function seqUndo() {
  const prev = SEQ.undo.pop();
  if (!prev) { log(t("undoNone")); return; }
  const p = JSON.parse(prev);
  for (let tr = 0; tr < 4; tr++) {
    if (JSON.stringify(p.tracks[tr]) !== JSON.stringify(SEQ.tracks[tr])) {
      if (p.tracks[tr].low !== SEQ.tracks[tr].low) { SEQ.low[tr] = p.tracks[tr].low; seqSendLow(tr); }
      SEQ.tracks[tr] = p.tracks[tr]; seqSendTrack(tr);
    }
    for (let s = 0; s < 32; s++) if (p.steps[tr][s].join() !== SEQ.steps[tr][s].join()) { SEQ.steps[tr][s] = p.steps[tr][s]; seqSendStep(tr, s); }
    if (p.cc[tr].num !== SEQ.cc[tr].num || p.cc[tr].on !== SEQ.cc[tr].on) { SEQ.cc[tr].num = p.cc[tr].num; SEQ.cc[tr].on = p.cc[tr].on; seqSendCCTrack(tr); }
    for (let s = 0; s < 32; s++) if (p.cc[tr].vals[s] !== SEQ.cc[tr].vals[s]) { SEQ.cc[tr].vals[s] = p.cc[tr].vals[s]; seqSendCCStep(tr, s); }
  }
  if (p.gen) for (let tr = 0; tr < 4; tr++) if (JSON.stringify(p.gen[tr]) !== JSON.stringify(SEQ.gen[tr])) { SEQ.gen[tr] = p.gen[tr]; seqSendGen(tr); }
  if (p.custom !== SEQ.custom) { SEQ.custom = p.custom; send(enc(0x1B, SEQ.custom & 0x7F, SEQ.custom >> 7)); }
  SEQ.win = [null, null, null, null];
  seqRender();
}

async function seqSendAll() {   // after an import: everything, paced
  for (let t = 0; t < 4; t++) { await send(enc(0x19, t, ...TRACK_KEYS.map(k => SEQ.tracks[t][k]))); await sleep(15); }
  await send(enc(0x1B, SEQ.custom & 0x7F, SEQ.custom >> 7)); await sleep(15);
  for (let t = 0; t < 4; t++) {
    SEQ.low[t] = SEQ.tracks[t].low != null ? SEQ.tracks[t].low : 48;
    await send(enc(0x1F, t, SEQ.low[t])); await sleep(12);
    await send(enc(0x20, t, SEQ.gen[t].amount, SEQ.gen[t].range, SEQ.gen[t].rhythm)); await sleep(12);
    await send(enc(0x1E, t, SEQ.cc[t].num, SEQ.cc[t].on)); await sleep(12);
    for (let s = 0; s < 32; s++) { await send(enc(0x1D, t, s, SEQ.cc[t].vals[s])); await sleep(8); }
  }
  for (let t = 0; t < 4; t++) for (let s = 0; s < 32; s++) {
    const b = SEQ.steps[t][s], hi = b.reduce((h, x, i) => h | ((x >> 7) << i), 0);
    await send(enc(0x18, t, s, ...b.map(x => x & 0x7F), hi)); await sleep(12);
  }
}

// -------------------------------------------------------------- rendering --
const LANES = ["note", "vel", "prob", "sub", "len", "ch", "rand", "cc"];
const LANE_LEVELS = { vel: 127, prob: 8, sub: 4, len: 4, ch: 18, rand: 2 };
if (!SEQ.lane) SEQ.lane = "note";
if (!SEQ.win) SEQ.win = [null, null, null, null];

function scaleOptions(v) {
  let html = "", fam = -1;
  for (const i of SCALES.order) {
    const sc = SCALES.scales[i];
    if (sc.family !== fam) { if (fam >= 0) html += "</optgroup>"; fam = sc.family; html += `<optgroup label="${esc(SCALES.families[fam])}">`; }
    html += `<option value="${i}" ${i === v ? "selected" : ""}>${esc(sc.name)}</option>`;
  }
  return html + "</optgroup>";
}
const selHtml = (attr, opts, v) => `<select ${attr}>${opts.map((o, i) => {
  const [val, label] = Array.isArray(o) ? o : [i, o];
  return `<option value="${val}" ${val === v ? "selected" : ""}>${esc(label)}</option>`;
}).join("")}</select>`;
const stepper = (key, v) => `<span class="stp"><button data-inc="${key}:-1" aria-label="-">−</button><b>${v}</b><button data-inc="${key}:1" aria-label="+">+</button></span>`;
const midiPill = k => !k.midi ? t("midiPillOff") : k.channel === 16 ? t("midiPillAll") : tf("midiPill", { c: k.channel + 1 });

// The notes shown in the Note lane: two octaves of the scale, which the user can shift.
function noteWindow(t) {
  const k = SEQ.tracks[t], all = scaleChoices(k);
  if (SEQ.win[t] == null) SEQ.win[t] = Math.max(12, k.low || 24);   // the lane starts at the track's lowest note
  const lo = SEQ.win[t];
  return all.filter(c => c.p.note >= lo && c.p.note < lo + 25);
}

let seqRenderTimer = null, seqSoftTimer = null;
function seqSoftSoon() { if (!seqSoftTimer) seqSoftTimer = setTimeout(() => { seqSoftTimer = null; softRefresh(); }, 40); }

// Update notes, hits and bars in place (steps changed by the box, e.g. the
// generative mode), without rebuilding the card: works while a slider is held.
function softRefresh() {
  const box = $("seq");
  if (!box || !SEQ.tracks || !box.querySelector(".steps32")) return;
  const t0 = SEQ.sel, k = SEQ.tracks[t0];
  refreshLane();
  box.querySelectorAll(".steps32 .cell").forEach(c => {
    const s = +c.dataset.step;
    c.classList.toggle("hit", s < k.length && hitOf(t0, s));
  });
  box.querySelectorAll(".lane [data-lb]").forEach(c => c.classList.toggle("h", hitOf(t0, +c.dataset.lb)));
  box.querySelectorAll(".ovrow").forEach(row => {
    const ti = +row.dataset.tab, tk = SEQ.tracks[ti];
    row.querySelectorAll("[data-ov]").forEach(c => { const s = +c.dataset.ov; c.classList.toggle("h", s < tk.length && hitOf(ti, s)); });
  });
  if (SEQ.fresh && SEQ.fresh.size) {   // a short flash on the notes that just changed
    SEQ.fresh.forEach(key => {
      const [ti, s] = key.split(".").map(Number);
      if (ti !== t0) return;
      box.querySelectorAll(`.steps32 [data-step="${s}"], .lane [data-lb="${s}"]`).forEach(el => {
        el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
      });
    });
    SEQ.fresh.clear();
  }
  seqRenderHeads();
}
function seqRenderSoon() { if (!seqRenderTimer) seqRenderTimer = setTimeout(() => { seqRenderTimer = null; seqRender(); }, 60); }

function seqRender() {
  const box = $("seq");
  if (!box) return;
  const has = !!S && S.fwNum >= 25 && !!SEQ.tracks;
  if (!has) {
    box.innerHTML = `<p class="small">${esc(S && S.fwNum < 25 ? t("seqOld") : link && S ? t("loading") : "")}</p>`;
    return;
  }
  if (SEQ.dragging || (box.contains(document.activeElement) && document.activeElement.matches("input[type=range]"))) {
    softRefresh();
    return;
  }
  const t0 = SEQ.sel, k = SEQ.tracks[t0];

  const overview = [0, 1, 2, 3].map(ti => {
    const tk = SEQ.tracks[ti];
    const cells = Array.from({ length: 32 }, (_, s) => `<i class="${s >= tk.length ? "o" : hitOf(ti, s) ? "h" : ""}" data-ov="${s}"></i>`).join("");
    const silent = (SEQ.mute & (1 << ti)) || (SEQ.solo && !(SEQ.solo & (1 << ti)));
    return `<div class="ovrow ${ti === t0 ? "sel" : ""} ${tk.mode ? "" : "off"} ${silent ? "silent" : ""}" data-tab="${ti}">
      <button class="ovname" data-tab="${ti}"><b>${esc(t("track"))} ${ti + 1}</b><span>${esc(t("tModes")[tk.mode])}</span><i class="dot"></i></button>
      <span class="ms"><button class="pill ${tk.midi ? "on" : ""}" data-midi="${ti}" ${tk.mode ? "" : "disabled"}>${esc(midiPill(tk))}</button>
        <button class="mbtn ${SEQ.mute & (1 << ti) ? "on" : ""}" data-mute="${ti}" title="${esc(t("mute"))}">M</button>
        <button class="sbtn ${SEQ.solo & (1 << ti) ? "on" : ""}" data-solo="${ti}" title="${esc(t("solo"))}">S</button></span>
      <div class="ovsteps">${cells}</div></div>`;
  }).join("");

  const chOpts = [...Array.from({ length: 16 }, (_, i) => [i, String(i + 1)]), [16, t("tAll")]];
  const head = `
    <div class="bar1">
      <div class="seg3">${t("tModes").map((m, i) => `<button data-setmode="${i}" aria-pressed="${i === k.mode}">${esc(m)}</button>`).join("")}</div>${helpBtn("sMode")}
      <label class="lab">${esc(t("tChannel"))}${helpBtn("sChannel")} ${selHtml('data-tk="channel"', chOpts, k.channel)}</label>
      <label class="lab">${esc(t("tScale"))}${helpBtn("sScale")} <select data-tk="scale">${scaleOptions(k.scale)}</select></label>
      <label class="lab">${esc(t("tRoot"))} ${selHtml('data-tk="root"', ROOTS, k.root)}</label>
      <label class="lab">${esc(t("tLow"))}${helpBtn("sLow")} <select data-low="1">${Array.from({ length: 73 }, (_, i) => i + 12).map(n =>
        `<option value="${n}" ${n === (k.low || 0) ? "selected" : ""}>${esc(noteLabel12(n))} · MIDI ${n}</option>`).join("")}</select></label>
      <span class="lab">${esc(t("tLength"))}${helpBtn("sLength")} ${stepper("length", k.length)}</span>
      ${k.mode === 2 ? `<span class="lab">${esc(t("tHits"))}${helpBtn("sHits")} ${stepper("hits", k.hits)}</span><span class="lab">${esc(t("tRot"))}${helpBtn("sRot")} ${stepper("rotation", k.rotation)}</span>` : ""}
    </div>
    ${k.mode && !k.midi ? `<p class="warn">${esc(t("midiOffHelp"))}</p>` : ""}
    ${isMicro(k.scale) ? `<p class="small">${esc(t("micro"))}</p>` : ""}
    ${k.scale === SCALES.custom ? `<div class="custom"><span class="small">${esc(t("custom"))}</span>${ROOTS.map((r, i) =>
      `<button data-cm="${i}" aria-pressed="${!!(SEQ.custom & (1 << i))}">${r}</button>`).join("")}</div>` : ""}`;

  const cells = Array.from({ length: 32 }, (_, s) => {
    const o = stepObj(SEQ.steps[t0][s]), inLen = s < k.length, hit = inLen && hitOf(t0, s);
    return `<button class="cell ${hit ? "hit" : ""} ${inLen ? "" : "out"}" data-step="${s}"><span class="n">${esc(playedLabel(playedNote(k, o.note)))}</span>
      <span class="m">${o.sub > 1 ? "×" + o.sub : ""}${o.ch ? " c" + (o.ch > 16 ? "A" : o.ch) : ""}${o.rand ? " ?" : ""}</span></button>`;
  }).join("");

  const lane = SEQ.lane;
  const laneTabs = LANES.map(l => `<button data-lane="${l}" aria-pressed="${l === lane}">${esc(t("lanes")[l])}</button>`).join("");
  const more = `
    <details class="more" ${SEQ.moreOpen ? "open" : ""}><summary>${esc(t("more"))}</summary>
      <div class="tform">
        ${fldR(t("tDiv"), selHtml('data-tk="division"', t("tDivs"), k.division), "sDiv")}
        ${fldR(t("tDir"), selHtml('data-tk="direction"', t("tDirs"), k.direction), "sDir")}
        ${fldR(t("tTranspose"), rngHtml("transpose", 0, 48, k.transpose, v => (v > 24 ? "+" : "") + (v - 24)), "sTranspose")}
        ${fldR(t("tProb"), rngHtml("prob", 0, 100, k.prob, v => v + " %"), "sTProb")}
        ${fldR(t("tRandNote"), rngHtml("randNote", 0, 100, k.randNote, v => v + " %"), "sRandNote")}
        ${fldR(t("tRandRange"), rngHtml("randRange", 0, 24, k.randRange, v => v), "sRandRange")}
        ${fldR(t("tHumanize"), rngHtml("humanize", 0, 40, k.humanize, v => v), "sHumanize")}
        ${fldR(t("tAccent"), rngHtml("accent", 0, 60, k.accent, v => v), "sAccent")}
      </div>
    </details>`;

  box.innerHTML = `
    <div class="ovhead small">${esc(t("ovHelp"))}${helpBtn("sMidi")}<button class="undo" data-undo="1" ${SEQ.undo.length ? "" : "disabled"}>${esc(t("undo"))}</button></div>
    <div class="ov">${overview}</div>
    <div class="ed ${k.mode ? "" : "muted"}">
      ${head}
      <div class="gen ${SEQ.gen[t0].amount ? "on" : ""}"><b>🌱 ${esc(t("gen"))}</b>${helpBtn("sGen")}
        <label class="lab">${esc(t("genAmount"))} <input type="range" min="0" max="100" step="5" value="${SEQ.gen[t0].amount}" data-gen="amount"><output>${SEQ.gen[t0].amount} %</output></label>
        <label class="lab">${esc(t("genRange"))} ${selHtml('data-gen="range"', t("genOct").map((o, i) => [i + 1, o]), SEQ.gen[t0].range)}</label>
        ${k.mode === 1 ? `<label class="chk"><input type="checkbox" data-gen="rhythm" ${SEQ.gen[t0].rhythm ? "checked" : ""}> ${esc(t("genRhythm"))}</label>` : ""}
        <button data-act="keep">📌 ${esc(t("genKeep"))}</button>
      </div>
      <div class="steps32">${cells}</div>
      <p class="small">${esc(k.mode === 2 ? t("stepsHelpEu") : t("stepsHelp"))}</p>
      <div class="lanetabs">${laneTabs}</div>
      ${lane === "cc" && !SEQ.cc[t0].on ? `<p class="warn">${esc(t("ccOff"))}</p>` : ""}
      <div class="lane" data-lanebox="${lane}">${laneBars()}</div>
      <div class="lanefoot"><span class="small">${esc(t("laneHelp")[lane])}</span>
        ${lane === "note" ? `<button data-oct="-1">${esc(t("octDown"))}</button><button data-oct="1">${esc(t("octUp"))}</button>` : ""}
        ${lane === "cc" ? `<label class="lab">${esc(t("ccNum"))} <input type="number" min="0" max="127" value="${SEQ.cc[t0].num}" data-ccnum="1"></label>
          <label class="chk"><input type="checkbox" data-ccon="1" ${SEQ.cc[t0].on ? "checked" : ""}> ${esc(t("ccOn"))}</label>` : ""}
      </div>
      <div class="tools">
        <button data-act="invnotes">🎲 ${esc(t("invNotes"))}</button>
        <button data-act="invrhythm">🎲 ${esc(t("invRhythm"))}</button>
        ${k.mode === 2 ? `<button data-act="tosteps">${esc(t("toSteps"))}</button>` : ""}
        ${k.mode === 1 ? `<button data-act="fill">${esc(t("sFill"))}</button><button data-act="clear">${esc(t("sClear"))}</button>` : ""}
        <button data-act="half">${esc(t("sCopyHalf"))}</button>
        <span class="copyto">${esc(t("copyTo"))} <select data-copyto="1">${[0, 1, 2, 3].filter(i => i !== t0).map(i => `<option value="${i}">${esc(t("track"))} ${i + 1}</option>`).join("")}</select>
          <button data-act="copy">${esc(t("copyGo"))}</button></span>
      </div>
      ${more}
    </div>`;
  seqRenderHeads();
}
const fldR = (label, html, help) => `<label class="fld"><span>${esc(label)}${help ? helpBtn(help) : ""}</span>${html}</label>`;
const rngHtml = (k, min, max, v, fmt) => `<input type="range" min="${min}" max="${max}" value="${v}" data-tk="${k}" data-fmt="${k}"><output>${esc(fmt(v))}</output>`;
const FMT = { transpose: v => (v > 24 ? "+" : "") + (v - 24), prob: v => v + " %", randNote: v => v + " %" };

// Bars of the current lane: value in 0..1 and a label, for each of the 32 steps.
function laneValue(t, s) {
  const k = SEQ.tracks[t], o = stepObj(SEQ.steps[t][s]);
  switch (SEQ.lane) {
    case "note": {
      const win = noteWindow(t), p = playedNote(k, o.note), key = p.note * 1000 + p.cents;
      let i = win.findIndex(c => c.p.note * 1000 + c.p.cents === key);
      const above = i < 0 && win.length && p.note > win[win.length - 1].p.note;
      if (i < 0) i = above ? win.length - 1 : 0;
      return { v: win.length > 1 ? (i + 1) / win.length : 1, label: playedLabel(p), out: i < 0 || win[i].p.note !== p.note ? (above ? "▲" : "▼") : "" };
    }
    case "vel": return { v: o.vel / 127, label: o.vel };
    case "prob": return { v: PROB_LEVELS[o.prob] / 100, label: PROB_LEVELS[o.prob] + "%" };
    case "sub": return { v: o.sub / 4, label: "×" + o.sub };
    case "len": return { v: LEN_PCT[o.len] / 100, label: LEN_PCT[o.len] + "%" };
    case "ch": return { v: (o.ch + 1) / 18, label: o.ch === 0 ? "P" : o.ch > 16 ? "A" : o.ch };
    case "rand": return { v: o.rand ? 1 : 0.06, label: o.rand ? "?" : "" };
    case "cc": { const v = SEQ.cc[t].vals[s]; return { v: Math.max(0.03, v / 127), label: v }; }
  }
}
function laneBars() {
  const t0 = SEQ.sel, L = SEQ.tracks[t0].length;
  return Array.from({ length: 32 }, (_, s) => {
    const lv = laneValue(t0, s);
    return `<div class="lb ${s >= L ? "o" : ""} ${hitOf(t0, s) ? "h" : ""}" data-lb="${s}"><i style="height:${Math.round(lv.v * 100)}%"></i><span>${esc(String(lv.label))}${lv.out || ""}</span></div>`;
  }).join("");
}
function refreshLane() {
  const lane = $("seq").querySelector(".lane");
  if (!lane) return;
  const k = SEQ.tracks[SEQ.sel];
  lane.querySelectorAll("[data-lb]").forEach(el => {
    const s = +el.dataset.lb, lv = laneValue(SEQ.sel, s);
    el.querySelector("i").style.height = Math.round(lv.v * 100) + "%";
    el.querySelector("span").textContent = String(lv.label) + (lv.out || "");
  });
  $("seq").querySelectorAll(".steps32 .cell").forEach(c => {
    const o = stepObj(SEQ.steps[SEQ.sel][+c.dataset.step]);
    c.querySelector(".n").textContent = playedLabel(playedNote(k, o.note));
    c.querySelector(".m").textContent = `${o.sub > 1 ? "×" + o.sub : ""}${o.ch ? " c" + (o.ch > 16 ? "A" : o.ch) : ""}${o.rand ? " ?" : ""}`;
  });
}

// Set a step from a lane position (y = 0 at the bottom, 1 at the top).
function laneSet(s, y) {
  const t0 = SEQ.sel, k = SEQ.tracks[t0], o = stepObj(SEQ.steps[t0][s]);
  y = Math.max(0, Math.min(1, y));
  switch (SEQ.lane) {
    case "note": { const win = noteWindow(t0); if (!win.length) return; o.note = win[Math.min(win.length - 1, Math.floor(y * win.length))].raw; break; }
    case "vel": o.vel = Math.max(1, Math.round(y * 127)); break;
    case "prob": { const pct = y * 100; let best = 0; PROB_LEVELS.forEach((p, i) => { if (Math.abs(p - pct) < Math.abs(PROB_LEVELS[best] - pct)) best = i; }); o.prob = best; break; }
    case "sub": o.sub = Math.min(4, Math.max(1, Math.ceil(y * 4))); break;
    case "len": o.len = Math.min(3, Math.floor(y * 4)); break;
    case "ch": o.ch = Math.min(17, Math.floor(y * 18)); break;
    case "rand": o.rand = y > 0.5; break;
    case "cc": SEQ.cc[t0].vals[s] = Math.round(y * 127); seqSendCCStep(t0, s); return;
  }
  SEQ.steps[t0][s] = stepBytes(o);
  seqSendStep(t0, s);
}

function seqRenderHeads() {
  const box = $("seq");
  if (!box || !SEQ.tracks) return;
  const now = performance.now();
  box.querySelectorAll(".ovrow").forEach(row => {
    const ti = +row.dataset.tab, h = SEQ.heads[ti];
    row.querySelectorAll("[data-ov]").forEach(c => c.classList.toggle("p", +c.dataset.ov === h));
    row.querySelector(".dot").classList.toggle("lit", now - SEQ.playedAt[ti] < 120);
  });
  const h = SEQ.heads[SEQ.sel];
  box.querySelectorAll(".steps32 .cell").forEach(c => c.classList.toggle("head", +c.dataset.step === h));
  box.querySelectorAll(".lane [data-lb]").forEach(c => c.classList.toggle("head", +c.dataset.lb === h));
}

// ---------------------------------------------------------------- editing --
function setTrack(key, v, rerender = true, snapshot = true) {
  if (snapshot) pushUndo();
  const k = SEQ.tracks[SEQ.sel];
  k[key] = v;
  k.length = Math.max(1, Math.min(32, k.length));
  k.hits = Math.max(0, Math.min(k.hits, k.length));
  k.rotation = Math.max(0, Math.min(k.rotation, k.length - 1));
  if (key === "scale" || key === "root" || key === "transpose") SEQ.win[SEQ.sel] = null;
  seqSendTrack(SEQ.sel);
  if (rerender) seqRender();
}

function seqBind() {
  const box = $("seq");
  box.addEventListener("click", e => {
    const el = e.target.closest("button");
    if (!el) {   // a click anywhere on a track row selects it
      const row = e.target.closest(".ovrow");
      if (row) { SEQ.sel = +row.dataset.tab; seqRender(); }
      return;
    }
    if (el.disabled) return;
    const d = el.dataset;
    if (d.midi != null) { SEQ.sel = +d.midi; setTrack("midi", SEQ.tracks[SEQ.sel].midi ? 0 : 1); return; }
    if (d.tab != null) { SEQ.sel = +d.tab; seqRender(); return; }
    if (d.setmode != null) { setTrack("mode", +d.setmode); return; }
    if (d.inc) { const [key, n] = d.inc.split(":"); setTrack(key, SEQ.tracks[SEQ.sel][key] + +n); return; }
    if (d.lane) { SEQ.lane = d.lane; seqRender(); return; }
    if (d.oct) { SEQ.win[SEQ.sel] = Math.max(0, Math.min(96, (SEQ.win[SEQ.sel] || 48) + 12 * +d.oct)); refreshLane(); return; }
    if (d.undo) { seqUndo(); return; }
    if (d.mute != null) { SEQ.mute ^= 1 << +d.mute; seqSendMute(); seqRender(); return; }
    if (d.solo != null) { SEQ.solo ^= 1 << +d.solo; seqSendMute(); seqRender(); return; }
    if (d.cm != null) { pushUndo(); SEQ.custom ^= 1 << +d.cm; if (!SEQ.custom) SEQ.custom = 1; send(enc(0x1B, SEQ.custom & 0x7F, SEQ.custom >> 7)); seqRender(); return; }
    if (d.step != null) {
      const k = SEQ.tracks[SEQ.sel], s = +d.step;
      if (k.mode !== 1 || s >= k.length) return;
      pushUndo();
      const o = stepObj(SEQ.steps[SEQ.sel][s]); o.on = !o.on;
      SEQ.steps[SEQ.sel][s] = stepBytes(o); seqSendStep(SEQ.sel, s); seqRender();
      return;
    }
    if (d.act) {
      const t0 = SEQ.sel, k = SEQ.tracks[t0];
      pushUndo();
      if (d.act === "copy") {
        const to = +box.querySelector("[data-copyto]").value, keep = { channel: SEQ.tracks[to].channel, midi: SEQ.tracks[to].midi };
        SEQ.tracks[to] = Object.assign({}, k, keep);
        SEQ.steps[to] = SEQ.steps[t0].map(b => b.slice());
        SEQ.cc[to] = { num: SEQ.cc[t0].num, on: SEQ.cc[t0].on, vals: SEQ.cc[t0].vals.slice() };
        SEQ.low[to] = SEQ.tracks[to].low; seqSendLow(to);
        SEQ.gen[to] = Object.assign({}, SEQ.gen[t0]); seqSendGen(to);
        seqSendTrack(to); seqSendCCTrack(to);
        for (let s = 0; s < 32; s++) { seqSendStep(to, s); seqSendCCStep(to, s); }
        log(tf("copied", { a: t0 + 1, b: to + 1 }));
        SEQ.sel = to; SEQ.win[to] = null; seqRender();
        return;
      }
      if (d.act === "keep") {   // the notes the box reinvented become the saved ones
        SEQ.undo.pop();
        for (let s = 0; s < 32; s++) seqSendStep(t0, s);
        log(tf("genKept", { n: t0 + 1 }));
        return;
      }
      if (d.act === "tosteps") {
        for (let s = 0; s < 32; s++) { const o = stepObj(SEQ.steps[t0][s]); o.on = s < k.length && hitOf(t0, s); SEQ.steps[t0][s] = stepBytes(o); seqSendStep(t0, s); }
        setTrack("mode", 1, true, false);
        return;
      }
      if (d.act === "invnotes") {
        const win = noteWindow(t0);
        let i = Math.floor(win.length / 2);
        for (let s = 0; s < 32; s++) {   // a random walk in the scale: melodic rather than jumpy
          i = Math.max(0, Math.min(win.length - 1, i + [-2, -1, -1, 0, 1, 1, 2, 3, -3][Math.floor(Math.random() * 9)]));
          const o = stepObj(SEQ.steps[t0][s]); o.note = win[i].raw; SEQ.steps[t0][s] = stepBytes(o); seqSendStep(t0, s);
        }
        seqRender();
        return;
      }
      if (d.act === "invrhythm") {
        if (k.mode === 2) { setTrack("hits", 2 + Math.floor(Math.random() * (k.length - 2)), false, false); setTrack("rotation", Math.floor(Math.random() * k.length), true, false); return; }
        for (let s = 0; s < 32; s++) {
          const o = stepObj(SEQ.steps[t0][s]);
          o.on = s % 4 === 0 ? Math.random() < 0.8 : Math.random() < 0.35;
          SEQ.steps[t0][s] = stepBytes(o); seqSendStep(t0, s);
        }
        seqRender();
        return;
      }
      for (let s = 0; s < 32; s++) {
        if (d.act === "half") { if (s >= 16) { SEQ.steps[t0][s] = SEQ.steps[t0][s - 16].slice(); SEQ.cc[t0].vals[s] = SEQ.cc[t0].vals[s - 16]; seqSendCCStep(t0, s); } else continue; }
        else { const o = stepObj(SEQ.steps[t0][s]); o.on = d.act === "fill"; SEQ.steps[t0][s] = stepBytes(o); }
        seqSendStep(t0, s);
      }
      seqRender();
    }
  });
  box.addEventListener("change", e => {
    const el = e.target;
    if (el.dataset.tk && el.tagName === "SELECT") setTrack(el.dataset.tk, +el.value);
    if (el.dataset.gen === "amount") {
      if (!SEQ.sliding) pushUndo();
      SEQ.sliding = true;
      SEQ.gen[SEQ.sel].amount = +el.value; el.nextElementSibling.textContent = el.value + " %";
      seqSendGen(SEQ.sel);
      return;
    }
    if (el.dataset.tk && el.type === "range") { SEQ.sliding = false; seqRender(); }
    if (el.dataset.gen) {
      SEQ.sliding = false;
      const g = SEQ.gen[SEQ.sel], key = el.dataset.gen;
      if (key !== "amount") pushUndo();
      g[key] = el.type === "checkbox" ? (el.checked ? 1 : 0) : +el.value;
      seqSendGen(SEQ.sel); seqRender();
    }
    if (el.dataset.low) {
      pushUndo();
      const t0 = SEQ.sel, v = +el.value;
      SEQ.low[t0] = v; SEQ.tracks[t0].low = v; SEQ.win[t0] = null;
      seqSendLow(t0); seqRender();
    }
    if (el.dataset.ccnum) { pushUndo(); SEQ.cc[SEQ.sel].num = Math.max(0, Math.min(127, Math.round(+el.value) || 0)); seqSendCCTrack(SEQ.sel); seqRender(); }
    if (el.dataset.ccon) { pushUndo(); SEQ.cc[SEQ.sel].on = el.checked ? 1 : 0; seqSendCCTrack(SEQ.sel); seqRender(); }
  });
  box.addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.tk && el.type === "range") {
      const v = +el.value, f = FMT[el.dataset.tk] || (x => x);
      el.nextElementSibling.textContent = f(v);
      setTrack(el.dataset.tk, v, false, !SEQ.sliding);
      SEQ.sliding = true;
    }
  });
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z" && !e.target.matches("input, select, textarea")) {
      if (SEQ.tracks) { e.preventDefault(); seqUndo(); }
    }
  });
  box.addEventListener("toggle", e => { if (e.target.matches("details.more")) SEQ.moreOpen = e.target.open; }, true);

  // drawing on the lanes
  const paint = e => {
    const lane = box.querySelector(".lane");
    const r = lane.getBoundingClientRect();
    const s = Math.max(0, Math.min(31, Math.floor((e.clientX - r.left) / r.width * 32)));
    const y = 1 - (e.clientY - r.top) / r.height;
    if (SEQ.lane === "rand") { if (SEQ.lastPainted === s) return; laneSet(s, SEQ.randValue); }
    else laneSet(s, y);
    SEQ.lastPainted = s;
    refreshLane();
  };
  box.addEventListener("pointerdown", e => {
    const lane = e.target.closest(".lane");
    if (!lane) return;
    e.preventDefault();
    SEQ.dragging = true; SEQ.lastPainted = -1;
    pushUndo();
    if (SEQ.lane === "rand") {
      const r = lane.getBoundingClientRect(), s = Math.max(0, Math.min(31, Math.floor((e.clientX - r.left) / r.width * 32)));
      SEQ.randValue = stepObj(SEQ.steps[SEQ.sel][s]).rand ? 0 : 1;
    }
    lane.setPointerCapture(e.pointerId);
    paint(e);
  });
  box.addEventListener("pointermove", e => { if (SEQ.dragging) paint(e); });
  const end = () => { if (SEQ.dragging) { SEQ.dragging = false; seqRender(); } };
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
}

// ------------------------------------------------------------------- demo --
// A simplified copy of the firmware's playback, for the demo mode.
function seqDemoTick(st, now) {
  if (!SEQ.tracks) return;
  let moved = false;
  SEQ.tracks.forEach((k, t) => {
    if (!k.mode) return;
    const d = TRACK_DIV24[k.division];
    if (st % d) return;
    const count = st / d, L = k.length;
    let pos = count % L;
    if (k.direction === 1) pos = L - 1 - pos;
    if (k.direction === 2 && L > 1) { const p = count % (2 * L - 2); pos = p < L ? p : 2 * L - 2 - p; }
    if (k.direction === 3) pos = Math.floor(Math.random() * L);
    SEQ.heads[t] = pos; moved = true;
    if (pos === 0 && count > 0 && SEQ.gen[t].amount) demoReinvent(t);
    const o = stepObj(SEQ.steps[t][pos]);
    const audible = !(SEQ.mute & (1 << t)) && (!SEQ.solo || (SEQ.solo & (1 << t)));
    if (audible && hitOf(t, pos) && Math.random() * 100 < k.prob && Math.random() < PROB_LEVELS[o.prob] / 100) {
      SEQ.playedAt[t] = now;
      if (k.midi) clock.midiAt = now;
    }
  });
  if (moved) seqRenderHeads();
}

// The firmware's reinvent(), for the demo.
function demoReinvent(t) {
  const k = SEQ.tracks[t], g = SEQ.gen[t];
  const base = Math.max(0, (k.low || 0) - (k.transpose - 24)), top = Math.min(127, base + 12 * g.range);
  let walk = SEQ.steps[t][0][0] & 0x7F;
  if (walk < base || walk > top) walk = Math.floor((base + top) / 2);
  for (let s = 0; s < k.length; s++) {
    const b = SEQ.steps[t][s];
    if (Math.random() * 100 < g.amount) {
      walk += Math.floor(Math.random() * 9) - 4;
      if (walk < base) walk = 2 * base - walk;
      if (walk > top) walk = 2 * top - walk;
      walk = Math.max(base, walk);
      const before = b[0];
      b[0] = (b[0] & 0x80) | walk;
      if (g.rhythm && k.mode === 1 && Math.random() < 0.5) b[0] ^= 0x80;
      if (b[0] !== before) (SEQ.fresh = SEQ.fresh || new Set()).add(`${t}.${s}`);
    } else walk = b[0] & 0x7F;
  }
  seqSoftSoon();
}

// jacks in mode "Track n": lit while the track's note is recent
function trackGateOn(t, now) {
  if (!SEQ.tracks || !SEQ.tracks[t]) return false;
  return now - SEQ.playedAt[t] < 90;
}
