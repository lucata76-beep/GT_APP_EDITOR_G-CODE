import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu } from "lucide-react";

export interface WorkshopActions {
  newDocument: () => void;
  openFile: () => void;
  openLibrary: () => void;
  save: () => void;
  saveAs: () => void;
  duplicateDocument: () => void;
  closeDocument: () => void;
  undo: () => void;
  redo: () => void;
  cut: () => void;
  copy: () => void;
  paste: () => void;
  find: () => void;
  replace: () => void;
  gotoLine: () => void;
  openMacro: () => void;
  download: () => void;
  share: () => void;
  backup: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  toggleLens: () => void;
  openSettings: () => void;
}

function Item({ onSelect, children, shortcut, danger = false }: { onSelect: () => void; children: React.ReactNode; shortcut?: string; danger?: boolean }) {
  return <DropdownMenuItem className={danger ? "menu-danger" : ""} onSelect={onSelect}>{children}{shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}</DropdownMenuItem>;
}

export function TopMenus({ actions, compact = false }: { actions: WorkshopActions; compact?: boolean }) {
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button className="header-menu-button" variant="ghost" size="icon" aria-label="Apri menu"><Menu /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="industrial-menu w-64">
          <DropdownMenuLabel>FANUC Workshop IDE</DropdownMenuLabel>
          <Item onSelect={actions.newDocument}>Nuovo programma</Item><Item onSelect={actions.openFile}>Apri file…</Item><Item onSelect={actions.openLibrary}>Libreria programmi</Item>
          <DropdownMenuSeparator /><Item onSelect={actions.save}>Salva in libreria</Item><Item onSelect={actions.download}>Scarica file CNC</Item><Item onSelect={actions.share}>Condividi / copia</Item>
          <DropdownMenuSeparator /><Item onSelect={actions.find}>Trova / sostituisci</Item><Item onSelect={actions.gotoLine}>Vai alla riga</Item><Item onSelect={actions.openMacro}>Inserisci Macro B</Item>
          <DropdownMenuSeparator /><Item onSelect={actions.toggleLens}>Attiva/disattiva lente</Item><Item onSelect={actions.openSettings}>Impostazioni</Item><Item onSelect={actions.closeDocument} danger>Chiudi programma</Item>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <nav className="top-menus" aria-label="Menu principale">
      <DropdownMenu><DropdownMenuTrigger asChild><button>File <ChevronDown /></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="industrial-menu w-64"><Item onSelect={actions.newDocument}>Nuovo</Item><Item onSelect={actions.openFile}>Apri file…<DropdownMenuShortcut>Ctrl+O</DropdownMenuShortcut></Item><Item onSelect={actions.openLibrary}>Apri dalla libreria</Item><DropdownMenuSeparator /><Item onSelect={actions.save}>Salva in libreria<DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut></Item><Item onSelect={actions.saveAs}>Salva con nome…</Item><Item onSelect={actions.duplicateDocument}>Duplica</Item><DropdownMenuSeparator /><Item onSelect={actions.closeDocument} danger>Chiudi</Item></DropdownMenuContent></DropdownMenu>
      <DropdownMenu><DropdownMenuTrigger asChild><button>Modifica <ChevronDown /></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="industrial-menu w-64"><Item onSelect={actions.undo}>Annulla<DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut></Item><Item onSelect={actions.redo}>Ripeti<DropdownMenuShortcut>Ctrl+Y</DropdownMenuShortcut></Item><DropdownMenuSeparator /><Item onSelect={actions.cut}>Taglia</Item><Item onSelect={actions.copy}>Copia</Item><Item onSelect={actions.paste}>Incolla</Item><DropdownMenuSeparator /><Item onSelect={actions.find}>Trova<DropdownMenuShortcut>Ctrl+F</DropdownMenuShortcut></Item><Item onSelect={actions.replace}>Sostituisci</Item><Item onSelect={actions.gotoLine}>Vai alla riga</Item></DropdownMenuContent></DropdownMenu>
      <DropdownMenu><DropdownMenuTrigger asChild><button>Inserisci <ChevronDown /></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="industrial-menu w-56"><Item onSelect={actions.openMacro}>Macro B e modelli personali</Item></DropdownMenuContent></DropdownMenu>
      <DropdownMenu><DropdownMenuTrigger asChild><button>Programmi <ChevronDown /></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="industrial-menu w-56"><Item onSelect={actions.openLibrary}>Tutti / recenti / preferiti</Item><Item onSelect={actions.openLibrary}>Cerca e organizza</Item><Item onSelect={actions.backup}>Backup libreria</Item></DropdownMenuContent></DropdownMenu>
      <DropdownMenu><DropdownMenuTrigger asChild><button>Visualizza <ChevronDown /></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="industrial-menu w-60"><Item onSelect={actions.zoomIn}>Aumenta carattere</Item><Item onSelect={actions.zoomOut}>Riduci carattere</Item><Item onSelect={actions.zoomReset}>Ripristina 16 px</Item><DropdownMenuSeparator /><Item onSelect={actions.toggleLens}>Lente codice</Item><Item onSelect={actions.openSettings}>Opzioni visualizzazione</Item></DropdownMenuContent></DropdownMenu>
    </nav>
  );
}
