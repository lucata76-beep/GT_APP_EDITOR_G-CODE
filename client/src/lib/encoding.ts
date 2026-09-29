import type { ExportLineEnding, LineEnding, TextEncoding } from "@/types";

const CP1252_DECODE: Record<number, number> = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e,
  0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6,
  0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152,
  0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c,
  0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a,
  0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
};
const CP1252_ENCODE = new Map(Object.entries(CP1252_DECODE).map(([byte, point]) => [point, Number(byte)]));

export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function detectLineEnding(text: string): LineEnding {
  const crlf = (text.match(/\r\n/g) ?? []).length;
  const withoutCrlf = text.replace(/\r\n/g, "");
  const cr = (withoutCrlf.match(/\r/g) ?? []).length;
  const lf = (withoutCrlf.match(/\n/g) ?? []).length;
  const used = [crlf > 0, cr > 0, lf > 0].filter(Boolean).length;
  if (used > 1) return "MIXED";
  if (crlf) return "CRLF";
  if (cr) return "CR";
  if (lf) return "LF";
  return "NONE";
}

export interface DecodedCncFile {
  content: string;
  encoding: TextEncoding;
  bom: boolean;
  lineEnding: LineEnding;
  bytes: ArrayBuffer;
  warning?: string;
}

export function decodeCncFile(buffer: ArrayBuffer): DecodedCncFile {
  const bytes = new Uint8Array(buffer);
  const bom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  const body = bom ? bytes.subarray(3) : bytes;
  let text: string;
  let encoding: TextEncoding = "utf-8";
  let warning: string | undefined;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    encoding = "windows-1252";
    text = new TextDecoder("windows-1252").decode(body);
    warning = "Il file non è UTF-8 valido: aperto come Windows-1252. Verificare la codifica prevista dal controllo/manuale.";
  }
  return {
    content: normalizeLineEndings(text),
    encoding,
    bom,
    lineEnding: detectLineEnding(text),
    bytes: buffer.slice(0),
    warning,
  };
}

export function applyLineEnding(text: string, ending: "LF" | "CRLF" | "CR"): string {
  const normalized = normalizeLineEndings(text);
  if (ending === "CRLF") return normalized.replace(/\n/g, "\r\n");
  if (ending === "CR") return normalized.replace(/\n/g, "\r");
  return normalized;
}

export function resolveExportLineEnding(original: LineEnding, preference: ExportLineEnding): "LF" | "CRLF" | "CR" {
  if (preference === "LF" || preference === "CRLF") return preference;
  if (original === "LF" || original === "CRLF" || original === "CR") return original;
  return "CRLF";
}

export function encodeText(text: string, encoding: TextEncoding, bom = false): Uint8Array {
  if (encoding === "utf-8") {
    const body = new TextEncoder().encode(text);
    if (!bom) return body;
    const result = new Uint8Array(body.length + 3);
    result.set([0xef, 0xbb, 0xbf]);
    result.set(body, 3);
    return result;
  }

  const output: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code <= 0x7f || (code >= 0xa0 && code <= 0xff)) output.push(code);
    else if (CP1252_ENCODE.has(code)) output.push(CP1252_ENCODE.get(code)!);
    else throw new Error(`Il carattere ${JSON.stringify(char)} (U+${code.toString(16).toUpperCase()}) non è rappresentabile in Windows-1252.`);
  }
  return new Uint8Array(output);
}

export interface ExportSource {
  content: string;
  encoding: TextEncoding;
  bom: boolean;
  lineEnding: LineEnding;
  sourceBytes?: ArrayBuffer;
  sourceTextNormalized?: string;
}

export function prepareExport(source: ExportSource, preference: ExportLineEnding): { bytes: Uint8Array; exactOriginal: boolean; ending: "LF" | "CRLF" | "CR" } {
  const ending = resolveExportLineEnding(source.lineEnding, preference);
  if (source.sourceBytes && source.sourceTextNormalized === source.content && preference === "preserve") {
    return { bytes: new Uint8Array(source.sourceBytes.slice(0)), exactOriginal: true, ending };
  }
  const converted = applyLineEnding(source.content, ending);
  return { bytes: encodeText(converted, source.encoding, source.bom), exactOriginal: false, ending };
}

export function downloadBytes(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([bytes as BlobPart], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
