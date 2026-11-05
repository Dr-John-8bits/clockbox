# Feuille de route

## Fait (v2.4)
Modes par jack (horloges, triolets, pointée, division libre, reset, run, euclidiens), probabilité, trigger/gate, décalage, rythmes euclidiens en MIDI, métronome, mesures, Song Position, pause/reprise, 4 préréglages avec tempo, export/import, écran dans le navigateur, mise à jour depuis le site.

## À étudier samedi 7 novembre 2026

### 0. Notes MIDI plus vivantes (déjà prévu)
- Accent sur le premier coup des rythmes euclidiens.
- Légère variation aléatoire de la vélocité.

### 1. Un vrai séquenceur MIDI (pas à pas et euclidien)
- Séquences de notes (hauteur, vélocité, longueur, probabilité par pas), en mode pas à pas ou euclidien.
- Envoi sur un canal au choix : 1 à 16, ou « ALL » (la même note sur les 16 canaux).
- Programmation sur l'écran du site ; lecture autonome, sans ordinateur, depuis la mémoire de la boîte.
- **Faisabilité : oui, sans toucher au matériel.**
  - Il reste environ 50 % de mémoire programme et 1,4 Ko de RAM.
  - L'EEPROM (1 Ko) limite le stockage, par exemple à 4 pistes de 32 pas.
  - Les deux prises MIDI envoient toujours la même chose.
  - « ALL » multiplie le trafic par 16 : à réserver aux séquences peu chargées.

### 2. Les jacks pour autre chose que des horloges
- **Séquenceur de gates** (pas à pas ou euclidien) sur les jacks : **faisable sans matériel**, c'est le prolongement de ce qui existe.
- **LFO et notes en CV** : les jacks ne sortent que 0 ou 5 V. Il faudrait :
  - pour un **LFO** : du PWM (possible sur D3 et D5, pas sur D7) **plus un petit filtre RC** (1 résistance et 1 condensateur par jack) ;
  - pour des **notes en CV (1 V/oct)** : un **convertisseur DAC** (par exemple un MCP4725 ou un MCP4822). Le PWM 8 bits est trop imprécis pour accorder des notes.
  - **Ces deux points demandent donc une petite modification matérielle (soudure).** À décider samedi.
