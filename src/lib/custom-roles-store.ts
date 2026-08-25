'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NavKey } from '@/lib/i18n/messages';
import { DEFAULT_COMPANY_CIDRS } from '@/lib/network-access';
import { ROLE_MODULE_KEYS } from '@/lib/role-access';
import type { ServerRoleConfig } from '@/lib/server/roles-config';

export type CustomRole = {
  id: string;
  name: string;
  moduleKeys: NavKey[];
  deniedChildren: NavKey[];
  profitLoss: boolean;
  companyNetworkOnly: boolean;
  blockMobile: boolean;
  allowedCidrs: string[];
  createdAt: string;
};

type CustomRolesState = {
  roles: CustomRole[];
  addRole: (input: Omit<CustomRole, 'id' | 'createdAt'> & { id?: string }) => string;
  updateRole: (id: string, patch: Partial<Omit<CustomRole, 'id' | 'createdAt'>>) => void;
  removeRole: (id: string) => void;
};

function slugify(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .slice(0, 40);
  return base || `role-${Date.now()}`;
}

export const useCustomRolesStore = create<CustomRolesState>()(
  persist(
    (set, get) => ({
      roles: [],
      addRole: (input) => {
        const id = input.id ?? slugify(input.name);
        const role: CustomRole = {
          id,
          name: input.name.trim(),
          moduleKeys: input.moduleKeys,
          deniedChildren: input.deniedChildren ?? [],
          profitLoss: input.profitLoss ?? false,
          companyNetworkOnly: input.companyNetworkOnly ?? false,
          blockMobile: input.blockMobile ?? false,
          allowedCidrs: input.allowedCidrs?.length ? input.allowedCidrs : DEFAULT_COMPANY_CIDRS,
          createdAt: new Date().toISOString(),
        };
        set({ roles: [...get().roles.filter((r) => r.id !== id), role] });
        return id;
      },
      updateRole: (id, patch) => {
        set({
          roles: get().roles.map((r) => (r.id === id ? { ...r, ...patch, id } : r)),
        });
      },
      removeRole: (id) => {
        set({ roles: get().roles.filter((r) => r.id !== id) });
      },
    }),
    { name: 'erp-custom-roles-v1' }
  )
);

export function toServerRoleConfig(custom: CustomRole): ServerRoleConfig {
  return {
    id: custom.id,
    name: custom.name,
    moduleKeys: custom.moduleKeys,
    deniedChildren: custom.deniedChildren,
    profitLoss: custom.profitLoss,
    canManageUsers: false,
    companyNetworkOnly: custom.companyNetworkOnly,
    blockMobile: custom.blockMobile,
    allowedCidrs: custom.allowedCidrs,
  };
}

export function buildServerRolesPayload(customRoles: CustomRole[]): ServerRoleConfig[] {
  const admin: ServerRoleConfig = {
    id: 'admin',
    name: 'مدیر سیستم',
    moduleKeys: ROLE_MODULE_KEYS.admin,
    deniedChildren: [],
    profitLoss: true,
    canManageUsers: true,
    companyNetworkOnly: false,
    blockMobile: false,
    allowedCidrs: DEFAULT_COMPANY_CIDRS,
    isSystem: true,
  };
  return [admin, ...customRoles.map(toServerRoleConfig)];
}

export async function syncRolesToServer(customRoles: CustomRole[]) {
  try {
    await fetch('/api/admin/roles-config', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: buildServerRolesPayload(customRoles) }),
    });
  } catch {
    /* offline / demo */
  }
}
