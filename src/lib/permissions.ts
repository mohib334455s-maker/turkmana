'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/lib/auth-store';

/** Default: everyone except warehouse and sales. Admin can change the list. */
const DEFAULT_PNL_ROLES: UserRole[] = ['admin', 'manager', 'accountant', 'user'];

type PermissionsState = {
  profitLossRoles: UserRole[];
  setProfitLossRoles: (roles: UserRole[]) => void;
  toggleProfitLossRole: (role: UserRole) => void;
};

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      profitLossRoles: DEFAULT_PNL_ROLES,
      setProfitLossRoles: (profitLossRoles) => set({ profitLossRoles }),
      toggleProfitLossRole: (role) => {
        const cur = get().profitLossRoles;
        if (role === 'admin') return; // admin always has access
        set({
          profitLossRoles: cur.includes(role)
            ? cur.filter((r) => r !== role)
            : [...cur, role],
        });
      },
    }),
    { name: 'erp-feature-perms-v1' }
  )
);

export function canGrantProfitLoss(role: UserRole) {
  return role === 'admin';
}

export function canViewProfitLoss(role: UserRole, allowed?: UserRole[]) {
  if (role === 'admin') return true;
  const list = allowed ?? DEFAULT_PNL_ROLES;
  return list.includes(role);
}

export function isContractOpenForExpenses(status?: string) {
  const s = (status || 'active').toLowerCase();
  return s === 'active' || s === 'open';
}

export function isPartyOpenForExpenses(status?: string) {
  const s = (status || 'active').toLowerCase();
  return s === 'active' || s === 'open';
}

export function isLotOpenForExpenses(status?: string) {
  const s = (status || 'active').toLowerCase();
  return s === 'active' || s === 'open';
}
