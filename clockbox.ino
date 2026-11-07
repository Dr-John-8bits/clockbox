/*
 * clockbox - Arduino clock generator and MIDI sequencer for electronic music instruments.
 * MIDI out + 3 analog clock/gate outputs + beat LED.
 *
 * Original project by Alexis Zbik (2020).
 * v2 (2026): one mode per jack (clocks, triplets, dotted, free divisions,
 * reset, run, sequencer tracks) with probability, offset and trigger/gate
 * length; a 4-track MIDI sequencer (steps or Euclidean, 32 steps, the 91
 * scales of the Monades / Rhizome FM-1 synths, randomness, probability,
 * substeps, a MIDI channel per step, accent, humanize); MIDI metronome,
 * time signatures, song position, pause/continue, presets with tempo, beat
 * LED, steady tempo, a settings menu, and a screen in the web browser.
 *
 * Requires the uClock library v2.3.x by midilab: https://github.com/midilab/uClock
 * Target: Arduino Nano / Uno (ATmega328P).
 *
 * Controls
 *   Pot ............ tempo, 30 to 240 BPM
 *   Button, running  stop, or pause if "button pauses" is on (on press)
 *   Button, paused   short press = continue, hold 1.5 s = back to the start
 *   Button, stopped  short press = start (on release), hold 1.5 s = settings menu
 *   In the menu .... pages: jack 1, jack 2, jack 3, preset. The LED first blinks
 *                    the page number (1 to 4), then shows the selected mode.
 *                    The pot chooses (move it a little to take over),
 *                    short press = next page, hold 1.5 s = save and quit.
 *   LED ............ running: long flash on beat 1, short on the other beats.
 *                    Paused: short blink every 2 beats. Stopped: off.
 *
 * Screen on a computer (https://dr-john-8bits.github.io/clockbox/ or site/index.html, Chrome/Edge over USB):
 *   The box stays silent until the page says hello. Then it reports its state
 *   and settings as SysEx, and accepts settings, sequences and commands. See PROTOCOL.
 */

#include <uClock.h>
#include <EEPROM.h>
#include "scales.h"

// ---------------------------------------------------------------- hardware --
const uint8_t POT_PIN    = A0;
const uint8_t BUTTON_PIN = 2;    // active HIGH, external pull-down resistor
const uint8_t LED_PIN    = 9;
const uint8_t JACK_COUNT = 3;
const uint8_t JACK_PINS[JACK_COUNT] = {5, 7, 3};   // jacks 1, 2, 3 = top, middle, bottom

// ------------------------------------------------------------------- tempo --
const float    BPM_MIN = 30.0;        // pot range
const float    BPM_MAX = 240.0;
const uint16_t BPM10_MIN = 200;       // range accepted from the screen, in 0.1 BPM
const uint16_t BPM10_MAX = 3000;
const float    BPM_HYSTERESIS = 0.7;  // pot must move this many BPM before tempo changes
const uint16_t POT_PICKUP = 32;       // pot travel (0..1023) needed to take over
const uint16_t POT_SAMPLE_MS = 5;

// ------------------------------------------------------------------ button --
const uint16_t DEBOUNCE_MS   = 25;
const uint16_t LONG_PRESS_MS = 1500;
const uint8_t  RESET_PULSE_MS = 10;

// ------------------------------------------------------------ output modes --
// Internal resolution is 96 ticks per quarter note.
enum Mode : uint8_t {
  MODE_24PPQN,          // 24 pulses per quarter (DIN sync, some drum machines)
  MODE_16TH,            // 4 pulses per quarter (most modular sequencers)
  MODE_8TH,             // 2 pulses per quarter (Volca / Pocket Operator sync)
  MODE_QUARTER,         // 1 pulse per quarter
  MODE_HALF,            // 1 pulse every 2 quarters
  MODE_BAR,             // 1 pulse per bar (see time signature)
  MODE_RESET,           // 10 ms trigger just before the first clock, on start
  MODE_RUN,             // gate high while running
  MODE_8TH_TRIPLET,     // 3 pulses per quarter
  MODE_16TH_TRIPLET,    // 6 pulses per quarter
  MODE_8TH_DOTTED,      // 1 pulse every dotted eighth
  MODE_TRACK_1,         // gates of sequencer tracks 1, 2, 3 (were Euclidean A, B, C)
  MODE_TRACK_2,
  MODE_TRACK_3,
  MODE_DIVISION,        // 1 pulse every N sixteenths (N per jack, 1..64): polyrhythms
  MODE_TRACK_4,
  MODE_COUNT
};
// Clock periods in ticks (50 % duty), 0 = not a plain clock.
const uint16_t MODE_PERIOD[MODE_COUNT] = {4, 24, 48, 96, 192, 0, 0, 0, 32, 16, 72, 0, 0, 0, 0, 0};
const uint16_t CYCLE_TICKS = 576;     // common multiple of every period above
// Order of the modes along the pot, in the box menu.
const uint8_t POT_ORDER[MODE_COUNT] = {
  MODE_24PPQN, MODE_16TH, MODE_16TH_TRIPLET, MODE_8TH, MODE_8TH_TRIPLET, MODE_8TH_DOTTED,
  MODE_QUARTER, MODE_HALF, MODE_BAR, MODE_DIVISION, MODE_RESET, MODE_RUN,
  MODE_TRACK_1, MODE_TRACK_2, MODE_TRACK_3, MODE_TRACK_4
};

// Time signatures: 4/4 3/4 2/4 5/4 6/8 7/8 (bar length and LED beat, in ticks)
const uint8_t  TIME_SIG_COUNT = 6;
const uint16_t BAR_TICKS[TIME_SIG_COUNT]  = {384, 288, 192, 480, 288, 336};
const uint8_t  BEAT_TICKS[TIME_SIG_COUNT] = {96, 96, 96, 96, 144, 48};

// --------------------------------------------------------------- settings --
struct Config {             // what a preset holds; every byte is 0..127 (fits SysEx)
  uint8_t jackMode[JACK_COUNT];
  uint8_t timeSig;          // index in BAR_TICKS
  uint8_t clockWhenStopped; // 1 = MIDI clock is sent while stopped too
  uint8_t songPosition;     // 1 = send Song Position Pointer before Start / Continue
  uint8_t buttonPauses;     // 1 = the button pauses instead of stopping
  uint8_t metroMode;        // 0 off, 1 downbeat only, 2 every beat
  uint8_t metroChannel;     // 0..15
  uint8_t metroNoteDown;    // note on beat 1
  uint8_t metroNoteBeat;    // note on the other beats
  uint8_t jackProb[JACK_COUNT];     // 0..100 %: chance that each pulse of the jack is sent
  uint8_t jackTrigger[JACK_COUNT];  // 0 = gate (50 %), 1 = short trigger (one tick, ~5 ms at 120 BPM)
  uint8_t jackOffset[JACK_COUNT];   // delay in sixteenths, 0..15 (clocks, bar and division modes)
  uint8_t jackDivision[JACK_COUNT]; // N for MODE_DIVISION, in sixteenths, 1..64
};
const uint8_t CONFIG_SIZE = sizeof(Config);   // 23
const uint8_t MAX_OFFSET = 15, MAX_DIVISION = 64;

const Config DEFAULT_CONFIG = {
  {MODE_16TH, MODE_RESET, MODE_8TH},
  0, 1, 1, 0,
  0, 9, 76, 77,                                  // metronome off, channel 10, wood blocks
  {100, 100, 100}, {0, 0, 0}, {0, 0, 0}, {3, 3, 3}
};

// ---------------------------------------------------------------- sequencer --
const uint8_t TRACK_COUNT = 4;
const uint8_t MAX_STEPS = 32;
const uint8_t STEP_BYTES = 4;
const uint8_t TRACK_DIV_COUNT = 5;
const uint8_t TRACK_DIV_TICKS[TRACK_DIV_COUNT] = {24, 48, 16, 96, 12};   // 1/16, 1/8, 1/16T, 1/4, 1/32
const uint8_t CHANNEL_ALL = 16;
const uint8_t LEN_PERCENT[4] = {25, 50, 75, 95};
enum TrackMode : uint8_t { TRACK_OFF, TRACK_STEPS, TRACK_EUCLID };
enum Direction : uint8_t { DIR_FORWARD, DIR_BACKWARD, DIR_PINGPONG, DIR_RANDOM };

