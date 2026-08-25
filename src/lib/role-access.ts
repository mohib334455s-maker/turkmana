import type { UserRole } from '@/lib/auth-store';
import type { CompanyAccess } from '@/lib/company-access';
import { COMPANY_ACCESS_LABELS } from '@/lib/company-access';
import type { NavKey } from '@/lib/i18n/messages';
import { navModules } from '@/lib/navigation';
import { canViewProfitLoss } from '@/lib/permissions';
import { systemRoles } from '@/lib/roles';
import type { CustomRole } from '@/lib/custom-roles-store';

/** Top-level sidebar modules each role may open. */
export const ROLE_MODULE_KEYS: Record<UserRole, NavKey[]> = {
  admin: [
    'dashboard',
    'contracts',
    'purchases',
    'warehouses',
    'imports',
    'sales',
    'customers',
    'representatives',
    'suppliers',
    'transport',
    'finance',
    'exchange',
    'hr',
    'reports',
    'notifications',
    'settings',
  ],
  manager: [
    'dashboard',
    'contracts',
    'purchases',
    'warehouses',
    'imports',
    'sales',
    'customers',
    'representatives',
    'suppliers',
    'transport',
    'finance',
    'exchange',
    'reports',
    'notifications',
    'settings',
  ],
  accountant: [
    'dashboard',
    'finance',
    'exchange',
    'customers',
    'suppliers',
    'purchases',
    'sales',
    'reports',
    'notifications',
  ],
  warehouse: [
    'dashboard',
    'warehouses',
    'imports',
    'transport',
    'contracts',
    'notifications',
  ],
  sales: [
    'dashboard',
    'sales',
    'customers',
    'representatives',
    'warehouses',
    'notifications',
  ],
  user: ['dashboard', 'finance', 'customers', 'reports', 'notifications'],
};

/** Settings sub-pages allowed per role. */
export const ROLE_SETTINGS_KEYS: Record<UserRole, NavKey[]> = {
  admin: ['settingsHome', 'companies', 'branches', 'products', 'users', 'roles'],
  manager: ['settingsHome', 'companies', 'branches', 'products', 'users', 'roles'],
  accountant: ['settingsHome', 'products'],
  warehouse: ['settingsHome'],
  sales: ['settingsHome'],
  user: ['settingsHome'],
};

/** Sub-pages denied even when parent module is allowed. */
export const ROLE_DENIED_CHILDREN: Partial<Record<UserRole, NavKey[]>> = {
  manager: ['profitLoss'],
  accountant: [],
  warehouse: ['profitLoss', 'users', 'roles', 'companies', 'branches'],
  sales: ['profitLoss', 'users', 'roles', 'companies', 'branches', 'payables'],
  user: [
    'profitLoss',
    'balanceSheet',
    'banks',
    'cash',
    'ledger',
    'entries',
    'expenses',
    'users',
    'roles',
    'companies',
    'branches',
    'executive',
    'aging',
  ],
};

export function canRoleManageUsers(role: string) {
  return role === 'admin';
}

export function canRoleManageRoles(role: string) {
  return role === 'admin';
}

function findCustomRole(role: string, customRoles?: CustomRole[]) {
  return customRoles?.find((r) => r.id === role);
}

export function moduleKeysForRole(role: string, customRoles?: CustomRole[]): NavKey[] {
  if (role === 'admin') return ROLE_MODULE_KEYS.admin;
  const custom = findCustomRole(role, customRoles);
  if (custom) return custom.moduleKeys;
  if (role in ROLE_MODULE_KEYS) return ROLE_MODULE_KEYS[role as UserRole];
  return ROLE_MODULE_KEYS.user;
}

export function deniedChildrenForRole(role: string, customRoles?: CustomRole[]): NavKey[] {
  if (role === 'admin') return [];
  const custom = findCustomRole(role, customRoles);
  if (custom) return custom.deniedChildren;
  return ROLE_DENIED_CHILDREN[role as UserRole] ?? [];
}

export function settingsKeysForRole(role: string): NavKey[] {
  if (role === 'admin') return ROLE_SETTINGS_KEYS.admin;
  if (role in ROLE_SETTINGS_KEYS) return ROLE_SETTINGS_KEYS[role as UserRole];
  return ['settingsHome'];
}

