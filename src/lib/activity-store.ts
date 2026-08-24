'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/lib/auth-store';

export type ActivityAction = 'create' | 'update' | 'delete' | 'txn';

export type ActivityNote = {
  id: number;
  action: ActivityAction;
  module: string;
  moduleFa: string;
  moduleEn: string;
  entityLabelFa: string;
  entityLabelEn: string;
  entityName: string;
  detailsFa?: string;
  detailsEn?: string;
  userName: string;
  userEmail: string;
  userRole: string;
  createdAt: string;
  read: boolean;
};

type ActivityState = {
  items: ActivityNote[];
  push: (input: Omit<ActivityNote, 'id' | 'createdAt' | 'read'>) => ActivityNote;
  markRead: (id: number) => void;
  markAllRead: () => void;
  clear: () => void;
};

function nextId(items: ActivityNote[]) {
  return items.reduce((max, n) => Math.max(max, n.id), 0) + 1;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      items: [],
      push: (input) => {
        const note: ActivityNote = {
          ...input,
          id: nextId(get().items),
          createdAt: new Date().toISOString(),
          read: false,
        };
        set({ items: [note, ...get().items].slice(0, 200) });
        return note;
      },
      markRead: (id) =>
        set({
          items: get().items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }),
      markAllRead: () =>
        set({ items: get().items.map((n) => ({ ...n, read: true })) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'erp-activity-v1' }
  )
);

export function unreadActivityCount(items: ActivityNote[]) {
  return items.filter((n) => !n.read).length;
}

export function notifyAdminChange(input: {
  action: ActivityAction;
  module: string;
  moduleFa: string;
  moduleEn: string;
  entityLabelFa: string;
  entityLabelEn: string;
  entityName: string;
  detailsFa?: string;
  detailsEn?: string;
}) {
  const auth = useAuthStore.getState();
  return useActivityStore.getState().push({
    action: input.action,
    module: input.module,
    moduleFa: input.moduleFa,
    moduleEn: input.moduleEn,
    entityLabelFa: input.entityLabelFa,
    entityLabelEn: input.entityLabelEn,
    entityName: input.entityName,
    detailsFa: input.detailsFa,
    detailsEn: input.detailsEn,
    userName: auth.fullName || auth.email || 'کاربر',
    userEmail: auth.email || '',
    userRole: auth.role || 'user',
  });
}