struct Track {              // 16 bytes, every byte is 0..127
  uint8_t mode;             // TrackMode
  uint8_t length;           // 1..32 steps
  uint8_t hits;             // Euclidean: hits over the length
  uint8_t rotation;         // Euclidean: shift to the right, 0..length-1
  uint8_t division;         // index in TRACK_DIV_TICKS
  uint8_t channel;          // 0..15, or CHANNEL_ALL
  uint8_t midi;             // 1 = play MIDI notes (the jacks follow the track anyway)
  uint8_t scale;            // 0..SCALE_COUNT-1
  uint8_t root;             // 0..11 (C..B)
  uint8_t transpose;        // 0..48 = -24..+24 semitones
  uint8_t direction;        // Direction
  uint8_t prob;             // 0..100 %: chance for each step of the track
  uint8_t randNote;         // 0..100 %: chance that a step plays a random note of the scale
  uint8_t randRange;        // 0..24 semitones around the step note, for random notes
  uint8_t humanize;         // 0..40: random velocity +-
  uint8_t accent;           // 0..60: velocity added to the first hit of each cycle
};
const uint8_t TRACK_SIZE = sizeof(Track);

// A step, 4 bytes:
//   b0: bit 7 = on (steps mode), bits 0-6 = note
//   b1: velocity 1..127
//   b2: bits 0-4 = channel (0 = the track's, 1..16 = that channel), bits 5-7 = probability level
//       (0 = 100 %, n = (8 - n) / 8)
//   b3: bits 0-1 = substeps - 1 (1..4 notes in the step), bits 2-3 = length (25, 50, 75, 95 %),
//       bit 4 = random note
const uint8_t STEP_ON = 0x80, STEP_RANDOM = 0x10;

// EEPROM layout (version 6):
//   0 'C', 1 'B', 2 version, 3..5 jack places, 8.. config (23 bytes),
//   64.. 4 presets of 26 bytes (magic, config, tempo in 0.1 BPM, 0 = none),
//   176.. 4 tracks of 16 bytes, 240..241 custom scale mask, 512.. steps (4 x 32 x 4 bytes)
const uint8_t  EEPROM_MAGIC0 = 'C', EEPROM_MAGIC1 = 'B', EEPROM_VERSION = 6;
const uint8_t  EEPROM_POSITIONS = 3;
const uint8_t  EEPROM_CONFIG = 8;
const uint8_t  PRESET_COUNT = 4;
const uint16_t EEPROM_PRESETS = 64, PRESET_STRIDE = 1 + CONFIG_SIZE + 2;
const uint8_t  PRESET_MAGIC = 0x5A;
const uint16_t EEPROM_TRACKS = 176, EEPROM_CUSTOM = 240, EEPROM_STEPS = 512;
// firmware 2.4 (EEPROM version 5), for the migration
const uint8_t  V5_CONFIG_SIZE = 50;
const uint16_t V5_PRESET_STRIDE = 56;

// ---------------------------------------------------------------- PROTOCOL --
// SysEx, manufacturer ID 0x7D (non-commercial), then 'C' 'B', a command, data.
//   computer -> box
//     10                      hello: start reporting, send state and config
//     11 jack mode            set one jack mode (saved)
//     12 jack                 identify: only this jack pulses on every beat for 15 s (7F = stop)
//     13 p0 p1 p2             physical place of each jack (0 top, 1 middle, 2 bottom), saved
//     14 <config, 23 bytes>   replace the settings (saved)
//     15 bpmHi bpmLo          tempo in 0.1 BPM (14 bits); the pot takes over when moved
//     16 action               0 start, 1 stop, 2 pause, 3 continue, 4 back to the start
//     17 op slot              preset: op 0 = load (with its tempo), 1 = save, 2 = erase
//     18 t s <step, 5 bytes>  set a step (4 bytes as 7-bit values, then their bits 7)
//     19 t <track, 16 bytes>  set a track
//     1A                      send the whole sequence (tracks, custom scale, steps)
//     1B lo hi                custom scale mask (12 bits)
//   box -> computer
//     01 <state>              see sendState()
//     02 <config> presetMask  current settings, and which preset slots are filled
//     03 t <track>            a track
//     04 t s <step, 5 bytes>  a step
//     05 p0 p1 p2 p3 mask     playheads (7F = silent) and which tracks played a note
//     06 lo hi                custom scale mask
// The MIDI clock itself (F8 / FA / FB / FC / F2) is on the same line.
const uint8_t FW_VERSION_MAJOR = 2, FW_VERSION_MINOR = 5;
const uint8_t SYSEX_ID = 0x7D, SYSEX_C = 'C', SYSEX_B = 'B';
const uint8_t CMD_STATE = 0x01, CMD_CONFIG = 0x02, CMD_TRACK = 0x03, CMD_STEP = 0x04,
              CMD_PLAYHEAD = 0x05, CMD_CUSTOM = 0x06,
              CMD_HELLO = 0x10, CMD_SET_MODE = 0x11, CMD_IDENTIFY = 0x12, CMD_SET_POSITIONS = 0x13,
              CMD_SET_CONFIG = 0x14, CMD_SET_TEMPO = 0x15, CMD_TRANSPORT = 0x16, CMD_PRESET = 0x17,
              CMD_SET_STEP = 0x18, CMD_SET_TRACK = 0x19, CMD_DUMP = 0x1A, CMD_SET_CUSTOM = 0x1B;
const uint32_t IDENTIFY_MS = 15000;
const uint16_t REPORT_MIN_INTERVAL_MS = 30;
const uint8_t  REPORT_POT_STEP = 3;
const uint8_t  MENU_PAGES = JACK_COUNT + 1;   // 3 jacks, then the preset page

// ================================================================= state ==

// Position counters for the plain clocks, advanced once per tick.
struct Counters {
  uint16_t cycle;                 // 0..CYCLE_TICKS-1
  uint16_t bar;                   // position in the bar
};

// Playback state of a sequencer track.
struct TrackRun {
  uint32_t count;     // steps since the start
  uint8_t  sub;       // tick within the step
  uint8_t  pos;       // step being played
  bool     active;    // this step plays
  uint8_t  ratchets;  // notes in this step
  uint8_t  period;    // ticks between them
  uint8_t  gateTicks; // ticks each one lasts
  uint8_t  note, velocity, channel;
  int16_t  bend;      // microtonal pitch bend, -8192..8191
  bool     bent;      // a pitch bend was sent (reset it when going back to 12 tones)
  int8_t   held;      // note sounding, -1 = none
  uint8_t  heldChannel;
  bool     gate;      // gate for the jacks following this track
  bool     noteOn;    // a note started on this tick
  bool     fresh;     // the first hit of the cycle is still to come (accent)
  uint8_t  lastNote;  // previous note, to pick the ascending or descending form of a scale
};

// Where a jack is in its current pulse (see jackPhase()). Declared up here so
// that the prototypes generated by the Arduino IDE can use it.
struct Phase {
  bool start;   // a new pulse begins on this tick (probability is rolled here)
  bool level;   // output level
};

enum Transport : uint8_t { STOPPED, PLAYING, PAUSED };

// shared with the clock interrupt
Config            cfg;
Track             tracks[TRACK_COUNT];
uint8_t           steps[TRACK_COUNT][MAX_STEPS][STEP_BYTES];
uint16_t          customMask = 0xFFF;
TrackRun          runs[TRACK_COUNT];
volatile uint8_t  transport = STOPPED;
volatile bool     pendingStart = false;      // MIDI Start right before the next clock
volatile bool     pendingContinue = false;   // MIDI Continue right before the next clock
volatile bool     menuActive = false;
volatile uint8_t  menuPage = 0;
volatile bool     menuLedPreview = false;    // LED copies the edited jack
volatile int8_t   identifyJack = -1;
volatile bool     playheadDirty = false;     // a track moved to a new step
volatile uint8_t  playedMask = 0;            // tracks that played a note since the last report
Counters          song;                      // advances while playing
Counters          freeRun;                   // always advances (menu preview, identify)
volatile uint32_t songTick = 0;              // position while playing / paused, in ticks
uint32_t          freeTick = 0;              // always counting (previews)
int8_t            metroHeldNote = -1;
uint8_t           metroOffIn = 0;
bool              jackGate[JACK_COUNT] = {true, true, true};   // this pulse passed its probability
uint16_t          rngState = 0xACE1;

