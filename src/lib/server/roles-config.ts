import type { NavKey } from '@/lib/i18n/messages';
import { DEFAULT_COMPANY_CIDRS } from '@/lib/network-access';
import { ROLE_DENIED_CHILDREN, ROLE_MODULE_KEYS } from '@/lib/role-access';
import type { UserRole } from '@/lib/auth-store';

export type ServerRoleConfig = {
  id: string;
  name: string;
  moduleKeys: NavKey[];
  deniedChildren: NavKey[];
  profitLoss: boolean;
  canManageUsers: boolean;
  companyNetworkOnly: boolean;
  blockMobile: boolean;
  allowedCidrs: string[];
  isSystem?: boolean;
};

type RolesConfigStore = {
  roles: ServerRoleConfig[];
  updatedAt: string;
};

function bucket(): RolesConfigStore {
  const g = globalThis as typeof globalThis & { __turkmanRolesConfig?: RolesConfigStore };
  if (!g.__turkmanRolesConfig) {
    g.__turkmanRolesConfig = {
      roles: [buildAdminRole()],
      updatedAt: new Date().toISOString(),
    };
  }
  return g.__turkmanRolesConfig;
}

function buildAdminRole(): ServerRoleConfig {
  return {
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
}

export function getRolesConfig(): RolesConfigStore {
  return bucket();
}

export function setRolesConfig(roles: ServerRoleConfig[]) {
  const admin = roles.find((r) => r.id === 'admin') ?? buildAdminRole();
  const custom = roles.filter((r) => r.id !== 'admin');
  bucket().roles = [admin, ...custom];
  bucket().updatedAt = new Date().toISOString();
}

export function getRoleConfig(roleId: string): ServerRoleConfig | null {
  return bucket().roles.find((r) => r.id === roleId) ?? null;
}

/** Legacy built-in roles when not synced from client yet. */
export function getLegacyRoleConfig(roleId: string): ServerRoleConfig | null {
  const legacy = roleId as UserRole;
  if (!(legacy in ROLE_MODULE_KEYS)) return null;
  return {
    id: roleId,
    name: roleId,
    moduleKeys: ROLE_MODULE_KEYS[legacy],
    deniedChildren: ROLE_DENIED_CHILDREN[legacy] ?? [],
    profitLoss: roleId === 'admin' || roleId === 'manager' || roleId === 'accountant',
    canManageUsers: roleId === 'admin' || roleId === 'manager',
    companyNetworkOnly: false,
    blockMobile: false,
    allowedCidrs: DEFAULT_COMPANY_CIDRS,
    isSystem: true,
  };
}

export function resolveRolePolicy(roleId: string): ServerRoleConfig | null {
  return getRoleConfig(roleId) ?? getLegacyRoleConfig(roleId);
}
