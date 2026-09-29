# FANUC Workshop IDE

Web app locale-first per scrivere, organizzare, importare ed esportare programmi ISO G-code FANUC e Custom Macro B. Progettata per uso in officina su portatile e iPhone.

> L’analisi dell’editor è testuale e deterministica: non è simulazione cinematica, verifica collisioni, certificazione del programma o autorizzazione all’esecuzione CNC. Questa versione non comunica con la macchina.

## Funzioni

- Editor CodeMirror 6 con evidenziazione dedicata a O/N, G/M, assi, variabili, operatori, logica Macro B e commenti tra parentesi.
- Ricerca/sostituzione, vai alla riga, Undo/Redo, posizione riga/colonna e completamenti scelti dall’utente.
- Import `.NC`, `.TAP`, `.TXT`; rilevamento UTF-8/Windows-1252 e terminatori LF/CRLF/CR/misti.
- Esportazione byte-per-byte dell’originale quando non sono state fatte modifiche né richiesta una conversione.
- Libreria IndexedDB con ricerca, recenti, preferiti, rinomina, duplicazione, eliminazione e backup/ripristino JSON.
- Modelli Macro B parametrici e personali, inseriti alla selezione/cursore e annullabili.
- Lente sul buffer reale, mouse/pointer, trascinamento touch e pinch a due dita per il font.
- Preferenze persistenti per profilo macchina, controllo, estensione, codifica, terminatori e visualizzazione.
- PWA con font incorporati e cache offline dopo il primo caricamento riuscito.

## Avvio locale

```bash
pnpm install
pnpm dev
```

Build di produzione:

```bash
pnpm check
pnpm build
```

## Uso rapido

1. **Importare:** File → Apri file oppure Libreria → Scegli file dal dispositivo.
2. **Salvare localmente:** pulsante Salva; il programma entra in IndexedDB del browser.
3. **Esportare:** Esporta/Scarica crea il file CNC. Se l’importato è invariato e l’opzione è “Conserva”, usa i byte originali.
4. **Backup:** Programmi → Backup libreria; il JSON include programmi, metadati, preferenze ed eventuali byte originali.
5. **Macro B:** aprire il pannello, impostare parametri, controllare l’anteprima e inserire. I segnaposti restano segnalati finché non vengono risolti.

## Limiti noti

- Codici M, opzioni Macro B, variabili disponibili, unità e convenzioni OEM vanno verificati sul controllo/manuale della macchina.
- Windows-1252 viene gestito; altri charset CNC legacy non sono ancora supportati.
- Un file con terminatori misti viene riesportato identico solo finché resta invariato. Dopo una modifica, “Conserva” usa CRLF come fallback e lo segnala nell’esito.
- Web Share, appunti e selettore file dipendono dalle API e dai permessi del browser.
- I test in viewport mobile non equivalgono a una verifica su iPhone/Safari fisico.

Vedere anche [mappatura Stitch](docs/STITCH_MAPPING.md).
