# clockbox
Arduino based clock generator for musical electronic instruments with MIDI and analog clock outputs.

**Website and live screen: https://dr-john-8bits.github.io/clockbox/**

Let's watch a nice little video about what it does : https://youtu.be/OYtPbgozCbE

Original project by Alexis Zbik (2020). Version 2 (2026) adds, with no hardware change:
- one mode per jack: clocks, triplets, dotted 8th, **free divisions** (1 every N sixteenths), reset, run, and the **sequencer tracks**, with a **probability**, a **trigger or gate** pulse and an **offset** per jack;
- a **4-track MIDI sequencer** (32 steps, step or Euclidean, the 91 scales of our FM-1 synths Rhizome and Monades including microtonal ones, randomness, probability, substeps, a MIDI channel per step or ALL, a CC value per step, accent, humanize, live mute/solo) and a **MIDI metronome**;
- **time signatures**, **Song Position**, **pause/continue**, optional MIDI clock while stopped;
- **4 presets** (with their tempo), settings **export/import** as a file, a beat LED, a steadier tempo, a settings menu on the box;
- a **screen in the browser** over USB (Chrome/Edge), with every setting, tap tempo and **one-click firmware updates**.

## Build

- Board: Arduino Nano or Uno (ATmega328P).
- Library: [uClock](https://github.com/midilab/uClock) by midilab, **version 2.3.x** (Arduino Library Manager → "uClock"). Version 1.x will not build.
- `EEPROM` comes with the Arduino AVR core.
- Or flash the `.hex` built by CI from the website, or update from the website directly.

## Hardware

| Pin | Use |
|---|---|
| A0 | Tempo pot |
| D2 | Push button, active HIGH (external pull-down) |
| D9 | LED |
| D5, D7, D3 | Clock/gate jacks 1, 2, 3 (top, middle, bottom on the original box) |
| TX (D1) | MIDI out (31250 baud) |

Pins can be changed at the top of `clockbox.ino`.

## Use

- **Pot**: tempo, 30 to 240 BPM, in 1 BPM steps (filtered, so it does not wobble).
- **Button while running**: stop, immediately (or pause, if "button pauses" is on).
- **Button while paused**: short press = continue, hold 1.5 s = back to the start.
- **Button while stopped**: short press = start (on release). Hold 1.5 s = settings menu.
- **LED**: running = long flash on beat 1, short flash on the other beats. Paused = short blink every 2 beats. Stopped = off.
- **MIDI**: clock (24 PPQN), Start / Stop / Continue, Song Position before Start and Continue, sequencer notes and metronome.

### Jack modes

In pot order in the menu:

| Mode | Signal |
|---|---|
| 24 ppqn | 24 pulses per quarter note (DIN sync, some drum machines) |
| 1/16 | 4 pulses per quarter (most modular sequencers) |
| 1/16 triplet | 6 pulses per quarter |
| 1/8 | 2 pulses per quarter (Volca, Pocket Operator) |
| 1/8 triplet | 3 pulses per quarter |
| Dotted 1/8 | 1 pulse every 3 sixteenths |
| 1/4 | 1 pulse per quarter |
| 1/2 | 1 pulse every 2 quarters |
| Bar | 1 pulse per bar (chosen time signature) |
| Free division | 1 pulse every N sixteenths (N = 1-64, per jack): polyrhythms |
| Reset | 10 ms trigger on start, just before the first clock |
| Run | High while running |
| Track 1-4 | A pulse for each note played by that sequencer track |

Clock modes have a 50 % duty cycle. On start, all clocks go high together with the MIDI Start.
Per jack: a probability (0-100 %, default 100) that each pulse is sent, a pulse length (gate at 50 %, or a short trigger of one tick, about 5 ms at 120 BPM), and an offset of 0 to 15 sixteenths (clocks, bar and free division; Euclidean rhythms use their rotation). Reset and Run are never random.
Defaults: jack 1 (top) = 1/16, jack 2 (middle) = Reset, jack 3 (bottom) = 1/8.

### Sequencer

4 tracks of up to 32 steps, each in step mode or Euclidean mode (hits and rotation over the length), with its own step length (1/16, 1/8, 1/16 triplet, 1/4, 1/32), direction (forward, backward, ping-pong, random), MIDI channel (1-16 or ALL), scale and root, transpose, track probability, random notes within a range, humanize and accent. Each step has a note, a velocity, its own MIDI channel (or the track's), a probability, 1 to 4 substeps (ratchets), a note length, a random-note flag and a CC value (each track sends one CC number of its choice, on its channel, when the value changes). Tracks can be muted or soloed live from the screen (not saved).

The 91 scales come from our FM-1 synths Rhizome and Monades (`tools/import_scales.py` converts their `scale_table.inc` into `scales.h` and `site/scales.js`). Notes are always quantized to the scale; ragas use their ascending or descending form; microtonal scales send a pitch bend (±2 semitones) before each note. The sequence lives in EEPROM (one sequence; export/import as JSON from the page), and plays without a computer.

### Settings menu

1. Stop the box, then hold the button 1.5 s.
2. Pages: jack 1, jack 2, jack 3, preset. The LED first blinks the page number, then shows the selected mode (on a jack page, the jack outputs it too; other jacks are silent).
3. Turn the pot to choose (move it a little first to take over).
4. Short press: next page. Hold 1.5 s: save (EEPROM) and quit. If a preset was chosen on page 4, it is loaded.

### Screen in the browser

Open **https://dr-john-8bits.github.io/clockbox/** in Chrome or Edge (Web Serial; `site/index.html` also works offline), click **Connect the box** and pick the USB serial port. The page draws the box with a screen and shows everything live. Every setting is there: the sequencer (an overview row per track with its MIDI pill and mute/solo, click a step to turn it on, drawable lanes for note, velocity, probability, substeps, length, channel, random and CC, invent notes or a rhythm, copy a track, undo), jack modes, MIDI options, metronome, time signature, presets, export/import, transport buttons, an exact tempo, tap tempo, **Identify** to find which jack is which, and a **firmware update** button (STK500 over Web Serial, verified after writing). Small “?” buttons explain the settings.

- The box restarts once when the page connects (USB-serial DTR reset): connect before playing.
- The box sends nothing extra until the page says hello. While connected, status messages are SysEx (manufacturer ID `0x7D`), also present on the MIDI outputs. The protocol is described at the top of `clockbox.ino`.
- **Demo mode** shows the page without a box.

### CI

`.github/workflows/pages.yml` builds the firmware with arduino-cli and uClock 2.3.0 on every push and pull request, and publishes `site/` with the compiled `.hex` on GitHub Pages from `master`.

## En français

Boîtier d'horloge pour instruments électroniques : sortie MIDI, 3 jacks clock/gate et une LED.

👉 **Mode d'emploi détaillé, tout expliqué pas à pas : [MODE_D_EMPLOI.md](MODE_D_EMPLOI.md)**

- **Potard** : tempo de 30 à 240 BPM.
- **Bouton** : en marche, un appui arrête (ou met en pause, en option). À l'arrêt, un appui court lance (au relâchement) ; tenir 1,5 s ouvre le menu.
- **Jacks** : horloges, triolets, croche pointée, division libre, reset, run ou pistes du séquenceur, avec par jack une probabilité, une impulsion trigger ou gate et un décalage. Jack 1 = haut, jack 2 = milieu, jack 3 = bas. Par défaut : haut = 1/16, milieu = reset, bas = 1/8.
- **Séquenceur MIDI 4 pistes** : pas à pas ou euclidien, 91 gammes (celles de nos synthés Rhizome et Monades), aléatoire, probabilité, sous-pas, un canal par pas, un CC par pas, mute et solo en live, invention de notes ou de rythmes, annulation.
- **MIDI** : horloge, position de départ, pause et reprise, métronome en notes MIDI, mesures 4/4, 3/4, 2/4, 5/4, 6/8, 7/8.
- **4 préréglages** (avec leur tempo), rappelables depuis l'écran ou depuis le menu de la boîte, et **export/import** des réglages en fichier.
- **Écran dans le navigateur** : ouvre **https://dr-john-8bits.github.io/clockbox/** dans Chrome, clique « Connecter la boîte ». Tout s'affiche en direct, tout se règle à la souris, et le firmware se met à jour en un clic.
- À compiler avec la bibliothèque uClock **2.3.x**.
