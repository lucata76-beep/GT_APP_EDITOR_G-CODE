import { Crosshair, Minus, Plus, X } from "lucide-react";

interface LensOverlayProps {
  active: boolean;
  content: string;
  line: number;
  zoom: number;
  onZoom: (zoom: number) => void;
  onClose: () => void;
}

export function LensOverlay({ active, content, line, zoom, onZoom, onClose }: LensOverlayProps) {
  if (!active) return null;
  const lines = content.split("\n");
  const safeLine = Math.max(1, Math.min(line, Math.max(1, lines.length)));
  const current = lines[safeLine - 1] ?? "";
  const tokens = Array.from(new Set(current.match(/#\d+|[GM]\d+(?:\.\d+)?|[XYZABCUVWIJKRFST]\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)/gi) ?? [])).slice(0, 6);
  return (
    <aside className="lens-overlay" aria-live="polite">
      <header><div><Crosshair /><strong>LENTE ATTIVA</strong><span>{zoom.toFixed(1)}×</span></div><button className="icon-button" onClick={onClose} aria-label="Chiudi lente"><X /></button></header>
      <div className="lens-context" style={{ fontSize: `${Math.round(18 * zoom)}px` }}>
        {safeLine > 1 && <div className="lens-adjacent"><b>{String(safeLine - 1).padStart(3, "0")}</b><code>{lines[safeLine - 2]}</code></div>}
        <div className="lens-current"><b>{String(safeLine).padStart(3, "0")}</b><code>{current || " "}</code></div>
        {safeLine < lines.length && <div className="lens-adjacent"><b>{String(safeLine + 1).padStart(3, "0")}</b><code>{lines[safeLine]}</code></div>}
      </div>
      <footer>
        <div className="lens-readout"><span>RIGA EDITOR {safeLine}</span><span>{current.length} caratteri</span>{tokens.map((token) => <code key={token}>{token}</code>)}</div>
        <div className="lens-zoom"><button onClick={() => onZoom(Math.max(1.2, Number((zoom - 0.1).toFixed(1))))} aria-label="Riduci ingrandimento"><Minus /></button><output>{zoom.toFixed(1)}×</output><button onClick={() => onZoom(Math.min(2.5, Number((zoom + 0.1).toFixed(1))))} aria-label="Aumenta ingrandimento"><Plus /></button></div>
      </footer>
    </aside>
  );
}
