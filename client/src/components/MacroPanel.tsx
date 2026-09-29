import { BookmarkPlus, Braces, GitBranch, Hash, Repeat2, X } from "lucide-react";
import { useMemo, useState } from "react";

interface PersonalTemplate { id: string; name: string; text: string }
type MacroType = "while" | "if-goto" | "if-then" | "assign" | "personal";

interface MacroPanelProps {
  open: boolean;
  insertionLabel: string;
  onClose: () => void;
  onInsert: (text: string) => void;
}

const PERSONAL_KEY = "fanuc-workshop-personal-templates";

function readPersonal(): PersonalTemplate[] {
  try { return JSON.parse(localStorage.getItem(PERSONAL_KEY) ?? "[]"); } catch { return []; }
}

export function MacroPanel({ open, insertionLabel, onClose, onInsert }: MacroPanelProps) {
  const [type, setType] = useState<MacroType>("while");
  const [variable, setVariable] = useState("#100");
  const [targetVariable, setTargetVariable] = useState("#101");
  const [operator, setOperator] = useState("LT");
  const [limit, setLimit] = useState("10");
  const [index, setIndex] = useState(1);
  const [personal, setPersonal] = useState<PersonalTemplate[]>(readPersonal);
  const [selectedPersonal, setSelectedPersonal] = useState<string>("");

  const preview = useMemo(() => {
    const safeIndex = Math.min(3, Math.max(1, index));
    if (type === "if-goto") return `IF [${variable} ${operator} ${limit}] GOTO ⟦N_BLOCCO⟧`;
    if (type === "if-then") return `IF [${variable} ${operator} ${limit}] THEN ${targetVariable} = ⟦VALORE⟧`;
    if (type === "assign") return `${variable} = ⟦ESPRESSIONE⟧`;
    if (type === "personal") return personal.find((item) => item.id === selectedPersonal)?.text ?? "";
    return `WHILE [${variable} ${operator} ${limit}] DO${safeIndex}\n⟦ISTRUZIONI⟧\nEND${safeIndex}`;
  }, [type, variable, targetVariable, operator, limit, index, personal, selectedPersonal]);

  if (!open) return null;

  const savePersonal = () => {
    if (!preview) return;
    const name = window.prompt("Nome del modello personale:", "Nuovo modello Macro B");
    if (!name?.trim()) return;
    const next = [...personal, { id: crypto.randomUUID(), name: name.trim(), text: preview }];
    localStorage.setItem(PERSONAL_KEY, JSON.stringify(next));
    setPersonal(next);
  };

  return (
    <div className="panel-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="macro-panel" role="dialog" aria-modal="true" aria-labelledby="macro-title">
        <header className="panel-titlebar">
          <div className="panel-title"><Braces size={20} /><div><h2 id="macro-title">Macro B FANUC</h2><span>Inserimento: {insertionLabel}</span></div></div>
          <button className="icon-button" onClick={onClose} aria-label="Chiudi pannello Macro B"><X /></button>
        </header>

        <nav className="macro-tabs" aria-label="Categorie Macro B">
          <button className={type === "while" ? "active" : ""} onClick={() => setType("while")}><Repeat2 />Ciclo WHILE</button>
          <button className={type === "if-goto" ? "active" : ""} onClick={() => setType("if-goto")}><GitBranch />IF / GOTO</button>
          <button className={type === "if-then" ? "active" : ""} onClick={() => setType("if-then")}><GitBranch />IF / THEN</button>
          <button className={type === "assign" ? "active" : ""} onClick={() => setType("assign")}><Hash />Assegna</button>
          <button className={type === "personal" ? "active" : ""} onClick={() => setType("personal")}><BookmarkPlus />Personali</button>
        </nav>

        <div className="macro-body">
          <div className="macro-form">
            {type === "personal" ? (
              <label className="field"><span>Modello personale</span><select value={selectedPersonal} onChange={(event) => setSelectedPersonal(event.target.value)}><option value="">Seleziona…</option>{personal.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            ) : (
              <>
                <label className="field"><span>Variabile</span><input value={variable} onChange={(event) => setVariable(event.target.value.toUpperCase())} spellCheck={false} /></label>
                {type === "if-then" && <label className="field"><span>Variabile destinazione</span><input value={targetVariable} onChange={(event) => setTargetVariable(event.target.value.toUpperCase())} spellCheck={false} /></label>}
                {(type === "while" || type.startsWith("if")) && <label className="field"><span>Operatore relazionale</span><select value={operator} onChange={(event) => setOperator(event.target.value)}><option>LT</option><option>LE</option><option>GT</option><option>GE</option><option>EQ</option><option>NE</option></select></label>}
                {(type === "while" || type.startsWith("if")) && <label className="field"><span>Valore limite</span><input value={limit} onChange={(event) => setLimit(event.target.value.toUpperCase())} spellCheck={false} /></label>}
                {type === "while" && <label className="field"><span>Indice DO / END (1–3)</span><div className="stepper"><button onClick={() => setIndex((value) => Math.max(1, value - 1))}>−</button><output>{index}</output><button onClick={() => setIndex((value) => Math.min(3, value + 1))}>+</button></div></label>}
              </>
            )}
          </div>
          <div className="macro-preview">
            <div className="preview-heading"><span>ANTEPRIMA ISO</span><span>Segnaposti evidenziati dal controllo sintattico</span></div>
            <pre>{preview || "Nessun modello selezionato"}</pre>
            <p>Le variabili e le funzioni disponibili dipendono da serie, opzioni, parametri e costruttore: <strong>da verificare sul controllo/manuale</strong>.</p>
          </div>
        </div>

        <footer className="panel-actions">
          {type !== "personal" && <button className="secondary-button" onClick={savePersonal}><BookmarkPlus />Salva come personale</button>}
          <button className="primary-button" disabled={!preview} onClick={() => onInsert(preview)}><Braces />Inserisci alla {insertionLabel}</button>
        </footer>
      </section>
    </div>
  );
}
