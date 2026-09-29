import { Settings2, X } from "lucide-react";
import type { WorkshopPreferences } from "@/types";

interface SettingsPanelProps {
  open: boolean;
  value: WorkshopPreferences;
  onChange: (value: WorkshopPreferences) => void;
  onClose: () => void;
}

export function SettingsPanel({ open, value, onChange, onClose }: SettingsPanelProps) {
  if (!open) return null;
  const machine = value.machine;
  return (
    <div className="panel-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="panel-titlebar"><div className="panel-title"><Settings2 /><div><h2 id="settings-title">Impostazioni</h2><span>Profilo locale configurabile</span></div></div><button className="icon-button" onClick={onClose} aria-label="Chiudi impostazioni"><X /></button></header>
        <div className="settings-grid">
          <div className="settings-section">
            <h3>Profilo macchina</h3>
            <label className="field"><span>Nome macchina</span><input value={machine.machineName} onChange={(event) => onChange({ ...value, machine: { ...machine, machineName: event.target.value } })} /></label>
            <label className="field"><span>Modello controllo</span><input value={machine.controlModel} onChange={(event) => onChange({ ...value, machine: { ...machine, controlModel: event.target.value } })} /></label>
            <p className="field-note">Il profilo identifica il contesto di lavoro, ma non prova opzioni, parametri, codici M o funzioni installate.</p>
          </div>
          <div className="settings-section">
            <h3>File predefiniti</h3>
            <label className="field"><span>Estensione</span><select value={machine.defaultExtension} onChange={(event) => onChange({ ...value, machine: { ...machine, defaultExtension: event.target.value as "NC" | "TAP" | "TXT" } })}><option>NC</option><option>TAP</option><option>TXT</option></select></label>
            <label className="field"><span>Codifica</span><select value={machine.defaultEncoding} onChange={(event) => onChange({ ...value, machine: { ...machine, defaultEncoding: event.target.value as "utf-8" | "windows-1252" } })}><option value="utf-8">UTF-8</option><option value="windows-1252">Windows-1252</option></select></label>
            <label className="field"><span>Terminatori in esportazione</span><select value={machine.exportLineEnding} onChange={(event) => onChange({ ...value, machine: { ...machine, exportLineEnding: event.target.value as "preserve" | "CRLF" | "LF" } })}><option value="preserve">Conserva originali; CRLF per nuovi</option><option value="CRLF">CRLF (Windows/FANUC da verificare)</option><option value="LF">LF (Unix)</option></select></label>
          </div>
          <div className="settings-section">
            <h3>Editor</h3>
            <label className="field"><span>Dimensione caratteri: {value.fontSize}px</span><input type="range" min="12" max="28" step="1" value={value.fontSize} onChange={(event) => onChange({ ...value, fontSize: Number(event.target.value) })} /></label>
            <label className="check-field"><input type="checkbox" checked={value.showLineNumbers} onChange={(event) => onChange({ ...value, showLineNumbers: event.target.checked })} /><span>Numeri di riga editor (distinti dai blocchi N)</span></label>
            <label className="check-field"><input type="checkbox" checked={value.lineWrap} onChange={(event) => onChange({ ...value, lineWrap: event.target.checked })} /><span>A capo visivo per righe lunghe</span></label>
            <label className="field"><span>Distanza visiva dal gutter: {value.visualIndent}ch</span><input type="range" min="3" max="6" step="1" value={value.visualIndent} onChange={(event) => onChange({ ...value, visualIndent: Number(event.target.value) })} /></label>
          </div>
        </div>
        <footer className="panel-actions"><button className="primary-button" onClick={onClose}>Applica e chiudi</button></footer>
      </section>
    </div>
  );
}
