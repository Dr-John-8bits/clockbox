# Clockbox v2 : mode d'emploi

La boîte a un **potard**, un **bouton**, une **LED**, **2 prises MIDI** et **3 jacks** de sortie.
Tout se règle aussi depuis **l'écran dans le navigateur** : https://dr-john-8bits.github.io/clockbox/ (section 5).

---

## 1. Utilisation de tous les jours

| Je veux… | Je fais… | La boîte répond… |
|---|---|---|
| Changer le tempo | Je tourne le potard | 30 BPM tout à gauche, 240 BPM tout à droite |
| Lancer | **Appui court** quand la boîte est à l'arrêt | Le départ se fait **au relâchement** du bouton. La LED se met à flasher |
| Arrêter | **Appui** pendant que ça tourne | Arrêt immédiat, dès l'appui. La LED s'éteint |

**Lire la LED :**
- **éteinte** : la boîte est à l'arrêt ;
- **un flash long, puis des flashs courts** : ça tourne. Le flash long tombe sur le 1er temps de chaque mesure, les courts sur les autres temps ;
- **un petit clignotement lent** (tous les 2 temps) : la boîte est **en pause** (voir plus bas).

**Bloquer le tempo (pour un concert) :** sur l'écran, dans la carte « Transport et tempo », coche **« 🔒 Bloquer le tempo »**. Le potard ne change plus le tempo, et la boîte redémarre à ce tempo même après avoir été débranchée. Charger un préréglage remet son tempo, qui reste bloqué. Le tempo peut toujours être changé depuis l'écran. Un petit cadenas s'affiche à côté du tempo.

