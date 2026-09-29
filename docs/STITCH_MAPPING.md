# Mappatura riferimenti Stitch → componenti reali

I file HTML originali sono conservati in `docs/stitch-html/`. Le quattro immagini originali sono conservate fuori dal bundle WebDev in `/home/ubuntu/webdev-static-assets/fanuc-workshop-ide-stitch/` per evitare di appesantire la distribuzione; gli hash SHA-256 sono riportati sotto.

| File Stitch | Ruolo originale | Componente/funzione reale | Adattamento effettuato |
|---|---|---|---|
| `DESIGN.md` | Design system | `client/src/index.css` | Palette industriale, Inter/JetBrains Mono locali, geometria rigida e target touch; omesso il commento `;` perché non assunto come regola FANUC universale. |
| `01_code.html` | Prototipo editor mobile | `WorkshopIde`, `CncEditor`, toolbar mobile | Editor CodeMirror 6 reale, stato documento, cursore, diagnostica, zoom, ricerca e comandi; eliminata la tastiera disegnata, usata quella nativa. |
| `01_screen.png` | Riferimento visivo editor | Shell e layout mobile | Gerarchia, barra macchina, comandi rapidi e bottom navigation mantenuti; stato salvato/modificato reso mutuamente esclusivo e reale. |
| `02_code.html` | Prototipo libreria | `LibraryPanel`, `storage.ts` | Ricerca, recenti, preferiti, rinomina, duplica, elimina, import e backup su IndexedDB. |
| `02_screen.png` | Riferimento visivo libreria | Lista programmi responsive | Rimossi DNC, memoria NC, buffer, OEM e AirDrop simulati; sostituiti con memoria locale browser e Web Share reale se disponibile. |
| `03_code.html` | Prototipo Macro B | `MacroPanel` | Parametri reali per WHILE, IF/GOTO, IF/THEN e assegnazione; inserimento alla selezione/cursore con Undo. |
| `03_screen.png` | Riferimento visivo Macro B | Pannello modale/bottom sheet | Anteprima parametrica mantenuta; riga fissa rimossa; segnaposti espliciti e diagnostici. |
| `04_code.html` | Prototipo lente | `LensOverlay`, eventi pointer/touch di `CncEditor` | La lente usa il buffer corrente e la riga realmente puntata; niente valori variabile o dati controllo simulati. |
| `04_screen.png` | Riferimento visivo lente | Overlay ingrandito e pinch | Struttura ingranditore mantenuta; un dito sposta la riga in modalità lente, due dita regolano il font editor. |

## Hash SHA-256 degli originali

```text
c3d4793d6f9f658bb1cdeae8ab59fc980fa4c672ea7b1ab3ba8da2fc9a8d1369  DESIGN.md
9531e08c7d7f10989a5243e35177fd5697a47854a622791dfacd709aafcceedd  01_code.html
f46ef3b483d6b5cd0e1275da4aa8494a31b7cd07d34f0b49f6c4148e2ddbe261  02_code.html
b0d24d49b5aa80a1be2879ff4d04c498d04b023d5078df5aee98524d7c0a3e6f  03_code.html
8541cd8e3eafae7fe84da9a2c7cbd2f8555a305c333ea1293d7f5d9029b187ea  04_code.html
aeaa8d4721ee24f962639b8327e4446df68b083e11de89bab5e8702c3f21f774  01_screen.png
c283217c9c068a243c403b1bbbe26adacdf8e08f8f4d4b4559357211cfe1248c  02_screen.png
0f6c1c424db862cb9b857c9f3bb55cda83600923737059c84c851120d0a289be  03_screen.png
4bdde333460e0098240f32a5a439ebc6b114ba7ecb000c6c36e39ec03173837a  04_screen.png
```
