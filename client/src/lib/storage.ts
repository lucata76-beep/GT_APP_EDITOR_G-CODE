import type { ProgramRecord, WorkshopPreferences } from "@/types";

const DB_NAME = "fanuc-workshop-ide";
const DB_VERSION = 1;
const PROGRAMS = "programs";
const SETTINGS = "settings";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROGRAMS)) db.createObjectStore(PROGRAMS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(SETTINGS)) db.createObjectStore(SETTINGS);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listPrograms(): Promise<ProgramRecord[]> {
  const db = await openDatabase();
  try {
    const values = await requestResult(db.transaction(PROGRAMS, "readonly").objectStore(PROGRAMS).getAll());
    return (values as ProgramRecord[]).sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
  } finally {
    db.close();
  }
}

export async function saveProgram(program: ProgramRecord): Promise<void> {
  const db = await openDatabase();
  try {
    await requestResult(db.transaction(PROGRAMS, "readwrite").objectStore(PROGRAMS).put(program));
  } finally {
    db.close();
  }
}

export async function removeProgram(id: string): Promise<void> {
  const db = await openDatabase();
  try {
    await requestResult(db.transaction(PROGRAMS, "readwrite").objectStore(PROGRAMS).delete(id));
  } finally {
    db.close();
  }
}

export async function savePreferences(preferences: WorkshopPreferences): Promise<void> {
  const db = await openDatabase();
  try {
    await requestResult(db.transaction(SETTINGS, "readwrite").objectStore(SETTINGS).put(preferences, "preferences"));
  } finally {
    db.close();
  }
}

export async function loadPreferences(): Promise<WorkshopPreferences | undefined> {
  const db = await openDatabase();
  try {
    return await requestResult(db.transaction(SETTINGS, "readonly").objectStore(SETTINGS).get("preferences"));
  } finally {
    db.close();
  }
}

function arrayBufferToBase64(buffer?: ArrayBuffer): string | undefined {
  if (!buffer) return undefined;
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  return btoa(binary);
}

function base64ToArrayBuffer(value?: string): ArrayBuffer | undefined {
  if (!value) return undefined;
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export interface LibraryBackup {
  format: "fanuc-workshop-ide-backup";
  version: 1;
  createdAt: string;
  programs: Array<Omit<ProgramRecord, "sourceBytes"> & { sourceBytesBase64?: string }>;
  preferences: WorkshopPreferences;
}

export function createBackup(programs: ProgramRecord[], preferences: WorkshopPreferences): LibraryBackup {
  return {
    format: "fanuc-workshop-ide-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    preferences,
    programs: programs.map(({ sourceBytes, ...program }) => ({ ...program, sourceBytesBase64: arrayBufferToBase64(sourceBytes) })),
  };
}

export async function restoreBackup(value: unknown): Promise<{ programs: ProgramRecord[]; preferences: WorkshopPreferences }> {
  const backup = value as LibraryBackup;
  if (!backup || backup.format !== "fanuc-workshop-ide-backup" || backup.version !== 1 || !Array.isArray(backup.programs)) {
    throw new Error("Backup non riconosciuto o versione non supportata.");
  }
  const programs = backup.programs.map(({ sourceBytesBase64, ...program }) => ({
    ...program,
    sourceBytes: base64ToArrayBuffer(sourceBytesBase64),
  })) as ProgramRecord[];
  for (const program of programs) await saveProgram(program);
  if (backup.preferences) await savePreferences(backup.preferences);
  return { programs, preferences: backup.preferences };
}
