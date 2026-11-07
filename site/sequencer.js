"use strict";
// clockbox screen: the 4-track sequencer (firmware 2.5+). Uses the globals of screen.js.

const SEQ_T = {
  fr: {
    seqTitle: "Séquenceur",
    seqHelp: "4 pistes de 32 pas, en pas à pas ou en rythme euclidien. Chaque piste joue des notes MIDI dans une gamme, et un jack peut suivre ses notes (mode « Piste »). Clique un pas pour le régler ; double-clic pour l'allumer ou l'éteindre.",
    track: "Piste", tMode: "Mode", tModes: ["Éteinte", "Pas à pas", "Euclidien"],
    tLength: "Longueur", tHits: "Coups", tRot: "Rotation", tDiv: "Durée d'un pas", tDivs: ["1/16", "1/8", "1/16 triolet", "1/4", "1/32"],
    tDir: "Sens", tDirs: ["Avant", "Arrière", "Aller-retour", "Hasard"],
    tMidi: "Jouer en MIDI", tChannel: "Canal", tAll: "ALL (16 canaux)", tScale: "Gamme", tRoot: "Tonique", tTranspose: "Transposition",
    tProb: "Probabilité de la piste", tRandNote: "Notes aléatoires", tRandRange: "Étendue de l'aléatoire", tHumanize: "Humanisation (vélocité)", tAccent: "Accent (1er coup)",
    custom: "Gamme CUSTOM : clique les notes à garder",
    gOut: "Sortie", gRhythm: "Rythme", gNotes: "Notes", gVary: "Variations",
    midiOff: "Cette piste ne joue pas en MIDI : coche « Jouer en MIDI » et choisis le canal de ton synthé.",
    midiOn: "Joue sur le canal {c}.", midiAll: "Joue sur les 16 canaux.",
    noteHelp: "Seules les notes de la gamme sont proposées (tonique et transposition comprises).",
    down: "− note", up: "+ note",
    step: "Pas", sOn: "Actif", sNote: "Note", sVel: "Vélocité", sChannel: "Canal", sTrackCh: "celui de la piste",
    sProb: "Probabilité", sSub: "Sous-pas", sLen: "Longueur de note", sRand: "Note aléatoire",
    sClear: "Effacer la piste", sFill: "Tout allumer", sCopy: "Copier ce pas partout",
    semis: "demi-tons", micro: "microtonale (pitch bend)",
    seqOld: "Le séquenceur demande le firmware 2.5 : mets ta boîte à jour plus bas.",
    loading: "Lecture de la séquence…",
  },
  en: {
    seqTitle: "Sequencer",
    seqHelp: "4 tracks of 32 steps, step by step or Euclidean. Each track plays MIDI notes in a scale, and a jack can follow its notes (mode “Track”). Click a step to edit it; double-click to turn it on or off.",
    track: "Track", tMode: "Mode", tModes: ["Off", "Steps", "Euclidean"],
    tLength: "Length", tHits: "Hits", tRot: "Rotation", tDiv: "Step length", tDivs: ["1/16", "1/8", "1/16 triplet", "1/4", "1/32"],
    tDir: "Direction", tDirs: ["Forward", "Backward", "Ping-pong", "Random"],
    tMidi: "Play MIDI", tChannel: "Channel", tAll: "ALL (16 channels)", tScale: "Scale", tRoot: "Root", tTranspose: "Transpose",
    tProb: "Track probability", tRandNote: "Random notes", tRandRange: "Random range", tHumanize: "Humanize (velocity)", tAccent: "Accent (first hit)",
    custom: "CUSTOM scale: click the notes to keep",
    gOut: "Output", gRhythm: "Rhythm", gNotes: "Notes", gVary: "Variations",
    midiOff: "This track does not play MIDI: tick “Play MIDI” and pick your synth's channel.",
    midiOn: "Plays on channel {c}.", midiAll: "Plays on all 16 channels.",
    noteHelp: "Only the notes of the scale are offered (root and transpose included).",
    down: "− note", up: "+ note",
    step: "Step", sOn: "On", sNote: "Note", sVel: "Velocity", sChannel: "Channel", sTrackCh: "the track's",
    sProb: "Probability", sSub: "Substeps", sLen: "Note length", sRand: "Random note",
    sClear: "Clear the track", sFill: "Turn all on", sCopy: "Copy this step everywhere",
    semis: "semitones", micro: "microtonal (pitch bend)",
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
};

function defaultSequence() {
  const tr = [
    [2, 16, 5, 0, 0, 9, 1, 0, 0, 24, 0, 100, 0, 12, 0, 20],
    [2, 8, 3, 0, 0, 9, 1, 0, 0, 24, 0, 100, 0, 12, 0, 20],
    [2, 16, 7, 0, 0, 9, 1, 0, 0, 24, 0, 80, 0, 12, 10, 20],
    [1, 16, 4, 0, 0, 0, 1, 1, 0, 24, 0, 100, 0, 12, 0, 0]];
  const line = [36, 0, 0, 39, 0, 0, 43, 0, 46, 0, 0, 43, 0, 39, 0, 0];
  SEQ.tracks = tr.map(a => Object.fromEntries(TRACK_KEYS.map((k, i) => [k, a[i]])));
  SEQ.steps = [36, 38, 42, 48].map((n, t) => Array.from({ length: 32 }, (_, s) => {
    if (t < 3) return [n, [110, 100, 80][t], 0, 4];
    const v = line[s % 16];
    return [(v ? 0x80 : 0) | (v || 48), 100, 0, 4];
  }));
  SEQ.custom = 0xFFF;
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
    return { note: Math.max(0, n), cents: 0 };
  }
  const period = Math.round(sc.period * 10), base = (60 + k.root) * 1000, t = n * 1000 - base;
  const oct = Math.floor(t / period), rem = t - oct * period;
  let best = 0, dist = rem;
  if (period - rem < dist) { best = period; dist = period - rem; }
  for (const c of sc.cents) { const d = Math.round(c * 10), x = Math.abs(d - rem); if (x < dist) { best = d; dist = x; } }
  const pitch = base + oct * period + best, out = Math.max(0, Math.min(127, Math.floor((pitch + 500) / 1000)));
  return { note: out, cents: Math.round((pitch - out * 1000) / 10) };
}
const playedLabel = p => noteLabel12(p.note) + (p.cents ? (p.cents > 0 ? " +" : " ") + p.cents + "¢" : "");

