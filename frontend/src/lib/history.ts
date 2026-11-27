"use client";
/**
 * "My recent voiceovers": the last 10 are kept in this browser (IndexedDB),
 * so people can replay or download them again later without an account.
 */

export type HistoryItem = {
  id: string;
  created: number;
  voice: string;
  voiceName: string;
  excerpt: string;
  seconds: number;
  format: "mp3" | "wav";
  music: string | null;
  audio: Blob;
  srt: string;
  shareId?: string;
};

const DB = "voicedost";
const STORE = "history";
const KEEP = 10;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function listHistory(): Promise<HistoryItem[]> {
  try {
    const db = await open();
    const items = await new Promise<HistoryItem[]>((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as HistoryItem[]);
      req.onerror = () => reject(req.error);
    });
    return items.sort((a, b) => b.created - a.created);
  } catch {
    return []; // private browsing or storage blocked
  }
}

export async function saveHistory(item: HistoryItem): Promise<void> {
  try {
    const db = await open();
    const existing = await listHistory();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put(item);
    for (const old of existing.filter((i) => i.id !== item.id).slice(KEEP - 1)) store.delete(old.id);
    await done(tx);
  } catch {
    /* storage full or blocked: history is a convenience only */
  }
}

export async function updateHistory(id: string, patch: Partial<HistoryItem>): Promise<void> {
  try {
    const db = await open();
    const items = await listHistory();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...item, ...patch });
    await done(tx);
  } catch {
    /* ignore */
  }
}

export async function removeHistory(id: string): Promise<void> {
  try {
    const db = await open();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    await done(tx);
  } catch {
    /* ignore */
  }
}
