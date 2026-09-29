import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, redo, undo } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { type Diagnostic, lintGutter, linter, lintKeymap } from "@codemirror/lint";
import { gotoLine, openSearchPanel, searchKeymap } from "@codemirror/search";
import { Compartment, EditorSelection, EditorState, type Extension } from "@codemirror/state";
import { drawSelection, dropCursor, EditorView, highlightActiveLine, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from "@codemirror/view";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { analyzeFanucText } from "@/lib/diagnostics";
import { fanucCompletion, fanucHighlighting, fanucLanguage } from "@/lib/fanucLanguage";
import type { CursorPosition } from "@/types";

export interface EditorHandle {
  undo: () => boolean;
  redo: () => boolean;
  find: () => boolean;
  replace: () => boolean;
  gotoLine: () => boolean;
  focus: () => void;
  insert: (text: string) => void;
  getSelection: () => { text: string; from: number; to: number };
  replaceSelection: (text: string) => void;
  selectAll: () => void;
}

interface CncEditorProps {
  value: string;
  documentVersion: number;
  fontSize: number;
  showLineNumbers: boolean;
  lineWrap: boolean;
  visualIndent: number;
  lensActive: boolean;
  onChange: (value: string) => void;
  onCursor: (position: CursorPosition) => void;
  onLensLine: (line: number) => void;
  onPinchFontSize: (size: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const CncEditor = forwardRef<EditorHandle, CncEditorProps>(function CncEditor(props, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const callbacksRef = useRef(props);
  const gutterCompartment = useRef(new Compartment()).current;
  const wrapCompartment = useRef(new Compartment()).current;
  const themeCompartment = useRef(new Compartment()).current;
  const pinchRef = useRef<{ distance: number; size: number } | null>(null);
  callbacksRef.current = props;

  const editorTheme = (size: number, indent: number): Extension => EditorView.theme({
    "&": { height: "100%", color: "#E2E2E7", backgroundColor: "#0C0E12" },
    ".cm-scroller": { overflow: "auto", fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', Consolas, monospace" },
    ".cm-content": { padding: "18px 0 30vh", paddingLeft: `${indent}ch`, caretColor: "#FFC174", fontSize: `${size}px`, lineHeight: "1.65" },
    ".cm-line": { padding: "0 18px 0 10px" },
    ".cm-gutters": { backgroundColor: "#111317", color: "#747A84", borderRight: "1px solid #343841", fontSize: `${Math.max(12, size - 3)}px` },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 8px", minWidth: "4ch" },
    ".cm-activeLine": { backgroundColor: "#1A1C20", boxShadow: "inset 2px 0 #F59E0B" },
    ".cm-activeLineGutter": { backgroundColor: "#282A2E", color: "#FFC174" },
    ".cm-selectionBackground, ::selection": { backgroundColor: "#264F78 !important" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#FFC174", borderLeftWidth: "2px" },
    ".cm-panels": { backgroundColor: "#1A1C20", color: "#E2E2E7", borderBottom: "1px solid #343841" },
    ".cm-search": { padding: "8px" },
    ".cm-search input": { backgroundColor: "#0C0E12", border: "1px solid #535862", color: "#E2E2E7", borderRadius: "3px", minHeight: "36px" },
    ".cm-search button": { backgroundColor: "#282A2E", border: "1px solid #535862", color: "#E2E2E7", borderRadius: "3px", minHeight: "36px" },
    ".cm-tooltip": { backgroundColor: "#1E2024", color: "#E2E2E7", border: "1px solid #535862" },
    ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "#F59E0B", color: "#111317" },
    ".cm-diagnostic": { fontFamily: "'JetBrains Mono Variable', monospace" },
    ".cm-diagnostic-error": { borderLeftColor: "#EF4444" },
    ".cm-diagnostic-warning": { borderLeftColor: "#F59E0B" },
  }, { dark: true });

  const createState = (doc: string) => EditorState.create({
    doc,
    extensions: [
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      highlightActiveLine(),
      bracketMatching(),
      fanucLanguage,
      fanucHighlighting,
      autocompletion({ override: [fanucCompletion], activateOnTyping: true }),
      linter((view) => analyzeFanucText(view.state.doc.toString()).map((item): Diagnostic => ({
        from: clamp(item.from, 0, view.state.doc.length),
        to: clamp(Math.max(item.to, item.from + 1), 0, view.state.doc.length),
        severity: item.severity,
        message: item.message,
      })), { delay: 250 }),
      lintGutter(),
      keymap.of([...completionKeymap, ...searchKeymap, ...historyKeymap, ...lintKeymap, ...defaultKeymap]),
      gutterCompartment.of(callbacksRef.current.showLineNumbers ? lineNumbers() : []),
      wrapCompartment.of(callbacksRef.current.lineWrap ? EditorView.lineWrapping : []),
      themeCompartment.of(editorTheme(callbacksRef.current.fontSize, callbacksRef.current.visualIndent)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) callbacksRef.current.onChange(update.state.doc.toString());
        if (update.docChanged || update.selectionSet) {
          const selection = update.state.selection.main;
          const line = update.state.doc.lineAt(selection.head);
          callbacksRef.current.onCursor({ line: line.number, column: selection.head - line.from + 1, from: selection.from, to: selection.to });
        }
      }),
    ],
  });

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({ state: createState(props.value), parent: hostRef.current });
    viewRef.current = view;
    const selection = view.state.selection.main;
    const line = view.state.doc.lineAt(selection.head);
    props.onCursor({ line: line.number, column: 1, from: selection.from, to: selection.to });
    return () => { view.destroy(); viewRef.current = null; };
    // The editor lifecycle is intentionally tied to documentVersion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.documentVersion]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: [
      gutterCompartment.reconfigure(props.showLineNumbers ? lineNumbers() : []),
      wrapCompartment.reconfigure(props.lineWrap ? EditorView.lineWrapping : []),
      themeCompartment.reconfigure(editorTheme(props.fontSize, props.visualIndent)),
    ] });
  }, [props.fontSize, props.showLineNumbers, props.lineWrap, props.visualIndent, gutterCompartment, wrapCompartment, themeCompartment]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const lineAtPoint = (x: number, y: number) => {
      const view = viewRef.current;
      if (!view) return;
      const pos = view.posAtCoords({ x, y });
      if (pos != null) callbacksRef.current.onLensLine(view.state.doc.lineAt(pos).number);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (callbacksRef.current.lensActive && event.pointerType !== "touch") lineAtPoint(event.clientX, event.clientY);
    };
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const [a, b] = Array.from(event.touches);
        pinchRef.current = { distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), size: callbacksRef.current.fontSize };
      } else if (event.touches.length === 1 && callbacksRef.current.lensActive) {
        event.preventDefault();
        lineAtPoint(event.touches[0].clientX, event.touches[0].clientY);
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && pinchRef.current) {
        event.preventDefault();
        const [a, b] = Array.from(event.touches);
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        callbacksRef.current.onPinchFontSize(clamp(Math.round(pinchRef.current.size * distance / pinchRef.current.distance), 12, 28));
      } else if (event.touches.length === 1 && callbacksRef.current.lensActive) {
        event.preventDefault();
        lineAtPoint(event.touches[0].clientX, event.touches[0].clientY);
      }
    };
    const onTouchEnd = () => { pinchRef.current = null; };
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("touchstart", onTouchStart, { passive: false });
    host.addEventListener("touchmove", onTouchMove, { passive: false });
    host.addEventListener("touchend", onTouchEnd);
    return () => {
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("touchstart", onTouchStart);
      host.removeEventListener("touchmove", onTouchMove);
      host.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    undo: () => viewRef.current ? undo(viewRef.current) : false,
    redo: () => viewRef.current ? redo(viewRef.current) : false,
    find: () => viewRef.current ? openSearchPanel(viewRef.current) : false,
    replace: () => viewRef.current ? openSearchPanel(viewRef.current) : false,
    gotoLine: () => viewRef.current ? gotoLine(viewRef.current) : false,
    focus: () => viewRef.current?.focus(),
    insert: (text) => {
      const view = viewRef.current;
      if (!view) return;
      const selection = view.state.selection.main;
      view.dispatch({ changes: { from: selection.from, to: selection.to, insert: text }, selection: { anchor: selection.from + text.length }, scrollIntoView: true, userEvent: "input" });
      view.focus();
    },
    getSelection: () => {
      const view = viewRef.current;
      if (!view) return { text: "", from: 0, to: 0 };
      const selection = view.state.selection.main;
      return { text: view.state.sliceDoc(selection.from, selection.to), from: selection.from, to: selection.to };
    },
    replaceSelection: (text) => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch(view.state.replaceSelection(text));
      view.focus();
    },
    selectAll: () => {
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({ selection: EditorSelection.single(0, view.state.doc.length) });
      view.focus();
    },
  }), []);

  return <div ref={hostRef} className={`cnc-editor ${props.lensActive ? "is-lens-active" : ""}`} aria-label="Editor programma CNC" />;
});