// loop only
float    bpm = 120;
uint16_t potValue = 0;
uint32_t potFiltered = 0;
uint32_t lastPotSample = 0;
bool     tempoArmed = true;     // false after the menu or a tempo from the screen
uint16_t potRef = 0;
bool     menuArmed = false;
uint8_t  menuPreset = 0;        // preset chosen on the menu's preset page
bool     menuPresetChosen = false;

enum PressAction : uint8_t { PRESS_NONE, PRESS_STOPPED, PRESS_MENU, PRESS_PAUSED };
bool     buttonStable = false;
bool     buttonLastRaw = false;
uint32_t buttonChangedAt = 0;
uint32_t pressStartedAt = 0;
PressAction pressAction = PRESS_NONE;
bool     longPressDone = false;
uint32_t menuBlinkStart = 0;

bool     reporting = false;
bool     stateDirty = false;
bool     configDirty = false;
int16_t  dumpIndex = -1;        // sequence dump in progress (see updateScreenLink())
uint32_t lastReportAt = 0;
uint16_t lastReportedPot = 0;
uint32_t identifyUntil = 0;
uint8_t  jackPosition[JACK_COUNT] = {0, 1, 2};
uint8_t  rxBuffer[48];
uint8_t  rxLength = 0;
bool     rxInSysex = false;

static void markDirty() { stateDirty = true; }
static void markConfigDirty() { configDirty = true; stateDirty = true; }

static int8_t trackOfMode(uint8_t mode) {
  if (mode >= MODE_TRACK_1 && mode <= MODE_TRACK_3) return mode - MODE_TRACK_1;
  if (mode == MODE_TRACK_4) return 3;
  return -1;
}

// ================================================================ rhythm ==

// Small random generator (16-bit xorshift, ISR-safe).
static uint16_t rnd() {
  rngState ^= rngState << 7; rngState ^= rngState >> 9; rngState ^= rngState << 8;
  return rngState;
}
static bool chance(uint8_t percent) { return percent >= 100 || rnd() % 100 < percent; }

static bool euclidHit(uint8_t steps_, uint8_t hits, uint8_t rotation, uint8_t step) {
  if (hits == 0 || steps_ == 0) return false;
  uint8_t i = (uint8_t)((step + steps_ - (rotation % steps_)) % steps_);
  return (uint16_t)(i * hits) % steps_ < hits;
}

static uint16_t barTicks() { return BAR_TICKS[cfg.timeSig]; }

static void resetCounters(Counters &c) { c.cycle = 0; c.bar = 0; }

static void setCounters(Counters &c, uint32_t pos) {
  c.cycle = pos % CYCLE_TICKS;
  c.bar = pos % barTicks();
}

static void advance(Counters &c) {
  if (++c.cycle >= CYCLE_TICKS) c.cycle = 0;
  if (++c.bar >= barTicks()) c.bar = 0;
}

// Where a jack is in its current pulse, for its mode, offset, division and gate length.
static Phase jackPhase(uint8_t j, const Counters &c, uint32_t pos, bool preview) {
  uint8_t mode = cfg.jackMode[j];
  uint16_t off = (uint16_t)cfg.jackOffset[j] * 24;
  uint16_t period = MODE_PERIOD[mode], phase, length;
  Phase r = {false, false};
  int8_t t = trackOfMode(mode);
  if (period) {                                     // plain clocks
    length = period;
    phase = (c.cycle + CYCLE_TICKS - off) % CYCLE_TICKS % period;
  } else if (mode == MODE_BAR) {
    length = barTicks();
    phase = (c.bar + length - off % length) % length;
  } else if (mode == MODE_DIVISION) {
    length = (uint16_t)cfg.jackDivision[j] * 24;
    phase = (pos + length - off % length) % length;
  } else if (mode == MODE_RUN) {
    r.level = true;
    return r;
  } else if (mode == MODE_RESET) {
    r.level = preview && c.bar < 2;                 // the real pulse comes from startTransport()
    return r;
  } else if (preview) {                             // a track, while stopped: its pattern, no randomness
    const Track &k = tracks[t];
    if (k.mode == TRACK_OFF) return r;
    uint8_t div = TRACK_DIV_TICKS[k.division], s = (pos / div) % k.length;
    bool on = k.mode == TRACK_STEPS ? (steps[t][s][0] & STEP_ON) : euclidHit(k.length, k.hits, k.rotation, s);
    r.level = on && pos % div < div / 2;
    return r;
  } else {                                          // a track, playing: follow its notes
    r.start = runs[t].noteOn;
    r.level = cfg.jackTrigger[j] ? runs[t].noteOn : runs[t].gate;
    return r;
  }
  r.start = phase == 0;
  r.level = cfg.jackTrigger[j] ? phase == 0 : phase < length / 2;
  return r;
}

// ==================================================================== MIDI ==
// Channel messages are only written from the clock interrupt, or with
// interrupts off, so that they never end up inside a SysEx message.

static void midi3(uint8_t status, uint8_t d1, uint8_t d2) {
  Serial.write(status); Serial.write(d1); Serial.write(d2);
}

// Send a channel message to one channel, or to all 16.
static void midiTo(uint8_t channel, uint8_t status, uint8_t d1, uint8_t d2) {
  if (channel == CHANNEL_ALL) for (uint8_t c = 0; c < 16; c++) midi3(status | c, d1, d2);
  else midi3(status | channel, d1, d2);
}

static void trackNoteOff(uint8_t t) {
  TrackRun &r = runs[t];
  if (r.held >= 0) { midiTo(r.heldChannel, 0x80, r.held, 0); r.held = -1; }
  r.gate = false;
}

static void releaseNotes() {   // call with interrupts off or from the ISR
  for (uint8_t t = 0; t < TRACK_COUNT; t++) trackNoteOff(t);
  if (metroHeldNote >= 0) { midi3(0x80 | cfg.metroChannel, metroHeldNote, 0); metroHeldNote = -1; }
}

// ------------------------------------------------------------------ scales --

static int32_t floorDiv(int32_t a, int32_t b) { return a >= 0 ? a / b : -((-a + b - 1) / b); }

static uint16_t scaleMask(uint8_t scale, bool down) {
  if (scale == SCALE_CUSTOM) return customMask ? customMask : 0xFFF;
  return pgm_read_word(&SCALE_MASK[scale][down ? 1 : 0]);
}

// Bring a note into the track's scale. 12-tone scales round down to the nearest
// degree (ascending or descending form); microtonal scales take the nearest
// degree and return a pitch bend (range +-2 semitones).
static uint8_t quantize(const Track &k, int16_t note, bool down, int16_t &bend) {
  bend = 0;
  if (note < 0) note = 0;
  if (note > 127) note = 127;
  if (k.scale < SCALE_TWELVE) {
    uint16_t mask = scaleMask(k.scale, down);
    int8_t deg = ((note - k.root) % 12 + 12) % 12;
    for (uint8_t i = 0; i < 12 && !(mask & (1 << deg)); i++) {
      note--;
      if (--deg < 0) deg += 12;
    }
    return note < 0 ? 0 : note;
  }
  uint8_t m = k.scale - SCALE_TWELVE;
  uint8_t count = pgm_read_byte(&MICRO_DEGREES[m]);
  int32_t period = pgm_read_word(&MICRO_PERIOD[m]);
  uint16_t first = pgm_read_word(&MICRO_OFFSET[m]);
  int32_t base = (int32_t)(60 + k.root) * 1000;             // in 0.1 cent
  int32_t t = (int32_t)note * 1000 - base;
  int32_t oct = floorDiv(t, period), rem = t - oct * period;
  int32_t best = 0, bestDist = rem;                         // degree 0
  if (period - rem < bestDist) { best = period; bestDist = period - rem; }
  for (uint8_t i = 0; i < count; i++) {
    int32_t d = pgm_read_word(&MICRO_CENTS[first + i]);
    int32_t dist = d > rem ? d - rem : rem - d;
    if (dist < bestDist) { best = d; bestDist = dist; }
  }
  int32_t pitch = base + oct * period + best;
  int32_t out = floorDiv(pitch + 500, 1000);
  if (out < 0) out = 0;
  if (out > 127) out = 127;
  bend = (int16_t)((pitch - out * 1000) * 8192 / 2000);
  if (bend > 8191) bend = 8191;
  if (bend < -8192) bend = -8192;
  return out;
}

