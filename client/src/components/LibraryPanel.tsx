import { Clock3, Copy, Download, FileInput, FolderOpen, Pencil, Search, Star, Trash2, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ProgramRecord } from "@/types";

type Filter = "all" | "recent" | "favorites";

interface LibraryPanelProps {
  open: boolean;
  programs: ProgramRecord[];
  currentId?: string;
  onClose: () => void;
  onOpen: (program: ProgramRecord) => void;
  onImport: (file: File) => void;
  onRename: (program: ProgramRecord, fileName: string) => void;
  onDuplicate: (program: ProgramRecord) => void;
  onDelete: (program: ProgramRecord) => void;
  onToggleFavorite: (program: ProgramRecord) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

export function LibraryPanel(props: LibraryPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const importRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("it");
    return props.programs.filter((program) => {
      if (filter === "favorites" && !program.favorite) return false;
      if (filter === "recent" && Date.now() - program.lastOpenedAt > 1000 * 60 * 60 * 24 * 14) return false;
      return !q || `${program.fileName}\n${program.content}`.toLocaleLowerCase("it").includes(q);
    });
  }, [props.programs, query, filter]);

  if (!props.open) return null;

  return (
    <div className="panel-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && props.onClose()}>
      <section className="library-panel" role="dialog" aria-modal="true" aria-labelledby="library-title">
        <header className="panel-titlebar">
          <div className="panel-title"><FolderOpen size={20} /><div><h2 id="library-title">Libreria programmi</h2><span>Memoria locale del browser · nessun collegamento CNC</span></div></div>
          <button className="icon-button" onClick={props.onClose} aria-label="Chiudi libreria"><X /></button>
        </header>

        <div className="library-controls">
          <label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nome, codice O o testo…" autoFocus /></label>
          <div className="filter-tabs" role="tablist">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Tutti <b>{props.programs.length}</b></button>
            <button className={filter === "recent" ? "active" : ""} onClick={() => setFilter("recent")}><Clock3 />Recenti</button>
            <button className={filter === "favorites" ? "active" : ""} onClick={() => setFilter("favorites")}><Star />Preferiti</button>
          </div>
        </div>

        <div className="program-list">
          {filtered.length === 0 && <div className="empty-state"><Search /><h3>Nessun programma trovato</h3><p>Modifica la ricerca oppure importa un file .NC, .TAP o .TXT accessibile dal dispositivo.</p></div>}
          {filtered.map((program) => {
            const firstComment = program.content.match(/\(([^)]+)\)/)?.[1] ?? "Programma CNC locale";
            const size = new Blob([program.content]).size;
            return (
              <article className={`program-card ${props.currentId === program.id ? "current" : ""}`} key={program.id}>
                <div className="program-main" onClick={() => props.onOpen(program)} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && props.onOpen(program)}>
                  <div className="program-code"><strong>{program.fileName}</strong>{props.currentId === program.id && <span>APERTO</span>}</div>
                  <h3>{firstComment}</h3>
                  <div className="program-meta"><span>{(size / 1024).toFixed(1)} KB</span><span>{program.encoding.toUpperCase()}</span><span>{program.lineEnding}</span><time>{new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(program.updatedAt)}</time></div>
                </div>
                <div className="program-actions">
                  <button onClick={() => props.onToggleFavorite(program)} aria-label={program.favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"} className={program.favorite ? "is-favorite" : ""}><Star /></button>
                  <button onClick={() => { const value = window.prompt("Nuovo nome file:", program.fileName); if (value?.trim()) props.onRename(program, value.trim()); }} aria-label="Rinomina"><Pencil /></button>
                  <button onClick={() => props.onDuplicate(program)} aria-label="Duplica"><Copy /></button>
                  <button onClick={() => window.confirm(`Eliminare definitivamente ${program.fileName} dalla libreria locale?`) && props.onDelete(program)} aria-label="Elimina" className="danger"><Trash2 /></button>
                  <button className="open-program" onClick={() => props.onOpen(program)}><FolderOpen />Apri</button>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="library-footer">
          <input ref={importRef} type="file" accept=".nc,.tap,.txt,text/plain" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) props.onImport(file); event.currentTarget.value = ""; }} />
          <input ref={restoreRef} type="file" accept="application/json,.json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) props.onRestore(file); event.currentTarget.value = ""; }} />
          <button className="primary-button" onClick={() => importRef.current?.click()}><FileInput />Scegli file dal dispositivo</button>
          <button className="secondary-button" onClick={props.onBackup}><Download />Backup libreria</button>
          <button className="secondary-button" onClick={() => restoreRef.current?.click()}><Upload />Ripristina backup</button>
        </footer>
      </section>
    </div>
  );
}
