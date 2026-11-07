"use strict";
// clockbox screen: contextual help bubbles ("?" buttons). Uses the globals of screen.js.
const HELP = {
  fr: {
    transport: "Start lance tout (boîte, MIDI, jacks). Pause garde la position ; Reprendre repart de là. Début ramène au début. Le tempo se tape au dixième près, ou au rythme avec « Tap » ; le potard reprend la main dès que tu le bouges.",
    jacks: "Les 3 prises jack envoient des impulsions de 0 ou 5 V pour le modulaire. Chaque jack a son mode : une horloge, un reset, un run, ou les notes d'une piste du séquenceur. Tout est enregistré dans la boîte dès que tu cliques.",
    seq: "4 pistes qui jouent en MIDI. 1) Choisis une piste. 2) Active son MIDI (pastille verte) et son canal. 3) Allume des pas d'un clic. 4) Dessine les notes, vélocités… dans les barres. La séquence est gardée dans la boîte et joue sans ordinateur.",
    midi: "Réglages communs à toute la boîte : la mesure, ce qui est envoyé en MIDI au démarrage et à l'arrêt, le comportement du bouton, et le métronome.",
    presets: "Un préréglage garde les modes des jacks, les options MIDI, le métronome, la mesure et le tempo. Il ne garde pas la séquence (pour ça, utilise la Sauvegarde). Le menu de la boîte peut rappeler un préréglage sans ordinateur.",
    backup: "Exporter crée un fichier avec tout : réglages, tempo, place des jacks et séquence. Importer le remet dans la boîte. Pratique pour garder plusieurs séquences ou partager avec un ami.",
    fw: "Installe le programme de la boîte depuis le site, en 15 s environ. Ne débranche pas pendant l'écriture. Si ça échoue, recommence : la boîte ne peut pas être abîmée.",
    jProb: "La chance que chaque impulsion de ce jack parte. À 100 %, toutes partent. En dessous, certaines sautent au hasard. Reset et Run ne sont jamais aléatoires.",
    jPulse: "Gate : la tension reste haute la moitié du temps (ce qu'attendent la plupart des entrées clock). Trigger : une impulsion très courte (~5 ms), pour les modules qui veulent un déclenchement bref.",
    jOffset: "Retarde les impulsions de 0 à 15 doubles croches. Exemple : des noires décalées d'une croche tombent sur les contretemps.",
    jDivN: "Une impulsion toutes les N doubles croches. N = 3, 5 ou 7 donne des polyrythmes qui tournent contre la mesure.",
    jIdent: "Fait battre ce jack seul pendant 15 s (la LED aussi), pour savoir quelle prise c'est. Seulement quand la boîte ne tourne pas.",
    jPlace: "Où se trouve ce jack sur ta boîte (haut, milieu, bas). La boîte s'en souvient ; ça ne change que l'affichage.",
    sMidi: "La pastille d'une piste active ou coupe son MIDI. Verte = la piste joue sur le canal affiché. « MIDI coupé » = elle ne joue pas en MIDI (les jacks en mode Piste la suivent quand même).",
    sMode: "Pas à pas : tu allumes toi-même les pas. Euclidien : tu choisis un nombre de coups, la boîte les répartit régulièrement sur la longueur (3 coups sur 8 = tresillo, 5 sur 16 = bossa). Éteinte : la piste ne joue pas.",
    sChannel: "Le canal MIDI de ton synthé (souvent 1). ALL envoie la même note aux 16 canaux. Un pas peut avoir son propre canal (barre « Canal »).",
    sScale: "Les 91 gammes de nos synthés Rhizome et Monades. Les notes sont toujours ramenées dans la gamme : impossible de jouer faux. Les gammes microtonales (maqams, 19/24 tons…) envoient un pitch bend : règle ton synthé sur ±2 demi-tons.",
    sLength: "Le nombre de pas de la piste (1 à 32). Des pistes de longueurs différentes se décalent entre elles : polyrythmes garantis.",
    sHits: "Le nombre de coups répartis sur la longueur.",
    sRot: "Décale le rythme euclidien vers la droite, pour qu'il commence ailleurs.",
    sDiv: "La durée de chaque pas : 1/16 (doubles croches) est le plus courant.",
    sDir: "Avant, arrière, aller-retour, ou un pas au hasard à chaque fois.",
    sTranspose: "Décale toute la piste de ±24 demi-tons (en restant dans la gamme).",
    sTProb: "La chance que chaque pas de la piste joue. Elle s'ajoute à la probabilité de chaque pas.",
    sRandNote: "La chance qu'un pas joue une autre note de la gamme, prise au hasard dans l'étendue choisie.",
    sRandRange: "Jusqu'où, en demi-tons autour de la note du pas, peut aller une note aléatoire.",
    sHumanize: "Une petite variation de vélocité à chaque note, pour un jeu moins mécanique.",
    sAccent: "Ajoute de la vélocité au premier coup de chaque tour de la piste.",
    mTimeSig: "La mesure sert au mode Mesure des jacks, au reset, à la LED (flash long sur le 1er temps) et au métronome.",
    mSpp: "Envoie la position (Song Position) avant Start et Reprendre, pour que séquenceurs et logiciels repartent au bon endroit. Laisse coché.",
    mClock: "Envoie l'horloge MIDI même à l'arrêt, pour que tes machines connaissent déjà le tempo. Décoche si une vieille machine se met à jouer toute seule.",
    mPause: "Le bouton de la boîte met en pause au lieu d'arrêter. En pause : appui court = reprendre, tenir 1,5 s = retour au début.",
    mMetro: "Une note MIDI sur le 1er temps, ou sur chaque temps (le 1er plus fort). Ce canal ne concerne que le métronome, pas les pistes du séquenceur.",
  },
  en: {
    transport: "Start runs everything (box, MIDI, jacks). Pause keeps the position; Continue resumes from there. To start goes back to the beginning. Type the tempo to 0.1, or tap it with “Tap”; the pot takes over as soon as you move it.",
    jacks: "The 3 jacks send 0 or 5 V pulses for the modular. Each jack has a mode: a clock, reset, run, or the notes of a sequencer track. Everything is saved in the box as soon as you click.",
    seq: "4 tracks that play over MIDI. 1) Pick a track. 2) Turn its MIDI on (green pill) and pick its channel. 3) Turn steps on with a click. 4) Draw notes, velocities… on the bars. The sequence is kept in the box and plays without a computer.",
    midi: "Settings shared by the whole box: time signature, what is sent over MIDI on start and stop, the button behaviour, and the metronome.",
    presets: "A preset keeps the jack modes, MIDI options, metronome, time signature and tempo. It does not keep the sequence (use Backup for that). The box menu can recall a preset without a computer.",
    backup: "Export makes a file with everything: settings, tempo, jack places and the sequence. Import puts it back into the box. Handy to keep several sequences or share with a friend.",
    fw: "Installs the box program from the site, in about 15 s. Do not unplug while writing. If it fails, try again: the box cannot be harmed.",
    jProb: "The chance that each pulse of this jack goes out. At 100 %, all do. Below that, some are skipped at random. Reset and Run are never random.",
    jPulse: "Gate: the voltage stays high half the time (what most clock inputs expect). Trigger: a very short pulse (~5 ms), for modules that want a brief trigger.",
    jOffset: "Delays the pulses by 0 to 15 sixteenths. Example: quarters delayed by an eighth fall on the off-beats.",
    jDivN: "One pulse every N sixteenths. N = 3, 5 or 7 gives polyrhythms that turn against the bar.",
    jIdent: "Makes only this jack pulse for 15 s (the LED too), to find which socket it is. Only while the box is not running.",
    jPlace: "Where this jack is on your box (top, middle, bottom). The box remembers it; it only changes the display.",
    sMidi: "A track's pill turns its MIDI on or off. Green = the track plays on the channel shown. “MIDI muted” = no MIDI (jacks in Track mode still follow it).",
    sMode: "Steps: you turn the steps on yourself. Euclidean: pick a number of hits and the box spreads them evenly over the length (3 over 8 = tresillo, 5 over 16 = bossa). Off: the track is silent.",
    sChannel: "Your synth's MIDI channel (often 1). ALL sends the same note to all 16 channels. A step can have its own channel (“Channel” bars).",
    sScale: "The 91 scales of our Rhizome and Monades synths. Notes are always brought into the scale: no wrong notes. Microtonal scales (maqams, 19/24-TET…) send a pitch bend: set your synth to ±2 semitones.",
    sLength: "Number of steps in the track (1 to 32). Tracks of different lengths drift against each other: instant polyrhythms.",
    sHits: "Number of hits spread over the length.",
    sRot: "Shifts the Euclidean rhythm to the right, so that it starts elsewhere.",
    sDiv: "The length of each step: 1/16 is the most common.",
    sDir: "Forward, backward, ping-pong, or a random step each time.",
    sTranspose: "Shifts the whole track by ±24 semitones (staying in the scale).",
    sTProb: "The chance that each step of the track plays. It adds to each step's own probability.",
    sRandNote: "The chance that a step plays another note of the scale, picked at random within the range.",
    sRandRange: "How far, in semitones around the step's note, a random note can go.",
    sHumanize: "A small velocity variation on each note, for a less mechanical feel.",
    sAccent: "Adds velocity to the first hit of each turn of the track.",
    mTimeSig: "The time signature is used by the Bar mode of the jacks, the reset, the LED (long flash on beat 1) and the metronome.",
    mSpp: "Sends the position (Song Position) before Start and Continue, so that sequencers and software restart at the right place. Keep it on.",
    mClock: "Sends MIDI clock while stopped too, so your gear already knows the tempo. Turn it off if an old machine starts playing on its own.",
    mPause: "The box button pauses instead of stopping. While paused: short press = continue, hold 1.5 s = back to the start.",
    mMetro: "A MIDI note on beat 1, or on every beat (beat 1 louder). This channel is only for the metronome, not for the sequencer tracks.",
  }
};
const helpBtn = key => `<button type="button" class="q" data-help="${key}" aria-label="?">?</button>`;

document.addEventListener("click", e => {
  const pop = document.getElementById("helpPop");
  const q = e.target.closest(".q");
  if (!q) { if (!e.target.closest("#helpPop")) pop.hidden = true; return; }
  e.preventDefault(); e.stopPropagation();
  if (!pop.hidden && pop.dataset.key === q.dataset.help) { pop.hidden = true; return; }
  pop.dataset.key = q.dataset.help;
  pop.textContent = (HELP[lang] || HELP.fr)[q.dataset.help] || "";
  pop.hidden = false;
  const r = q.getBoundingClientRect(), w = Math.min(340, window.innerWidth - 24);
  pop.style.width = w + "px";
  pop.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + "px";
  const below = r.bottom + 8 + pop.offsetHeight < window.innerHeight;
  pop.style.top = (below ? r.bottom + 8 : Math.max(8, r.top - 8 - pop.offsetHeight)) + "px";
}, true);
document.addEventListener("keydown", e => { if (e.key === "Escape") document.getElementById("helpPop").hidden = true; });
window.addEventListener("scroll", () => { const p = document.getElementById("helpPop"); if (p) p.hidden = true; }, { passive: true });
