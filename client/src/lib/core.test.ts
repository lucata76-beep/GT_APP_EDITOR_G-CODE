import { describe, expect, it } from "vitest";
import { analyzeFanucText } from "./diagnostics";
import { decodeCncFile, detectLineEnding, encodeText, prepareExport } from "./encoding";

function bufferOf(values: number[]): ArrayBuffer {
  return new Uint8Array(values).buffer;
}

describe("fedeltà file CNC", () => {
  it("riesporta byte-per-byte un Windows-1252 CRLF invariato", () => {
    const original = bufferOf([0x4f,0x31,0x30,0x30,0x30,0x0d,0x0a,0x28,0x50,0x52,0x4f,0x56,0x41,0x20,0xe9,0x29,0x0d,0x0a,0x4d,0x33,0x30]);
    const decoded = decodeCncFile(original);
    const exported = prepareExport({ ...decoded, sourceBytes: decoded.bytes, sourceTextNormalized: decoded.content }, "preserve");
    expect(decoded.encoding).toBe("windows-1252");
    expect(decoded.lineEnding).toBe("CRLF");
    expect(exported.exactOriginal).toBe(true);
    expect(Array.from(exported.bytes)).toEqual(Array.from(new Uint8Array(original)));
  });

  it("conserva BOM UTF-8 e byte originali", () => {
    const body = encodeText("O0001\r\nM30", "utf-8", true);
    const decoded = decodeCncFile(body.buffer);
    const exported = prepareExport({ ...decoded, sourceBytes: decoded.bytes, sourceTextNormalized: decoded.content }, "preserve");
    expect(decoded.bom).toBe(true);
    expect(Array.from(exported.bytes)).toEqual(Array.from(body));
  });

  it("riconosce terminatori misti senza modificarli in lettura", () => {
    expect(detectLineEnding("A\r\nB\nC\rD")).toBe("MIXED");
  });

  it("rifiuta caratteri non rappresentabili in Windows-1252", () => {
    expect(() => encodeText("O1 ⚙", "windows-1252")).toThrow(/non è rappresentabile/);
  });
});

describe("diagnostica deterministica", () => {
  it("rileva END mancante e segnaposto", () => {
    const result = analyzeFanucText("WHILE [#100 LT 10] DO1\n⟦ISTRUZIONI⟧");
    expect(result.some((item) => item.message.includes("END1 mancante"))).toBe(true);
    expect(result.some((item) => item.message.includes("Segnaposto"))).toBe(true);
  });

  it("accetta una coppia WHILE/END bilanciata", () => {
    const result = analyzeFanucText("WHILE [#100 LT 10] DO1\n#100=#100+1\nEND1");
    expect(result.filter((item) => item.severity === "error")).toHaveLength(0);
  });

  it("non interpreta il punto e virgola come commento", () => {
    const result = analyzeFanucText("; [");
    expect(result.some((item) => item.message.includes("quadra"))).toBe(true);
  });
});
