'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asCompanyAccess, type CompanyAccess } from '@/lib/company-access';

export type UserRole =
  | 'admin'
  | 'manager'
  | 'accountant'
  | 'warehouse'
  | 'sales'
  | 'user'
  | (string & {});

type AuthState = {
  role: UserRole;
  email: string;
  fullName: string;
  companyAccess: CompanyAccess;
  setSession: (session: {
    role?: string;
    email?: string;
    fullName?: string;
    companyAccess?: string;
  }) => void;
  clear: () => void;
};

function asRole(value?: string): UserRole {
  if (!value || !value.trim()) return 'user';
  return value.trim();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: 'admin',
      email: 'turkman',
      fullName: 'ادمین سیستم',
      companyAccess: 'both',
      setSession: (session) =>
        set({
          role: asRole(session.role),
          email: session.email ?? '',
          fullName: session.fullName ?? '',
          companyAccess:
            session.role === 'admin' && !session.companyAccess
              ? 'both'
              : asCompanyAccess(session.companyAccess),
        }),
      clear: () => set({ role: 'user', email: '', fullName: '', companyAccess: 'arya' }),
    }),
    { name: 'erp-auth-session-v3' }
  )
);

export function canManageUsers(role: UserRole) {
  return role === 'admin';
}

export function canManageRoles(role: UserRole) {
  return role === 'admin';
}