// ---------------------------------------------------------------- tracks --

static uint8_t stepPosition(const Track &k, uint32_t count) {
  uint8_t L = k.length;
  switch (k.direction) {
    case DIR_BACKWARD: return L - 1 - count % L;
    case DIR_PINGPONG: {
      if (L < 2) return 0;
      uint16_t p = count % (2 * L - 2);
      return p < L ? p : 2 * L - 2 - p;
    }
    case DIR_RANDOM: return rnd() % L;
    default: return count % L;
  }
}

static uint8_t cycleLength(const Track &k) {
  return k.direction == DIR_PINGPONG && k.length > 1 ? 2 * k.length - 2 : k.length;
}

// Decide what a step plays: called on its first tick.
static void beginStep(uint8_t t) {
  const Track &k = tracks[t];
  TrackRun &r = runs[t];
  trackNoteOff(t);
  if (r.count % cycleLength(k) == 0) r.fresh = true;
  r.pos = stepPosition(k, r.count);
  const uint8_t *s = steps[t][r.pos];
  bool on = k.mode == TRACK_STEPS ? (s[0] & STEP_ON) : euclidHit(k.length, k.hits, k.rotation, r.pos);
  uint8_t level = s[2] >> 5;
  r.active = on && chance(k.prob) && (level == 0 || (rnd() & 7) >= level);
  playheadDirty = true;
  if (!r.active) return;

  uint8_t div = TRACK_DIV_TICKS[k.division];
  r.ratchets = (s[3] & 3) + 1;
  r.period = div / r.ratchets;
  r.gateTicks = (uint16_t)r.period * LEN_PERCENT[(s[3] >> 2) & 3] / 100;
  if (r.gateTicks < 1) r.gateTicks = 1;
  if (r.gateTicks >= r.period) r.gateTicks = r.period - 1 ? r.period - 1 : 1;

  int16_t n = s[0] & 0x7F;
  if ((s[3] & STEP_RANDOM) || chance(k.randNote))
    n += (int16_t)(rnd() % (2 * k.randRange + 1)) - k.randRange;
  n += (int16_t)k.transpose - 24;
  r.note = quantize(k, n, n < r.lastNote, r.bend);
  r.lastNote = r.note;

  int16_t v = s[1];
  if (r.fresh) { v += k.accent; r.fresh = false; }
  if (k.humanize) v += (int16_t)(rnd() % (2 * k.humanize + 1)) - k.humanize;
  r.velocity = v < 1 ? 1 : v > 127 ? 127 : v;
  uint8_t ch = s[2] & 0x1F;
  r.channel = ch ? (ch > 16 ? CHANNEL_ALL : ch - 1) : k.channel;
}

static void trackNoteOn(uint8_t t) {
  const Track &k = tracks[t];
  TrackRun &r = runs[t];
  trackNoteOff(t);
  if (k.midi) {
    if (k.scale >= SCALE_TWELVE || r.bent) {   // microtonal: bend first (centre it back otherwise)
      uint16_t b = 8192 + r.bend;
      midiTo(r.channel, 0xE0, b & 0x7F, b >> 7);
      r.bent = r.bend != 0;
    }
    midiTo(r.channel, 0x90, r.note, r.velocity);
    r.held = r.note;
    r.heldChannel = r.channel;
  }
  r.gate = true;
  r.noteOn = true;
  playedMask |= 1 << t;
}

static void runTracks() {
  for (uint8_t t = 0; t < TRACK_COUNT; t++) {
    const Track &k = tracks[t];
    TrackRun &r = runs[t];
    r.noteOn = false;
    if (k.mode == TRACK_OFF) continue;
    if (r.sub == 0) beginStep(t);
    if (r.active) {
      uint8_t within = r.sub % r.period, idx = r.sub / r.period;
      if (within == r.gateTicks) trackNoteOff(t);
      if (within == 0 && idx < r.ratchets) trackNoteOn(t);
    }
    if (++r.sub >= TRACK_DIV_TICKS[k.division]) { r.sub = 0; r.count++; }
  }
}

// Put every track at a song position (start, continue, new settings).
static void setRuns(uint32_t pos) {
  for (uint8_t t = 0; t < TRACK_COUNT; t++) {
    TrackRun &r = runs[t];
    uint8_t div = TRACK_DIV_TICKS[tracks[t].division];
    r.sub = pos % div;
    r.count = pos / div;
    r.active = false;
    r.gate = false;
    r.noteOn = false;
    r.fresh = r.count % cycleLength(tracks[t]) == 0;
    r.pos = r.count % tracks[t].length;
  }
}

static void playMetronome(const Counters &c) {
  if (metroHeldNote >= 0 && metroOffIn && --metroOffIn == 0) {
    midi3(0x80 | cfg.metroChannel, metroHeldNote, 0);
    metroHeldNote = -1;
  }
  if (cfg.metroMode && c.bar % BEAT_TICKS[cfg.timeSig] == 0) {
    bool down = c.bar == 0;
    if (down || cfg.metroMode == 2) {
      if (metroHeldNote >= 0) midi3(0x80 | cfg.metroChannel, metroHeldNote, 0);
      metroHeldNote = down ? cfg.metroNoteDown : cfg.metroNoteBeat;
      midi3(0x90 | cfg.metroChannel, metroHeldNote, down ? 120 : 90);
      metroOffIn = 12;
    }
  }
}

// ======================================================= clock (interrupt) ==

// Called by uClock 96 times per quarter note.
void onClockTick(uint32_t tick) {
  bool playing = transport == PLAYING;

  // MIDI clock, 24 PPQN
  if ((tick & 3) == 0) {
    if (pendingStart)    { pendingStart = false;    Serial.write(0xFA); }
    if (pendingContinue) { pendingContinue = false; Serial.write(0xFB); }
    if (playing || cfg.clockWhenStopped) Serial.write(0xF8);
  }

  if (playing) { playMetronome(song); runTracks(); }

  if (identifyJack >= 0) {
    bool level = freeRun.cycle % 96 < 48;     // one pulse per beat
    for (uint8_t j = 0; j < JACK_COUNT; j++) digitalWrite(JACK_PINS[j], (int8_t)j == identifyJack && level);
    digitalWrite(LED_PIN, level);
  } else if (menuActive) {
    bool level = menuPage < JACK_COUNT && jackPhase(menuPage, freeRun, freeTick, true).level;
    for (uint8_t j = 0; j < JACK_COUNT; j++) digitalWrite(JACK_PINS[j], j == menuPage && level);
    if (menuLedPreview) digitalWrite(LED_PIN, level);
  } else {
    for (uint8_t j = 0; j < JACK_COUNT; j++) {
      uint8_t m = cfg.jackMode[j];
      Phase ph = jackPhase(j, song, songTick, false);
      if (playing && ph.start) jackGate[j] = chance(cfg.jackProb[j]);
      bool gated = m == MODE_RESET || m == MODE_RUN || jackGate[j];   // reset and run are never random
      digitalWrite(JACK_PINS[j], playing && gated && ph.level);
    }
    bool led;
    if (playing) led = song.bar < 24 || song.bar % BEAT_TICKS[cfg.timeSig] < 6;
    else if (transport == PAUSED) led = freeRun.cycle % 192 < 12;
    else led = false;
    digitalWrite(LED_PIN, led);
  }

  advance(freeRun);
  freeTick++;
  if (playing) { advance(song); songTick++; }
}

// ================================================================ helpers ==