export function childPagesForRole(role: string, customRoles?: CustomRole[]): NavKey[] {
  const allowedTop = new Set(moduleKeysForRole(role, customRoles));
  const denied = new Set(deniedChildrenForRole(role, customRoles));
  const pages: NavKey[] = [];

  for (const mod of navModules) {
    if (!allowedTop.has(mod.key)) continue;
    if (mod.children?.length) {
      for (const child of mod.children) {
        if (!denied.has(child.key)) pages.push(child.key);
      }
    } else if (!denied.has(mod.key)) {
      pages.push(mod.key);
    }
  }

  for (const key of settingsKeysForRole(role)) {
    if (!denied.has(key) && !pages.includes(key)) pages.push(key);
  }

  return pages;
}

export function childPagesForRoleLegacy(role: UserRole): NavKey[] {
  const allowedTop = new Set(ROLE_MODULE_KEYS[role]);
  const denied = new Set(ROLE_DENIED_CHILDREN[role] ?? []);
  const pages: NavKey[] = [];

  for (const mod of navModules) {
    if (!allowedTop.has(mod.key)) continue;
    if (mod.children?.length) {
      for (const child of mod.children) {
        if (!denied.has(child.key)) pages.push(child.key);
      }
    } else if (!denied.has(mod.key)) {
      pages.push(mod.key);
    }
  }

  for (const key of ROLE_SETTINGS_KEYS[role]) {
    if (!denied.has(key) && !pages.includes(key)) pages.push(key);
  }

  return pages;
}

export function companyAccessLabel(access: CompanyAccess, locale: 'fa' | 'en') {
  return COMPANY_ACCESS_LABELS[access][locale];
}

export function describeCompanyScope(
  access: CompanyAccess,
  locale: 'fa' | 'en'
): { title: string; detail: string } {
  if (access === 'arya') {
    return locale === 'fa'
      ? {
          title: 'فقط آزیا آریا لمتید',
          detail: 'داده، لوگو، قرارداد و معاملات فقط شرکت آزیا آریا لمتید — بدون سوئیچ ترکمن پطرولیم',
        }
      : {
          title: 'Azya Aria Ltd only',
          detail: 'Data, logo, contracts and transactions for Arya only — no Turkmen switch',
        };
  }
  if (access === 'turkmen') {
    return locale === 'fa'
      ? {
          title: 'فقط ترکمن پطرولیم',
          detail: 'داده، لوگو، قرارداد و معاملات فقط شرکت ترکمن پطرولیم — بدون سوئیچ آزیا آریا لمتید',
        }
      : {
          title: 'Turkmen only',
          detail: 'Data, logo, contracts and transactions for Turkmen only — no Arya switch',
        };
  }
  return locale === 'fa'
    ? {
        title: 'آزیا آریا لمتید و ترکمن پطرولیم (قدرت انتخاب)',
        detail:
          'می‌تواند بین آزیا آریا لمتید و ترکمن پطرولیم جابه‌جا شود؛ هر بار فقط یک شرکت فعال است و ثبت‌ها جدا هستند',
      }
    : {
        title: 'Arya & Turkmen (can switch)',
        detail:
          'Can switch between Azya Aria Ltd and Turkmen; one active company at a time — records stay separate',
      };
}

export type UserAccessSummary = {
  role: string;
  roleTitle: string;
  companyAccess: CompanyAccess;
  companyTitle: string;
  companyDetail: string;
  moduleKeys: NavKey[];
  pageKeys: NavKey[];
  settingsKeys: NavKey[];
  canManageUsers: boolean;
  canViewProfitLoss: boolean;
  companyNetworkOnly?: boolean;
  blockMobile?: boolean;
};

export function buildUserAccessSummary(
  role: string,
  companyAccess: CompanyAccess,
  locale: 'fa' | 'en',
  profitLossRoles?: UserRole[],
  customRoles?: CustomRole[]
): UserAccessSummary {
  const roleDef = systemRoles.find((r) => r.key === role);
  const custom = findCustomRole(role, customRoles);
  const scope = describeCompanyScope(companyAccess, locale);
  const pnl =
    role === 'admin' ||
    custom?.profitLoss === true ||
    canViewProfitLoss(role as UserRole, profitLossRoles);

  return {
    role,
    roleTitle:
      custom?.name ??
      (roleDef ? (locale === 'fa' ? roleDef.titleFa : roleDef.titleEn) : role),
    companyAccess,
    companyTitle: scope.title,
    companyDetail: scope.detail,
    moduleKeys: moduleKeysForRole(role, customRoles),
    pageKeys: childPagesForRole(role, customRoles),
    settingsKeys: settingsKeysForRole(role),
    canManageUsers: canRoleManageUsers(role),
    canViewProfitLoss: pnl,
    companyNetworkOnly: custom?.companyNetworkOnly,
    blockMobile: custom?.blockMobile,
  };
}
