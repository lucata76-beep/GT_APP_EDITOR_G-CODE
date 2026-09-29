import type { FanucDiagnostic } from "@/types";

interface OpenToken {
  char: "[" | "(";
  offset: number;
  line: number;
}

export function analyzeFanucText(text: string): FanucDiagnostic[] {
  const diagnostics: FanucDiagnostic[] = [];
  const bracketStack: OpenToken[] = [];
  const loopStack: Array<{ index: string; offset: number; line: number }> = [];
  const lines = text.split("\n");
  let base = 0;

  lines.forEach((lineText, lineIndex) => {
    const line = lineIndex + 1;
    let inComment = false;
    for (let i = 0; i < lineText.length; i++) {
      const char = lineText[i];
      if (char === "(") {
        if (inComment) {
          diagnostics.push({ from: base + i, to: base + i + 1, line, severity: "warning", message: "Parentesi '(' annidata nel commento: interpretazione da verificare sul controllo/manuale." });
        } else {
          inComment = true;
          bracketStack.push({ char: "(", offset: base + i, line });
        }
      } else if (char === ")") {
        const last = bracketStack.at(-1);
        if (!inComment || last?.char !== "(") {
          diagnostics.push({ from: base + i, to: base + i + 1, line, severity: "error", message: "Parentesi ')' senza apertura corrispondente." });
        } else {
          bracketStack.pop();
          inComment = false;
        }
      } else if (!inComment && char === "[") {
        bracketStack.push({ char: "[", offset: base + i, line });
      } else if (!inComment && char === "]") {
        const last = bracketStack.at(-1);
        if (last?.char === "[") bracketStack.pop();
        else diagnostics.push({ from: base + i, to: base + i + 1, line, severity: "error", message: "Parentesi quadra ']' senza apertura corrispondente." });
      }
    }

    const codeOnly = lineText.replace(/\([^)]*\)/g, " ");
    const whileMatch = /\bWHILE\b[\s\S]*\bDO\s*(\d+)\b/i.exec(codeOnly);
    if (whileMatch) loopStack.push({ index: whileMatch[1], offset: base + whileMatch.index, line });

    for (const match of Array.from(codeOnly.matchAll(/\bEND\s*(\d+)\b/gi))) {
      const index = match[1];
      let found = -1;
      for (let i = loopStack.length - 1; i >= 0; i--) {
        if (loopStack[i].index === index) { found = i; break; }
      }
      if (found === -1) {
        diagnostics.push({ from: base + match.index!, to: base + match.index! + match[0].length, line, severity: "error", message: `END${index} senza WHILE ... DO${index} aperto.` });
      } else {
        loopStack.splice(found, 1);
      }
    }

    for (const match of Array.from(lineText.matchAll(/⟦[^⟧]+⟧|<[^>\n]+>|\?\?\?/g))) {
      diagnostics.push({ from: base + match.index!, to: base + match.index! + match[0].length, line, severity: "warning", message: "Segnaposto non risolto: completare prima dell'esportazione per uso macchina." });
    }
    base += lineText.length + 1;
  });

  for (const token of bracketStack) {
    diagnostics.push({
      from: token.offset,
      to: token.offset + 1,
      line: token.line,
      severity: "error",
      message: token.char === "[" ? "Parentesi quadra '[' non chiusa." : "Commento FANUC '(' non chiuso.",
    });
  }
  for (const loop of loopStack) {
    diagnostics.push({ from: loop.offset, to: loop.offset + 5, line: loop.line, severity: "error", message: `END${loop.index} mancante per WHILE ... DO${loop.index} aperto alla riga ${loop.line}.` });
  }

  return diagnostics.sort((a, b) => a.from - b.from || (a.severity === "error" ? -1 : 1));
}
