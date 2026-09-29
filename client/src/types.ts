export type TextEncoding = "utf-8" | "windows-1252";
export type LineEnding = "LF" | "CRLF" | "CR" | "MIXED" | "NONE";
export type ExportLineEnding = "preserve" | "CRLF" | "LF";

export interface MachineProfile {
  machineName: string;
  controlModel: string;
  defaultExtension: "NC" | "TAP" | "TXT";
  defaultEncoding: TextEncoding;
  exportLineEnding: ExportLineEnding;
}

export interface WorkshopPreferences {
  machine: MachineProfile;
  fontSize: number;
  lensZoom: number;
  showLineNumbers: boolean;
  lineWrap: boolean;
  visualIndent: number;
  theme: "dark" | "light";
}

export interface ProgramRecord {
  id: string;
  fileName: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
  favorite: boolean;
  encoding: TextEncoding;
  bom: boolean;
  lineEnding: LineEnding;
  sourceBytes?: ArrayBuffer;
  sourceTextNormalized?: string;
}

export interface DocumentModel {
  id?: string;
  fileName: string;
  content: string;
  savedContent: string;
  encoding: TextEncoding;
  bom: boolean;
  lineEnding: LineEnding;
  sourceBytes?: ArrayBuffer;
  sourceTextNormalized?: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  from: number;
  to: number;
}

export interface FanucDiagnostic {
  from: number;
  to: number;
  line: number;
  severity: "error" | "warning" | "info";
  message: string;
}
