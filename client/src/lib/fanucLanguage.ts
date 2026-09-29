import { CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { HighlightStyle, StreamLanguage, type StreamParser, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

interface FanucState {
  inComment: boolean;
}

const parser: StreamParser<FanucState> = {
  startState: () => ({ inComment: false }),
  token(stream, state) {
    if (state.inComment) {
      if (stream.skipTo(")")) { stream.next(); state.inComment = false; }
      else stream.skipToEnd();
      return "comment";
    }
    if (stream.eatSpace()) return null;
    if (stream.peek() === "(") {
      stream.next();
      if (stream.skipTo(")")) stream.next(); else { stream.skipToEnd(); state.inComment = true; }
      return "comment";
    }
    if (stream.match(/(?:⟦[^⟧]*⟧|<[^>]*>|\?\?\?)/)) return "placeholder";
    if (stream.match(/#(?:\d+|\[[^\]]+\])/i)) return "variable";
    if (stream.match(/[ON]\d+/i)) return "program";
    if (stream.match(/(?:WHILE|DO|END|IF|THEN|GOTO|AND|OR|XOR|EQ|NE|GT|GE|LT|LE|SIN|COS|TAN|ATAN|SQRT|ABS|ROUND|FIX|FUP|LN|EXP|MOD)\b/i)) return "logic";
    if (stream.match(/[GM]\d+(?:\.\d+)?/i)) return "command";
    if (stream.match(/[XYZABCUVWIJKRFSTHPQDL]\s*(?:[+-]?(?:\d+(?:\.\d*)?|\.\d+)|#(?:\d+|\[[^\]]+\]))/i)) return "axis";
    if (stream.match(/[=+\-*\/\[\]]/)) return "operator";
    if (stream.match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)/)) return "number";
    if (stream.match(/[A-Z_][A-Z0-9_]*/i)) return "name";
    stream.next();
    return null;
  },
  tokenTable: {
    program: tags.labelName,
    command: tags.keyword,
    axis: tags.propertyName,
    variable: tags.variableName,
    logic: tags.controlKeyword,
    operator: tags.operator,
    number: tags.number,
    comment: tags.comment,
    placeholder: tags.invalid,
    name: tags.name,
  },
};

export const fanucLanguage = StreamLanguage.define(parser);

export const fanucHighlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.labelName, color: "#E5C07B", fontWeight: "700" },
  { tag: tags.keyword, color: "#61AFEF", fontWeight: "700" },
  { tag: tags.propertyName, color: "#98C379" },
  { tag: tags.variableName, color: "#F0818A", fontWeight: "650" },
  { tag: tags.controlKeyword, color: "#E6A86B", fontWeight: "700" },
  { tag: tags.operator, color: "#D7DCE5" },
  { tag: tags.number, color: "#C7D6E8" },
  { tag: tags.comment, color: "#8F959F", fontStyle: "italic" },
  { tag: tags.invalid, color: "#111317", backgroundColor: "#FFB95F", textDecoration: "underline" },
  { tag: tags.name, color: "#D7DCE5" },
]));

const completions = [
  { label: "G00", type: "keyword", detail: "Posizionamento rapido — comportamento da verificare sul controllo/manuale" },
  { label: "G01", type: "keyword", detail: "Interpolazione lineare" },
  { label: "G02", type: "keyword", detail: "Interpolazione circolare oraria" },
  { label: "G03", type: "keyword", detail: "Interpolazione circolare antioraria" },
  { label: "G04", type: "keyword", detail: "Sosta — unità P da verificare" },
  { label: "G17", type: "keyword", detail: "Piano XY" },
  { label: "G18", type: "keyword", detail: "Piano ZX" },
  { label: "G19", type: "keyword", detail: "Piano YZ" },
  { label: "G40", type: "keyword", detail: "Annulla compensazione raggio" },
  { label: "G49", type: "keyword", detail: "Annulla compensazione lunghezza" },
  { label: "G80", type: "keyword", detail: "Annulla ciclo fisso" },
  { label: "G90", type: "keyword", detail: "Programmazione assoluta" },
  { label: "G91", type: "keyword", detail: "Programmazione incrementale" },
  { label: "M03", type: "keyword", detail: "Mandrino orario — disponibilità da verificare" },
  { label: "M05", type: "keyword", detail: "Arresto mandrino" },
  { label: "M30", type: "keyword", detail: "Fine programma e riavvolgimento" },
  { label: "IF", type: "keyword", apply: "IF [⟦CONDIZIONE⟧] GOTO ⟦N_BLOCCO⟧" },
  { label: "WHILE", type: "keyword", apply: "WHILE [⟦CONDIZIONE⟧] DO1\n⟦ISTRUZIONI⟧\nEND1" },
  { label: "#100", type: "variable", detail: "Variabile comune: disponibilità/uso da verificare" },
];

export function fanucCompletion(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[A-Z#][A-Z0-9#]*/i);
  if (!word && !context.explicit) return null;
  return { from: word?.from ?? context.pos, options: completions, validFor: /^[A-Z#][A-Z0-9#]*$/i };
}