// Distinct notes of the track's scale between C0 and C7, with a raw value that produces each.
function scaleChoices(k) {
  const seen = new Map();
  for (let raw = 0; raw < 128; raw++) {
    const p = playedNote(k, raw);
    if (p.note < 24 || p.note > 108) continue;
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
  SEQ.tracks[t] = Object.fromEntries(TRACK_KEYS.map((k, i) => [k, d[1 + i]]));
  seqRender();
}
function seqOnStep(d) {
  if (!SEQ.steps) defaultSequence();
  const [t, s] = d;
  if (t > 3 || s > 31 || SEQ.timers[`s${t}.${s}`]) return;
  SEQ.steps[t][s] = [0, 1, 2, 3].map(i => d[2 + i] | (((d[6] >> i) & 1) << 7));
  if (t === 3 && s === 31) { SEQ.loaded = true; log("séquence lue"); }
  seqRenderSoon();
}
function seqOnCustom(d) { SEQ.custom = (d[0] | (d[1] << 7)) & 0xFFF; seqRenderSoon(); }
function seqOnPlayhead(d, now) {
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
async function seqSendAll() {   // after an import: everything, paced
  for (let t = 0; t < 4; t++) { await send(enc(0x19, t, ...TRACK_KEYS.map(k => SEQ.tracks[t][k]))); await sleep(15); }
  await send(enc(0x1B, SEQ.custom & 0x7F, SEQ.custom >> 7)); await sleep(15);
  for (let t = 0; t < 4; t++) for (let s = 0; s < 32; s++) {
    const b = SEQ.steps[t][s], hi = b.reduce((h, x, i) => h | ((x >> 7) << i), 0);
    await send(enc(0x18, t, s, ...b.map(x => x & 0x7F), hi)); await sleep(12);
  }
}

// ---------------------------------------------------------------- editing --
function editTrack(fn) {
  const k = SEQ.tracks[SEQ.sel];
  fn(k);
  k.length = Math.max(1, Math.min(32, k.length));
  k.hits = Math.min(k.hits, k.length);
  k.rotation = Math.min(k.rotation, k.length - 1);
  seqSendTrack(SEQ.sel);
  seqRender();
}
function editStep(s, fn) {
  const o = stepObj(SEQ.steps[SEQ.sel][s]);
  fn(o);
  o.note = Math.max(0, Math.min(127, o.note)); o.vel = Math.max(1, Math.min(127, o.vel));
  SEQ.steps[SEQ.sel][s] = stepBytes(o);
  seqSendStep(SEQ.sel, s);
  seqRender();
}

// -------------------------------------------------------------- rendering --
const fld = (label, html) => `<label class="fld"><span>${esc(label)}</span>${html}</label>`;
const sel = (k, opts, v) => `<select data-tk="${k}">${opts.map((o, i) => {
  const [val, label] = Array.isArray(o) ? o : [i, o];
  return `<option value="${val}" ${val === v ? "selected" : ""}>${esc(label)}</option>`;
}).join("")}</select>`;
const rng = (k, min, max, v, suffix = "") => `<input type="range" min="${min}" max="${max}" value="${v}" data-tk="${k}"><output>${v}${suffix}</output>`;

function scaleOptions(v) {
  let html = "", fam = -1;
  for (const i of SCALES.order) {
    const sc = SCALES.scales[i];
    if (sc.family !== fam) { if (fam >= 0) html += "</optgroup>"; fam = sc.family; html += `<optgroup label="${esc(SCALES.families[fam])}">`; }
    html += `<option value="${i}" ${i === v ? "selected" : ""}>${esc(sc.name)}</option>`;
  }
  return html + "</optgroup>";
}

let seqRenderTimer = null;
function seqRenderSoon() { if (!seqRenderTimer) seqRenderTimer = setTimeout(() => { seqRenderTimer = null; seqRender(); }, 60); }

function seqRender() {
  const box = $("seq");
  if (!box) return;
  const has = !!S && (S.fwNum >= 25) && !!SEQ.tracks;
  if (!has) {
    box.innerHTML = `<p class="small">${esc(S && S.fwNum < 25 ? t("seqOld") : link && S ? t("loading") : "")}</p>`;
    return;
  }
  if (box.contains(document.activeElement) && document.activeElement.matches("input[type=range], input[type=number]") && box.dataset.ready) {
    seqRenderHeads();   // do not rebuild under the user's fingers
    return;
  }
  const k = SEQ.tracks[SEQ.sel], o = stepObj(SEQ.steps[SEQ.sel][SEQ.step]);
  const tabs = [0, 1, 2, 3].map(i => {
    const tk = SEQ.tracks[i];
    return `<button class="ttab ${i === SEQ.sel ? "on" : ""}" data-tab="${i}"><b>${esc(t("track"))} ${i + 1}</b><span>${esc(t("tModes")[tk.mode])}${tk.midi && tk.mode ? " · " + (tk.channel === 16 ? "ALL" : "ch " + (tk.channel + 1)) : ""}</span><i class="dot"></i></button>`;
  }).join("");
  const chOpts = [...Array.from({ length: 16 }, (_, i) => [i, String(i + 1)]), [16, t("tAll")]];
  const microNote = isMicro(k.scale) ? `<p class="small">${esc(t("micro"))}</p>` : "";
  const customRow = k.scale === SCALES.custom ? `<div class="custom"><span class="small">${esc(t("custom"))}</span>${ROOTS.map((r, i) =>
    `<button data-cm="${i}" aria-pressed="${!!(SEQ.custom & (1 << i))}">${r}</button>`).join("")}</div>` : "";
  const status = !k.mode ? "" : !k.midi ? `<p class="warn">${esc(t("midiOff"))}</p>`
    : `<p class="ok">${esc(k.channel === 16 ? t("midiAll") : tf("midiOn", { c: k.channel + 1 }))}</p>`;
  const form = `
    <div class="tform">
      <div class="grp2"><h4>${esc(t("gOut"))}</h4>
        ${fld(t("tMode"), sel("mode", t("tModes"), k.mode))}
        <label class="chk big"><input type="checkbox" data-tk="midi" ${k.midi ? "checked" : ""}> ${esc(t("tMidi"))}</label>
        ${fld(t("tChannel"), sel("channel", chOpts, k.channel))}
        ${status}
      </div>
      <div class="grp2"><h4>${esc(t("gRhythm"))}</h4>
        ${fld(t("tLength"), rng("length", 1, 32, k.length))}
        ${k.mode === 2 ? fld(t("tHits"), rng("hits", 0, k.length, k.hits)) + fld(t("tRot"), rng("rotation", 0, k.length - 1, k.rotation)) : ""}
        ${fld(t("tDiv"), sel("division", t("tDivs"), k.division))}
        ${fld(t("tDir"), sel("direction", t("tDirs"), k.direction))}
      </div>
      <div class="grp2"><h4>${esc(t("gNotes"))}</h4>
        ${fld(t("tScale"), `<select data-tk="scale">${scaleOptions(k.scale)}</select>`)}
        ${fld(t("tRoot"), sel("root", ROOTS, k.root))}
        ${fld(t("tTranspose"), rng("transpose", 0, 48, k.transpose).replace(`>${k.transpose}<`, `>${k.transpose - 24 > 0 ? "+" : ""}${k.transpose - 24}<`))}
      </div>
      <div class="grp2"><h4>${esc(t("gVary"))}</h4>
        ${fld(t("tProb"), rng("prob", 0, 100, k.prob, " %"))}
        ${fld(t("tRandNote"), rng("randNote", 0, 100, k.randNote, " %"))}
        ${fld(t("tRandRange"), rng("randRange", 0, 24, k.randRange))}
        ${fld(t("tHumanize"), rng("humanize", 0, 40, k.humanize))}
        ${fld(t("tAccent"), rng("accent", 0, 60, k.accent))}
      </div>
    </div>${microNote}${customRow}`;
  const cells = Array.from({ length: 32 }, (_, s) => {
    const so = stepObj(SEQ.steps[SEQ.sel][s]), inLen = s < k.length, hit = inLen && hitOf(SEQ.sel, s);
    return `<button class="cell ${hit ? "hit" : ""} ${inLen ? "" : "out"} ${s === SEQ.step ? "sel" : ""}" data-step="${s}"
      style="--p:${PROB_LEVELS[so.prob] / 100}"><span class="n">${esc(playedLabel(playedNote(k, so.note)))}</span>
      <span class="m">${so.sub > 1 ? "×" + so.sub : ""}${so.ch ? " c" + (so.ch > 16 ? "A" : so.ch) : ""}${so.rand ? " ?" : ""}</span></button>`;
  }).join("");
  const stepChOpts = [[0, t("sTrackCh")], ...Array.from({ length: 16 }, (_, i) => [i + 1, String(i + 1)]), [17, "ALL"]];
  const insp = `
    <div class="insp">
      <b>${esc(t("step"))} ${SEQ.step + 1}</b>
      ${k.mode === 1 ? `<label class="chk"><input type="checkbox" data-sk="on" ${o.on ? "checked" : ""}> ${esc(t("sOn"))}</label>` : ""}
      ${fld(t("sNote"), noteSelect(k, o.note))}
      <div class="nbtns"><button data-nudge="-1">${esc(t("down"))}</button><button data-nudge="1">${esc(t("up"))}</button><span class="small">${esc(t("noteHelp"))}</span></div>
      ${fld(t("sVel"), `<input type="range" min="1" max="127" value="${o.vel}" data-sk="vel"><output>${o.vel}</output>`)}
      ${fld(t("sChannel"), `<select data-sk="ch">${stepChOpts.map(([v, l]) => `<option value="${v}" ${v === o.ch ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`)}
      ${fld(t("sProb"), `<select data-sk="prob">${PROB_LEVELS.map((p, i) => `<option value="${i}" ${i === o.prob ? "selected" : ""}>${p} %</option>`).join("")}</select>`)}
      ${fld(t("sSub"), `<select data-sk="sub">${[1, 2, 3, 4].map(n => `<option value="${n}" ${n === o.sub ? "selected" : ""}>${n}</option>`).join("")}</select>`)}
      ${fld(t("sLen"), `<select data-sk="len">${LEN_PCT.map((p, i) => `<option value="${i}" ${i === o.len ? "selected" : ""}>${p} %</option>`).join("")}</select>`)}
      <label class="chk"><input type="checkbox" data-sk="rand" ${o.rand ? "checked" : ""}> ${esc(t("sRand"))}</label>
      <div class="sbtns">
        <button data-act="copy">${esc(t("sCopy"))}</button>
        ${k.mode === 1 ? `<button data-act="fill">${esc(t("sFill"))}</button><button data-act="clear">${esc(t("sClear"))}</button>` : ""}
      </div>
    </div>`;
  box.innerHTML = `<div class="ttabs">${tabs}</div>${form}<div class="grid">${cells}</div>${insp}`;
  box.dataset.ready = "1";
  seqRenderHeads();
}

function seqRenderHeads() {
  const box = $("seq");
  if (!box || !SEQ.tracks) return;
  const now = performance.now();
  box.querySelectorAll(".cell").forEach(c => c.classList.toggle("head", +c.dataset.step === SEQ.heads[SEQ.sel]));
  box.querySelectorAll(".ttab").forEach(b => b.querySelector(".dot").classList.toggle("lit", now - SEQ.playedAt[+b.dataset.tab] < 120));
}

function noteSelect(k, raw) {
  const cur = playedNote(k, raw), key = cur.note * 1000 + cur.cents;
  return `<select data-sk="note">${scaleChoices(k).map(c =>
    `<option value="${c.raw}" ${c.p.note * 1000 + c.p.cents === key ? "selected" : ""}>${esc(playedLabel(c.p))}</option>`).join("")}</select>`;
}

// --------------------------------------------------------------- handlers --
function seqBind() {
  const box = $("seq");
  box.addEventListener("click", e => {
    const tab = e.target.closest("[data-tab]");
    if (tab) { SEQ.sel = +tab.dataset.tab; SEQ.step = 0; box.dataset.ready = ""; seqRender(); return; }
    const cell = e.target.closest("[data-step]");
    if (cell) { SEQ.step = +cell.dataset.step; box.dataset.ready = ""; seqRender(); return; }
    const cm = e.target.closest("[data-cm]");
    if (cm) { SEQ.custom ^= 1 << +cm.dataset.cm; if (!SEQ.custom) SEQ.custom = 1; send(enc(0x1B, SEQ.custom & 0x7F, SEQ.custom >> 7)); seqRender(); return; }
    const nudge = e.target.closest("[data-nudge]");
    if (nudge) {
      const k = SEQ.tracks[SEQ.sel], list = scaleChoices(k), o = stepObj(SEQ.steps[SEQ.sel][SEQ.step]);
      const cur = playedNote(k, o.note), key = cur.note * 1000 + cur.cents;
      let i = list.findIndex(c => c.p.note * 1000 + c.p.cents === key);
      i = Math.max(0, Math.min(list.length - 1, (i < 0 ? 0 : i) + +nudge.dataset.nudge));
      editStepQuiet(SEQ.step, s => { s.note = list[i].raw; }, true);
      return;
    }
    const act = e.target.closest("[data-act]");
    if (!act) return;
    const t = SEQ.sel, src = SEQ.steps[t][SEQ.step].slice();
    for (let s = 0; s < 32; s++) {
      const o = stepObj(SEQ.steps[t][s]);
      if (act.dataset.act === "copy") { const keep = o.on; SEQ.steps[t][s] = src.slice(); if (SEQ.tracks[t].mode === 1) SEQ.steps[t][s][0] = (keep ? 0x80 : 0) | (src[0] & 0x7F); }
      else { o.on = act.dataset.act === "fill"; SEQ.steps[t][s] = stepBytes(o); }
      seqSendStep(t, s);
    }
    seqRender();
  });
  box.addEventListener("dblclick", e => {
    const cell = e.target.closest("[data-step]");
    if (cell && SEQ.tracks[SEQ.sel].mode === 1) editStep(+cell.dataset.step, o => { o.on = !o.on; });
  });
  const onInput = e => {
    const el = e.target;
    const v = el.type === "checkbox" ? (el.checked ? 1 : 0) : Math.round(+el.value);
    if (el.dataset.tk) {
      if (el.type === "range" && el.nextElementSibling) el.nextElementSibling.textContent = el.dataset.tk === "transpose" ? (v - 24 > 0 ? "+" : "") + (v - 24) : v + (/prob|rand/i.test(el.dataset.tk) && el.dataset.tk !== "randRange" ? " %" : "");
      const structural = ["mode", "length", "scale", "root", "midi", "channel"].includes(el.dataset.tk) || e.type === "change";
      editTrackQuiet(el.dataset.tk, v, structural);
    } else if (el.dataset.sk) {
      if (el.type === "range" && el.nextElementSibling) el.nextElementSibling.textContent = v;
      const k = el.dataset.sk;
      editStepQuiet(SEQ.step, o => { o[k] = k === "on" || k === "rand" ? !!v : v; }, e.type === "change");
    }
  };
  box.addEventListener("input", onInput);
  box.addEventListener("change", e => { if (e.target.type !== "range") onInput(e); else seqRender(); });
}
function editTrackQuiet(key, v, rerender) {
  const k = SEQ.tracks[SEQ.sel];
  k[key] = v;
  k.length = Math.max(1, Math.min(32, k.length));
  k.hits = Math.min(k.hits, k.length);
  k.rotation = Math.min(k.rotation, k.length - 1);
  seqSendTrack(SEQ.sel);
  if (rerender) { $("seq").dataset.ready = ""; seqRender(); }
  else updateCells();
}
function editStepQuiet(s, fn, rerender) {
  const o = stepObj(SEQ.steps[SEQ.sel][s]);
  fn(o);
  o.note = Math.max(0, Math.min(127, o.note || 0)); o.vel = Math.max(1, Math.min(127, o.vel || 1));
  SEQ.steps[SEQ.sel][s] = stepBytes(o);
  seqSendStep(SEQ.sel, s);
  if (rerender) { $("seq").dataset.ready = ""; seqRender(); } else updateCells();
}
function updateCells() {
  const k = SEQ.tracks[SEQ.sel];
  $("seq").querySelectorAll(".cell").forEach(c => {
    const s = +c.dataset.step, so = stepObj(SEQ.steps[SEQ.sel][s]), inLen = s < k.length;
    c.classList.toggle("hit", inLen && hitOf(SEQ.sel, s));
    c.classList.toggle("out", !inLen);
    c.querySelector(".n").textContent = playedLabel(playedNote(k, so.note));
    c.style.setProperty("--p", PROB_LEVELS[so.prob] / 100);
  });

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
    const o = stepObj(SEQ.steps[t][pos]);
    if (hitOf(t, pos) && Math.random() * 100 < k.prob && Math.random() < PROB_LEVELS[o.prob] / 100) {
      SEQ.playedAt[t] = now;
      if (k.midi) clock.midiAt = now;
    }
  });
  if (moved) seqRenderHeads();
}

// jacks in mode "Track n": lit while the track's note is recent
function trackGateOn(t, now) {
  if (!SEQ.tracks || !SEQ.tracks[t]) return false;
  return now - SEQ.playedAt[t] < 90;
}
