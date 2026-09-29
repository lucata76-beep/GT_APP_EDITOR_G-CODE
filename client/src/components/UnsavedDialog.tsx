import { AlertTriangle } from "lucide-react";

interface UnsavedDialogProps {
  open: boolean;
  fileName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedDialog({ open, fileName, onSave, onDiscard, onCancel }: UnsavedDialogProps) {
  if (!open) return null;
  return (
    <div className="panel-backdrop" role="presentation">
      <section className="unsaved-dialog" role="alertdialog" aria-modal="true" aria-labelledby="unsaved-title" aria-describedby="unsaved-description">
        <div className="warning-icon"><AlertTriangle /></div>
        <h2 id="unsaved-title">Modifiche non salvate</h2>
        <p id="unsaved-description"><strong>{fileName}</strong> contiene modifiche locali. Scegliere come procedere prima di cambiare programma.</p>
        <div className="unsaved-actions"><button className="primary-button" onClick={onSave}>Salva in libreria</button><button className="danger-button" onClick={onDiscard}>Scarta modifiche</button><button className="secondary-button" onClick={onCancel}>Annulla</button></div>
      </section>
    </div>
  );
}
