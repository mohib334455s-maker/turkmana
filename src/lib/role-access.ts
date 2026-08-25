import type { UserRole } from '@/lib/auth-store';
import type { CompanyAccess } from '@/lib/company-access';
import { COMPANY_ACCESS_LABELS } from '@/lib/company-access';
import type { NavKey } from '@/lib/i18n/messages';
import { navModules } from '@/lib/navigation';
import { canViewProfitLoss } from '@/lib/permissions';
import { systemRoles } from '@/lib/roles';

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

export function canRoleManageUsers(role: UserRole) {
  return role === 'admin' || role === 'manager';
}

export function childPagesForRole(role: UserRole): NavKey[] {
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
        title: 'آزیا آریا لمتید و ترکمن پطرولیم (سوئیچ)',
        detail: 'می‌تواند بین آزیا آریا لمتید و ترکمن پطرولیم جابه‌جا شود؛ هر بار فقط یک شرکت فعال است',
      }
    : {
        title: 'Arya & Turkmen (switch)',
        detail: 'Can switch between Azya Aria Ltd and Turkmen; one active company at a time',
      };
}

export type UserAccessSummary = {
  role: UserRole;
  roleTitle: string;
  companyAccess: CompanyAccess;
  companyTitle: string;
  companyDetail: string;
  moduleKeys: NavKey[];
  pageKeys: NavKey[];
  settingsKeys: NavKey[];
  canManageUsers: boolean;
  canViewProfitLoss: boolean;
};

export function buildUserAccessSummary(
  role: UserRole,
  companyAccess: CompanyAccess,
  locale: 'fa' | 'en',
  profitLossRoles?: UserRole[]
): UserAccessSummary {
  const roleDef = systemRoles.find((r) => r.key === role);
  const scope = describeCompanyScope(companyAccess, locale);
  return {
    role,
    roleTitle: roleDef ? (locale === 'fa' ? roleDef.titleFa : roleDef.titleEn) : role,
    companyAccess,
    companyTitle: scope.title,
    companyDetail: scope.detail,
    moduleKeys: ROLE_MODULE_KEYS[role],
    pageKeys: childPagesForRole(role),
    settingsKeys: ROLE_SETTINGS_KEYS[role],
    canManageUsers: canRoleManageUsers(role),
    canViewProfitLoss: canViewProfitLoss(role, profitLossRoles),
  };
}