**Côté MIDI :** l'horloge MIDI sort en permanence, même à l'arrêt, pour que tes machines connaissent déjà le tempo (c'est réglable). Juste avant chaque Start, la boîte envoie aussi la **position de départ** (« Song Position »), pour que les séquenceurs et les logiciels repartent bien du début.

### Pause et reprise (option)
Si tu coches « Le bouton met en pause » sur l'écran (section 5) :

| Je veux… | Je fais… |
|---|---|
| Mettre en pause | **Appui** pendant que ça tourne : tout s'arrête, mais la boîte retient où on en était |
| Reprendre là où on s'était arrêté | **Appui court** pendant la pause : la boîte envoie « Reprendre » (Continue) à tes machines MIDI |
| Revenir au début | **Tenir 1,5 s** pendant la pause : la boîte repasse à l'arrêt, prête à repartir du début |

Sans cette option, le bouton fait simplement Start et Stop, comme avant.

---

## 2. Les 3 jacks : à quoi ils servent

**Où sont les jacks :** **jack 1 = celui du haut**, **jack 2 = celui du milieu**, **jack 3 = celui du bas** (à côté du bouton rouge).

**Réglage d'origine :** haut = 1/16 (le tempo pour le séquenceur), milieu = Reset, bas = 1/8.

Chaque jack a son propre **mode**. Voici tous les modes, dans l'ordre où ils défilent sous le potard dans le menu (de gauche à droite) :

| Mode | Ce qui sort du jack | Pour quoi faire |
|---|---|---|
| **24 ppqn** | 24 impulsions par noire | Synchro DIN des vieilles boîtes à rythme Roland, Korg… |
| **1/16** | 4 impulsions par noire (doubles croches) | L'entrée « clock » de la plupart des séquenceurs modulaires |
| **1/16 triolet** | 6 impulsions par noire | Rythmes ternaires rapides |
| **1/8** | 2 impulsions par noire (croches) | Synchro des Korg Volca et des Pocket Operator |
| **1/8 triolet** | 3 impulsions par noire | Shuffle, rythmes ternaires |
| **1/8 pointée** | 1 impulsion toutes les 3 doubles croches | Contretemps, délais rythmiques |
| **1/4** | 1 impulsion par noire | Un battement par temps |
| **1/2** | 1 impulsion toutes les 2 noires | |
| **Mesure** | 1 impulsion par mesure | Déclencher quelque chose à chaque mesure (la mesure se choisit : 4/4, 3/4…) |
| **Division libre** | 1 impulsion toutes les N doubles croches (N de 1 à 64, réglé sur l'écran) | Des polyrythmes : avec N = 3, 5 ou 7, l'impulsion tourne contre la mesure et retombe sur le 1er temps de temps en temps |
| **Reset** | 1 seule impulsion courte, au moment du Start | L'entrée « reset » d'un séquenceur, pour qu'il reparte du pas 1 en même temps que tes machines MIDI |
| **Run** | Tension haute tant que ça tourne, 0 V à l'arrêt ou en pause | L'entrée « run » ou « start/stop » de certains séquenceurs |
| **Piste 1, 2, 3, 4** | Une impulsion à chaque note jouée par cette piste du séquenceur (section 4), avec ses probabilités et ses sous-pas | Le même rythme sur le modulaire et sur tes synthés MIDI |

### Impulsion : gate ou trigger
Pour chaque jack, sur l'écran :
- **Gate (50 %)** (réglage d'origine) : la tension reste haute la moitié du temps. C'est ce qu'attendent la plupart des entrées d'horloge.
- **Trigger (court)** : une impulsion très brève (environ 5 ms à 120 BPM). Pour les modules qui veulent un déclenchement court, ou quand une gate longue (sur une mesure, par exemple) gêne : une enveloppe qui resterait ouverte, un module qui compterait mal.

### Le décalage
Pour chaque jack, sur l'écran, tu peux **retarder** les impulsions de 0 à 15 doubles croches. Par exemple :
- **1/4 décalé d'une croche (1/8)** : les impulsions tombent entre les temps, sur les contretemps. Idéal pour un charleston ouvert ou un « tchak » ;
- **Mesure décalée d'une noire** : l'impulsion tombe sur le 2e temps au lieu du 1er.

Le décalage marche pour les horloges, la mesure et la division libre. Pour les pistes du séquenceur, c'est leur propre réglage qui compte (section 4).

### La probabilité
Chaque jack a aussi une **probabilité**, de 0 à 100 %, réglable sur l'écran (section 5), sous les modes du jack :
- **100 %** (réglage d'origine) : toutes les impulsions partent, comme d'habitude ;
- **en dessous** : chaque impulsion a cette chance de partir. À 50 %, environ une sur deux saute, **au hasard**. Le rythme respire et change un peu à chaque mesure : pratique pour donner de la vie à un charleston ou à une séquence ;
- **Reset** et **Run** ne sont jamais aléatoires, quelle que soit la probabilité.

> Si ta boîte est câblée autrement, l'écran (section 5) sait le découvrir : le bouton « Identifier » fait battre un seul jack, et tu indiques sa place (haut, milieu, bas). La boîte s'en souvient.

---

## 3. Le menu de la boîte, pas à pas

> Le plus simple, c'est l'écran (section 5) : on clique sur ce qu'on veut. Le menu de la boîte sert quand tu n'as pas d'ordinateur sous la main, par exemple en concert.

Le menu a **4 pages** : **jack 1**, **jack 2**, **jack 3**, puis **préréglage**.

### Entrer dans le menu
1. La boîte doit être **à l'arrêt** (LED éteinte). Si elle tourne, appuie une fois pour l'arrêter.
2. **Appuie sur le bouton et garde-le enfoncé** environ 1,5 seconde.
3. La LED se met à clignoter : tu es dans le menu. **Tu peux lâcher le bouton.**

> Si tu lâches trop tôt, avant 1,5 s, la boîte croit à un appui court et **démarre**. Pas de souci : appuie pour l'arrêter et recommence en tenant plus longtemps.

### Ce que la LED te dit dans le menu
1. **D'abord quelques éclairs rapides : c'est le numéro de la page.**
   - 1 éclair = jack 1, celui du haut
   - 2 éclairs = jack 2, celui du milieu
   - 3 éclairs = jack 3, celui du bas
   - 4 éclairs = page des préréglages
2. **Sur les pages des jacks, la LED clignote ensuite exactement comme le jack**, au rythme du mode choisi. Tu vois donc le mode sans rien brancher. Par exemple : 1/16 clignote vite (4 fois par temps), 1/4 une fois par temps, Mesure lentement, Reset fait un tout petit flash par mesure, Run reste allumée, et un rythme euclidien clignote… selon son rythme.
3. **Sur la page des préréglages**, la LED fait autant de clignotements lents que le numéro du préréglage choisi (1 à 4), en boucle.

Le jack que tu règles est **le seul qui envoie un signal** pendant le menu : branché sur un module, tu entends ou vois tout de suite le résultat.

### Changer le réglage
- **Tourne le potard.** Sur une page de jack, sa course est découpée en zones, une par mode, dans l'ordre du tableau de la section 2 : tout à gauche = 24 ppqn, tout à droite = Piste 4. Sur la page des préréglages, il y a 4 zones : 1, 2, 3, 4.
- **Pourquoi rien ne bouge au début ?** En entrant dans le menu, le potard est là où tu l'avais laissé pour le tempo. Pour ne pas changer le réglage par accident, la boîte attend que **tu tournes un peu le potard** avant de le prendre en compte. Bouge-le d'un petit cran, et ensuite il répond normalement.

### Passer à la page suivante
- **Appui court** : page suivante (jack 1 → jack 2 → jack 3 → préréglage → jack 1…). La LED refait ses éclairs rapides pour annoncer le numéro.
- Là encore, tourne un peu le potard avant qu'il agisse.

### Enregistrer et sortir
- **Garde le bouton enfoncé environ 1,5 s.** La boîte enregistre et sort du menu : la LED s'éteint, la boîte est à l'arrêt.
- **Si tu as choisi un préréglage** sur la 4e page (en tournant le potard), c'est **ce préréglage qui est chargé** en sortant. Sinon, ce sont tes changements de jacks qui sont enregistrés.
- Les réglages sont **gardés même quand on débranche la boîte**.
- **Le tempo n'a pas bougé** pendant le menu. Après la sortie, il reste celui d'avant tant que tu n'as pas tourné le potard.

> Si tu débranches la boîte **pendant** le menu, sans avoir tenu le bouton pour sortir, les changements ne sont pas enregistrés.

### Exemple
*« Je veux : jack 1 en doubles croches vers mon séquenceur, jack 2 qui envoie un reset à ce séquenceur, et jack 3 en noires. »*

1. Boîte à l'arrêt, LED éteinte. Je tiens le bouton 1,5 s et je lâche. **1 éclair** : jack 1.
2. Je bouge un peu le potard, puis je le mets presque tout à gauche, dans la 2e zone : la LED clignote vite. C'est **1/16**.
3. Appui court. **2 éclairs** : jack 2. Je tourne vers la droite jusqu'à un tout petit flash par mesure : c'est **Reset**.
4. Appui court. **3 éclairs** : jack 3. Je tourne vers le milieu jusqu'à un flash par temps : c'est **1/4**.
5. Je tiens le bouton 1,5 s : enregistré, LED éteinte.
6. Appui court : tout démarre ensemble. Le séquenceur reçoit d'abord le reset, puis les doubles croches.

---

## 4. Le séquenceur

La boîte contient un **séquenceur de 4 pistes**. Chaque piste joue des **notes MIDI** sur le synthé de ton choix, et un jack peut suivre son rythme (mode « Piste 1 » à « Piste 4 », section 2). Il se règle **sur l'écran** (section 5), carte « Séquenceur ». Une fois réglé, il est gardé dans la boîte et joue sans ordinateur.

### Faire jouer une piste sur un synthé
1. Branche la prise MIDI de la boîte sur l'entrée MIDI du synthé.
2. Dans la carte Séquenceur, chaque piste a une ligne avec sa **pastille MIDI**. Clique la pastille pour l'activer : elle devient **verte** et affiche « MIDI · canal… ». Choisis ensuite le **Canal** du synthé, juste sous les 4 lignes.
3. Lance la boîte (Start) : la piste joue.

> Attention : le canal de la carte « MIDI, métronome et mesure » est celui du **métronome**, pas celui des pistes.

Par défaut, la piste 1 joue sur le canal 1, la piste 2 sur le canal 2, la piste 3 sur le canal 3 et la piste 4 sur le canal 4 ; tu changes ça comme tu veux. Chaque piste a son canal : avec 2 pistes sur 2 canaux, tu fais jouer **2 synthés en même temps**, avec 2 séquences différentes. Le canal **ALL** envoie la même note aux 16 canaux.

### Les deux façons d'écrire une piste
- **Pas à pas** : jusqu'à 32 pas ; tu allumes les pas qui jouent et tu choisis la note de chacun.
- **Euclidien** : tu choisis un nombre de **coups** et la boîte les répartit le plus régulièrement possible sur la longueur. 3 coups sur 8 donnent le tresillo, 5 sur 16 une bossa, 4 sur 16 un coup par temps… La **rotation** décale le rythme. Chaque coup joue la note du pas où il tombe.

### Écrire une piste
- **Clique une ligne** pour choisir la piste à modifier.
- **Clique un pas** pour l'allumer ou l'éteindre, en mode pas à pas.
- Sous les pas, choisis ce que tu veux régler : **Note**, **Vélocité**, **Probabilité**, **Sous-pas**, **Longueur**, **Canal** ou **Aléatoire**. Puis **glisse à la souris sur les barres** pour dessiner les valeurs, pas par pas ou en balayant plusieurs pas d'un coup.
- Pour les notes, la hauteur de la barre choisit une note **de la gamme** ; les boutons « ▼ octave » et « ▲ octave » déplacent la plage affichée.
- **M** coupe une piste et **S** l'isole (solo), tout de suite, pendant que ça joue. C'est fait pour le live, et ce n'est pas enregistré : au prochain allumage, toutes les pistes jouent.
- **🎲 Inventer des notes** remplit la piste avec une mélodie au hasard dans la gamme, en gardant le rythme. **🎲 Inventer un rythme** tire un nouveau rythme (ou de nouveaux coups et une nouvelle rotation en euclidien).
- **Euclidien → pas à pas** transforme un rythme euclidien en pas que tu peux ensuite modifier un par un.
- **Copier cette piste vers…** recopie la piste (pas, notes, CC, réglages) sur une autre, en gardant le canal et le MIDI de la piste d'arrivée.
- **↶ Annuler** (ou Cmd+Z) défait la dernière modification du séquenceur, et ainsi de suite jusqu'à 40 fois.
- « Tout allumer », « Tout éteindre » et « Copier la 1re moitié sur la 2e » font gagner du temps.
- Les réglages moins courants sont rangés dans **« Plus de réglages de la piste »**.
- Un petit **« ? »** à côté d'un réglage l'explique en une phrase.

### Les réglages d'une piste
- **Longueur** (1 à 32 pas), **durée d'un pas** (1/16, 1/8, 1/16 triolet, 1/4, 1/32) et **sens de lecture** (avant, arrière, aller-retour, hasard). Des pistes de longueurs différentes se décalent entre elles : c'est une source de polyrythmes.
- **Gamme et tonique** : les 91 gammes de nos synthés FM-1 Rhizome et Monades (majeure, mineure, modes, pentatoniques, blues, bebop, ragas, maqams, japonaises, microtonales, et une gamme CUSTOM où tu choisis toi-même les notes). Les notes de la piste sont toujours ramenées dans la gamme : **impossible de jouer faux**. Les ragas ont une forme montante et une forme descendante, et la boîte choisit la bonne selon le sens de la mélodie.
- **Gammes microtonales** (maqams en quarts de ton, 19 et 24 tons, intonation juste…) : la boîte envoie un **pitch bend** avant chaque note. Règle la plage de pitch bend de ton synthé sur ±2 demi-tons. Le pitch bend touche tout un canal : pour jouer plusieurs notes microtonales à la fois, répartis-les sur plusieurs canaux.
- **Note la plus basse** : aucune note de la piste ne descend en dessous. Une note plus grave (écrite, aléatoire ou transposée) remonte d'une octave, en restant dans la gamme. Par défaut, c'est **MIDI 48**, le premier do du MS-20 avec le VCO1 en 32'. Les notes proposées et les barres partent de là. Le menu affiche le nom de la note et son numéro MIDI, car les noms d'octave changent d'une marque à l'autre (ici, MIDI 60 = C3).
- **Transposition** : ±24 demi-tons. **+12 = une octave plus haut, −12 = une octave plus bas**, pour toute la piste d'un coup (dans « Plus de réglages de la piste »).
- **Variations** :
  - **probabilité de la piste** : la chance que chaque pas joue ;
  - **notes aléatoires** : la chance qu'un pas joue une autre note de la gamme, dans l'**étendue** choisie ;
  - **humanisation** : une petite variation de vélocité ;
  - **accent** : le premier coup de chaque tour est plus fort.

### Le génératif : des mélodies qui évoluent toutes seules
Chaque piste a un réglage **🌱 Génératif**, juste au-dessus de ses pas :
- **Notes changées à chaque cycle** (0 à 100 %) : à chaque nouveau tour de la piste, la boîte réinvente ce pourcentage de notes.
  - **0 %** : la piste rejoue toujours ses notes ;
  - **10 à 30 %** : quelques notes changent à chaque tour, la mélodie évolue doucement en gardant son identité ;
  - **100 %** : toute la mélodie est réinventée à chaque tour.
- **Étendue** : 1, 2 ou 3 octaves au-dessus de la note la plus basse.
- **Le rythme varie aussi** (en pas à pas) : des pas s'allument ou s'éteignent au hasard.

Les notes inventées restent **dans la gamme**, jamais sous la note la plus basse, et avancent surtout par petits intervalles pour rester chantantes. Elles ne sont **pas enregistrées**, pour ne pas user la mémoire de la boîte : ta séquence écrite revient au prochain allumage. Si un tour te plaît, clique **« 📌 Garder ces notes »** pour l'enregistrer. Quand l'écran est connecté, il affiche les nouvelles notes au fil des tours.

### Les réglages d'un pas (les barres)
- **Note** : seules les notes de la gamme sont possibles.
- **Vélocité**.
- **Canal** : celui de la piste, ou un autre. Un pas peut ainsi jouer sur un autre synthé que le reste de la piste.
- **Probabilité** : de 100 % à 13 %.
- **Sous-pas** : 1 à 4 notes rapides dans la durée du pas, pour des roulements.
- **Longueur de note** : 25, 50, 75 ou 95 % du pas.
- **Note aléatoire** : ce pas joue toujours une note au hasard dans la gamme.
- **CC** : une valeur de contrôle MIDI (0 à 127) envoyée à chaque pas, sur le canal de la piste. Choisis le numéro de CC sous les barres (74 = filtre sur beaucoup de synthés, 71 = résonance) et coche « Envoyer ce CC ». La boîte n'envoie la valeur que quand elle change. **Ton synthé doit accepter ce CC** : regarde sa documentation MIDI.

### Garder ses séquences
La boîte garde **une** séquence (les 4 pistes) dans sa mémoire. Pour en garder d'autres, utilise « Exporter les réglages » (section 5) : le fichier contient aussi la séquence, et « Importer » la remet dans la boîte. Les 4 préréglages, eux, gardent les réglages des jacks, du MIDI et le tempo, mais pas la séquence.

---

## 5. L'écran dans le navigateur

La boîte n'a pas d'écran, mais l'ordinateur peut en faire un : une page qui affiche tout ce qui se passe dans la boîte, en direct, et qui permet **tous les réglages** à la souris.

### L'ouvrir
1. Branche la boîte à l'ordinateur avec son câble USB.
2. Ouvre le site **https://dr-john-8bits.github.io/clockbox/** dans **Google Chrome** (ou Microsoft Edge). Safari et Firefox ne savent pas parler au port USB. Sans internet, le fichier `site/index.html` du projet fait la même chose.
3. Clique **« Connecter la boîte »**. Dans la liste qui s'ouvre, choisis **« FT232R USB UART »**, puis **« Connexion »**.
4. La boîte **redémarre une seconde** (elle repasse à l'arrêt) : c'est normal, la puce USB fait ça à chaque connexion. Connecte-toi donc **avant** de jouer, pas en plein morceau.
5. L'écran s'allume et la pastille en haut passe à « Connecté ».

### Ce qu'on y voit
- **Une boîte dessinée** comme la vraie, avec un écran ajouté. Le potard tourne quand tu tournes le vrai, le bouton s'enfonce quand tu appuies, la LED clignote comme la vraie, et chaque jack s'allume quand il envoie une impulsion, avec son mode écrit dessous. Les prises MIDI s'allument quand la boîte envoie de l'horloge ou des notes.
- **L'écran de la boîte dessinée** montre : le tempo, en marche, en pause ou à l'arrêt, la mesure (4/4…), les temps et le numéro de mesure. Quand tu tiens le bouton, une barre se remplit jusqu'à l'action. Dans le menu, la page en cours et le mode choisi, avec ses voisins.

### Les réglages
- **Transport et tempo** : Start, Pause / Reprendre, Stop, Début. Un **tempo précis** au dixième (par exemple 92,5) et un bouton **Tap** pour taper le tempo. Le potard reprend la main dès que tu le bouges.
- **Les 3 jacks** : clique sur le mode voulu, il est envoyé et **enregistré tout de suite**. Dessous : la **probabilité**, l'**impulsion** (gate ou trigger), le **décalage**, et **N** pour la division libre. « Identifier » fait battre ce jack seul pendant 15 s ; « Place » indique où il est sur la boîte.
- **Séquenceur** : juste sous la boîte, sur toute la largeur. Voir section 4.
- **MIDI, métronome et mesure** :
  - la **mesure** : 4/4, 3/4, 2/4, 5/4, 6/8 ou 7/8 (pour le mode Mesure, le Reset, la LED et le métronome) ;
  - **envoyer la position de départ** : conseillé, laisse coché ;
  - **envoyer l'horloge même à l'arrêt** : décoche si une vieille machine se met à jouer toute seule dès qu'elle reçoit l'horloge ;
  - **le bouton met en pause** : voir section 1 ;
  - le **métronome MIDI** : une note sur le 1er temps seulement, ou sur chaque temps (le 1er plus fort), avec son canal et ses notes. Ce canal ne concerne que le métronome.
- **Préréglages** : 4 emplacements. « Enregistrer ici » garde **tout** (modes des jacks, probabilités, rythmes, MIDI, mesure) **et le tempo du moment**. En chargeant un préréglage, son tempo revient aussi ; le potard reprend la main dès que tu le bouges.
- **↺ Horloge simple** (sous les préréglages) : remet la boîte dans l'esprit de son premier firmware. Les 3 jacks passent en croches (1/8), et le MIDI n'envoie plus que l'horloge, Start et Stop : les pistes passent en « MIDI coupé », le génératif et le métronome s'arrêtent. Rien n'est effacé : ta séquence reste en mémoire, il suffit de réactiver le MIDI d'une piste (ou de charger un préréglage) pour tout retrouver. Le tempo bloqué n'est pas touché.
- **Sauvegarde** : « Exporter les réglages » télécharge un fichier `.json` avec toute ta configuration, le tempo et la place des jacks. « Importer des réglages… » le remet dans la boîte. Pratique pour garder ta configuration de concert à l'abri, la partager avec un ami qui a une clockbox, ou la remettre après une mise à jour. « Charger » le rappelle, « Effacer » le vide. Un préréglage se rappelle aussi depuis le menu de la boîte (4e page), sans ordinateur.
- **Mise à jour du firmware** : voir section 6.

Tous les réglages sont **enregistrés dans la boîte dès que tu les changes**. Tu peux débrancher l'ordinateur et partir en concert : la boîte, alimentée par un chargeur USB, démarre avec tes réglages.

### Se déconnecter
Clique « Déconnecter », ou ferme la page. **Sans la page, la boîte n'envoie rien de plus que d'habitude sur ses prises MIDI.**

> **Mode démo** : sans boîte branchée, la page fait tourner une boîte imaginaire, pour tout découvrir. Clique le bouton rouge dessiné pour start/stop.

---

## 6. Mettre à jour le firmware

Le firmware, c'est le programme qui tourne dans la boîte. Quand une nouvelle version sort, tu peux l'installer **depuis le site, sans aucun logiciel** :

1. Ouvre le site dans Chrome et connecte la boîte (section 5).
2. Descends à la carte **« Mise à jour du firmware »**. Elle indique la version de ta boîte et celle du site.
3. Clique **« Mettre à jour la boîte »** et confirme.
4. Attends environ 15 secondes, **sans débrancher le câble**. La barre avance (écriture, puis vérification).
5. La boîte redémarre et la page se reconnecte toute seule.

Si quelque chose se passe mal (câble débranché, par exemple), **la boîte n'est pas abîmée** : la partie qui permet de la mettre à jour ne s'efface jamais. Recommence simplement.

Tes réglages, tes préréglages et ta séquence sont conservés d'une version à l'autre quand c'est possible. La 2.5 et la 2.6 reprennent les réglages de la 2.4 : les rythmes euclidiens A, B et C deviennent alors les pistes 1 à 3 du séquenceur. Depuis une version plus ancienne, la boîte repart sur ses réglages d'origine. Par précaution, fais un export (carte Sauvegarde) avant une mise à jour.

---

## 7. Si ça ne marche pas comme prévu

| Problème | Explication |
|---|---|
| J'appuie longtemps et la boîte démarre au lieu d'ouvrir le menu | J'ai lâché avant 1,5 s, ou la boîte tournait déjà. Il faut partir de l'arrêt, LED éteinte |
| Dans le menu, le potard ne change rien | Il faut d'abord le bouger d'un petit cran |
| Après le menu, le potard ne change pas le tempo | Même chose : bouge-le un peu, et il reprend la main |
| Mon séquenceur démarre au pas 2 au lieu du pas 1 | Certains séquenceurs gèrent mal un reset suivi d'une impulsion d'horloge. Essaie le mode **Run** à la place du Reset |
| Une machine MIDI joue toute seule alors que la boîte est à l'arrêt | Décoche « Envoyer l'horloge MIDI même à l'arrêt » |
| Ma boîte à rythme ne repart pas du début | Laisse cochée « Envoyer la position de départ » |
| Je ne sais plus ce que j'ai réglé | Connecte l'écran, ou entre dans le menu : la LED montre le mode de chaque jack |
| « Connecter la boîte » ne montre pas « FT232R » | Vérifie le câble USB. Ferme tout autre programme qui utiliserait la boîte (IDE Arduino, autre onglet de l'écran) |
| Le séquenceur ne fait aucun son | Dans la carte Séquenceur, coche « Jouer en MIDI » sur la piste et choisis le canal de ton synthé (pas celui du métronome). Vérifie le câble MIDI |
| La barre CC ne change rien au son | Le synthé doit accepter ce numéro de CC (regarde sa documentation MIDI). Vérifie aussi que « Envoyer ce CC » est coché et que la piste joue en MIDI |
| Une gamme microtonale sonne faux | Règle la plage de pitch bend du synthé sur ±2 demi-tons |
| L'écran dit que ma boîte a un ancien firmware | Mets-la à jour depuis la carte « Mise à jour du firmware » (section 6) |

---

## 8. Avant de flasher ta propre boîte

Sauvegarde d'abord le programme qui est dedans, pour pouvoir le remettre en cas de souci. Avec l'outil `avrdude` fourni avec l'IDE Arduino, carte Nano branchée :

    avrdude -p atmega328p -c arduino -P <port série> -b 115200 -U flash:r:sauvegarde.bin:r

Avec un Nano « old bootloader », remplace `115200` par `57600`. Pour remettre la sauvegarde, utilise la même commande avec `flash:w:sauvegarde.bin:r`.