static void applyTempo(float newBpm) {
  bpm = newBpm;
  markDirty();
  uClock.setTempo(bpm);
  // uClock reprograms Timer1 without touching its counter. If the counter is
  // already past the new compare value (tempo went up), it would run up to
  // 65535 and wrap, delaying the next tick by up to ~30 ms. Make it fire now.
  noInterrupts();
  if (OCR1A > 2 && TCNT1 >= OCR1A) TCNT1 = OCR1A - 2;
  interrupts();
}

static float potToBpm(uint16_t pot) {
  return BPM_MIN + (float)pot * (BPM_MAX - BPM_MIN) / 1023.0;
}

static bool validConfig(const Config &c) {
  for (uint8_t j = 0; j < JACK_COUNT; j++) if (c.jackMode[j] >= MODE_COUNT) return false;
  if (c.timeSig >= TIME_SIG_COUNT || c.clockWhenStopped > 1 || c.songPosition > 1 ||
      c.buttonPauses > 1 || c.metroMode > 2 || c.metroChannel > 15 ||
      c.metroNoteDown > 127 || c.metroNoteBeat > 127) return false;
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    if (c.jackProb[j] > 100 || c.jackTrigger[j] > 1 || c.jackOffset[j] > MAX_OFFSET ||
        c.jackDivision[j] < 1 || c.jackDivision[j] > MAX_DIVISION) return false;
  }
  return true;
}

static bool validTrack(const Track &k) {
  return k.mode <= TRACK_EUCLID && k.length >= 1 && k.length <= MAX_STEPS && k.hits <= k.length &&
         k.rotation < k.length && k.division < TRACK_DIV_COUNT && k.channel <= CHANNEL_ALL &&
         k.midi <= 1 && k.scale < SCALE_COUNT && k.root < 12 && k.transpose <= 48 &&
         k.direction <= DIR_RANDOM && k.prob <= 100 && k.randNote <= 100 && k.randRange <= 24 &&
         k.humanize <= 40 && k.accent <= 60;
}

static void fixStep(uint8_t *s) {
  if ((s[1] & 0x7F) == 0) s[1] = 100;
  s[1] &= 0x7F;
  if ((s[2] & 0x1F) > 17) s[2] &= 0xE0;
  s[3] &= 0x1F;
}

// Install new settings safely while the clock runs.
static void applyConfig(const Config &c) {
  noInterrupts();
  releaseNotes();
  cfg = c;
  setCounters(song, songTick);
  setCounters(freeRun, 0);
  interrupts();
  markConfigDirty();
}

static void applyTrack(uint8_t t, const Track &k) {
  noInterrupts();
  trackNoteOff(t);
  tracks[t] = k;
  setRuns(songTick);
  interrupts();
}

static void saveConfig() {
  EEPROM.update(0, EEPROM_MAGIC0);
  EEPROM.update(1, EEPROM_MAGIC1);
  EEPROM.update(2, EEPROM_VERSION);
  for (uint8_t j = 0; j < JACK_COUNT; j++) EEPROM.update(EEPROM_POSITIONS + j, jackPosition[j]);
  const uint8_t *p = (const uint8_t *)&cfg;
  for (uint8_t i = 0; i < CONFIG_SIZE; i++) EEPROM.update(EEPROM_CONFIG + i, p[i]);
}

static void saveTrack(uint8_t t) {
  const uint8_t *p = (const uint8_t *)&tracks[t];
  for (uint8_t i = 0; i < TRACK_SIZE; i++) EEPROM.update(EEPROM_TRACKS + t * TRACK_SIZE + i, p[i]);
}

static void saveStep(uint8_t t, uint8_t s) {
  for (uint8_t i = 0; i < STEP_BYTES; i++)
    EEPROM.update(EEPROM_STEPS + ((uint16_t)t * MAX_STEPS + s) * STEP_BYTES + i, steps[t][s][i]);
}

static void saveCustom() {
  EEPROM.update(EEPROM_CUSTOM, customMask & 0xFF);
  EEPROM.update(EEPROM_CUSTOM + 1, customMask >> 8);
}

static bool readConfig(uint16_t addr, Config &out) {
  uint8_t *p = (uint8_t *)&out;
  for (uint8_t i = 0; i < CONFIG_SIZE; i++) p[i] = EEPROM.read(addr + i);
  return validConfig(out);
}

static bool presetFilled(uint8_t slot) {
  Config tmp;
  uint16_t a = EEPROM_PRESETS + slot * PRESET_STRIDE;
  return EEPROM.read(a) == PRESET_MAGIC && readConfig(a + 1, tmp);
}

static bool loadPreset(uint8_t slot) {
  Config tmp;
  uint16_t a = EEPROM_PRESETS + slot * PRESET_STRIDE;
  if (slot >= PRESET_COUNT || EEPROM.read(a) != PRESET_MAGIC || !readConfig(a + 1, tmp)) return false;
  applyConfig(tmp);
  saveConfig();
  uint16_t b10 = EEPROM.read(a + 1 + CONFIG_SIZE) | ((uint16_t)EEPROM.read(a + 2 + CONFIG_SIZE) << 8);
  if (b10 >= BPM10_MIN && b10 <= BPM10_MAX) {
    applyTempo(b10 / 10.0);
    tempoArmed = false;   // the pot takes over once moved
    potRef = potValue;
  }
  return true;
}

static void writePreset(uint8_t slot, const Config &c, uint16_t b10) {
  uint16_t a = EEPROM_PRESETS + slot * PRESET_STRIDE;
  EEPROM.update(a, PRESET_MAGIC);
  const uint8_t *p = (const uint8_t *)&c;
  for (uint8_t i = 0; i < CONFIG_SIZE; i++) EEPROM.update(a + 1 + i, p[i]);
  EEPROM.update(a + 1 + CONFIG_SIZE, b10 & 0xFF);
  EEPROM.update(a + 2 + CONFIG_SIZE, b10 >> 8);
}

static void savePreset(uint8_t slot) {
  if (slot >= PRESET_COUNT) return;
  writePreset(slot, cfg, (uint16_t)(bpm * 10 + 0.5));
  markConfigDirty();
}

// ------------------------------------------------------- default sequence --

static void defaultTrack(uint8_t t, Track &k) {
  //            mode          len hits rot div ch midi scale root tr  dir  prob rn rr hum acc
  Track d[4] = {{TRACK_EUCLID, 16, 5, 0, 0, 9, 0, 0, 0, 24, 0, 100, 0, 12, 0, 20},   // kick
                {TRACK_EUCLID,  8, 3, 0, 0, 9, 0, 0, 0, 24, 0, 100, 0, 12, 0, 20},   // snare
                {TRACK_EUCLID, 16, 7, 0, 0, 9, 0, 0, 0, 24, 0, 100, 0, 12, 0, 20},   // hat
                {TRACK_STEPS,  16, 4, 0, 0, 0, 0, 1, 0, 24, 0, 100, 0, 12, 0, 0}};   // C minor line
  k = d[t];
}

static void defaultSteps(uint8_t t, uint8_t note, uint8_t velocity) {
  static const uint8_t line[16] = {36, 0, 0, 39, 0, 0, 43, 0, 46, 0, 0, 43, 0, 39, 0, 0};
  for (uint8_t s = 0; s < MAX_STEPS; s++) {
    uint8_t n = note, on = 0;
    if (t == 3) { n = line[s % 16] ? line[s % 16] : 48; on = line[s % 16] ? STEP_ON : 0; }
    steps[t][s][0] = on | n;
    steps[t][s][1] = velocity;
    steps[t][s][2] = 0;
    steps[t][s][3] = 1 << 2;   // one note, 50 %
  }
}

static void defaultSequence() {
  static const uint8_t notes[4] = {36, 38, 42, 48}, vel[4] = {110, 100, 80, 100};
  for (uint8_t t = 0; t < TRACK_COUNT; t++) {
    defaultTrack(t, tracks[t]);
    defaultSteps(t, notes[t], vel[t]);
  }
  customMask = 0xFFF;
}

static void saveSequence() {
  for (uint8_t t = 0; t < TRACK_COUNT; t++) {
    saveTrack(t);
    for (uint8_t s = 0; s < MAX_STEPS; s++) saveStep(t, s);
  }
  saveCustom();
}

