/**
 * Backup to a chosen folder via File System Access API (Chrome/Edge).
 * Falls back to normal download when the API is unavailable.
 */

import { buildBackupPayload, downloadBackup, type BackupPayload } from '@/lib/backup';

const FOLDER_NAME_KEY = 'erp-backup-folder-name';
const DB_NAME = 'turkman-backup-fs';
const STORE = 'handles';
const HANDLE_KEY = 'backup-dir';

type DirHandle = FileSystemDirectoryHandle;

function canUseFolderApi() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveHandle(handle: DirHandle) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  localStorage.setItem(FOLDER_NAME_KEY, handle.name);
}

async function loadHandle(): Promise<DirHandle | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(HANDLE_KEY);
      req.onsuccess = () => resolve((req.result as DirHandle) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export function getRememberedBackupFolderName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FOLDER_NAME_KEY);
}

export function isBackupFolderSupported() {
  return canUseFolderApi();
}

/** Pick or create a folder (browser lets user create one in the picker). */
export async function pickBackupFolder(): Promise<
  { ok: true; folderName: string } | { ok: false; error: string }
> {
  if (!canUseFolderApi()) {
    return { ok: false, error: 'unsupported' };
  }
  try {
    // @ts-expect-error File System Access API
    const handle = (await window.showDirectoryPicker({
      id: 'turkman-erp-backup',
      mode: 'readwrite',
      startIn: 'documents',
    })) as DirHandle;
    await saveHandle(handle);
    return { ok: true, folderName: handle.name };
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return { ok: false, error: 'cancelled' };
    return { ok: false, error: 'picker_failed' };
  }
}

async function ensurePermission(handle: DirHandle): Promise<boolean> {
  const opts = { mode: 'readwrite' as const };
  // @ts-expect-error queryPermission
  const q = await handle.queryPermission?.(opts);
  if (q === 'granted') return true;
  // @ts-expect-error requestPermission
  const r = await handle.requestPermission?.(opts);
  return r === 'granted';
}

async function writePayloadToFolder(handle: DirHandle, payload: BackupPayload) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const fileName = `turkman-erp-backup-${stamp}.json`;
  const fileHandle = await handle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(payload, null, 2));
  await writable.close();
  return fileName;
}

/**
 * Save backup into the remembered folder, or ask to pick one.
 * Falls back to browser download.
 */
export async function backupToFolder(opts?: {
  forcePick?: boolean;
}): Promise<
  | { ok: true; method: 'folder'; folderName: string; fileName: string; exportedAt: string }
  | { ok: true; method: 'download'; exportedAt: string }
  | { ok: false; error: string }
> {
  const payload = buildBackupPayload();

  if (!canUseFolderApi()) {
    const exportedAt = downloadBackup();
    return { ok: true, method: 'download', exportedAt };
  }

  try {
    let handle: DirHandle | null = opts?.forcePick ? null : await loadHandle();
    if (handle) {
      const ok = await ensurePermission(handle);
      if (!ok) handle = null;
    }
    if (!handle) {
      // @ts-expect-error File System Access API
      handle = (await window.showDirectoryPicker({
        id: 'turkman-erp-backup',
        mode: 'readwrite',
        startIn: 'documents',
      })) as DirHandle;
      await saveHandle(handle);
    }
    const fileName = await writePayloadToFolder(handle, payload);
    return {
      ok: true,
      method: 'folder',
      folderName: handle.name,
      fileName,
      exportedAt: payload.exportedAt,
    };
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return { ok: false, error: 'cancelled' };
    // Fallback download
    const exportedAt = downloadBackup();
    return { ok: true, method: 'download', exportedAt };
  }
}
