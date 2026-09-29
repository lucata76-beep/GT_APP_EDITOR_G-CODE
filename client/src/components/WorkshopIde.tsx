import { Activity, AlertTriangle, Braces, Check, ChevronRight, CloudOff, Copy, Download, Eye, FileCode2, FolderOpen, HardDrive, Minus, Plus, Save, Search, Settings2, Share2, Star, Type, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CncEditor, type EditorHandle } from "@/components/CncEditor";
import { LensOverlay } from "@/components/LensOverlay";
import { LibraryPanel } from "@/components/LibraryPanel";
import { MacroPanel } from "@/components/MacroPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TopMenus, type WorkshopActions } from "@/components/TopMenus";
import { UnsavedDialog } from "@/components/UnsavedDialog";
import { analyzeFanucText } from "@/lib/diagnostics";
import { decodeCncFile, downloadBytes, prepareExport } from "@/lib/encoding";
import { createBackup, listPrograms, loadPreferences, removeProgram, restoreBackup, savePreferences, saveProgram } from "@/lib/storage";
import type { CursorPosition, DocumentModel, ProgramRecord, WorkshopPreferences } from "@/types";

const DEFAULT_PREFERENCES: WorkshopPreferences = {
  machine: { machineName: "Mikron Mill P900", controlModel: "FANUC 31i-MB/B", defaultExtension: "NC", defaultEncoding: "utf-8", exportLineEnding: "preserve" },
  fontSize: 16,
  lensZoom: 1.8,
  showLineNumbers: true,
  lineWrap: false,
  visualIndent: 3,
  theme: "dark",
};

const initialDocument = (preferences = DEFAULT_PREFERENCES): DocumentModel => ({
  fileName: `O0001.${preferences.machine.defaultExtension}`,
  content: "O0001\n(NUOVO PROGRAMMA)\n",
  savedContent: "O0001\n(NUOVO PROGRAMMA)\n",
  encoding: preferences.machine.defaultEncoding,
  bom: false,
  lineEnding: "CRLF",
});

