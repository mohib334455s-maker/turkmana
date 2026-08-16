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
  | 'user';

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
  const allowed: UserRole[] = [
    'admin',
    'manager',
    'accountant',
    'warehouse',
    'sales',
    'user',
  ];
  return allowed.includes(value as UserRole) ? (value as UserRole) : 'user';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: 'admin',
      email: 'admin@example.com',
      fullName: 'مدیر سیستم',
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
    { name: 'erp-auth-session' }
  )
);

export function canManageUsers(role: UserRole) {
  return role === 'admin' || role === 'manager';
}
