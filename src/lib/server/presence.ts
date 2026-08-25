import { isMobileUserAgent } from '@/lib/network-access';

export type PresenceEntry = {
  sessionId: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
  ip: string;
  userAgent: string;
  isMobile: boolean;
  loginAt: string;
  lastSeenAt: string;
};

const TTL_MS = 2 * 60 * 1000;

type PresenceStore = Map<string, PresenceEntry>;

function store(): PresenceStore {
  const g = globalThis as typeof globalThis & { __turkmanPresence?: PresenceStore };
  if (!g.__turkmanPresence) g.__turkmanPresence = new Map();
  return g.__turkmanPresence;
}

function prune() {
  const now = Date.now();
  for (const [id, entry] of store()) {
    if (now - new Date(entry.lastSeenAt).getTime() > TTL_MS) {
      store().delete(id);
    }
  }
}

export function upsertPresence(entry: Omit<PresenceEntry, 'isMobile' | 'lastSeenAt'> & {
  lastSeenAt?: string;
}) {
  prune();
  const now = new Date().toISOString();
  store().set(entry.sessionId, {
    ...entry,
    isMobile: isMobileUserAgent(entry.userAgent),
    lastSeenAt: entry.lastSeenAt ?? now,
  });
}

export function touchPresence(sessionId: string) {
  const cur = store().get(sessionId);
  if (!cur) return false;
  cur.lastSeenAt = new Date().toISOString();
  store().set(sessionId, cur);
  return true;
}

export function removePresence(sessionId: string) {
  store().delete(sessionId);
}

export function listActivePresence(): PresenceEntry[] {
  prune();
  return [...store().values()].sort(
    (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
  );
}