function normalizedFileName(value: string, extension: string): string {
  const clean = value.replace(/[\\/:*?"<>|]/g, "_").trim() || "SENZA_NOME";
  return /\.[A-Za-z0-9]+$/.test(clean) ? clean : `${clean}.${extension}`;
}

function cloneArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function WorkshopIde() {
  const editorRef = useRef<EditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [document, setDocument] = useState<DocumentModel>(() => initialDocument());
  const [documentVersion, setDocumentVersion] = useState(0);
  const [cursor, setCursor] = useState<CursorPosition>({ line: 1, column: 1, from: 0, to: 0 });
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [macroOpen, setMacroOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lensActive, setLensActive] = useState(false);
  const [lensLine, setLensLine] = useState(1);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(Boolean(navigator.serviceWorker?.controller));
  const dirty = document.content !== document.savedContent;
  const diagnostics = useMemo(() => analyzeFanucText(document.content), [document.content]);

  const refreshPrograms = useCallback(async () => setPrograms(await listPrograms()), []);
  useEffect(() => {
    Promise.all([listPrograms(), loadPreferences()]).then(([storedPrograms, storedPreferences]) => {
      setPrograms(storedPrograms);
      if (storedPreferences) setPreferences(storedPreferences);
    }).catch(() => toast.error("Impossibile leggere la memoria locale del browser."));
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onController = () => setOfflineReady(true);
    window.addEventListener("online", onOnline); window.addEventListener("offline", onOffline);
    navigator.serviceWorker?.addEventListener("controllerchange", onController);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); navigator.serviceWorker?.removeEventListener("controllerchange", onController); };
  }, []);
  useEffect(() => { const id = window.setTimeout(() => savePreferences(preferences).catch(() => toast.error("Preferenze non salvate.")), 250); return () => clearTimeout(id); }, [preferences]);
  useEffect(() => { if (lensActive) setLensLine(cursor.line); }, [cursor.line, lensActive]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", beforeUnload); return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "s") { event.preventDefault(); void saveCurrent(); }
      if (event.key.toLowerCase() === "o") { event.preventDefault(); fileInputRef.current?.click(); }
    };
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  });

  const loadDocument = (next: DocumentModel) => { setDocument(next); setDocumentVersion((value) => value + 1); setLensLine(1); };
  const guard = (action: () => void | Promise<void>) => { if (dirty) setPendingAction(() => action); else void action(); };

  const buildSavedRecord = (fileName: string): ProgramRecord => {
    const existing = programs.find((item) => item.id === document.id);
    const exported = prepareExport(document, preferences.machine.exportLineEnding);
    const now = Date.now();
    return {
      id: existing?.id ?? document.id ?? crypto.randomUUID(), fileName, content: document.content,
      createdAt: existing?.createdAt ?? now, updatedAt: now, lastOpenedAt: now, favorite: existing?.favorite ?? false,
      encoding: document.encoding, bom: document.bom, lineEnding: exported.ending,
      sourceBytes: cloneArrayBuffer(exported.bytes), sourceTextNormalized: document.content,
    };
  };

  const saveCurrent = async (requestedName?: string): Promise<boolean> => {
    try {
      const fileName = normalizedFileName(requestedName ?? document.fileName, preferences.machine.defaultExtension);
      const record = buildSavedRecord(fileName);
      await saveProgram(record);
      setPrograms((items) => [record, ...items.filter((item) => item.id !== record.id)]);
      setDocument((current) => ({ ...current, id: record.id, fileName, savedContent: current.content, lineEnding: record.lineEnding, sourceBytes: record.sourceBytes, sourceTextNormalized: current.content }));
      toast.success(`${fileName} salvato nella libreria locale.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Salvataggio non riuscito.");
      return false;
    }
  };

  const newDocument = () => guard(() => loadDocument(initialDocument(preferences)));
  const closeDocument = () => guard(() => loadDocument({ ...initialDocument(preferences), fileName: `SENZA_NOME.${preferences.machine.defaultExtension}`, content: "", savedContent: "" }));
  const saveAs = () => { const name = window.prompt("Nome file per la libreria:", document.fileName); if (name?.trim()) void saveCurrent(name.trim()); };
  const duplicateDocument = () => {
    const dot = document.fileName.lastIndexOf(".");
    const name = dot > 0 ? `${document.fileName.slice(0, dot)}_COPIA${document.fileName.slice(dot)}` : `${document.fileName}_COPIA`;
    loadDocument({ ...document, id: undefined, fileName: name, savedContent: "", sourceBytes: undefined, sourceTextNormalized: undefined });
    toast.message("Copia creata: salvarla per aggiungerla alla libreria.");
  };

  const importFile = (file: File) => guard(async () => {
    if (!/\.(nc|tap|txt)$/i.test(file.name)) { toast.error("Formato non supportato. Usare .NC, .TAP o .TXT."); return; }
    const decoded = decodeCncFile(await file.arrayBuffer());
    loadDocument({ fileName: file.name, content: decoded.content, savedContent: decoded.content, encoding: decoded.encoding, bom: decoded.bom, lineEnding: decoded.lineEnding, sourceBytes: decoded.bytes, sourceTextNormalized: decoded.content });
    setLibraryOpen(false);
    if (decoded.warning) toast.warning(decoded.warning); else toast.success(`${file.name} aperto senza conversioni automatiche.`);
  });

  const openProgram = (program: ProgramRecord) => guard(async () => {
    const updated = { ...program, lastOpenedAt: Date.now() };
    await saveProgram(updated);
    setPrograms((items) => [updated, ...items.filter((item) => item.id !== updated.id)]);
    loadDocument({ id: updated.id, fileName: updated.fileName, content: updated.content, savedContent: updated.content, encoding: updated.encoding, bom: updated.bom, lineEnding: updated.lineEnding, sourceBytes: updated.sourceBytes, sourceTextNormalized: updated.sourceTextNormalized });
    setLibraryOpen(false);
  });

  const exportCurrent = (): { bytes: Uint8Array; exactOriginal: boolean } | null => {
    try {
      const result = prepareExport(document, preferences.machine.exportLineEnding);
      downloadBytes(result.bytes, normalizedFileName(document.fileName, preferences.machine.defaultExtension));
      toast.success(result.exactOriginal ? "Scaricato il contenuto originale senza ricodifica." : `Scaricato in ${document.encoding.toUpperCase()} con terminatori ${result.ending}.`);
      return result;
    } catch (error) { toast.error(error instanceof Error ? error.message : "Esportazione non riuscita."); return null; }
  };

  const copyCode = async () => { try { await navigator.clipboard.writeText(document.content); toast.success("Codice copiato negli appunti."); } catch { toast.error("Accesso agli appunti non disponibile."); } };
  const shareCurrent = async () => {
    try {
      const result = prepareExport(document, preferences.machine.exportLineEnding);
      const file = new File([result.bytes as BlobPart], document.fileName, { type: "application/octet-stream" });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) await navigator.share({ title: document.fileName, files: [file] });
      else await copyCode();
    } catch (error) { if ((error as DOMException)?.name !== "AbortError") toast.error("Condivisione non disponibile: usare Copia o Scarica."); }
  };

  const backupLibrary = () => {
    const json = JSON.stringify(createBackup(programs, preferences), null, 2);
    downloadBytes(new TextEncoder().encode(json), `fanuc-workshop-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success("Backup della libreria scaricato.");
  };
  const restoreLibrary = async (file: File) => {
    try { const restored = await restoreBackup(JSON.parse(await file.text())); setPrograms(restored.programs); if (restored.preferences) setPreferences(restored.preferences); toast.success(`${restored.programs.length} programmi ripristinati.`); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Ripristino non riuscito."); }
  };

  const renameProgram = async (program: ProgramRecord, fileName: string) => { const next = { ...program, fileName: normalizedFileName(fileName, preferences.machine.defaultExtension), updatedAt: Date.now() }; await saveProgram(next); if (document.id === next.id) setDocument((current) => ({ ...current, fileName: next.fileName })); await refreshPrograms(); };
  const duplicateProgram = async (program: ProgramRecord) => { const dot = program.fileName.lastIndexOf("."); const copy = { ...program, id: crypto.randomUUID(), fileName: `${program.fileName.slice(0, dot)}_COPIA${program.fileName.slice(dot)}`, createdAt: Date.now(), updatedAt: Date.now(), lastOpenedAt: Date.now(), favorite: false }; await saveProgram(copy); await refreshPrograms(); };
  const deleteProgram = async (program: ProgramRecord) => { await removeProgram(program.id); if (document.id === program.id) setDocument((current) => ({ ...current, id: undefined, sourceBytes: undefined })); await refreshPrograms(); toast.success("Programma eliminato dalla libreria locale."); };
  const toggleFavorite = async (program: ProgramRecord) => { await saveProgram({ ...program, favorite: !program.favorite }); await refreshPrograms(); };

  const clipboardSelection = async (mode: "copy" | "cut") => {
    const selection = editorRef.current?.getSelection();
    const text = selection?.text || (mode === "copy" ? document.content : "");
    if (!text) { toast.message("Nessuna selezione da elaborare."); return; }
    try { await navigator.clipboard.writeText(text); if (mode === "cut" && selection?.text) editorRef.current?.replaceSelection(""); }
    catch { toast.error("Accesso agli appunti non disponibile."); }
  };
  const paste = async () => { try { editorRef.current?.replaceSelection(await navigator.clipboard.readText()); } catch { toast.error("Incolla non autorizzato dal browser. Usare Ctrl+V nell’editor."); } };

  const actions: WorkshopActions = {
    newDocument, openFile: () => fileInputRef.current?.click(), openLibrary: () => setLibraryOpen(true), save: () => void saveCurrent(), saveAs, duplicateDocument, closeDocument,
    undo: () => { editorRef.current?.undo(); }, redo: () => { editorRef.current?.redo(); }, cut: () => void clipboardSelection("cut"), copy: () => void clipboardSelection("copy"), paste: () => void paste(),
    find: () => { editorRef.current?.find(); }, replace: () => { editorRef.current?.replace(); }, gotoLine: () => { editorRef.current?.gotoLine(); }, openMacro: () => setMacroOpen(true),
    download: () => { exportCurrent(); }, share: () => void shareCurrent(), backup: backupLibrary,
    zoomIn: () => setPreferences((value) => ({ ...value, fontSize: Math.min(28, value.fontSize + 1) })), zoomOut: () => setPreferences((value) => ({ ...value, fontSize: Math.max(12, value.fontSize - 1) })), zoomReset: () => setPreferences((value) => ({ ...value, fontSize: 16 })),
    toggleLens: () => setLensActive((value) => !value), openSettings: () => setSettingsOpen(true),
  };

  const statusLabel = dirty ? "MODIFICHE NON SALVATE" : document.id ? "SALVATO IN LIBRERIA" : document.sourceBytes ? "FILE INVARIATO" : document.content ? "NUOVO LOCALE" : "NESSUN PROGRAMMA";
  const recentPrograms = programs.slice(0, 5);

  return (
    <div className="workshop-shell">
      <input ref={fileInputRef} type="file" accept=".nc,.tap,.txt,text/plain" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) importFile(file); event.currentTarget.value = ""; }} />
      <header className="app-header">
        <div className="brand-block"><div className="brand-mark">F</div><div><strong>FANUC</strong><span>WORKSHOP IDE</span></div></div>
        <TopMenus actions={actions} />
        <div className="document-chip"><span className={dirty ? "status-dot dirty" : "status-dot saved"} /> <FileCode2 /> <b>{document.fileName}</b></div>
        <button className="header-save" onClick={() => void saveCurrent()}><Save />Salva</button>
        <button className="header-share" onClick={() => void shareCurrent()} aria-label="Condividi"><Share2 /></button>
        <div className="mobile-menu"><TopMenus actions={actions} compact /></div>
      </header>

      <div className="machine-strip"><div><Activity /><strong>{preferences.machine.machineName}</strong><span>·</span><span>{preferences.machine.controlModel}</span></div><div className="connectivity">{online ? <Wifi /> : <WifiOff />}<span>{online ? "Browser online" : "Browser offline"}</span><CloudOff /><span>Nessun collegamento macchina</span></div></div>

      <main className="workspace">
        <aside className="left-sidebar">
          <div className="sidebar-heading"><span>PROGRAMMI LOCALI</span><button onClick={() => setLibraryOpen(true)}>Tutti <ChevronRight /></button></div>
          <label className="sidebar-search" onClick={() => setLibraryOpen(true)}><Search /><span>Cerca libreria…</span></label>
          <div className="quick-programs">{recentPrograms.length === 0 ? <div className="sidebar-empty"><HardDrive /><p>Libreria vuota</p><button onClick={() => fileInputRef.current?.click()}>Importa file</button></div> : recentPrograms.map((program) => <button key={program.id} className={program.id === document.id ? "active" : ""} onClick={() => openProgram(program)}><FileCode2 /><span><strong>{program.fileName}</strong><small>{program.favorite && <Star />} {new Intl.DateTimeFormat("it-IT").format(program.updatedAt)}</small></span></button>)}</div>
          <div className="sidebar-actions"><button onClick={() => setLibraryOpen(true)}><FolderOpen />Apri libreria</button><button onClick={() => setMacroOpen(true)}><Braces />Macro B</button></div>
        </aside>

        <section className="editor-workspace">
          <div className="editor-toolbar">
            <div className={`state-badge ${dirty ? "dirty" : "saved"}`}><span />{statusLabel}</div>
            <span className="cursor-readout">L:{String(cursor.line).padStart(3, "0")} C:{String(cursor.column).padStart(2, "0")}</span>
            <span className="editor-mode">EDIT · FANUC ISO</span>
            <div className="zoom-controls"><button onClick={actions.zoomOut} aria-label="Riduci carattere"><Minus /></button><output>{preferences.fontSize}px</output><button onClick={actions.zoomIn} aria-label="Aumenta carattere"><Plus /></button></div>
          </div>
          <div className="editor-frame">
            <CncEditor ref={editorRef} value={document.content} documentVersion={documentVersion} fontSize={preferences.fontSize} showLineNumbers={preferences.showLineNumbers} lineWrap={preferences.lineWrap} visualIndent={preferences.visualIndent} lensActive={lensActive} onChange={(content) => setDocument((current) => ({ ...current, content }))} onCursor={setCursor} onLensLine={setLensLine} onPinchFontSize={(fontSize) => setPreferences((current) => ({ ...current, fontSize }))} />
            <LensOverlay active={lensActive} content={document.content} line={lensLine} zoom={preferences.lensZoom} onZoom={(lensZoom) => setPreferences((current) => ({ ...current, lensZoom }))} onClose={() => setLensActive(false)} />
          </div>
          <div className="cnc-command-bar"><button onClick={() => editorRef.current?.insert("#")}>#</button><button onClick={() => editorRef.current?.insert("GOTO ")}>GOTO</button><button onClick={() => editorRef.current?.insert("IF [] ")}>IF</button><button onClick={() => editorRef.current?.insert("DO1\n\nEND1")}>DO/END</button><button onClick={() => editorRef.current?.find()}><Search /></button></div>
        </section>

        <aside className="right-sidebar">
          <div className="inspector-section"><div className="sidebar-heading"><span>CONTROLLO TESTO</span><b className={diagnostics.length ? "has-issues" : "clear"}>{diagnostics.length}</b></div><p className="inspector-note">Solo regole deterministiche. Non è simulazione CNC né verifica collisioni/opzioni.</p>{diagnostics.length === 0 ? <div className="diagnostic-clear"><Check />Nessun problema rilevato dalle regole disponibili</div> : <div className="diagnostic-list">{diagnostics.slice(0, 6).map((item, index) => <button key={`${item.from}-${index}`} onClick={() => editorRef.current?.gotoLine()} className={item.severity}><AlertTriangle /><span><b>Riga {item.line}</b>{item.message}</span></button>)}</div>}</div>
          <div className="inspector-section"><div className="sidebar-heading"><span>PROFILO</span><button onClick={() => setSettingsOpen(true)}><Settings2 /></button></div><dl><div><dt>Macchina</dt><dd>{preferences.machine.machineName}</dd></div><div><dt>Controllo</dt><dd>{preferences.machine.controlModel}</dd></div><div><dt>Codifica</dt><dd>{document.encoding.toUpperCase()}</dd></div><div><dt>Terminatori</dt><dd>{document.lineEnding}</dd></div></dl><p className="verify-note">Opzioni e convenzioni OEM: da verificare sul controllo/manuale.</p></div>
        </aside>
      </main>

      <footer className="status-footer"><span>POS {cursor.line}:{cursor.column}</span><span>{document.encoding.toUpperCase()}</span><span>{document.lineEnding}</span><span>{offlineReady ? "APP DISPONIBILE OFFLINE" : "CACHE OFFLINE IN PREPARAZIONE"}</span><span className="safety-note">NON SOSTITUISCE SIMULAZIONE, PROVA A VUOTO O VERIFICA MACCHINA</span></footer>

      <nav className="mobile-bottom-nav" aria-label="Azioni rapide"><button onClick={() => setLibraryOpen(true)}><FolderOpen /><span>Apri</span></button><button onClick={() => setMacroOpen(true)}><Braces /><span>Macro B</span></button><button onClick={() => setPreferences((current) => ({ ...current, fontSize: current.fontSize >= 20 ? 14 : current.fontSize + 2 }))}><Type /><span>Dim A±</span></button><button className={lensActive ? "active" : ""} onClick={() => setLensActive((value) => !value)}><Eye /><span>Lente</span></button><button onClick={() => exportCurrent()}><Download /><span>Esporta</span></button></nav>

      <LibraryPanel open={libraryOpen} programs={programs} currentId={document.id} onClose={() => setLibraryOpen(false)} onOpen={openProgram} onImport={importFile} onRename={renameProgram} onDuplicate={duplicateProgram} onDelete={deleteProgram} onToggleFavorite={toggleFavorite} onBackup={backupLibrary} onRestore={restoreLibrary} />
      <MacroPanel open={macroOpen} insertionLabel={`riga ${cursor.line}, colonna ${cursor.column}`} onClose={() => setMacroOpen(false)} onInsert={(text) => {
        const before = cursor.from > 0 ? document.content[cursor.from - 1] : "\n";
        const after = cursor.to < document.content.length ? document.content[cursor.to] : "\n";
        const block = `${before === "\n" ? "" : "\n"}${text}${after === "\n" ? "" : "\n"}`;
        editorRef.current?.insert(block);
        setMacroOpen(false);
        toast.success("Modello inserito; Annulla ripristina il contenuto precedente.");
      }} />
      <SettingsPanel open={settingsOpen} value={preferences} onChange={setPreferences} onClose={() => setSettingsOpen(false)} />
      <UnsavedDialog open={Boolean(pendingAction)} fileName={document.fileName} onSave={() => void (async () => { if (await saveCurrent()) { const action = pendingAction; setPendingAction(null); if (action) await action(); } })()} onDiscard={() => { const action = pendingAction; setPendingAction(null); if (action) void action(); }} onCancel={() => setPendingAction(null)} />
    </div>
  );
}