// Firmware 2.4 (EEPROM version 5): the settings held the Euclidean rhythms A, B
// and C. They become tracks 1 to 3 (same jack mode numbers); presets keep their
// jack settings and tempo.
static bool fromV5(const uint8_t *b, Config &out) {
  out = DEFAULT_CONFIG;
  memcpy(out.jackMode, b, 3);
  memcpy(&out.timeSig, b + 3, 8);         // time signature .. metronome
  memcpy(out.jackProb, b + 35, 3);
  memcpy(out.jackTrigger, b + 41, 3);
  memcpy(out.jackOffset, b + 44, 3);
  memcpy(out.jackDivision, b + 47, 3);
  return validConfig(out);
}

static void migrateFromV5() {
  uint8_t old[V5_CONFIG_SIZE];
  for (uint8_t i = 0; i < V5_CONFIG_SIZE; i++) old[i] = EEPROM.read(EEPROM_CONFIG + i);
  defaultSequence();
  for (uint8_t g = 0; g < 3; g++) {      // Euclidean A, B, C -> tracks 1, 2, 3
    const uint8_t *e = old + 11 + g * 8;  // steps hits rotation division midi channel note velocity
    Track &k = tracks[g];
    if (e[0] >= 1 && e[0] <= MAX_STEPS && e[1] <= e[0] && e[2] < e[0] && e[3] < 4 && e[5] < 16) {
      k.mode = TRACK_EUCLID; k.length = e[0]; k.hits = e[1]; k.rotation = e[2]; k.division = e[3];
      k.midi = e[4] ? 1 : 0; k.channel = e[5]; k.accent = 0;
      uint8_t p = old[38 + g];
      k.prob = p <= 100 ? p : 100;
      defaultSteps(g, e[6] & 0x7F, e[7] ? e[7] & 0x7F : 100);
    }
  }
  Config presets[PRESET_COUNT];
  uint16_t tempos[PRESET_COUNT];
  bool filled[PRESET_COUNT];
  for (uint8_t s = 0; s < PRESET_COUNT; s++) {
    uint16_t a = EEPROM_PRESETS + s * V5_PRESET_STRIDE;
    uint8_t b[V5_CONFIG_SIZE];
    for (uint8_t i = 0; i < V5_CONFIG_SIZE; i++) b[i] = EEPROM.read(a + 1 + i);
    filled[s] = EEPROM.read(a) == PRESET_MAGIC && fromV5(b, presets[s]);
    tempos[s] = EEPROM.read(a + 1 + V5_CONFIG_SIZE) | ((uint16_t)EEPROM.read(a + 2 + V5_CONFIG_SIZE) << 8);
  }
  if (!fromV5(old, cfg)) cfg = DEFAULT_CONFIG;
  for (uint8_t s = 0; s < PRESET_COUNT; s++) {
    if (filled[s]) writePreset(s, presets[s], tempos[s]);
    else EEPROM.update(EEPROM_PRESETS + s * PRESET_STRIDE, 0);
  }
  saveSequence();
  saveConfig();   // writes the new version number
}

static void loadSettings() {
  bool magic = EEPROM.read(0) == EEPROM_MAGIC0 && EEPROM.read(1) == EEPROM_MAGIC1;
  if (magic && EEPROM.read(2) == 5) migrateFromV5();
  bool valid = magic && EEPROM.read(2) == EEPROM_VERSION;
  if (!valid || !readConfig(EEPROM_CONFIG, cfg)) cfg = DEFAULT_CONFIG;

  if (valid) {
    for (uint8_t t = 0; t < TRACK_COUNT; t++) {
      uint8_t *p = (uint8_t *)&tracks[t];
      for (uint8_t i = 0; i < TRACK_SIZE; i++) p[i] = EEPROM.read(EEPROM_TRACKS + t * TRACK_SIZE + i);
      if (!validTrack(tracks[t])) defaultTrack(t, tracks[t]);
      for (uint8_t s = 0; s < MAX_STEPS; s++) {
        for (uint8_t i = 0; i < STEP_BYTES; i++)
          steps[t][s][i] = EEPROM.read(EEPROM_STEPS + ((uint16_t)t * MAX_STEPS + s) * STEP_BYTES + i);
        fixStep(steps[t][s]);
      }
    }
    customMask = (EEPROM.read(EEPROM_CUSTOM) | ((uint16_t)EEPROM.read(EEPROM_CUSTOM + 1) << 8)) & 0xFFF;
  } else {
    defaultSequence();
    saveSequence();
    saveConfig();
  }

  uint8_t seen = 0;   // positions must be a permutation of 0..JACK_COUNT-1
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    uint8_t p = EEPROM.read(EEPROM_POSITIONS + j);
    if (p < JACK_COUNT) seen |= 1 << p;
    jackPosition[j] = p;
  }
  if (seen != (1 << JACK_COUNT) - 1) {
    for (uint8_t j = 0; j < JACK_COUNT; j++) jackPosition[j] = j;
  }
}

static void readPot() {
  uint32_t now = millis();
  if (now - lastPotSample < POT_SAMPLE_MS) return;
  lastPotSample = now;
  uint32_t raw = (uint32_t)analogRead(POT_PIN) << 4;
  potFiltered = potFiltered + raw / 8 - potFiltered / 8;  // alpha = 1/8, ~40 ms
  potValue = potFiltered >> 4;
}

static uint16_t potDistance(uint16_t a, uint16_t b) {
  return a > b ? a - b : b - a;
}

// ============================================================= transport ==

static void sendSongPosition(uint32_t tick) {   // with interrupts off
  uint16_t sixteenths = (tick / 24) & 0x3FFF;
  Serial.write(0xF2); Serial.write(sixteenths & 0x7F); Serial.write(sixteenths >> 7);
}

static void startTransport() {
  uClock.stop();   // freeze ticks so that the restart is clean, from tick 0
  identifyJack = -1;
  noInterrupts();
  releaseNotes();
  songTick = 0;
  resetCounters(song);
  setRuns(0);
  if (cfg.songPosition) sendSongPosition(0);
  interrupts();
  bool reset = false;
  for (uint8_t j = 0; j < JACK_COUNT; j++) {
    if (cfg.jackMode[j] == MODE_RESET) { digitalWrite(JACK_PINS[j], HIGH); reset = true; }
  }
  if (reset) {
    delay(RESET_PULSE_MS);
    for (uint8_t j = 0; j < JACK_COUNT; j++) {
      if (cfg.jackMode[j] == MODE_RESET) digitalWrite(JACK_PINS[j], LOW);
    }
  }
  delay(2);        // let sequencers see the reset fall before the first clock
  pendingStart = true;
  transport = PLAYING;
  uClock.start();  // first tick: MIDI Start + Clock, every jack goes high together
  markDirty();
}

static void stopTransport(bool pause) {
  if (transport != PLAYING) return;
  transport = pause ? PAUSED : STOPPED;   // jacks fall on the next tick
  noInterrupts();
  Serial.write(0xFC);
  releaseNotes();
  interrupts();
  if (!pause) songTick = 0;
  playheadDirty = true;
  markDirty();
}

static void continueTransport() {
  if (transport != PAUSED) return;
  uClock.stop();
  noInterrupts();
  songTick -= songTick % 24;   // resume on a sixteenth, as the Song Position Pointer does
  setCounters(song, songTick);
  setRuns(songTick);
  if (cfg.songPosition) sendSongPosition(songTick);
  interrupts();
  pendingContinue = true;
  transport = PLAYING;
  uClock.start();
  markDirty();
}

static void rewindTransport() {
  if (transport == PLAYING) stopTransport(false);
  transport = STOPPED;
  songTick = 0;
  noInterrupts();
  resetCounters(song);
  setRuns(0);
  if (cfg.songPosition) sendSongPosition(0);
  interrupts();
  playheadDirty = true;
  markDirty();
}

// ========================================================= computer screen ==

static bool sendSysex(const uint8_t *msg, uint8_t len) {
  // Never block: the clock interrupt also writes to Serial.
  if (Serial.availableForWrite() < (int)len) return false;
  noInterrupts();   // keep the message in one piece in the TX buffer
  for (uint8_t i = 0; i < len; i++) Serial.write(msg[i]);
  interrupts();
  return true;
}

