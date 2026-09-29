# Piano di verifica FANUC Workshop IDE

| Flusso | Criterio |
|---|---|
| Nuovo → scrittura → Salva → Chiudi → Riapri | Testo normalizzato nell’editor identico e metadati coerenti. |
| Import → export senza modifica | SHA-256 dei byte identico, inclusi BOM e terminatori. |
| Modifica → Chiudi/Nuovo/Apri | Dialogo Salva / Scarta / Annulla visibile e bloccante. |
| Libreria → scegli programma | Buffer, nome file, cursore e stato cambiano realmente. |
| Macro → modifica parametri → Inserisci → Undo | Testo inserito alla selezione/cursore e annullato in una transazione. |
| Lente → trascina → Chiudi | Riga ingrandita deriva dal buffer corrente; il testo non cambia. |
| Font e pinch zoom | Limiti 12–28 px e preferenza persistente. |
| Offline | Dopo build e primo caricamento, shell, font ed editor disponibili senza rete. |
| Diagnostica | Parentesi, DO/END e segnaposti classificati senza dichiarazioni di sicurezza macchina. |
