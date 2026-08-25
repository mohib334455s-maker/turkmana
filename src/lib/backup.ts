/** Keys persisted in browser localStorage for Turkman ERP */
export const ERP_STORAGE_KEYS = [
  'erp-ops-v2',
  'erp-ui-prefs',
  'erp-company-filter',
  'erp-feature-perms-v1',
  'erp-custom-roles-v1',
] as const;

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  app: 'turkman-erp';
  data: Record<string, unknown>;
};

export function buildBackupPayload(): BackupPayload {
  const data: Record<string, unknown> = {};
  if (typeof window === 'undefined') {
    return { version: 1, exportedAt: new Date().toISOString(), app: 'turkman-erp', data };
  }
  for (const key of ERP_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'turkman-erp',
    data,
  };
}

export function downloadBackup(filename?: string) {
  const payload = buildBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = filename ?? `turkman-erp-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return payload.exportedAt;
}

export function restoreBackup(raw: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw) as Partial<BackupPayload>;
    if (parsed.app !== 'turkman-erp' || !parsed.data || typeof parsed.data !== 'object') {
      return { ok: false, error: 'invalid_format' };
    }
    for (const [key, value] of Object.entries(parsed.data)) {
      if (!(ERP_STORAGE_KEYS as readonly string[]).includes(key)) continue;
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'parse_error' };
  }
}

export function clearOperationalData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('erp-ops-v2');
}

export function estimateBackupSizeKb(): number {
  if (typeof window === 'undefined') return 0;
  let bytes = 0;
  for (const key of ERP_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) bytes += raw.length * 2;
  }
  return Math.round(bytes / 1024);
}

export function countStoredKeys(): number {
  if (typeof window === 'undefined') return 0;
  return ERP_STORAGE_KEYS.filter((k) => localStorage.getItem(k)).length;
}