static void sendState() {
  uint16_t b10 = (uint16_t)(bpm * 10 + 0.5);
  uint16_t pos16 = (songTick / 24) & 0x3FFF;
  uint8_t msg[] = {
    0xF0, SYSEX_ID, SYSEX_C, SYSEX_B, CMD_STATE,
    FW_VERSION_MAJOR, FW_VERSION_MINOR,
    (uint8_t)(b10 >> 7), (uint8_t)(b10 & 0x7F),
    transport, menuActive, menuPage, menuPreset,
    (uint8_t)(potValue >> 7), (uint8_t)(potValue & 0x7F),
    buttonStable, (uint8_t)pressAction, tempoArmed, menuArmed,
    (uint8_t)(identifyJack < 0 ? 0x7F : identifyJack),
    jackPosition[0], jackPosition[1], jackPosition[2],
    (uint8_t)(pos16 >> 7), (uint8_t)(pos16 & 0x7F),
    cfg.jackMode[0], cfg.jackMode[1], cfg.jackMode[2],
    0xF7
  };
  if (!sendSysex(msg, sizeof(msg))) return;
  stateDirty = false;
  lastReportAt = millis();
  lastReportedPot = potValue;
}

static void sendConfig() {
  uint8_t msg[5 + CONFIG_SIZE + 2];
  msg[0] = 0xF0; msg[1] = SYSEX_ID; msg[2] = SYSEX_C; msg[3] = SYSEX_B; msg[4] = CMD_CONFIG;
  memcpy(msg + 5, &cfg, CONFIG_SIZE);
  uint8_t mask = 0;
  for (uint8_t s = 0; s < PRESET_COUNT; s++) if (presetFilled(s)) mask |= 1 << s;
  msg[5 + CONFIG_SIZE] = mask;
  msg[6 + CONFIG_SIZE] = 0xF7;
  if (sendSysex(msg, sizeof(msg))) configDirty = false;
}

static bool sendTrack(uint8_t t) {
  uint8_t msg[6 + TRACK_SIZE + 1];
  msg[0] = 0xF0; msg[1] = SYSEX_ID; msg[2] = SYSEX_C; msg[3] = SYSEX_B; msg[4] = CMD_TRACK; msg[5] = t;
  memcpy(msg + 6, &tracks[t], TRACK_SIZE);
  msg[6 + TRACK_SIZE] = 0xF7;
  return sendSysex(msg, sizeof(msg));
}

static bool sendStep(uint8_t t, uint8_t s) {
  const uint8_t *b = steps[t][s];
  uint8_t hi = 0;
  for (uint8_t i = 0; i < STEP_BYTES; i++) hi |= (b[i] >> 7) << i;
  uint8_t msg[] = {0xF0, SYSEX_ID, SYSEX_C, SYSEX_B, CMD_STEP, t, s,
                   (uint8_t)(b[0] & 0x7F), (uint8_t)(b[1] & 0x7F), (uint8_t)(b[2] & 0x7F), (uint8_t)(b[3] & 0x7F), hi, 0xF7};
  return sendSysex(msg, sizeof(msg));
}

static bool sendCustom() {
  uint8_t msg[] = {0xF0, SYSEX_ID, SYSEX_C, SYSEX_B, CMD_CUSTOM,
                   (uint8_t)(customMask & 0x7F), (uint8_t)(customMask >> 7), 0xF7};
  return sendSysex(msg, sizeof(msg));
}

static bool sendPlayheads() {
  uint8_t msg[11] = {0xF0, SYSEX_ID, SYSEX_C, SYSEX_B, CMD_PLAYHEAD};
  for (uint8_t t = 0; t < TRACK_COUNT; t++)
    msg[5 + t] = transport == STOPPED || tracks[t].mode == TRACK_OFF ? 0x7F : runs[t].pos;
  msg[9] = playedMask;
  msg[10] = 0xF7;
  if (!sendSysex(msg, sizeof(msg))) return false;
  playedMask = 0;
  playheadDirty = false;
  return true;
}

static void handleCommand() {
  // rxBuffer holds the bytes between F0 and F7
  if (rxLength < 4 || rxBuffer[0] != SYSEX_ID || rxBuffer[1] != SYSEX_C || rxBuffer[2] != SYSEX_B) return;
  const uint8_t *d = rxBuffer + 4;
  uint8_t n = rxLength - 4;
  switch (rxBuffer[3]) {
    case CMD_HELLO:
      reporting = true;
      markConfigDirty();
      break;
    case CMD_SET_MODE:
      if (n >= 2 && d[0] < JACK_COUNT && d[1] < MODE_COUNT) {
        cfg.jackMode[d[0]] = d[1];
        saveConfig();
        markConfigDirty();
      }
      break;
    case CMD_IDENTIFY:
      if (n >= 1) {
        if (d[0] < JACK_COUNT && transport != PLAYING && !menuActive) {
          identifyJack = d[0];
          identifyUntil = millis() + IDENTIFY_MS;
        } else {
          identifyJack = -1;
        }
        markDirty();
      }
      break;
    case CMD_SET_POSITIONS:
      if (n >= JACK_COUNT) {
        uint8_t seen = 0;
        for (uint8_t j = 0; j < JACK_COUNT; j++) if (d[j] < JACK_COUNT) seen |= 1 << d[j];
        if (seen == (1 << JACK_COUNT) - 1) {
          for (uint8_t j = 0; j < JACK_COUNT; j++) jackPosition[j] = d[j];
          saveConfig();
          markDirty();
        }
      }
      break;
    case CMD_SET_CONFIG:
      if (n >= CONFIG_SIZE) {
        Config tmp;
        memcpy(&tmp, d, CONFIG_SIZE);
        if (validConfig(tmp)) { applyConfig(tmp); saveConfig(); }
        else markConfigDirty();   // send back what the box really has
      }
      break;
    case CMD_SET_TEMPO:
      if (n >= 2) {
        uint16_t b10 = ((uint16_t)d[0] << 7) | d[1];
        if (b10 >= BPM10_MIN && b10 <= BPM10_MAX) {
          applyTempo(b10 / 10.0);
          tempoArmed = false;   // the pot takes over once moved
          potRef = potValue;
        }
      }
      break;
    case CMD_TRANSPORT:
      if (n >= 1 && !menuActive) {
        switch (d[0]) {
          case 0: startTransport(); break;
          case 1: if (transport == PLAYING) stopTransport(false); else rewindTransport(); break;
          case 2: stopTransport(true); break;
          case 3: continueTransport(); break;
          case 4: rewindTransport(); break;
        }
      }
      break;
    case CMD_PRESET:
      if (n >= 2 && d[1] < PRESET_COUNT) {
        if (d[0] == 0) loadPreset(d[1]);
        else if (d[0] == 1) savePreset(d[1]);
        else if (d[0] == 2) { EEPROM.update(EEPROM_PRESETS + d[1] * PRESET_STRIDE, 0); markConfigDirty(); }
      }
      break;
    case CMD_SET_STEP:
      if (n >= 7 && d[0] < TRACK_COUNT && d[1] < MAX_STEPS) {
        uint8_t b[STEP_BYTES];
        for (uint8_t i = 0; i < STEP_BYTES; i++) b[i] = d[2 + i] | (((d[6] >> i) & 1) << 7);
        fixStep(b);
        noInterrupts();
        memcpy(steps[d[0]][d[1]], b, STEP_BYTES);
        interrupts();
        saveStep(d[0], d[1]);
      }
      break;
    case CMD_SET_TRACK:
      if (n >= 1 + TRACK_SIZE && d[0] < TRACK_COUNT) {
        Track k;
        memcpy(&k, d + 1, TRACK_SIZE);
        if (validTrack(k)) { applyTrack(d[0], k); saveTrack(d[0]); }
        else sendTrack(d[0]);   // send back what the box really has
      }
      break;
    case CMD_DUMP:
      dumpIndex = 0;
      break;
    case CMD_SET_CUSTOM:
      if (n >= 2) {
        customMask = (d[0] | ((uint16_t)d[1] << 7)) & 0xFFF;
        saveCustom();
      }
      break;
  }
}

