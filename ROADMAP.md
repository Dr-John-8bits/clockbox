# Feuille de route

## Fait (v2.4)
Modes par jack (horloges, triolets, pointée, division libre, reset, run, euclidiens), probabilité, trigger/gate, décalage, rythmes euclidiens en MIDI, métronome, mesures, Song Position, pause/reprise, 4 préréglages avec tempo, export/import, écran dans le navigateur, mise à jour depuis le site.

## À étudier samedi 7 novembre 2026

### 0. Notes MIDI plus vivantes (déjà prévu)
- Accent sur le premier coup des rythmes euclidiens.
- Légère variation aléatoire de la vélocité.

**Règle : on ne soude rien, on exploite le matériel tel qu'il est.**

### 1. Un vrai séquenceur MIDI (pas à pas et euclidien)
- Séquences de notes (hauteur, vélocité, longueur), en mode pas à pas ou euclidien.
- Envoi sur un canal au choix : 1 à 16, ou « ALL » (la même note sur les 16 canaux).
- **Gammes** : reprendre les gammes de nos synthés FM-1 **Rhizome** et **Monades** (projets voisins `Projets-perso/M-VAVE FM1/`). Les deux utilisent la même table : `app/dsp/scale_table.inc`, générée par `tools/generate_scales.py`.
  - Cela fait 91 gammes en 15 familles, avec la gamme CUSTOM et les ragas.
  - Les notes sont ramenées dans la gamme choisie, avec une tonique au choix.
  - Les 12 gammes **microtonales** (Scala) passeraient en MIDI par du pitch bend, comme dans Monades. Le pitch bend vaut pour tout un canal : une seule note à la fois par canal.
  - Les **gamakas** (ornements des ragas) sont à étudier.
- **Aléatoire** : notes, vélocités et octaves au hasard dans la gamme, avec une intensité réglable.
- **Probabilité par pas.**
- **Sous-pas** (« substeps », ratchets) : répéter un pas 2, 3 ou 4 fois dans sa durée.
- D'autres idées à discuter : sens de lecture (avant, arrière, aller-retour, hasard), longueur différente par piste, transposition.
- Programmation sur l'écran du site ; lecture autonome, sans ordinateur, depuis la mémoire de la boîte.
- **Faisabilité : oui, sans toucher au matériel.**
  - Il reste environ 50 % de mémoire programme et 1,4 Ko de RAM.
  - Une gamme de 12 notes tient en 2 octets, une gamme microtonale en quelques dizaines. Les 91 gammes tiennent dans la mémoire programme, et leurs noms restent sur le site.
  - L'EEPROM (1 Ko) limite le stockage des séquences, par exemple à 4 pistes de 32 pas.
  - Les deux prises MIDI envoient toujours la même chose.
  - « ALL » multiplie le trafic par 16 : à réserver aux séquences peu chargées.

### 2. Les jacks pour autre chose que des horloges
- **Séquenceur de gates** (pas à pas ou euclidien, avec probabilité et sous-pas) sur les 3 jacks : faisable tel quel.
- **LFO et notes en CV : abandonnés.** Les jacks ne sortent que 0 ou 5 V, et il faudrait souder un filtre ou un convertisseur.