// Sequence dump, one message per call when there is room: tracks, custom scale, steps.
static void continueDump() {
  const int16_t total = TRACK_COUNT + 1 + TRACK_COUNT * MAX_STEPS;
  while (dumpIndex >= 0 && dumpIndex < total) {
    bool sent;
    if (dumpIndex < TRACK_COUNT) sent = sendTrack(dumpIndex);
    else if (dumpIndex == TRACK_COUNT) sent = sendCustom();
    else {
      int16_t i = dumpIndex - TRACK_COUNT - 1;
      sent = sendStep(i / MAX_STEPS, i % MAX_STEPS);
    }
    if (!sent) return;
    dumpIndex++;
  }
  dumpIndex = -1;
}

static void updateScreenLink() {
  while (Serial.available() > 0) {
    uint8_t c = Serial.read();
    if (c >= 0xF8) continue;               // real-time bytes may appear anywhere
    if (c == 0xF0) { rxInSysex = true; rxLength = 0; continue; }
    if (!rxInSysex) continue;
    if (c == 0xF7) { rxInSysex = false; handleCommand(); continue; }
    if (c & 0x80 || rxLength >= sizeof(rxBuffer)) { rxInSysex = false; continue; }
    rxBuffer[rxLength++] = c;
  }

  if (identifyJack >= 0 && (long)(millis() - identifyUntil) >= 0) {
    identifyJack = -1;
    markDirty();
  }

  if (!reporting) return;
  if (dumpIndex >= 0) continueDump();
  if (playheadDirty) sendPlayheads();
  if (potDistance(potValue, lastReportedPot) >= REPORT_POT_STEP) markDirty();
  if (millis() - lastReportAt < REPORT_MIN_INTERVAL_MS) return;
  if (configDirty) sendConfig();
  if (stateDirty) sendState();
}

// ================================================================== menu ==

static void showMenuPage() {
  menuLedPreview = false;
  menuArmed = false;
  potRef = potValue;
  menuBlinkStart = millis();
  markDirty();
}

static void enterMenu() {
  menuPage = 0;
  menuPresetChosen = false;
  showMenuPage();
  menuActive = true;
}

static void nextMenuPage() {
  menuPage = (menuPage + 1) % MENU_PAGES;
  showMenuPage();
}

static void exitMenu() {
  menuActive = false;
  menuLedPreview = false;
  if (!(menuPresetChosen && loadPreset(menuPreset))) saveConfig();
  markConfigDirty();
  tempoArmed = false;  // keep the current tempo until the pot is moved
  potRef = potValue;
}

static uint8_t potZone(uint8_t zones, uint8_t current) {
  // pot split into zones, with a dead band around each boundary (keeps current)
  uint16_t zone = 1024 / zones, margin = 8;
  uint8_t candidate = potValue / zone;
  if (candidate >= zones) candidate = zones - 1;
  uint16_t offset = potValue - candidate * zone;
  return (offset > margin && offset < zone - margin) ? candidate : current;
}

static void updateMenu() {
  if (!menuArmed && potDistance(potValue, potRef) > POT_PICKUP) {
    menuArmed = true;
    markDirty();
  }
  uint32_t t = millis() - menuBlinkStart;
  uint32_t blinks = 200UL * (menuPage + 1);

  if (menuPage < JACK_COUNT) {
    if (menuArmed) {
      uint8_t idx = 0;
      for (uint8_t i = 0; i < MODE_COUNT; i++) if (POT_ORDER[i] == cfg.jackMode[menuPage]) idx = i;
      uint8_t mode = POT_ORDER[potZone(MODE_COUNT, idx)];
      if (mode != cfg.jackMode[menuPage]) {
        cfg.jackMode[menuPage] = mode;
        markConfigDirty();
      }
    }
    // LED: page number, then it shows the selected mode
    if (t < blinks + 500) {
      menuLedPreview = false;
      digitalWrite(LED_PIN, t < blinks && (t % 200) < 70);
    } else {
      menuLedPreview = true;
    }
  } else {
    if (menuArmed) {
      uint8_t p = potZone(PRESET_COUNT, menuPreset);
      if (p != menuPreset || !menuPresetChosen) {
        menuPreset = p;
        menuPresetChosen = true;
        markDirty();
      }
    }
    // LED: 4 blinks (page), then (preset number) slow blinks, repeated
    menuLedPreview = false;
    if (t < blinks + 500) {
      digitalWrite(LED_PIN, t < blinks && (t % 200) < 70);
    } else {
      uint32_t u = (t - blinks - 500) % (400UL * (menuPreset + 1) + 1000);
      digitalWrite(LED_PIN, menuPresetChosen && u < 400UL * (menuPreset + 1) && (u % 400) < 200);
    }
  }
}

// ================================================================ button ==

static void updateButton() {
  uint32_t now = millis();
  bool raw = digitalRead(BUTTON_PIN) == HIGH;
  if (raw != buttonLastRaw) {
    buttonLastRaw = raw;
    buttonChangedAt = now;
  }
  if (raw != buttonStable && now - buttonChangedAt >= DEBOUNCE_MS) {
    buttonStable = raw;
    markDirty();
    if (buttonStable) {                          // pressed
      if (identifyJack >= 0) identifyJack = -1;
      pressStartedAt = now;
      longPressDone = false;
      if (menuActive)                 pressAction = PRESS_MENU;
      else if (transport == PLAYING) { stopTransport(cfg.buttonPauses); pressAction = PRESS_NONE; }
      else if (transport == PAUSED)   pressAction = PRESS_PAUSED;
      else                            pressAction = PRESS_STOPPED;
    } else {                                     // released
      if (!longPressDone) {
        if (pressAction == PRESS_STOPPED)     startTransport();
        else if (pressAction == PRESS_PAUSED) continueTransport();
        else if (pressAction == PRESS_MENU)   nextMenuPage();
      }
      pressAction = PRESS_NONE;
    }
  }

  if (buttonStable && !longPressDone && now - pressStartedAt >= LONG_PRESS_MS) {
    if (pressAction == PRESS_STOPPED)     { enterMenu(); longPressDone = true; }
    else if (pressAction == PRESS_MENU)   { exitMenu(); longPressDone = true; }
    else if (pressAction == PRESS_PAUSED) { rewindTransport(); longPressDone = true; }
  }
}

// ============================================================= setup/loop ==

void setup() {
  Serial.begin(31250);  // MIDI
  pinMode(BUTTON_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  for (uint8_t j = 0; j < JACK_COUNT; j++) pinMode(JACK_PINS[j], OUTPUT);

  for (uint8_t t = 0; t < TRACK_COUNT; t++) { runs[t].held = -1; runs[t].lastNote = 60; }
  loadSettings();
  rngState = (analogRead(A1) << 8) ^ analogRead(A2) ^ (uint16_t)micros() ^ potValue;
  if (!rngState) rngState = 0xACE1;
  resetCounters(song);
  resetCounters(freeRun);
  setRuns(0);

  potFiltered = (uint32_t)analogRead(POT_PIN) << 4;
  potValue = potFiltered >> 4;
  bpm = (float)(int)(potToBpm(potValue) + 0.5);

  uClock.init();
  uClock.setOutputPPQN(uClock.PPQN_96);
  uClock.setOnOutputPPQN(onClockTick);
  applyTempo(bpm);
  uClock.start();  // the clock always runs; "transport" is what the user sees
}

void loop() {
  readPot();
  updateButton();
  updateScreenLink();

  if (menuActive) {
    updateMenu();
    return;
  }

  if (!tempoArmed && potDistance(potValue, potRef) > POT_PICKUP) {
    tempoArmed = true;
    markDirty();
  }
  if (tempoArmed) {
    float target = potToBpm(potValue);
    if (fabs(target - bpm) >= BPM_HYSTERESIS) {
      float rounded = (float)(int)(target + 0.5);
      if (rounded < BPM_MIN) rounded = BPM_MIN;
      if (rounded > BPM_MAX) rounded = BPM_MAX;
      if (rounded != bpm) applyTempo(rounded);
    }
  }
}
